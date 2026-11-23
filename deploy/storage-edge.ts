const EXPECTED="ad34e1220ae7168923d435150c7469b296d9500842174d8f8adbea61e499048c";
Deno.serve(async(req: Request)=>{
if(req.method!=="POST")return new Response("Method not allowed",{status:405});
const token=req.headers.get("x-republica-key")||"";
if(token.length!==96)return new Response("Unauthorized",{status:401});
const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,"0")).join("");
let delta=0;for(let i=0;i<EXPECTED.length;i++)delta|=hash.charCodeAt(i)^EXPECTED.charCodeAt(i);
if(delta)return new Response("Unauthorized",{status:401});
try{const body=await req.json();const write=body.operation==="write";if(!write&&body.operation!=="read")return new Response("Invalid operation",{status:400});
const keys=JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}");const key=Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||keys.default;
if(!key)return new Response("Service unavailable",{status:503});
const result=await fetch(Deno.env.get("SUPABASE_URL")+"/rest/v1/rpc/"+(write?"republica_write":"republica_read"),{method:"POST",headers:{"Content-Type":"application/json",apikey:key,Authorization:"Bearer "+key},body:JSON.stringify(write?{p_expected:body.expected,p_data:body.data,p_write_id:body.writeId}:{})});
if(!result.ok)return new Response("Persistence unavailable",{status:503});return new Response(await result.text(),{headers:{"Content-Type":"application/json","Cache-Control":"no-store"}});
}catch{return new Response("Invalid request",{status:400})}});
