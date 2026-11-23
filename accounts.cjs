'use strict';
const crypto=require('node:crypto'),{promisify}=require('node:util'),scrypt=promisify(crypto.scrypt);
const hash=t=>crypto.createHash('sha256').update(t).digest('hex');
const clean=v=>String(v||'').replace(/[<>\x00-\x1f]/g,'').trim();
const publicUser=u=>({id:u.id,username:u.username,name:u.name,color:u.color});
function current(req,state){const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('republica_session='))?.split('=')[1];if(!token||!/^[a-f0-9]{64}$/.test(token))return null;const s=state.sessions.find(s=>s.hash===hash(token)&&s.expires>Date.now());return s?state.users.find(u=>u.id===s.userId):null}
function cookie(req,res,value,remove=false){const secure=process.env.NODE_ENV==='production'||req.socket.encrypted;res.setHeader('Set-Cookie','republica_session='+value+'; Path=/; HttpOnly; SameSite=Lax; Max-Age='+(remove?0:2592000)+(secure?'; Secure':''))}
async function handle(req,res,route,data,state){
 if(route==='/api/me')return {user:current(req,state)?publicUser(current(req,state)):null};
 if(route==='/api/logout'){const token=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('republica_session='))?.split('=')[1];state.sessions=state.sessions.filter(s=>s.hash!==hash(token||''));cookie(req,res,'',true);return {user:null}}
 const username=clean(data.username).toLowerCase(),password=String(data.password||'');if(!/^[a-z0-9_]{3,24}$/.test(username))throw Error('Usuário: 3 a 24 letras, números ou _.');if(password.length<8||password.length>128)throw Error('Senha: 8 a 128 caracteres.');
 let user=state.users.find(u=>u.username===username);
 if(route==='/api/register'){if(user)throw Error('Esse usuário já existe.');if(state.users.length>=5000)throw Error('Cadastro temporariamente indisponível.');const salt=crypto.randomBytes(16).toString('hex');user={id:crypto.randomUUID(),username,name:clean(data.name||username).slice(0,30),color:/^#[0-9a-f]{6}$/i.test(data.color||'')?data.color:'#65e1b5',salt,hash:(await scrypt(password,salt,64)).toString('hex')};state.users.push(user)}
 else if(route==='/api/login'){const derived=await scrypt(password,user?.salt||'missing-account-salt',64);if(!user||!crypto.timingSafeEqual(Buffer.from(user.hash,'hex'),derived))throw Error('Usuário ou senha inválidos.')}else throw Error('Rota de conta inválida.');
 const token=crypto.randomBytes(32).toString('hex');state.sessions=state.sessions.filter(s=>s.expires>Date.now());state.sessions.push({hash:hash(token),userId:user.id,expires:Date.now()+30*86400000});cookie(req,res,token);return {user:publicUser(user)};
}
module.exports={current,handle,publicUser};
