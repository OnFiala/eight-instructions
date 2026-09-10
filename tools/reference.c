/* Literal, test-only Brainfuck reference. No RLE, affine loops or guest semantics. */
#include <stdint.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

static void fail(const char *message) { fprintf(stderr, "%s\n", message); exit(1); }

int main(int argc, char **argv) {
    if (argc != 4) fail("usage: reference SOURCE CELLS INSTRUCTION_LIMIT");
    size_t cells = (size_t)strtoull(argv[2], NULL, 10);
    uint64_t limit = strtoull(argv[3], NULL, 10);
    if (cells < 1 || cells > 1000000 || !limit) fail("invalid resource limit");
    FILE *file = fopen(argv[1], "rb");
    if (!file) fail("cannot open source");
    if (fseek(file, 0, SEEK_END)) fail("cannot size source");
    long size = ftell(file);
    if (size < 0 || size > 100000000) fail("invalid source size");
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
    while (pc < length) {
        if (steps >= limit) fail("instruction limit");
        steps++;
        switch (source[pc]) {
            case '>': if (++pointer >= cells) fail("tape bounds"); if (pointer > high) high = pointer; break;
            case '<': if (!pointer) fail("tape bounds"); pointer--; break;
            case '+': tape[pointer]++; break;
            case '-': tape[pointer]--; break;
            case '[': if (!tape[pointer]) pc = jump[pc]; break;
            case ']': if (tape[pointer]) pc = jump[pc]; break;
            case ',': { int c = getchar(); tape[pointer] = c == EOF ? 0 : (uint16_t)c; break; }
            case '.': if (putchar(tape[pointer] & 255) == EOF) fail("output failure"); break;
        }
        pc++;
    }
    if (fflush(stdout)) fail("output flush failure");
    fprintf(stderr, "{\"steps\":%llu,\"pointer\":%zu,\"highWater\":%zu}\n",
            (unsigned long long)steps, pointer, high);
    free(source); free(jump); free(stack); free(tape);
    return 0;
}
