'use strict';
const reference=require('./reference-data.json');
const regions=['Norte','Nordeste','Centro-Oeste','Sudeste','Sul'];
const viceRows=[
['Helena Duarte','Economista','Sudeste','economy',1.25,'Plano fiscal',110,12,.88,1,1],
['Caio Nascimento','Organizador comunitário','Nordeste','ground',1.28,'Microdoações',72,17,1,1.28,1],
['Lívia Monteiro','Comunicadora','Sul','charisma',1.24,'Assinaturas',90,14,.96,1.12,1],
['Rafael Azevedo','Articulador federativo','Centro-Oeste','machine',1.25,'Rede federativa',120,10,.93,1,1.12],
['Sofia Arantes','Gestora de saúde','Norte','social',1.26,'Rede solidária',82,15,.94,1.08,1],
['Davi Freitas','Especialista em segurança','Sudeste','security',1.25,'Reserva prudente',135,7,.9,.85,1],
['Bia Siqueira','Liderança jovem','Nordeste','charisma',1.25,'Campanha digital',78,13,.82,1.12,1],
['Miguel Valença','Gestor municipal','Sul','machine',1.24,'Comitês municipais',105,11,.92,1,1.18],
['Nara Tavares','Ambientalista','Norte','social',1.27,'Campanha enxuta',65,12,.73,1,1],
['Tomás Ribeiro','Educador','Centro-Oeste','trust',1.25,'Orçamento aberto',88,12,.96,1,1],
['Elisa Brandão','Mediadora','Sudeste','trust',1.28,'Fundo compartilhado',115,9,.9,1,1.1],
['André Paiva','Liderança cooperativa','Sul','ground',1.25,'Rede cooperativa',85,14,.92,1.22,1],
['Cecília Moura','Pesquisadora','Nordeste','economy',1.26,'Foco em pesquisa',100,10,.87,1,1],
['Ícaro Batista','Logístico regional','Norte','ground',1.3,'Caravana eficiente',92,11,.9,1.05,1],
['Malu Farias','Especialista em transparência','Centro-Oeste','trust',1.3,'Reserva de emergência',150,5,.98,.85,1]
];
const runningMates=viceRows.map((v,i)=>({id:'vice-'+i,name:v[0],profile:v[1],region:v[2],specialty:v[3],multiplier:v[4],description:'Ações de '+({economy:'economia',ground:'mobilização',charisma:'comunicação',machine:'articulação',social:'políticas sociais',security:'segurança',trust:'credibilidade'}[v[3]])+' recebem +'+Math.round((v[4]-1)*100)+'% de efeito; +10% em '+v[2]+'.'}));
const financeNotes=[
'Contratos eficientes: gastos gerais −12%, receita estável.',
'Caixa menor, arrecadação +28% e maior receita recorrente.',
'Receita recorrente e arrecadação +12%; gastos −4%.',
'Caixa amplo e articulação +12%; gastos −7%.',
'Receita recorrente alta, gastos −6%, arrecadação +8%.',
'Caixa inicial alto, gastos −10%, arrecadação −15%.',
'Comunicação digital custa 35% menos; demais gastos −18%.',
'Articulação +18%, gastos −8% e receita municipal.',
'Menor caixa inicial; todos os gastos −27%.',
'Reputação inicial +12, custos −4% e receita moderada.',
'Gastos −10%, articulação +10% e caixa compartilhado.',
'Arrecadação +22%, mobilização custa 25% menos.',
'Pesquisa custa 50% menos, demais gastos −13%.',
'Mobilização custa 30% menos; arrecadação +5%.',
'Maior caixa inicial; baixa receita, arrecadação −15%.'
];
const finances=viceRows.map((v,i)=>({id:'finance-'+i,name:v[5],initial:v[6],income:v[7],cost:v[8],fundraising:v[9],alliance:v[10],reputation:i===9?12:0,discount:i===6?'communication':i===11||i===13?'mobilization':i===12?'research':null,discountFactor:i===6?.65:i===11?.75:i===13?.7:i===12?.5:1,description:financeNotes[i]}));
const fictionalNames=['Aurora Campos','Bruno Reis','Clara Nogueira','Danilo Rocha','Eva Albuquerque','Felipe Martins','Gabriela Luz','Hugo Almeida','Iara Sales','Jonas Prado','Kiara Lima','Lucas Neves','Marina Viana','Nicolas Costa','Olívia Barros'];
const colors=['#38d4ad','#f7ad57','#a59bff','#f16e88','#64bbff','#e5cc64'];
const fictionalCandidates=fictionalNames.map((name,i)=>({id:'fiction-'+i,name,shortName:name,party:['ALV','UNI','HZN','NEX','SOL'][i%5],bloc:'Perfil fictício',color:colors[i%6],stats:{economy:45+(i*7)%40,social:45+(i*11)%40,security:45+(i*13)%40,trust:50+(i*3)%35,charisma:50+(i*9)%35,machine:45+(i*5)%40,ground:50+(i*17)%35},region:regions[i%5]}));
const actions=[
['doors','Porta a porta','mobilization','ground',8,12,2.4,8,'Conversas presenciais e novos voluntários.'],
['committees','Comitês de bairro','mobilization','ground',12,10,2.1,12,'Estrutura territorial permanente.'],
['training','Formação de voluntários','mobilization','ground',7,8,1.3,18,'Amplie sua rede para as próximas ações.'],
['caravan','Caravana regional','mobilization','ground',18,17,3.3,5,'Presença intensa no estado selecionado.'],
['assembly','Plenária comunitária','mobilization','social',9,13,2.6,7,'Escuta e participação popular.'],
['radio','Rádio local','communication','charisma',10,7,2.3,0,'Presença nos meios de comunicação locais.'],
['digital','Campanha digital','communication','charisma',14,9,2.8,4,'Comunicação pública e divulgação de propostas.'],
['tv','Programa de campanha','communication','charisma',23,11,3.8,0,'Alcance nacional: efeito distribuído nas 27 UFs.'],
['plan','Plano de governo','program','trust',12,11,2.7,0,'Propostas verificáveis aumentam a reputação.'],
['economy','Fórum econômico','program','economy',15,12,3.1,0,'Apresente soluções para emprego e renda.'],
['health','Agenda de saúde','program','social',12,10,2.8,3,'Debata os serviços públicos.'],
['security','Agenda de segurança','program','security',13,11,2.9,0,'Apresente seu programa de segurança.'],
['debate','Preparação de debate','program','trust',16,16,3.2,0,'Reforço nacional com bônus nos turnos de debate.'],
['deputy','Aliança com deputado','alliance','machine',14,9,2.2,4,'Conquiste uma liderança da bancada do estado.'],
['coalition','Pacto regional','alliance','machine',20,13,3.4,6,'Articule apoios no estado selecionado.'],
['audit','Transparência das contas','research','trust',6,5,1,0,'Reputação +8 e pequeno ganho local.'],
['survey','Pesquisa de campo','research','trust',8,5,1.5,2,'Reputação +3 e reforço de organização local.'],
['fundraise','Mobilizar doadores','fundraising','ground',4,8,.5,2,'Arrecade recursos de apoiadores fictícios.'],
['rest','Reorganizar equipe','recovery','trust',0,0,0,0,'Recupere 30 de energia; consome uma decisão.']
].map(v=>({id:v[0],name:v[1],category:v[2],specialty:v[3],cost:v[4],energy:v[5],power:v[6],volunteers:v[7],description:v[8]}));
const deputies=reference.states.flatMap((state,i)=>[0,1,2].map(j=>({id:state.uf+'-'+j,name:['Alex','Cris','Renê','Jo','Ariel','Dani','Sam','Val'][ (i+j)%8]+' '+['Ventura','Fontes','Andrade','Falcão','Menezes','Ramos','Pires','Borges'][(i*3+j)%8]+' ('+state.uf+')',uf:state.uf,party:['ALV','UNI','HZN'][j],specialty:['ground','economy','social'][(i+j)%3],strength:2+(i+j)%4})));
module.exports={states:reference.states,realCandidates:reference.candidates,fictionalCandidates,runningMates,finances,actions,deputies,colors};

const ideologies=['Esquerda','Centro-esquerda','Centro','Centro-direita','Direita','Liberal','Ecologista'];
const sectors=[{id:'workers',name:'Trabalhadores',issue:'social'},{id:'business',name:'Empreendedores',issue:'economy'},{id:'students',name:'Estudantes',issue:'trust'},{id:'rural',name:'Produtores rurais',issue:'machine'},{id:'retirees',name:'Aposentados',issue:'social'},{id:'services',name:'Profissionais de serviços',issue:'security'}];
const parties=fictionalNames.map((name,i)=>({id:'party-'+i,name:['Aliança Popular','União Nacional','Horizonte Cidadão','Movimento Futuro','Rede Solidária','Frente Democrática','Pacto Verde','União Liberal','Voz do Interior','Movimento Social','Nova República','Coalizão Cívica','Caminho Comum','Renovação Nacional','Ação Cidadã'][i],acronym:['APO','UNA','HCI','MFU','RSO','FDE','PVE','ULI','VIN','MSO','NRE','CCI','CCO','RNA','ACI'][i],ideology:ideologies[i%7]}));
const territories=[...reference.states,{uf:'EX',name:'Exterior',region:'Exterior',voters:2200,priorities:['trust','economy'],battleground:true}];
Object.assign(module.exports,{ideologies,sectors,parties,territories});
