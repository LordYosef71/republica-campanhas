'use strict';
const D=require('./data.cjs'),crypto=require('node:crypto');
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const fail=message=>{throw new Error(message)};
const choose=(list,id)=>list.find(x=>x.id===id)||fail('Opção inválida.');
function roster(r){return r.universe==='reference'?D.realCandidates:D.fictionalCandidates}
function log(r,text){r.feed.unshift(text);r.feed=r.feed.slice(0,35)}
function makeRoom(options={}){
 if(!['fictional','reference','custom'].includes(options.universe))fail('Escolha o universo.');
 if(![10,20,30].includes(options.turnLimit))fail('Duração inválida.');
 return {code:crypto.randomBytes(4).toString('hex').toUpperCase(),universe:options.universe,mode:options.mode==='solo'?'solo':'multi',turnLimit:options.turnLimit,turn:1,phase:'lobby',players:[],hostId:null,feed:[],support:{},deputies:{},finalists:[],revision:0,createdAt:Date.now()};
}
function addPlayer(r,input,bot=false){
 if(r.phase!=='lobby')fail('A campanha já começou.');if(r.players.length>=6)fail('Sala cheia (máximo de 6).');
 const name=String(input.name||'').trim().slice(0,30);if(!name)fail('Informe seu apelido.');
 let candidate;if(r.universe==='custom'&&!bot&&!input.customCandidate)fail('No modo personalizado, crie sua candidatura.');if(input.customCandidate){const c=input.customCandidate;const name=String(c.name||'').trim().slice(0,40),party=String(c.party||'').trim().slice(0,25);if(!name||!party)fail('Informe nome e partido da candidatura personalizada.');if(!D.territories.some(s=>s.region===c.region))fail('Região inválida.');candidate={id:'custom-'+crypto.randomUUID(),name,shortName:name,party,bloc:'Candidatura personalizada',region:c.region,stats:{economy:60,social:60,security:60,trust:60,charisma:60,machine:60,ground:60}};}else candidate=choose(roster(r),input.candidateId);const vice=choose(D.runningMates,input.viceId),finance=choose(D.finances,input.financeId);if(input.customParty){const party=String(input.customParty).trim().slice(0,25);if(party)candidate={...candidate,party};}
 if(r.players.some(p=>p.candidate.id===candidate.id))fail('Essa candidatura já está ocupada.');
 const ideology=D.ideologies.includes(input.ideology)?input.ideology:D.ideologies[r.players.length%D.ideologies.length];const color=/^#[0-9a-f]{6}$/i.test(input.color||'')?input.color:D.colors.find(c=>!r.players.some(p=>p.candidate.color.toLowerCase()===c.toLowerCase()));if(r.players.some(p=>p.candidate.color.toLowerCase()===color.toLowerCase()))fail('Outra equipe já escolheu esta cor.');let logo=null;if(input.logo){if(typeof input.logo!=='string'||input.logo.length>50000||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(input.logo))fail('Imagem inválida. Use PNG, JPEG ou WebP de até 35 KB após o processamento.');const bytes=Buffer.from(input.logo.split(',')[1],'base64');if(!((bytes[0]===0x89&&bytes.toString('ascii',1,4)==='PNG')||(bytes[0]===0xff&&bytes[1]===0xd8)||(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')))fail('Formato de imagem inválido.');logo=input.logo;}
 const p={id:crypto.randomUUID(),token:crypto.randomBytes(24).toString('hex'),name,bot,candidate:{...candidate,color},vice,finance,ideology,logo,accountId:input.accountId||null,network:1200,militancy:40,sectors:Object.fromEntries(D.sectors.map((s,i)=>[s.id,40+(D.ideologies.indexOf(ideology)*7+i*9)%25])),focus:{uf:'SP',category:'program'},social:[],money:finance.initial,energy:100,reputation:55+finance.reputation,volunteers:30,actionsLeft:5,ready:false,eliminated:false,used:[],ledger:[],actionsTotal:0};
 r.players.push(p);r.hostId=r.hostId||p.id;r.revision++;return p;
}
function normalize(r,uf){const values=r.support[uf],total=Object.values(values).reduce((a,b)=>a+b,0);for(const id of Object.keys(values))values[id]=values[id]*100/total}
function start(r,p){
 if(p.id!==r.hostId)fail('Somente quem criou a sala pode iniciar.');if(r.phase!=='lobby')fail('Partida já iniciada.');
 if(r.mode==='solo'){const available=roster(r).filter(c=>!r.players.some(p=>p.candidate.id===c.id));for(let i=0;i<3;i++)addPlayer(r,{name:'Equipe automática '+(i+1),candidateId:available[i].id,viceId:D.runningMates[(i+4)%15].id,financeId:D.finances[(i+3)%15].id},true)}
 if(r.players.length<2)fail('Aguarde pelo menos duas pessoas.');
 r.social=[];r.events=[];r.endorsements={};for(const s of D.territories){r.support[s.uf]={};for(let i=0;i<r.players.length;i++){const q=r.players[i];const region=q.candidate.region||Object.keys(q.candidate.regionBoosts||{})[0];r.support[s.uf][q.id]=20+(region===s.region?5:0)+(q.vice.region===s.region?2:0);}normalize(r,s.uf)}
 r.phase='first';log(r,'Campanha iniciada. Cinco decisões por equipe e turno. Todos os números são fictícios.');r.revision++;
}
function active(r){return r.players.filter(p=>!p.eliminated)}
function ranking(r){const total=D.territories.reduce((s,x)=>s+x.voters,0);return active(r).map(p=>({id:p.id,name:p.candidate.shortName||p.candidate.name,color:p.candidate.color,share:D.territories.reduce((sum,s)=>sum+(r.support[s.uf]?.[p.id]||0)*s.voters,0)/total})).sort((a,b)=>b.share-a.share)}
function cost(p,a){let v=a.cost*p.finance.cost;if(p.finance.discount===a.category)v*=p.finance.discountFactor;return Math.round(v*10)/10}
function action(r,p,input){
 if(!['first','runoff'].includes(r.phase))fail('Campanha não está em andamento.');if(p.eliminated)fail('Sua chapa foi eliminada.');if(p.ready)fail('Você já encerrou este turno.');if(p.actionsLeft<=0)fail('Suas cinco decisões terminaram.');
 const a=choose(D.actions,input.actionId),state=D.territories.find(s=>s.uf===input.uf)||fail('Estado inválido.');
 const usedKey=a.id+':'+state.uf;if(p.used.includes(usedKey)&&a.id!=='rest')fail('Esta ação já foi usada nesta UF neste turno.');
 const expense=cost(p,a);if(p.money<expense)fail('Verba insuficiente.');if(p.energy<a.energy)fail('Energia insuficiente.');
 let deputy=null;if(a.id==='deputy'){deputy=D.deputies.find(d=>d.id===input.deputyId&&d.uf===state.uf)||fail('Escolha um deputado deste estado.');if(r.deputies[deputy.id])fail('Deputado já tem uma aliança.');}
 p.money=Math.round((p.money-expense)*10)/10;p.energy-=a.energy;p.actionsLeft--;p.actionsTotal++;p.used.push(usedKey);p.volunteers+=a.volunteers;p.focus={uf:state.uf,category:a.category};p.militancy=clamp(p.militancy+(a.category==='mobilization'?3:0),0,100);p.network+=a.category==='communication'?400:60;const sector=D.sectors.find(s=>s.issue===a.specialty);if(sector)p.sectors[sector.id]=clamp(p.sectors[sector.id]+4,0,100);const post={turn:r.turn,playerId:p.id,candidate:p.candidate.shortName||p.candidate.name,party:p.candidate.party,uf:state.uf,category:a.category,text:a.name+' — '+state.name,reach:Math.round(p.network*(.4+p.reputation/100)),likes:Math.round(p.network*.04)};p.social.unshift(post);p.social=p.social.slice(0,12);r.social.unshift(post);r.social=r.social.slice(0,50);
 let power=a.power*(.75+(p.candidate.stats[a.specialty]||50)/100)*(.75+p.reputation/200);
 if(p.vice.specialty===a.specialty)power*=p.vice.multiplier;
 if(p.vice.region===state.region)power*=1.1;
 if(a.category==='mobilization')power*=1+Math.min(.5,p.volunteers/350)+p.militancy/500;if(a.category==='communication')power*=1+Math.min(.35,p.network/20000);if(sector)power*=.8+p.sectors[sector.id]/200;
 if(a.category==='alliance')power*=p.finance.alliance;
 if(deputy){r.deputies[deputy.id]=p.id;power+=deputy.strength*.4;p.volunteers+=deputy.strength;log(r,p.name+' conquistou o apoio de '+deputy.name+'.');}
 if(a.id==='fundraise'){const raised=Math.round((20+p.volunteers*.1)*p.finance.fundraising);p.money+=raised;p.ledger.unshift({turn:r.turn,label:a.name,expense,income:raised});}
 else p.ledger.unshift({turn:r.turn,label:a.name,expense,income:0});
 p.ledger=p.ledger.slice(0,25);
 if(a.id==='rest')p.energy=clamp(p.energy+30,0,100);
 if(a.id==='audit')p.reputation=clamp(p.reputation+8,0,100);
 if(a.id==='survey'||a.id==='plan')p.reputation=clamp(p.reputation+3,0,100);
 if(a.id==='debate'&&r.turn%5===0){power*=1.6;log(r,'Boa preparação: '+p.name+' ganhou destaque no debate.');}
 const national=['tv','debate'].includes(a.id);
 for(const s of national?D.territories:[state]){r.support[s.uf][p.id]+=national?power*.3:power;normalize(r,s.uf)}
 log(r,p.name+': '+a.name+(national?' em rede nacional.':' em '+state.name+'.'));r.revision++;
}
function botTurn(r,p){for(let i=0;i<5&&p.actionsLeft>0;i++){const states=[...D.territories].sort((a,b)=>a.uf.localeCompare(b.uf));const state=states[(r.turn*7+i*3+r.players.indexOf(p))%states.length];const choices=D.actions.filter(a=>a.id!=='deputy'&&a.energy<=p.energy&&cost(p,a)<=p.money&&!p.used.includes(a.id+':'+state.uf));let a=p.money<18?choices.find(a=>a.id==='fundraise'):p.energy<18?choices.find(a=>a.id==='rest'):choices.filter(a=>a.power>1)[(r.turn+i)%Math.max(1,choices.filter(a=>a.power>1).length)];a=a||D.actions.find(a=>a.id==='rest');action(r,p,{actionId:a.id,uf:state.uf})}p.ready=true;}
function finishElection(r){const rank=ranking(r);r.result=rank;r.phase='finished';log(r,'Apuração final: '+rank[0].name+' venceu com '+rank[0].share.toFixed(1)+'% dos votos simulados.');}
function advance(r){
 if(r.turn>=r.turnLimit){const rank=ranking(r);if(r.phase==='runoff'||rank[0].share>50){finishElection(r);return;}
 r.firstRoundSupport=structuredClone(r.support);r.firstRoundResult=rank;r.finalists=rank.slice(0,2).map(x=>x.id);for(const p of r.players)p.eliminated=!r.finalists.includes(p.id);
 for(const s of D.territories){for(const id of Object.keys(r.support[s.uf]))if(!r.finalists.includes(id))delete r.support[s.uf][id];normalize(r,s.uf)}
 r.phase='runoff';r.turn=1;r.turnLimit=10;log(r,'Segundo turno: '+rank.slice(0,2).map(x=>x.name).join(' e ')+'. Dez turnos finais.');
 }else{r.turn++;log(r,'Novo turno: '+r.turn+'. Receita recebida e equipes reorganizadas.');}
 randomEvent(r);for(const p of active(r)){p.ready=false;p.actionsLeft=5;p.used=[];p.energy=clamp(p.energy+35,0,100);p.money+=p.finance.income;p.ledger.unshift({turn:r.turn,label:'Receita recorrente',expense:0,income:p.finance.income});p.ledger=p.ledger.slice(0,25);const allies=Object.values(r.deputies).filter(id=>id===p.id).length;if(allies)for(const s of D.territories){const n=D.deputies.filter(d=>d.uf===s.uf&&r.deputies[d.id]===p.id).length;if(n){r.support[s.uf][p.id]+=n*.15;normalize(r,s.uf)}}}
}
function randomEvent(r){const people=active(r);if(!people.length)return;const p=people[crypto.randomInt(people.length)],kind=crypto.randomInt(5);const effects=[['Onda de voluntariado',()=>{p.volunteers+=15;p.militancy=clamp(p.militancy+5,0,100)}],['Doações espontâneas',()=>{p.money+=12;p.ledger.unshift({turn:r.turn,label:'Evento: doações espontâneas',income:12,expense:0})}],['Entrevista repercute',()=>{p.network+=700}],['Agenda cancelada',()=>{p.energy=clamp(p.energy-8,0,100)}],['Cobrança pública',()=>{p.reputation=clamp(p.reputation-4,0,100)}]];effects[kind][1]();const text=effects[kind][0]+' — '+p.name;const event={turn:r.turn,phase:r.phase,text};r.events.unshift(event);r.events=r.events.slice(0,20);log(r,'Evento aleatório: '+text);}
function endorse(r,p,targetId){if(r.phase!=='runoff'||!p.eliminated)fail('Apenas candidaturas derrotadas podem declarar apoio no segundo turno.');if(r.endorsements[p.id])fail('Apoio já declarado.');const target=r.players.find(q=>q.id===targetId&&!q.eliminated);if(!target)fail('Escolha uma candidatura finalista.');r.endorsements[p.id]=targetId;for(const s of D.territories){const prior=r.firstRoundSupport[s.uf][p.id]||0;const other=active(r).find(q=>q.id!==targetId);const transfer=Math.min(r.support[s.uf][other.id]-.01,prior*.35);r.support[s.uf][targetId]+=transfer;r.support[s.uf][other.id]-=transfer;}target.reputation=clamp(target.reputation+2,0,100);log(r,p.name+' declarou apoio a '+target.name+' no segundo turno.');r.revision++;}
function negotiate(r,p,defeatedId){if(r.phase!=='runoff'||p.eliminated||p.ready)fail('Negocie durante seu turno na etapa final.');const q=r.players.find(q=>q.id===defeatedId&&q.eliminated&&q.bot);if(!q)fail('Escolha uma candidatura automática derrotada.');if(r.endorsements[q.id])fail('Candidatura já declarou apoio.');if(p.actionsLeft<1||p.money<12)fail('A negociação exige uma decisão e R$ 12 mi.');p.money-=12;p.actionsLeft--;p.ledger.unshift({turn:r.turn,label:'Negociação de apoio',expense:12,income:0});endorse(r,q,p.id);}
function settleBots(r){let guard=0;while(['first','runoff'].includes(r.phase)&&active(r).every(p=>p.bot)&&guard++<45){for(const p of active(r))if(!p.ready)botTurn(r,p);advance(r)}}
function ready(r,p){if(!['first','runoff'].includes(r.phase)||p.eliminated)fail('Você não está disputando este turno.');if(p.ready)fail('Turno já encerrado.');p.ready=true;log(r,p.name+' encerrou o turno.');for(const bot of active(r).filter(q=>q.bot&&!q.ready))botTurn(r,bot);if(active(r).every(q=>q.ready))advance(r);settleBots(r);r.revision++;}
function leave(r,p){if(p.bot)fail('Equipe já está automática.');if(r.phase==='lobby'){r.players=r.players.filter(q=>q.id!==p.id);if(r.hostId===p.id)r.hostId=r.players[0]?.id||null;}else{p.bot=true;log(r,p.name+' saiu; a equipe passa ao controle automático.');if(['first','runoff'].includes(r.phase)&&!p.eliminated&&!p.ready)botTurn(r,p);if(['first','runoff'].includes(r.phase)&&active(r).every(q=>q.ready))advance(r)}settleBots(r);r.revision++;}
function view(r,p){return {...r,players:r.players.map(q=>{const {token,...safe}=q;if(q.id!==p.id){delete safe.used;delete safe.ledger;}return safe}),me:p.id,ranking:r.phase==='lobby'?[]:ranking(r)};}
module.exports={endorse,negotiate,makeRoom,addPlayer,start,action,ready,leave,view,ranking,cost};
