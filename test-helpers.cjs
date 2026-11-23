const E=require('./engine.cjs'),V=require('./campaign-life.cjs');
function end(r,p){const event=V.due(r);if(event&&!p.ready&&!p.eliminated)while(!p.broadcasts[event.id]?.completed)E.broadcast(r,p,{approach:'evidence'});return E.ready(r,p);}
function tick(r,now){const changed=E.tick(r,now);if(r.phase==='counting')E.tick(r,r.counting.anchor+60001);return changed;}
module.exports={end,tick};
