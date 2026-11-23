# República • Campanhas

Jogo de estratégia eleitoral multiplayer para 2 a 6 pessoas ou individual contra três equipes automáticas.

## Abrir localmente

Requer Node.js 20 ou superior. Execute `node server.cjs` ou `iniciar-jogo.cmd` e abra http://localhost:8092. O servidor local usa a pasta .data, ignorada pelo Git. Crie uma conta com usuário e senha na própria página. Contas deste jogo são independentes do WAR. Não há recuperação automática de senha.

## Modos e conteúdo

- Referência: candidatos e partidos reais como personagens de simulação.
- Fictício: 15 candidaturas e 15 modelos de partido fictícios.
- Personalizado completo: cada jogador cria nome, partido, ideologia, cor e imagem de partido.
- 15 vices, 15 modelos financeiros, 19 ações de campanha, 81 deputados fictícios.
- Militância, voluntários, redes simuladas de cada partido/candidatura, foco territorial e temático, opiniões de seis setores e eventos aleatórios.
- Mapa interativo dos 27 estados/DF, mais eleitorado do exterior em menu próprio. Votos do exterior contam na média nacional. Todo o eleitorado é simulado.
- Primeiro turno e segundo turno de 10 rodadas. Candidatos eliminados humanos declaram apoio; finalistas negociam com candidatos automáticos derrotados.

## Regras

Cada equipe tem cinco decisões por turno. Todas precisam encerrar para avançar. Vice e modelo financeiro mudam efeitos e custos. Os indicadores de setores são índices agregados inventados. A rede social é interna ao jogo e não publica em serviços externos.

TV e preparação de debate têm alcance nacional; o debate recebe bônus a cada cinco turnos. Apoios parlamentares são exclusivos e geram presença recorrente na UF. Acima de 50% na apuração há vitória direta; sem maioria, dois finalistas disputam o segundo turno. A redistribuição inicial é proporcional; um apoio posterior desloca até 35% da base original do candidato derrotado para o finalista apoiado.

Quem sai de campanha iniciada cede a equipe à IA. O código da sala é usado para convidar novos jogadores no lobby; somente a conta proprietária retoma a própria equipe depois do início.

## Hospedagem separada

Arquitetura equivalente ao WAR: repositório GitHub privado, serviço Docker no Render Free e banco Supabase exclusivo. Não copie dados nem credenciais do WAR.

O serviço exige estas variáveis: `NODE_ENV=production`, `REPUBLICA_STORAGE_URL` e `REPUBLICA_STORAGE_KEY`. A credencial fica somente no ambiente do servidor. O cliente nunca recebe acesso administrativo ao banco. O esquema de banco usa RLS sem políticas públicas, com acesso reservado ao serviço. Uma Edge Function autenticada faz a ponte para o banco.

Persistência registra contas, sessões, partidas e imagens reduzidas em uma transação com controle de versão e tentativas idempotentes. Use uma única instância do servidor. Mudanças de estado são serializadas; se não for possível confirmar uma gravação, o servidor deixa de aceitar alterações até reiniciar com os dados confirmados.

Endpoint de saúde: `/healthz`. Os serviços gratuitos têm cotas e podem suspender por inatividade. Horas gratuitas do Render são compartilhadas pelo workspace, embora serviços e dados deste jogo sejam separados do WAR.

## Verificação

`node --test test.cjs`: 15 testes de regras, login, autorização, persistência, imagens e multiplayer.
`pnpm install --frozen-lockfile` e `pnpm test:ui`: fluxo de interface com duas sessões, via JSDOM. Esse teste não substitui revisão visual em navegador real.

## Origem

Referência: https://republicaemdisputa.com/ . Dados de candidaturas, UFs e geometria do mapa vieram da captura pública autorizada pelo usuário; o servidor multiplayer e os sistemas adicionais foram implementados neste projeto. Todos os resultados, atributos e opiniões são ficcionais, sem valor de pesquisa ou previsão eleitoral.
