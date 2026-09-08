# RouteFlow

RouteFlow é uma plataforma de planejamento, otimização e execução de rotas de entrega. O sistema transforma uma planilha operacional em uma rota navegável, mantém o progresso sincronizado e registra o resultado de cada entrega.

**Estado atual:** candidato à versão 1.0 Commercial Beta.

## Produto

O fluxo principal é:

`Excel → validação → agrupamento em paradas físicas → otimização viária → ajuste manual → navegação interna → confirmação das entregas → histórico e relatórios`

O RouteFlow foi pensado para motoristas, operações de entrega e equipes que precisam manter os dados originais da carga, reduzir deslocamentos desnecessários e acompanhar a execução da rota sem depender de abrir um navegador externo a cada parada.

## Principais recursos

- Importação de Excel preservando as colunas originais.
- Agrupamento de vários pacotes no mesmo endereço/coordenada em uma única parada física.
- Otimização por rede viária dirigida, com suporte a ordem manual.
- Mapa com paradas numeradas e estatísticas de distância e duração.
- Navegador interno com GPS e progresso de rota.
- Recuperação de rota interrompida e sincronização entre dispositivos.
- Histórico de rotas e entregas.
- Registro de entrega realizada ou falha, destinatário, observações, GPS e ocorrências.
- Resultado independente para múltiplos pacotes de uma mesma parada.
- Fila offline para eventos de entrega, retry e estado de sincronização.
- Cadastro/inteligência operacional de endereços.
- Área do assinante, planos, limites e histórico de cobrança.
- Painel administrativo e indicadores operacionais.
- PWA instalável e projeto Android/Capacitor para APK.

## Planos e preços

Os valores comerciais **não ficam fixos no README nem na interface como fonte de verdade**. Eles são carregados da configuração de planos do backend (`PlanConfig`). Assim, alterações feitas na administração podem ser refletidas na Área do Assinante sem manter duas tabelas de preço divergentes.

A regra de cobrança atual é:

- **Pix:** preço-base configurado do plano, processado pela integração Banco Inter.
- **Cartão:** assinatura recorrente processada pelo Asaas. O backend pode calcular o valor do cartão considerando os encargos configurados para esse meio de pagamento.

Enquanto as credenciais/certificados de produção de um provedor não estiverem configurados, o respectivo meio de pagamento deve permanecer indisponível em vez de simular uma cobrança real.

## Arquitetura

### Frontend

Frontend web estático/PWA em JavaScript, com Leaflet para o mapa e SheetJS para importação/exportação de planilhas. A aplicação publicada consome a API RouteFlow e possui módulos separados para autenticação, sincronização, histórico, comprovantes, relatórios, assinatura e administração.

### Backend

API Node.js com PostgreSQL/Prisma. O backend concentra autenticação, persistência, entitlements SaaS, billing, gateway de roteamento, histórico, segurança, métricas, observabilidade e limites de uso.

### Produção

- Web: GitHub Pages.
- API: Render.
- Banco: PostgreSQL no Render durante a fase beta.
- Branch de desenvolvimento/entrega: `main`.

## Executar localmente

### Requisitos

- Node.js 22 ou compatível
- Docker Desktop
- Git

### Banco e API

```bash
docker compose up -d postgres
cd server
npm install
npx prisma generate
npx prisma migrate deploy
npm start
```

Use `server/.env.example` como referência para as variáveis necessárias. Nunca versione chaves, senhas, certificados ou tokens reais.

A API local usa por padrão a porta `3001`.

### Frontend

O frontend é estático. Sirva a raiz do repositório por um servidor HTTP local. Em localhost, o cliente direciona as chamadas para a API local; em produção, usa o endpoint de produção configurado pelo projeto.

## Testes e qualidade

O workflow **RouteFlow Commercial Readiness** executa automaticamente no `main`:

- validação do schema Prisma;
- geração do Prisma Client;
- verificação de sintaxe do backend, frontend e service worker;
- testes unitários do backend;
- auditoria de dependências de produção;
- validação dos artefatos essenciais da release.

Há também smoke test de produção e workflow de publicação do GitHub Pages.

## Android / APK

O diretório `android/` contém a base Capacitor do aplicativo Android. A estratégia atual é APK antes da publicação em loja. Testes físicos de GPS, câmera, retomada da rota, modo offline e reconexão continuam sendo gates obrigatórios antes de considerar a experiência móvel validada para uso comercial amplo.

## Integrações externas

Alguns recursos dependem de serviços externos e não devem ser considerados ativos apenas porque o código existe:

- Banco Inter: Pix, dependente de credenciais, certificado e chave Pix.
- Asaas: assinatura recorrente por cartão e webhooks.
- Storage privado: necessário para persistência real dos bytes das fotos de comprovante.
- Motor de roteamento de produção: necessário para SLA comercial; infraestrutura pública/demo não deve ser tratada como SLA.

## Segurança

O projeto mantém autenticação, autorização de administração no backend, rate limits, limites de payload, request IDs, logs estruturados e segredos exclusivamente no servidor. Dados sensíveis e credenciais não devem ser enviados ao frontend nem versionados no GitHub.

## Documentação operacional

Consulte também:

- `DEVELOPMENT_STATE.md` para o estado durável do desenvolvimento.
- `COMMERCIAL_READINESS.md` para prontidão comercial.
- `OPERATIONS_RUNBOOK.md` para operação e incidentes.
- `PRIVACY.md` e `TERMS.md` para os rascunhos legais/técnicos.

## Estado da versão 1.0

O núcleo do produto está implementado. A liberação comercial definitiva depende da ativação/validação dos serviços externos de produção, infraestrutura adequada, persistência privada das fotos e testes físicos de campo em dispositivos móveis.

## Licença e autoria

Consulte o arquivo de licença do repositório para os termos aplicáveis ao código. RouteFlow é desenvolvido no repositório `turlang/routeflow`.
