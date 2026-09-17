"""Locate a real emitted tokenizer excerpt; documentation verification only."""
import hashlib
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from kernel.build import Kernel


class LocatedKernel(Kernel):
    def token_read(self):
        start = sum(map(len, self.b.parts))
        pointer = self.b.p
        super().token_read()
        self.tokenizer_range = (start, sum(map(len, self.b.parts)), pointer)


kernel = LocatedKernel()
generated, _ = kernel.build()
artifact = (ROOT / 'artifacts/kernel.bf').read_text()
assert generated == artifact, 'Excerpt must come from the exact artifact'
start, end, pointer = kernel.tokenizer_range
excerpt = artifact[start:start + 720]
target = ROOT / 'records/004'
(target / 'bf-excerpt.txt').write_text('\n'.join(excerpt[i:i+80] for i in range(0,len(excerpt),80))+'\n')
(target / 'bf-excerpt.json').write_text(json.dumps({
    'artifact': 'artifacts/kernel.bf',
    'artifactSha256': hashlib.sha256(artifact.encode()).hexdigest(),
    'generator': 'kernel/build.py:Kernel.token_read',
    'offsetConvention': 'Zero-based raw command offsets, excluding added display line breaks',
    'start': start, 'endExclusive': start+len(excerpt),
    'completeTokenizerEndExclusive': end, 'initialPointer': pointer,
    'excerptSha256': hashlib.sha256(excerpt.encode()).hexdigest(),
    'scope': 'First720commands of the real tokenizer: initialize token state and begin reading/skipping input. A partial function excerpt, not a standalone program or a routing/scheduler algorithm.'
},indent=2)+'\n')
print(f'Exact BF tokenizer excerpt [{start},{start+len(excerpt)}) verified.')
