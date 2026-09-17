/* Literal, test-only Brainfuck reference. No RLE, affine loops or guest semantics. */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void fail(const char *message) { fprintf(stderr, "%s\n", message); exit(1); }
static uint64_t read_le(FILE *f, unsigned bytes) {
    uint64_t value = 0;
    for (unsigned i = 0; i < bytes; i++) { int c = fgetc(f); if (c == EOF) fail("truncated state"); value |= (uint64_t)c << (8*i); }
    return value;
}
static void write_le(FILE *f, uint64_t value, unsigned bytes) {
    for (unsigned i = 0; i < bytes; i++) if (fputc((int)((value >> (8*i)) & 255), f) == EOF) fail("state write failed");
}

int main(int argc, char **argv) {
    if (argc != 4 && argc != 6) fail("usage: reference SOURCE CELLS INSTRUCTION_LIMIT [INITIAL_STATE FINAL_STATE]");
    size_t cells = (size_t)strtoull(argv[2], NULL, 10);
    uint64_t limit = strtoull(argv[3], NULL, 10);
    if (cells < 1 || cells > 1000000 || !limit) fail("invalid resource limit");
    FILE *file = fopen(argv[1], "rb");
    if (!file) fail("cannot open source");
    if (fseek(file, 0, SEEK_END)) fail("cannot size source");
    long size = ftell(file);
    if (size < 0 || size > 160L * 1024L * 1024L) fail("invalid source size");
    rewind(file);
    char *source = malloc((size_t)size + 1);
    if (!source) fail("allocation failure");
    if (fread(source, 1, (size_t)size, file) != (size_t)size) fail("source read failed");
    fclose(file);
    size_t length = 0;
    for (long i = 0; i < size; i++)
        if (source[i] && strchr("><+-.,[]", source[i])) source[length++] = source[i];
    uint32_t *jump = calloc(length ? length : 1, sizeof(*jump));
    size_t capacity = 1024, depth = 0;
    uint32_t *stack = malloc(capacity * sizeof(*stack));
    uint16_t *tape = calloc(cells, sizeof(*tape));
    if (!jump || !stack || !tape) fail("allocation failure");
    for (size_t i = 0; i < length; i++) {
        if (source[i] == '[') {
            if (depth == capacity) {
                capacity *= 2;
                uint32_t *grown = realloc(stack, capacity * sizeof(*stack));
                if (!grown) fail("allocation failure");
                stack = grown;
            }
            stack[depth++] = (uint32_t)i;
        } else if (source[i] == ']') {
            if (!depth) fail("unmatched closing bracket");
            uint32_t opening = stack[--depth];
            jump[opening] = (uint32_t)i;
            jump[i] = opening;
        }
    }
    if (depth) fail("unmatched opening bracket");
    size_t pc = 0, pointer = 0, high = 0;
    uint64_t steps = 0;
    /* Optional generic raw continuation. No application or optimized opcode data.
       Four little-endian u64 values (raw PC, pointer, high water, steps), then
       CELLS little-endian u16 values. EOF pauses on comma in this mode. */
    if (argc == 6) {
        FILE *state = fopen(argv[4], "rb"); if (!state) fail("cannot open state");
        pc = (size_t)read_le(state, 8); pointer = (size_t)read_le(state, 8);
        high = (size_t)read_le(state, 8); steps = read_le(state, 8);
        if (pc >= length || pointer >= cells || high >= cells || high < pointer) fail("invalid state");
        for (size_t i = 0; i < cells; i++) tape[i] = (uint16_t)read_le(state, 2);
        if (fgetc(state) != EOF) fail("excess state bytes");
        fclose(state);
    }
    uint64_t initial_steps = steps;
    while (pc < length) {
        if (steps - initial_steps >= limit) fail("instruction limit");
        steps++;
        switch (source[pc]) {
            case '>': if (++pointer >= cells) fail("tape bounds"); if (pointer > high) high = pointer; break;
            case '<': if (!pointer) fail("tape bounds"); pointer--; break;
            case '+': tape[pointer]++; break;
            case '-': tape[pointer]--; break;
            case '[': if (!tape[pointer]) pc = jump[pc]; break;
            case ']': if (tape[pointer]) pc = jump[pc]; break;
            case ',': { int c = getchar(); if (c == EOF && argc == 6) { steps--; goto done; } tape[pointer] = c == EOF ? 0 : (uint16_t)c; break; }
            case '.': if (putchar(tape[pointer] & 255) == EOF) fail("output failure"); break;
        }
        pc++;
    }
done:
    if (argc == 6) {
        FILE *state = fopen(argv[5], "wb"); if (!state) fail("cannot create state");
        write_le(state, pc, 8); write_le(state, pointer, 8); write_le(state, high, 8); write_le(state, steps, 8);
        for (size_t i = 0; i < cells; i++) write_le(state, tape[i], 2);
        if (fclose(state)) fail("state close failed");
    }
    if (fflush(stdout)) fail("output flush failure");
    fprintf(stderr, "{\"steps\":%llu,\"pointer\":%zu,\"highWater\":%zu}\n",
            (unsigned long long)steps, pointer, high);
    free(source); free(jump); free(stack); free(tape);
    return 0;
}
