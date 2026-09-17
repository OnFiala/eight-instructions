// Display decoding only. BF chooses goals, branches, scores and publication.
// Trial compiler/world records must never enter the live renderer or editor.
export function readAutonomy(output){
  let pos=0,world=0,live='',records=[],sources=[];
  while(pos<output.length){
    const end=output.indexOf('\n',pos);if(end<0)break;
    const line=output.slice(pos,end),[kind,...parts]=line.trim().split(/\s+/);pos=end+1;
    if(kind==='WORLD'){
      if(!/^[01]$/.test(parts[0]))throw Error('Invalid native world marker');
      world=Number(parts[0]);continue;
    }
    if(['SOURCE','VERSION-SOURCE','GENERATED','SUBMITTED-CANDIDATE'].includes(kind)){
      const size=Number(parts.at(-1));
      if(!Number.isSafeInteger(size)||size<0||size>512||pos+size>output.length)throw Error('Incomplete native source frame');
      const source=output.slice(pos,pos+size);pos+=size;if(output[pos]==='\n')pos++;
      if(kind==='GENERATED'||kind==='SUBMITTED-CANDIDATE')sources.push({kind,values:parts.map(Number),source});
      else if(world===0)live+=line+'\n'+source+'\n';
      continue;
    }
    if(/^(SEARCH-BEGIN|SEARCH-DECISION|SEARCH-REFUSED|TRIAL-RESULT|VALIDATION-BEGIN|VALIDATION-RESULT|NATIVE-ROLLBACK|SYNTHESIS|GOAL|SCENARIO-COMPLETE|DISTRICT|DISTRICT-PLANNED|DISTRICT-BUILT|DISTRICT-BLOCKED|CONSTRUCTION-PHASE|AUTONOMY-MODULE)$/.test(kind)){
      if(parts.some(p=>!/^\d+$/.test(p)||Number(p)>65535))throw Error('Invalid native autonomy record');
      records.push({kind,values:parts.map(Number),world,raw:line.trim()});
    }
    if(world===0)live+=line+'\n';
  }
  return {live,records,sources};
}
export const decisionText={1:'New rule accepted after an additional test.',2:'No better rule found. The current program stays.',3:'The live world changed. This result was not applied.',4:'Publication could not finish. The current program stays.',5:'The observation failed. BF restored the previous rule.',7:'The additional test rejected this rule.'};
