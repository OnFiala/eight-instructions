"""Emit Thread's compiler and runtime as Brainfuck. No guest execution in Python."""
import argparse
import hashlib
import json
import sys
from contextlib import contextmanager
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.emitter import BF, Array

ROOT = Path(__file__).resolve().parents[1]
WORDS = {
    '+': 6, '-': 7, '*': 8, '/mod': 9, '=': 10, '<': 11,
    'dup': 12, 'drop': 13, 'swap': 14, 'over': 15,
    '@': 16, '!': 17, 'p@': 18, 'p!': 19, 'emit': 20, '.': 21,
    'depth': 22, 'words': 23, 'here': 24, 'allot': 25, 'trace': 26,
    'bye': 27, 'assert': 28, '0=': 29, 'exit': 3, 'rot': 30,
    ':': 100, ';': 101, 'if': 102, 'else': 103, 'then': 104,
    'begin': 105, 'until': 106, 'again': 107, 'recurse': 108,
    'variable': 109, 'constant': 110, 'while': 111, 'repeat': 112, '."': 113,
}


class Kernel:
    def __init__(self):
        b = self.b = BF()
        names = 'running sp rp cp dp here mode start control err ip op arg ch length overflow found kind word number valid negative i j k a z x y q rem tmp tracing binding definition'.split()
        for name in names:
            setattr(self, name, b.cell(name))
        base = 512
        self.arrays = {}
        for name, size in [('token', 24), ('data', 256), ('returns', 256),
                           ('controls', 128), ('dictionary', 6144), ('code', 8192),
                           ('heap', 4096), ('store', 4096)]:
            arr = Array(b, base, size, name)
            self.arrays[name] = arr
            setattr(self, name, arr)
            base += (size+1)*4
        self.cells = base + 64

    @contextmanager
    def case(self, cell, n):
        b = self.b
        with b.temps() as t:
            b.eqn(cell, n, t)
            with b.when(t):
                yield

    def error(self, n):
        b = self.b
        with b.zero(self.err):
            b.text(f'!E{n} ')
            with b.when(self.mode):
                b.copy(self.start, self.cp)
            for c in [self.sp, self.rp, self.ip, self.mode, self.control]:
                b.clear(c)
            b.set(self.err, n)

    def check_limit(self, value, limit, error=3):
        b = self.b
        with b.temps(2) as (n, ok):
            b.set(n, limit)
            b.lt(value, n, ok)
            with b.zero(ok):
                self.error(error)

    def push(self, v):
        self.data.put(self.sp, v)
        self.b.add(self.sp)

    def pop(self, v):
        self.b.add(self.sp, -1)
        self.data.get(self.sp, v)

    def emit_code(self, v):
        self.check_limit(self.cp, self.code.size, 5)
        with self.b.zero(self.err):
            self.code.put(self.cp, v)
            self.b.add(self.cp)

    def emit_n(self, n):
        with self.b.temps() as t:
            self.b.set(t, n)
            self.emit_code(t)

    def divmod(self, numerator, denominator, quotient, remainder):
        b = self.b
        with b.temps(3) as (less, go, sub):
            b.copy(numerator, remainder)
            b.clear(quotient)
            b.set(go, 1)
            with b.loop(go):
                b.lt(remainder, denominator, less)
                b.copy(less, go)
                with b.zero(less):
                    b.copy(denominator, sub)
                    b.move(sub, remainder, -1)
                    b.add(quotient)
                    b.set(go, 1)
                with b.when(less):
                    b.clear(go)

    def decimal(self, value):
        b = self.b
        with b.temps(5) as (r, q, d, rest, started):
            b.copy(value, r)
            for divisor in [10000, 1000, 100, 10, 1]:
                b.set(d, divisor)
                self.divmod(r, d, q, rest)
                b.copy(rest, r)
                with b.when(q):
                    b.set(started, 1)
                if divisor == 1:
                    b.set(started, 1)
                with b.when(started):
                    b.add(q, 48)
                    b.at(q)
                    b.raw('.')
            b.text(' ')

    def read(self):
        self.b.at(self.ch)
        self.b.raw(',')

    def token_read(self):
        b = self.b
        b.clear(self.length)
        b.clear(self.overflow)
        with b.temps(3) as (go, space, limit):
            b.set(go, 1)
            b.set(limit, 33)
            with b.loop(go):
                self.read()
                with self.case(self.ch, 92):
                    b.set(space, 1)
                    with b.loop(space):
                        self.read()
                        with self.case(self.ch, 10): b.clear(space)
                        with self.case(self.ch, 0): b.clear(space)
                b.lt(self.ch, limit, space)
                with b.zero(space): b.clear(go)
                with self.case(self.ch, 0):
                    b.clear(go)
                    b.clear(self.running)
            b.copy(self.running, go)
            with b.loop(go):
                b.set(space, 23)
                b.lt(self.length, space, limit)
                with b.when(limit):
                    self.token.put(self.length, self.ch)
                    b.add(self.length)
                with b.zero(limit): b.set(self.overflow, 1)
                self.read()
                b.set(limit, 33)
                b.lt(self.ch, limit, space)
                with b.when(space): b.clear(go)
                with self.case(self.ch, 0): b.clear(self.running)

    def lookup(self):
        b = self.b
        b.clear(self.found)
        b.clear(self.i)
        with b.temps(5) as (go, same, n, v, t):
            b.lt(self.i, self.dp, go)
            with b.loop(go):
                b.copy(self.i, self.j)
                # Entry is [length, kind, code, 21 name bytes].
                b.clear(self.k)
                b.copy(self.i, t)
                with b.loop(t):
                    b.add(t, -1)
                    b.add(self.k, 24)
                self.dictionary.get(self.k, n)
                b.eq(n, self.length, same)
                with b.when(same):
                    b.clear(self.j)
                    b.copy(self.k, self.x)
                    b.add(self.x, 3)
                    b.lt(self.j, self.length, n)
                    with b.loop(n):
                        self.dictionary.get(self.x, v)
                        self.token.get(self.j, t)
                        b.eq(v, t, n)
                        with b.zero(n): b.clear(same)
                        b.add(self.x)
                        b.add(self.j)
                        b.lt(self.j, self.length, n)
                    with b.when(same):
                        b.set(self.found, 1)
                        b.add(self.k)
                        self.dictionary.get(self.k, self.kind)
                        b.add(self.k)
                        self.dictionary.get(self.k, self.word)
                b.add(self.i)
                b.lt(self.i, self.dp, go)

    def parse_number(self):
        b = self.b
        b.set(self.valid, 1)
        b.clear(self.number)
        b.clear(self.negative)
        b.clear(self.i)
        self.token.get(self.i, self.a)
        with self.case(self.a, 45):
            b.set(self.negative, 1)
            b.add(self.i)
            with self.case(self.length, 1): b.clear(self.valid)
        with b.temps(4) as (go, t, ok, digit):
            b.lt(self.i, self.length, go)
            with b.loop(go):
                self.token.get(self.i, digit)
                b.set(t, 48)
                b.lt(digit, t, ok)
                with b.when(ok): b.clear(self.valid)
                b.set(t, 58)
                b.lt(digit, t, ok)
                with b.zero(ok): b.clear(self.valid)
                b.add(digit, -48)
                b.set(t, 6554)
                b.lt(self.number, t, ok)
                with b.zero(ok): b.clear(self.valid)
                with self.case(self.number, 6553):
                    b.set(t, 6)
                    b.lt(digit, t, ok)
                    with b.zero(ok): b.clear(self.valid)
                with b.when(self.valid):
                    b.copy(self.number, t)
                    b.clear(self.number)
                    b.move(t, self.number, 10)
                    b.move(digit, self.number)
                b.add(self.i)
                b.lt(self.i, self.length, go)
            with b.when(self.negative):
                b.copy(self.number, t)
                b.clear(self.number)
                b.move(t, self.number, -1)

    def name_definition(self):
        b = self.b
        b.copy(self.mode, self.definition)
        self.check_limit(self.dp, 256, 5)
        self.check_limit(self.length, 22, 1)
        with b.zero(self.err):
            b.copy(self.dp, self.k)
            with b.temps() as t:
                b.clear(self.k)
                b.copy(self.dp, t)
                b.move(t, self.k, 24)
            self.dictionary.put(self.k, self.length)
            b.add(self.k)
            b.set(self.a, 1)
            self.dictionary.put(self.k, self.a)
            b.add(self.k)
            self.dictionary.put(self.k, self.start)
            b.add(self.k)
            b.clear(self.i)
            b.lt(self.i, self.length, self.z)
            with b.loop(self.z):
                self.token.get(self.i, self.a)
                self.dictionary.put(self.k, self.a)
                b.add(self.i)
                b.add(self.k)
                b.lt(self.i, self.length, self.z)
            b.set(self.mode, 2)
            for kind in [3, 4]:
                with self.case(self.definition, kind):
                    self.emit_n(1)
                    self.emit_code(self.binding)
                    self.emit_n(3)
                    with b.zero(self.err):
                        if kind == 3:
                            b.clear(self.a)
                            self.heap.put(self.here, self.a)
                            b.add(self.here)
                        b.add(self.dp)
                        b.clear(self.mode)

    def control_push(self, tag, address):
        b = self.b
        self.check_limit(self.control, 126, 6)
        with b.zero(self.err):
            self.controls.put(self.control, address)
            b.add(self.control)
            with b.temps() as t:
                b.set(t, tag)
                self.controls.put(self.control, t)
            b.add(self.control)

    def control_pop(self, allowed):
        b = self.b
        with b.zero(self.control): self.error(6)
        with b.zero(self.err):
            b.add(self.control, -1)
            self.controls.get(self.control, self.a)
            b.clear(self.z)
            for tag in allowed:
                with self.case(self.a, tag): b.set(self.z, 1)
            with b.zero(self.z): self.error(6)
            with b.zero(self.err):
                b.add(self.control, -1)
                self.controls.get(self.control, self.arg)

    def compiler(self):
        b = self.b
        with self.case(self.word, 100):
            with b.when(self.mode): self.error(6)
            with b.zero(self.err):
                b.set(self.mode, 1)
                b.copy(self.cp, self.start)
        with self.case(self.word, 101):
            with self.case(self.mode, 0): self.error(6)
            with b.when(self.control): self.error(6)
            with b.zero(self.err):
                self.emit_n(3)
                with b.zero(self.err):
                    b.add(self.dp)
                    b.clear(self.mode)
        with b.temps() as special:
            b.set(special, 101)
            b.lt(special, self.word, special)
            with self.case(self.word, 109): b.clear(special)
            with self.case(self.word, 110): b.clear(special)
            with self.case(self.word, 113): b.clear(special)
            with b.when(special):
                with self.case(self.mode, 0): self.error(6)
        with b.zero(self.err):
            with self.case(self.word, 102):
                self.emit_n(5)
                self.control_push(1, self.cp)
                self.emit_n(0)
            with self.case(self.word, 103):
                self.control_pop([1])
                with b.zero(self.err):
                    self.emit_n(4)
                    b.copy(self.cp, self.x)
                    self.emit_n(0)
                    self.code.put(self.arg, self.cp)
                    self.control_push(2, self.x)
            with self.case(self.word, 104):
                self.control_pop([1, 2])
                with b.zero(self.err): self.code.put(self.arg, self.cp)
            with self.case(self.word, 105): self.control_push(3, self.cp)
            for word, op in [(106, 5), (107, 4)]:
                with self.case(self.word, word):
                    self.control_pop([3])
                    with b.zero(self.err):
                        self.emit_n(op)
                        self.emit_code(self.arg)
            with self.case(self.word, 108):
                self.emit_n(2)
                self.emit_code(self.start)
            for word, mode in [(109, 3), (110, 4)]:
                with self.case(self.word, word):
                    with b.when(self.mode): self.error(6)
                    if mode == 3:
                        self.check_limit(self.here, self.heap.size)
                        b.copy(self.here, self.binding)
                    else:
                        with b.zero(self.sp): self.error(2)
                        with b.zero(self.err): self.pop(self.binding)
                    with b.zero(self.err):
                        b.copy(self.cp, self.start)
                        b.set(self.mode, mode)
            with self.case(self.word, 111):
                self.emit_n(5)
                self.control_push(4, self.cp)
                self.emit_n(0)
            with self.case(self.word, 112):
                self.control_pop([4])
                with b.zero(self.err):
                    b.copy(self.arg, self.x)
                    self.control_pop([3])
                    with b.zero(self.err):
                        self.emit_n(4)
                        self.emit_code(self.arg)
                        self.code.put(self.x, self.cp)
            with self.case(self.word, 113):
                with b.temps() as go:
                    b.set(go, 1)
                    with b.loop(go):
                        self.read()
                        with self.case(self.ch, 34): b.clear(go)
                        with self.case(self.ch, 0):
                            self.error(9)
                            b.clear(go)
                            b.clear(self.running)
                        with b.when(go):
                            with b.when(self.mode):
                                self.emit_n(1)
                                self.emit_code(self.ch)
                                self.emit_n(20)
                            with b.zero(self.mode):
                                b.at(self.ch)
                                b.raw('.')

    @contextmanager
    def primitive(self, op, inputs=0, outputs=0):
        b = self.b
        with self.case(self.op, op):
            with b.temps(2) as (need, bad):
                b.set(need, inputs)
                b.lt(self.sp, need, bad)
                with b.when(bad): self.error(2)
                b.copy(self.sp, need)
                b.add(need, outputs-inputs)
                self.check_limit(need, 257, 2)
            with b.zero(self.err): yield

    def execution(self):
        b = self.b
        with b.loop(self.op):
            with b.when(self.tracing):
                b.text('~')
                self.decimal(self.ip)
                self.decimal(self.op)
                self.decimal(self.sp)
                b.text('\n')
            with self.primitive(1, 0, 1):
                self.code.get(self.ip, self.a)
                b.add(self.ip)
                self.push(self.a)
            with self.primitive(2):
                self.check_limit(self.rp, 256, 2)
                with b.zero(self.err):
                    b.copy(self.ip, self.a)
                    with b.when(self.ip):
                        self.code.get(self.ip, self.arg)
                        b.add(self.a)
                    self.returns.put(self.rp, self.a)
                    b.add(self.rp)
                    b.copy(self.arg, self.ip)
            with self.primitive(3):
                with b.zero(self.rp): self.error(7)
                with b.zero(self.err):
                    b.add(self.rp, -1)
                    self.returns.get(self.rp, self.ip)
            with self.primitive(4):
                self.code.get(self.ip, self.a)
                b.copy(self.a, self.ip)
            with self.primitive(5, 1):
                self.pop(self.a)
                self.code.get(self.ip, self.x)
                b.add(self.ip)
                with b.zero(self.a): b.copy(self.x, self.ip)
            for op, factor in [(6, 1), (7, -1)]:
                with self.primitive(op, 2, 1):
                    self.pop(self.y)
                    self.pop(self.x)
                    b.move(self.y, self.x, factor)
                    self.push(self.x)
            with self.primitive(8, 2, 1):
                self.pop(self.y)
                self.pop(self.x)
                b.mul(self.x, self.y, self.a)
                self.push(self.a)
            with self.primitive(9, 2, 2):
                self.pop(self.y)
                self.pop(self.x)
                with b.zero(self.y): self.error(4)
                with b.zero(self.err):
                    self.divmod(self.x, self.y, self.q, self.rem)
                    self.push(self.rem)
                    self.push(self.q)
            for op, method in [(10, b.eq), (11, b.lt)]:
                with self.primitive(op, 2, 1):
                    self.pop(self.y)
                    self.pop(self.x)
                    method(self.x, self.y, self.a)
                    self.push(self.a)
            with self.primitive(12, 1, 2):
                self.pop(self.a)
                self.push(self.a)
                self.push(self.a)
            with self.primitive(13, 1): b.add(self.sp, -1)
            with self.primitive(14, 2, 2):
                self.pop(self.y)
                self.pop(self.x)
                self.push(self.y)
                self.push(self.x)
            with self.primitive(15, 2, 3):
                b.copy(self.sp, self.a)
                b.add(self.a, -2)
                self.data.get(self.a, self.x)
                self.push(self.x)
            for op, array in [(16, self.heap), (18, self.store)]:
                with self.primitive(op, 1, 1):
                    self.pop(self.x)
                    self.check_limit(self.x, array.size)
                    with b.zero(self.err):
                        array.get(self.x, self.a)
                        self.push(self.a)
            for op, array in [(17, self.heap), (19, self.store)]:
                with self.primitive(op, 2):
                    self.pop(self.x)
                    self.pop(self.a)
                    self.check_limit(self.x, array.size)
                    with b.zero(self.err): array.put(self.x, self.a)
            with self.primitive(20, 1):
                self.pop(self.a)
                b.at(self.a)
                b.raw('.')
            with self.primitive(21, 1):
                self.pop(self.a)
                self.decimal(self.a)
            with self.primitive(22, 0, 1):
                b.copy(self.sp, self.a)
                self.push(self.a)
            with self.primitive(23):
                b.clear(self.i)
                b.lt(self.i, self.dp, self.z)
                with b.loop(self.z):
                    b.clear(self.k)
                    b.copy(self.i, self.a)
                    b.move(self.a, self.k, 24)
                    self.dictionary.get(self.k, self.x)
                    b.add(self.k, 3)
                    with b.loop(self.x):
                        self.dictionary.get(self.k, self.a)
                        b.at(self.a)
                        b.raw('.')
                        b.add(self.k)
                        b.add(self.x, -1)
                    b.text(' ')
                    b.add(self.i)
                    b.lt(self.i, self.dp, self.z)
            with self.primitive(24, 0, 1): self.push(self.here)
            with self.primitive(25, 1):
                self.pop(self.x)
                self.check_limit(self.x, self.heap.size+1)
                with b.zero(self.err):
                    b.copy(self.here, self.y)
                    b.move(self.x, self.y)
                    self.check_limit(self.y, self.heap.size+1)
                    with b.zero(self.err): b.copy(self.y, self.here)
            with self.primitive(26, 1): self.pop(self.tracing)
            with self.primitive(27):
                b.clear(self.running)
                b.clear(self.ip)
                b.clear(self.rp)
            with self.primitive(28, 1):
                self.pop(self.a)
                with b.zero(self.a): self.error(8)
            with self.primitive(29, 1, 1):
                self.pop(self.x)
                b.clear(self.a)
                with b.zero(self.x): b.set(self.a, 1)
                self.push(self.a)
            with self.primitive(30, 3, 3):
                self.pop(self.a)
                self.pop(self.y)
                self.pop(self.x)
                self.push(self.y)
                self.push(self.a)
                self.push(self.x)
            b.clear(self.op)
            with b.when(self.ip):
                with b.temps() as in_code:
                    b.lt(self.ip, self.cp, in_code)
                    with b.zero(in_code): self.error(7)
                with b.zero(self.err):
                    self.code.get(self.ip, self.op)
                    b.add(self.ip)

    def build(self):
        b = self.b
        b.set(self.running, 1)
        b.set(self.cp, 1)  # zero is the top-level return sentinel
        b.set(self.dp, len(WORDS))
        for i, (name, op) in enumerate(WORDS.items()):
            for j, value in enumerate([len(name), 2 if op >= 100 else 0, op, *name.encode('ascii')]):
                b.set(self.dictionary.base+(i*24+j)*4+2, value)
        b.text('Thread / 8 Instructions\n')
        with b.loop(self.running):
            b.clear(self.err)
            self.token_read()
            with b.when(self.length):
                with b.when(self.overflow): self.error(1)
                with b.zero(self.err):
                    b.copy(self.mode, self.tmp)
                    with b.temps() as naming:
                        b.clear(naming)
                        for kind in [1, 3, 4]:
                            with self.case(self.tmp, kind): b.set(naming, 1)
                        with b.when(naming): self.name_definition()
                    with b.temps() as normal:
                        b.clear(normal)
                        for kind in [0, 2]:
                            with self.case(self.tmp, kind): b.set(normal, 1)
                        with b.when(normal):
                            self.lookup()
                            with b.when(self.found):
                                with self.case(self.kind, 2): self.compiler()
                                with b.temps() as ordinary:
                                    b.eqn(self.kind, 2, ordinary)
                                    with b.zero(ordinary):
                                        with b.when(self.mode):
                                            with self.case(self.kind, 0): self.emit_code(self.word)
                                            with self.case(self.kind, 1):
                                                self.emit_n(2)
                                                self.emit_code(self.word)
                                        with b.zero(self.mode):
                                            with self.case(self.kind, 0): b.copy(self.word, self.op)
                                            with self.case(self.kind, 1):
                                                b.set(self.op, 2)
                                                b.copy(self.word, self.arg)
                            with b.zero(self.found):
                                self.parse_number()
                                with b.zero(self.valid): self.error(1)
                                with b.when(self.valid):
                                    with b.when(self.mode):
                                        self.emit_n(1)
                                        self.emit_code(self.number)
                                    with b.zero(self.mode):
                                        self.check_limit(self.sp, 256, 2)
                                        with b.zero(self.err): self.push(self.number)
            self.execution()
        with b.when(self.mode): self.error(6)
        return b.source(), {
            'dialect': {'cell_bits': 16, 'wrapping': True, 'io_bits': 8, 'eof': 0, 'tape_cells': self.cells},
            'registers': b.names,
            'arrays': {name: {'base': a.base, 'size': a.size, 'stride': 4, 'value_lane': 2} for name, a in self.arrays.items()},
            'primitives': WORDS,
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source, layout = Kernel().build()
    layout['sha256'] = hashlib.sha256(source.encode()).hexdigest()
    layout['instructions'] = len(source.strip())
    outputs = {'dist/kernel.bf': source, 'dist/kernel-map.json': json.dumps(layout, indent=2)+'\n'}
    for file, content in outputs.items():
        path = ROOT/file
        if args.check:
            if not path.exists() or path.read_text() != content:
                raise SystemExit(f'Non-reproducible artifact: {file}')
        else:
            path.write_text(content)
    print(json.dumps({'instructions': layout['instructions'], 'sha256': layout['sha256'], 'cells': layout['dialect']['tape_cells']}))


if __name__ == '__main__':
    main()
