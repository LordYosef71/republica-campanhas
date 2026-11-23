'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
function createStorage(config={}){
 const directory=config.directory||process.env.REPUBLICA_DATA_DIR||path.join(__dirname,'.data'),url=config.url??process.env.REPUBLICA_STORAGE_URL,key=config.key??process.env.REPUBLICA_STORAGE_KEY,fetcher=config.fetch||fetch;
 if(Boolean(url)!==Boolean(key))throw Error('Configure o endereço e a credencial do banco juntos.');
 if(process.env.NODE_ENV==='production'&&!url&&!config.allowLocal)throw Error('Produção exige persistência remota.');
 if(url&&!/^https:\/\/[a-z0-9]+\.supabase\.co\/functions\/v1\/republica-storage$/.test(url))throw Error('Endereço de banco inválido.');
 let version=0,healthy=false;
 async function remote(body){for(let i=0;i<3;i++){try{const res=await fetcher(url,{method:'POST',headers:{'Content-Type':'application/json','x-republica-key':key},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});if(!res.ok)throw Error('Banco indisponível.');return await res.json()}catch(e){if(i===2){healthy=false;throw Error('Não foi possível confirmar o salvamento. Tente novamente após reiniciar o serviço.')}}}}
 const file=path.join(directory,'state.json');
 return {remote:Boolean(url),healthy:()=>healthy,async load(){let state={users:[],sessions:[],rooms:[]};if(url){const row=await remote({operation:'read'});if(!row||!Number.isInteger(row.version)||!row.data)throw Error('Resposta de banco inválida.');version=row.version;state=row.data;}else{try{state=JSON.parse(fs.readFileSync(file,'utf8'))}catch(e){if(e.code!=='ENOENT')throw e}}if(!Array.isArray(state.users)||!Array.isArray(state.rooms)||!Array.isArray(state.sessions))throw Error('Dados inválidos.');healthy=true;return state},async save(state){if(!healthy)throw Error('Armazenamento indisponível.');if(url){const row=await remote({operation:'write',expected:version,data:state,writeId:crypto.randomUUID()});if(row.version!==version+1){healthy=false;throw Error('Versão do banco inválida.')}version=row.version;}else{fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(file+'.tmp',JSON.stringify(state));fs.renameSync(file+'.tmp',file)}}};
}
module.exports={createStorage};
