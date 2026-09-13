export function registerExperimentTools({context,runSource,readState,reportError=()=>{}}) {
  if(!context?.registerTool)return ()=>{};
  const lifecycle=new AbortController();
  const registrations=[{
    name:'execute_thread_source',title:'Execute a program inside Brainfuck',
    description:'Send Thread source to the visible local machine, starting its native libraries if necessary. This changes its guest state and may emit output. It does not save files or contact a server.',
    inputSchema:{type:'object',properties:{source:{type:'string',minLength:1,maxLength:100000}},required:['source'],additionalProperties:false},
    annotations:{readOnlyHint:false,untrustedContentHint:true},
    async execute(input){
      if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>k!=='source')||typeof input.source!=='string'||!input.source.length||input.source.length>100000)throw new Error('Provide one nonempty source string of at most 100,000 characters');
      return await runSource(input.source);
    },
  },{
    name:'read_machine_state',title:'Read the visible machine state',
    description:'Read the same generic execution status, instruction counters and small tape view shown by the debugger. This does not run guest instructions or change data.',
    inputSchema:{type:'object',properties:{},additionalProperties:false},
    annotations:{readOnlyHint:true,untrustedContentHint:true},
    async execute(input){if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).length)throw new Error('No arguments are accepted');return await readState();},
  }];
  for(const tool of registrations) {
    try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(reportError);}catch(error){reportError(error);}
  }
  return ()=>lifecycle.abort();
}
