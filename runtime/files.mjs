import {open,rename,unlink} from 'node:fs/promises';
import {dirname,basename,join} from 'node:path';
import {randomUUID} from 'node:crypto';

// OS durability boundary. Never interprets the machine image's guest data.
export async function atomicWrite(path,contents) {
  const temporary=join(dirname(path),`.${basename(path)}.${randomUUID()}.tmp`);
  let file;
  try {
    file=await open(temporary,'wx',0o600);
    await file.writeFile(contents,'utf8');await file.sync();await file.close();file=null;
    await rename(temporary,path);
    const directory=await open(dirname(path),'r');
    try {await directory.sync();} finally {await directory.close();}
  } finally {
    if(file)await file.close();
    await unlink(temporary).catch(e=>{if(e.code!=='ENOENT')throw e;});
  }
}
