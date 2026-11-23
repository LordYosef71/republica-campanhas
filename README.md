# República • Campanhas

## Atualização 0.3 — ritmo, pesquisas e campanha territorial

Primeiro turno com 10 semanas por padrão; segundo turno com cinco. Cada equipe tem cinco decisões por semana. Depois que todas encerram, o servidor publica o balanço semanal e abre um intervalo de 20 segundos. O prazo fica salvo no banco e é verificado pelo servidor; recarregar a página não o reinicia. Uma semana equivale a uma rodada, não a uma semana de calendário real.

Durante a campanha, o mapa e o radar mostram estimativas de três institutos fictícios, com amostras e margens de erro distintas. As pesquisas ficam congeladas durante cada semana e são renovadas no encerramento. O apoio interno e os votos não são enviados ao navegador; a apuração só acontece ao encerrar as semanas eleitorais, após o intervalo. A apuração do primeiro turno permanece visível durante o segundo.

Ações permitem selecionar uma UF, de duas a quatro UFs, uma região ou abrangência nacional, conforme seu tipo. A abrangência amplia o custo e distribui o efeito entre os territórios. O exterior participa das ações nacionais e da eleição. Cada UF tem prioridades e um perfil ideológico sintético, sem pretensão de descrever a população real.

Cada campanha recebe metas para as 27 UFs e o exterior em ciclos de três semanas. Elas medem presença territorial, com progresso e recompensa visíveis apenas ao proprietário. No último ciclo da etapa eleitoral, o prazo é limitado à semana da eleição.

Popularidade, reputação, confiabilidade e carisma influenciam o voto simulado. A mídia possui painel próprio, com estratégias equilibrada, digital, regional e nacional. Alterar o plano custa R$ 8 milhões simulados e uma decisão; seu bônus atua nas ações de comunicação correspondentes. A investigação gera relatório de despesas recentes, alcance e foco de outra campanha, sem revelar votos nem acusar pessoas reais de irregularidades.

Apoios no segundo turno não transferem votos na declaração. A adesão é gradual nas três semanas seguintes e depende de compatibilidade com o perfil ideológico estadual, proximidade entre as candidaturas e confiabilidade do apoiado. Estados com baixa afinidade não transferem apoio. Declarações tardias têm menos semanas para surtir efeito.

Validação: 21 testes de servidor e fluxo de interface com duas sessões (JSDOM), incluindo balanço e expiração do prazo. Revisão visual em navegador real não foi concluída nesta sessão.

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
- Primeiro turno de 10 semanas por padrão e segundo turno de cinco semanas. Candidatos eliminados humanos declaram apoio; finalistas negociam com candidatos automáticos derrotados.

## Regras

Cada equipe tem cinco decisões por turno. Todas precisam encerrar para avançar. Vice e modelo financeiro mudam efeitos e custos. Os indicadores de setores são índices agregados inventados. A rede social é interna ao jogo e não publica em serviços externos.

TV e preparação de debate têm alcance nacional; o debate recebe bônus a cada cinco turnos. Apoios parlamentares são exclusivos e geram presença recorrente na UF. Acima de 50% na apuração há vitória direta; sem maioria, dois finalistas disputam o segundo turno. A redistribuição inicial é proporcional; apoios posteriores têm adesão gradual conforme a compatibilidade ideológica do estado.

Quem sai de campanha iniciada cede a equipe à IA. O código da sala é usado para convidar novos jogadores no lobby; somente a conta proprietária retoma a própria equipe depois do início.

## Hospedagem separada

Arquitetura equivalente ao WAR: repositório GitHub privado, serviço Docker no Render Free e banco Supabase exclusivo. Não copie dados nem credenciais do WAR.

O serviço exige estas variáveis: `NODE_ENV=production`, `REPUBLICA_STORAGE_URL` e `REPUBLICA_STORAGE_KEY`. A credencial fica somente no ambiente do servidor. O cliente nunca recebe acesso administrativo ao banco. O esquema de banco usa RLS sem políticas públicas, com acesso reservado ao serviço. Uma Edge Function autenticada faz a ponte para o banco.

Persistência registra contas, sessões, partidas e imagens reduzidas em uma transação com controle de versão e tentativas idempotentes. Use uma única instância do servidor. Mudanças de estado são serializadas; se não for possível confirmar uma gravação, o servidor deixa de aceitar alterações até reiniciar com os dados confirmados.

Endpoint de saúde: `/healthz`. Os serviços gratuitos têm cotas e podem suspender por inatividade. Horas gratuitas do Render são compartilhadas pelo workspace, embora serviços e dados deste jogo sejam separados do WAR.

## Verificação

`node --test test.cjs`: 21 testes de regras, login, autorização, persistência, imagens, pesquisas, ritmo semanal e multiplayer.
`pnpm install --frozen-lockfile` e `pnpm test:ui`: fluxo de interface com duas sessões, via JSDOM. Esse teste não substitui revisão visual em navegador real.

## Origem

Referência: https://republicaemdisputa.com/ . Dados de candidaturas, UFs e geometria do mapa vieram da captura pública autorizada pelo usuário; o servidor multiplayer e os sistemas adicionais foram implementados neste projeto. Todos os resultados, atributos e opiniões são ficcionais, sem valor de pesquisa ou previsão eleitoral.
