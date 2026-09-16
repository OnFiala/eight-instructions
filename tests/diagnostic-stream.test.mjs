import test from 'node:test';
import assert from 'node:assert/strict';
import {NativeDiagnostics} from '../runtime/diagnostics.mjs';
import {spawnSync} from 'node:child_process';
test('CLI diagnostics ignore opaque source bodies across every byte split',()=>{
  const body=': user.thread \\ example\n!E3 \nWS-ERROR 7 \n;';
  const out=`SOURCE 6 ${body.length}\n${body}\nVERSION-SOURCE ${body.length}\n${body}\n`;
  for(let split=0;split<=out.length;split++){
    const d=new NativeDiagnostics();d.feed(out.slice(0,split));d.feed(out.slice(split));assert.equal(d.boundary(),false);
    d.feed('!E');d.feed('3 ');assert.equal(d.boundary(),true);
  }
  const d=new NativeDiagnostics();for(const byte of out)d.feed(byte);assert.equal(d.boundary(),false);
  d.feed('WS-ERROR 39 \n');assert.equal(d.boundary(),true);
});
test('a fresh CLI reads a real BF-stored source containing diagnostic text without a false error exit',()=>{
  const source=': factory-west.thread schema# 1 \\ !E3 example\n;';
  const input=`${source.length} 1 source-write ${source} 1 source-read 1 module-compile 1 3 mf w@ serial-of version-source`;
  const r=spawnSync(process.execPath,['runtime/cli.mjs','--load','dist/initial-industry.8i','--eval',input],{encoding:'utf8',timeout:120000,maxBuffer:2e6});
  assert.equal(r.status,0,r.stderr);assert.ok(r.stdout.includes(source));assert.match(r.stdout,/SOURCE-STORED 1/);
});
