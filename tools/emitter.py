"""A deterministic assembler that emits only Brainfuck; never runs guest code."""
from contextlib import contextmanager


class BF:
    def __init__(self):
        self.parts = []
        self.p = 0
        self.next_cell = 0
        self.free = []
        self.names = {}

    def cell(self, name=None):
        c = self.next_cell
        self.next_cell += 1
        if name:
            self.names[name] = c
        assert self.next_cell < 512, 'scratch overlaps arrays'
        return c

    @contextmanager
    def temps(self, n=1):
        cells = [self.free.pop() if self.free else self.cell() for _ in range(n)]
        for c in cells:
            self.clear(c)
        yield cells[0] if n == 1 else cells
        for c in cells:
            self.clear(c)
        self.free.extend(cells)

    def at(self, c):
        d = c - self.p
        self.parts.append('>' * d if d >= 0 else '<' * -d)
        self.p = c

    def raw(self, code, end=None):
        assert set(code) <= set('><+-.,[]')
        self.parts.append(code)
        if end is not None:
            self.p = end

    def clear(self, c):
        self.at(c)
        self.raw('[-]')

    def add(self, c, value=1):
        self.at(c)
        value %= 65536
        self.raw('+' * value if value <= 32768 else '-' * (65536-value))

    def set(self, c, value):
        self.clear(c)
        self.add(c, value)

    @contextmanager
    def loop(self, c):
        self.at(c)
        self.raw('[')
        yield
        self.at(c)
        self.raw(']')

    def move(self, src, dst, factor=1):
        assert src != dst
        with self.loop(src):
            self.add(src, -1)
            self.add(dst, factor)

    def copy(self, src, dst):
        assert src != dst
        self.clear(dst)
        with self.temps() as t:
            with self.loop(src):
                self.add(src, -1)
                self.add(dst)
                self.add(t)
            self.move(t, src)

    @contextmanager
    def when(self, c):
        with self.temps() as t:
            self.copy(c, t)
            with self.loop(t):
                self.clear(t)
                yield

    @contextmanager
    def zero(self, c):
        with self.temps() as t:
            self.set(t, 1)
            with self.when(c):
                self.clear(t)
            with self.loop(t):
                self.clear(t)
                yield

    def eq(self, a, b, out):
        with self.temps(2) as (x, y):
            self.copy(a, x)
            self.copy(b, y)
            self.move(y, x, -1)
            self.set(out, 0)
            with self.zero(x):
                self.set(out, 1)

    def eqn(self, a, n, out):
        with self.temps() as t:
            self.copy(a, t)
            self.add(t, -n)
            self.clear(out)
            with self.zero(t):
                self.set(out, 1)

    def lt(self, a, b, out):
        """Unsigned comparison. Operates on copies; terminates at min(a,b)."""
        with self.temps(3) as (x, y, go):
            self.copy(a, x)
            self.copy(b, y)
            self.copy(x, go)
            with self.loop(go):
                self.clear(go)
                with self.when(y):
                    self.add(x, -1)
                    self.add(y, -1)
                    self.copy(x, go)
            self.clear(out)
            with self.when(y):
                self.set(out, 1)

    def mul(self, a, b, out):
        with self.temps(2) as (x, y):
            self.copy(a, x)
            self.clear(out)
            with self.loop(x):
                self.add(x, -1)
                self.copy(b, y)
                self.move(y, out)

    def text(self, text):
        with self.temps() as t:
            last = 0
            for b in text.encode('ascii'):
                self.add(t, b-last)
                self.at(t)
                self.raw('.')
                last = b

    def source(self):
        return ''.join(self.parts) + '\n'


class Array:
    """Four lanes: outbound count, return breadcrumb, value, traveling cargo.

    Access walks index frames in Brainfuck, then walks back clearing breadcrumbs.
    This assembler does not know or compute the runtime index.
    """
    def __init__(self, b, base, size, name, banks=1):
        self.b, self.base, self.size, self.name = b, base, size, name
        self.unit, self.banks, self.stride = 4, banks, 4*banks

    def access(self, index, value, write=False):
        b, p, stride = self.b, self.base, self.stride
        right, left = '>'*stride, '<'*stride
        b.copy(index, p)
        b.clear(p+3)
        if write:
            b.copy(value, p+3)
        b.at(p)
        b.raw('[-[-'+right+'+'+left+']>>>[-'+right+'+'+left+']'+'>'*(stride-2)+'+<]')
        if write:
            b.raw('>>[-]>[-<+>]<<')  # target lane 1
            b.raw('<')
        else:
            b.raw('>>[->+<<<+>>]<<[->>+<<]')
        b.raw('>[->>[-'+left+'+'+right+']'+'<'*(stride+2)+']', end=p+1)
        if not write:
            b.clear(value)
            b.move(p+3, value)

    def get(self, index, out):
        self.access(index, out)

    def put(self, index, value):
        self.access(index, value, True)


class PagedArray:
    """Six-lane BF memory with a page and offset address; 64 words per page.

    Both walks, cargo transfer and return are emitted Brainfuck. Callers own the
    two address components. No host-side random access primitive is introduced.
    """
    def __init__(self, b, base, size, name, banks=1):
        self.b, self.base, self.size, self.name = b, base, size, name
        self.unit, self.banks, self.stride = 6, banks, 6*banks

    def access(self, high, low, value, write=False):
        b, p, hop = self.b, self.base, 64*self.stride
        right, left = '>'*hop, '<'*hop
        step, back = '>'*self.stride, '<'*self.stride
        b.copy(high, p)
        b.copy(low, p+4)
        b.clear(p+3)
        if write: b.copy(value, p+3)
        b.at(p)
        b.raw('[-[-'+right+'+'+left+']>>>[-'+right+'+'+left+']>[-'+right+'+'+left+']'+ '>'*(hop-3)+'+<]')
        # At page base lane 0. Walk the low part, leaving separate breadcrumbs.
        b.raw('>>>>[-[-'+step+'+'+back+']<[-'+step+'+'+back+']'+'>'*(self.stride+2)+'+<]')
        b.raw('<<<<')  # target lane 0
        if write: b.raw('>>[-]>[-<+>]<<<')
        else: b.raw('>>[->+<<<+>>]<<[->>+<<]')
        # Return low part from lane 5, then page part from lane 1.
        b.raw('>>>>>[-<<[-'+back+'+'+step+']'+'<'*(self.stride-2)+']<<<<')
        b.raw('[->>[-'+left+'+'+right+']'+'<'*(hop+2)+']', end=p+1)
        if not write:
            b.clear(value)
            b.move(p+3, value)

    def get(self, high, low, out): self.access(high, low, out)
    def put(self, high, low, value): self.access(high, low, value, True)


def copy_bank(array, source, target):
    """Emit a bounded streaming copy of value lanes, preserving the source.

    Context slots are opaque data. The caller supplies two compile-time lane
    selectors; the kernel checks runtime context numbers before selecting this
    emitted operation. No host reads values or performs the copy at runtime.
    All walk/cargo/temporary lanes return to zero, including the end sentinel.
    """
    assert 0 <= source < array.banks and 0 <= target < array.banks
    if source == target:
        return
    b, p, stride = array.b, array.base, array.stride
    src, dst, tmp = 2 + source*array.unit, 2 + target*array.unit, 3
    # Lane zero carries the remaining fixed count. Lane three preserves source.
    def move(a, z):
        return '>'*(z-a) if z >= a else '<'*(a-z)
    b.set(p, array.size)
    b.at(p)
    b.raw('[-[->' + '>'*(stride-1) + '+' + '<'*stride + ']' +
          move(0, dst) + '[-]' + move(dst, tmp) + '[-]' + move(tmp, src) +
          '[-' + move(src, dst) + '+' + move(dst, tmp) + '+' + move(tmp, src) + ']' +
          move(src, tmp) + '[-' + move(tmp, src) + '+' + move(src, tmp) + ']' +
          move(tmp, stride) + ']', end=p+array.size*stride)


def clear_bank(array, bank):
    """Emit bounded zeroing of one opaque value context, including all objects."""
    assert 0 <= bank < array.banks
    b, p, stride = array.b, array.base, array.stride
    lane = 2 + bank*array.unit
    b.set(p, array.size)
    b.at(p)
    b.raw('[-[->' + '>'*(stride-1) + '+' + '<'*stride + ']' +
          '>'*lane + '[-]' + '>'*(stride-lane) + ']',
          end=p+array.size*stride)
