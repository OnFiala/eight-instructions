"""Emit Thread's compiler and runtime as Brainfuck. No guest execution in Python."""
import argparse
import gzip
import hashlib
import io
import json
import sys
from contextlib import contextmanager
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from tools.emitter import BF, Array, PagedArray

ROOT = Path(__file__).resolve().parents[1]
WORDS = {
    '+': 6, '-': 7, '*': 8, '/mod': 9, '=': 10, '<': 11,
    'dup': 12, 'drop': 13, 'swap': 14, 'over': 15,
    '@': 16, '!': 17, 'p@': 18, 'p!': 19, 'emit': 20, '.': 21,
    'depth': 22, 'words': 23, 'here': 24, 'allot': 25, 'trace': 26,
    'bye': 27, 'assert': 28, '0=': 29, 'exit': 3, 'rot': 30,
    'fill': 31, 'pfill': 32, 'move': 33, 'pmove': 34,
    'key': 35, 'w@': 36, 'w!': 37,
    ':': 100, ';': 101, 'if': 102, 'else': 103, 'then': 104,
    'begin': 105, 'until': 106, 'again': 107, 'recurse': 108,
    'variable': 109, 'constant': 110, 'while': 111, 'repeat': 112, '."': 113,
}


class Kernel:
    def __init__(self):
        b = self.b = BF()
        names = 'running sp rp cp dp here mode start control err ip op arg ch length overflow found kind word number valid negative i j k a z x y q rem tmp tracing binding definition hash defhash ip_hi ip_lo cp_hi cp_lo start_hi start_lo arg_hi arg_lo word_hi word_lo'.split()
        for name in names:
            setattr(self, name, b.cell(name))
        base = 512
        self.arrays = {}
        for name, size in [('token', 24), ('buckets', 256), ('data', 256), ('returns', 512),
                           ('controls', 128), ('dictionary', 8192), ('code', 12288),
                           ('heap', 4096), ('store', 4096), ('workspace', 4096)]:
            arr = (PagedArray if name in ('code', 'workspace') else Array)(b, base, size, name)
            self.arrays[name] = arr
            setattr(self, name, arr)
            base += (size+1)*arr.stride
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
                b.copy(self.start_hi, self.cp_hi)
                b.copy(self.start_lo, self.cp_lo)
            for c in [self.sp, self.rp, self.ip, self.ip_hi, self.ip_lo, self.mode, self.control]:
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

    def advance(self, high, low, flat=None):
        b = self.b
        b.add(low)
        if flat is not None: b.add(flat)
        with self.case(low, 64):
            b.clear(low)
            b.add(high)

    def emit_code(self, v):
        self.check_limit(self.cp_hi, self.code.size // 64, 5)
        with self.b.zero(self.err):
            self.code.put(self.cp_hi, self.cp_lo, v)
            self.advance(self.cp_hi, self.cp_lo, self.cp)

    def emit_n(self, n):
        with self.b.temps() as t:
            self.b.set(t, n)
            self.emit_code(t)

    def split(self, flat, high, low):
        with self.b.temps() as radix:
            self.b.set(radix, 64)
            self.divmod(flat, radix, high, low)

    def emit_address(self, flat):
        with self.b.temps(2) as (high, low):
            self.split(flat, high, low)
            self.emit_code(high)
            self.emit_code(low)

    def patch(self, flat):
        with self.b.temps(2) as (high, low):
            self.split(flat, high, low)
            self.code.put(high, low, self.cp_hi)
            self.advance(high, low)
            self.code.put(high, low, self.cp_lo)

    def fetch(self, out):
        b = self.b
        with b.temps(2) as (valid, lower):
            b.lt(self.ip_hi, self.cp_hi, valid)
            with b.temps() as equal:
                b.eq(self.ip_hi, self.cp_hi, equal)
                with b.when(equal):
                    b.lt(self.ip_lo, self.cp_lo, lower)
                    b.copy(lower, valid)
            with b.zero(valid): self.error(7)
            with b.zero(self.err):
                self.code.get(self.ip_hi, self.ip_lo, out)
                self.advance(self.ip_hi, self.ip_lo, self.ip)

    def jump(self, high, low):
        b = self.b
        b.copy(high, self.ip_hi)
        b.copy(low, self.ip_lo)
        b.copy(low, self.ip)
        with b.temps() as t:
            b.copy(high, t)
            b.move(t, self.ip, 64)

    def start_definition(self):
        b = self.b
        b.copy(self.cp, self.start)
        b.copy(self.cp_hi, self.start_hi)
        b.copy(self.cp_lo, self.start_lo)

    def divmod(self, numerator, denominator, quotient, remainder, wide=False):
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
                if wide:
                    with self.case(quotient, 8): b.clear(go)
            if wide:
                with self.case(quotient, 8):
                    # Large quotients use 16 bounded binary candidate steps.
                    # Scaling is guarded before multiplication to prevent wrap.
                    # These operations execute in BF, never in the host runtime.
                    with b.temps(4) as (safe, limit, scaled, source):
                        for bit in range(15, -1, -1):
                            if bit:
                                b.set(limit, (65535 >> bit) + 1)
                                b.lt(denominator, limit, safe)
                            else:
                                b.set(safe, 1)
                            with b.when(safe):
                                b.clear(scaled)
                                b.copy(denominator, source)
                                b.move(source, scaled, 1 << bit)
                                b.lt(remainder, scaled, less)
                                with b.zero(less):
                                    b.move(scaled, remainder, -1)
                                    b.add(quotient, 1 << bit)

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
        b.clear(self.hash)
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
                    with b.temps(3) as (byte, modulus, small):
                        b.copy(self.ch, byte)
                        b.move(byte, self.hash)
                        b.set(modulus, 256)
                        b.lt(self.hash, modulus, small)
                        with b.zero(small): b.add(self.hash, -256)
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
        self.buckets.get(self.hash, self.i)
        with b.temps(4) as (same, n, v, t):
            with b.loop(self.i):
                b.add(self.i, -1)
                b.clear(self.k)
                b.copy(self.i, t)
                b.move(t, self.k, 32)
                self.dictionary.get(self.k, n)
                b.eq(n, self.length, same)
                with b.when(same):
                    b.clear(self.j)
                    b.copy(self.k, self.x)
                    b.add(self.x, 6)
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
                    b.copy(self.k, t)
                    b.add(t)
                    self.dictionary.get(t, self.kind)
                    b.add(t)
                    self.dictionary.get(t, self.word)
                    b.add(t)
                    self.dictionary.get(t, self.word_hi)
                    b.add(t)
                    self.dictionary.get(t, self.word_lo)
                    b.clear(self.i)
                with b.zero(same):
                    b.add(self.k, 5)
                    self.dictionary.get(self.k, self.i)

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
        self.check_limit(self.length, 24, 1)
        with b.zero(self.err):
            b.copy(self.dp, self.k)
            with b.temps() as t:
                b.clear(self.k)
                b.copy(self.dp, t)
                b.move(t, self.k, 32)
            self.dictionary.put(self.k, self.length)
            b.add(self.k)
            b.set(self.a, 1)
            self.dictionary.put(self.k, self.a)
            b.add(self.k)
            self.dictionary.put(self.k, self.start)
            b.add(self.k)
            self.dictionary.put(self.k, self.start_hi)
            b.add(self.k)
            self.dictionary.put(self.k, self.start_lo)
            b.add(self.k)
            self.buckets.get(self.hash, self.a)
            self.dictionary.put(self.k, self.a)
            b.copy(self.hash, self.defhash)
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
                        self.publish()
                        b.clear(self.mode)

    def publish(self):
        self.b.add(self.dp)
        self.buckets.put(self.defhash, self.dp)

    def control_push(self, tag, address):
        b = self.b
        self.check_limit(self.control, 127, 6)
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
                self.start_definition()
        with self.case(self.word, 101):
            with self.case(self.mode, 0): self.error(6)
            with b.when(self.control): self.error(6)
            with b.zero(self.err):
                self.emit_n(3)
                with b.zero(self.err):
                    self.publish()
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
                self.emit_n(0)
            with self.case(self.word, 103):
                self.control_pop([1])
                with b.zero(self.err):
                    self.emit_n(4)
                    b.copy(self.cp, self.x)
                    self.emit_n(0)
                    self.emit_n(0)
                    self.patch(self.arg)
                    self.control_push(2, self.x)
            with self.case(self.word, 104):
                self.control_pop([1, 2])
                with b.zero(self.err): self.patch(self.arg)
            with self.case(self.word, 105): self.control_push(3, self.cp)
            for word, op in [(106, 5), (107, 4)]:
                with self.case(self.word, word):
                    self.control_pop([3])
                    with b.zero(self.err):
                        self.emit_n(op)
                        self.emit_address(self.arg)
            with self.case(self.word, 108):
                self.emit_n(2)
                self.emit_code(self.start_hi)
                self.emit_code(self.start_lo)
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
                        self.start_definition()
                        b.set(self.mode, mode)
            with self.case(self.word, 111):
                self.emit_n(5)
                self.control_push(4, self.cp)
                self.emit_n(0)
                self.emit_n(0)
            with self.case(self.word, 112):
                self.control_pop([4])
                with b.zero(self.err):
                    b.copy(self.arg, self.x)
                    self.control_pop([3])
                    with b.zero(self.err):
                        self.emit_n(4)
                        self.emit_address(self.arg)
                        self.patch(self.x)
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
                self.fetch(self.a)
                with b.zero(self.err): self.push(self.a)
            with self.primitive(2):
                self.check_limit(self.rp, 511, 2)
                with b.zero(self.err):
                    with b.when(self.ip):
                        self.fetch(self.arg_hi)
                        self.fetch(self.arg_lo)
                    with b.zero(self.err):
                        self.returns.put(self.rp, self.ip_hi)
                        b.add(self.rp)
                        self.returns.put(self.rp, self.ip_lo)
                        b.add(self.rp)
                        self.jump(self.arg_hi, self.arg_lo)
            with self.primitive(3):
                with b.zero(self.rp): self.error(7)
                with b.zero(self.err):
                    b.add(self.rp, -1)
                    self.returns.get(self.rp, self.arg_lo)
                    b.add(self.rp, -1)
                    self.returns.get(self.rp, self.arg_hi)
                    self.jump(self.arg_hi, self.arg_lo)
            with self.primitive(4):
                self.fetch(self.arg_hi)
                self.fetch(self.arg_lo)
                with b.zero(self.err): self.jump(self.arg_hi, self.arg_lo)
            with self.primitive(5, 1):
                self.pop(self.a)
                self.fetch(self.arg_hi)
                self.fetch(self.arg_lo)
                with b.zero(self.err):
                    with b.zero(self.a): self.jump(self.arg_hi, self.arg_lo)
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
                    self.divmod(self.x, self.y, self.q, self.rem, wide=True)
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
                    b.move(self.a, self.k, 32)
                    self.dictionary.get(self.k, self.x)
                    b.add(self.k, 6)
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
                b.clear(self.ip_hi)
                b.clear(self.ip_lo)
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
            for op, array in [(31, self.heap), (32, self.store)]:
                with self.primitive(op, 3):
                    self.pop(self.z)
                    self.pop(self.x)
                    self.pop(self.a)
                    self.check_limit(self.z, array.size+1)
                    self.check_limit(self.x, array.size+1)
                    with b.zero(self.err):
                        b.copy(self.x, self.y)
                        with b.temps() as t:
                            b.copy(self.z, t)
                            b.move(t, self.y)
                        self.check_limit(self.y, array.size+1)
                        with b.zero(self.err):
                            with b.loop(self.z):
                                array.put(self.x, self.a)
                                b.add(self.x)
                                b.add(self.z, -1)
            for op, array in [(33, self.heap), (34, self.store)]:
                with self.primitive(op, 3):
                    self.pop(self.z)
                    self.pop(self.y)
                    self.pop(self.x)
                    for value in [self.x, self.y, self.z]:
                        self.check_limit(value, array.size+1)
                    with b.zero(self.err):
                        for start in [self.x, self.y]:
                            with b.temps(2) as (end, t):
                                b.copy(start, end)
                                b.copy(self.z, t)
                                b.move(t, end)
                                self.check_limit(end, array.size+1)
                        with b.zero(self.err):
                            with b.temps() as backward:
                                b.lt(self.x, self.y, backward)
                                with b.when(backward):
                                    with b.temps() as t:
                                        b.copy(self.z, t)
                                        b.move(t, self.x)
                                        b.copy(self.z, t)
                                        b.move(t, self.y)
                                    with b.loop(self.z):
                                        b.add(self.x, -1)
                                        b.add(self.y, -1)
                                        array.get(self.x, self.a)
                                        array.put(self.y, self.a)
                                        b.add(self.z, -1)
                                with b.zero(backward):
                                    with b.loop(self.z):
                                        array.get(self.x, self.a)
                                        array.put(self.y, self.a)
                                        b.add(self.x)
                                        b.add(self.y)
                                        b.add(self.z, -1)
            with self.primitive(35, 0, 1):
                self.read()
                self.push(self.ch)
            for op, write in [(36, False), (37, True)]:
                with self.primitive(op, 2 if write else 1, 0 if write else 1):
                    self.pop(self.x)
                    if write: self.pop(self.a)
                    self.check_limit(self.x, self.workspace.size)
                    with b.zero(self.err):
                        with b.temps(2) as (high, low):
                            self.split(self.x, high, low)
                            if write: self.workspace.put(high, low, self.a)
                            else:
                                self.workspace.get(high, low, self.a)
                                self.push(self.a)
            b.clear(self.op)
            with b.when(self.ip):
                self.fetch(self.op)

    def build(self):
        b = self.b
        b.set(self.running, 1)
        b.set(self.cp_lo, 1)
        b.set(self.cp, 1)  # zero is the top-level return sentinel
        b.set(self.dp, len(WORDS))
        heads = {}
        for i, (name, op) in enumerate(WORDS.items()):
            bucket = sum(name.encode('ascii')) % 256
            for j, value in enumerate([len(name), 2 if op >= 100 else 0, op, 0, 0, heads.get(bucket, 0), *name.encode('ascii')]):
                b.set(self.dictionary.base+(i*32+j)*4+2, value)
            heads[bucket] = i+1
        for bucket, head in heads.items():
            b.set(self.buckets.base+bucket*4+2, head)
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
                                                self.emit_code(self.word_hi)
                                                self.emit_code(self.word_lo)
                                        with b.zero(self.mode):
                                            with self.case(self.kind, 0): b.copy(self.word, self.op)
                                            with self.case(self.kind, 1):
                                                b.set(self.op, 2)
                                                b.copy(self.word_hi, self.arg_hi)
                                                b.copy(self.word_lo, self.arg_lo)
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
            'arrays': {name: {'base': a.base, 'size': a.size, 'stride': a.stride, 'value_lane': 2} for name, a in self.arrays.items()},
            'primitives': WORDS,
        }


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    source, layout = Kernel().build()
    layout['sha256'] = hashlib.sha256(source.encode()).hexdigest()
    layout['instructions'] = len(source.strip())
    compressed = io.BytesIO()
    with gzip.GzipFile(fileobj=compressed, mode='wb', filename='', mtime=0, compresslevel=9) as archive:
        archive.write(source.encode())
    outputs = {'artifacts/kernel.bf': source.encode(), 'dist/kernel.bf.gz': compressed.getvalue(),
               'dist/kernel-map.json': (json.dumps(layout, indent=2)+'\n').encode()}
    for file, content in outputs.items():
        path = ROOT/file
        if args.check:
            if not path.exists() or path.read_bytes() != content:
                raise SystemExit(f'Non-reproducible artifact: {file}')
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(content)
    print(json.dumps({'instructions': layout['instructions'], 'sha256': layout['sha256'], 'cells': layout['dialect']['tape_cells']}))


if __name__ == '__main__':
    main()
