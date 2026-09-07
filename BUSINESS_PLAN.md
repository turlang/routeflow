# RouteFlow — Plano de Negócio Recorrente

## Posicionamento
**RouteFlow: o copiloto de entregas para quem dirige.**

SaaS mobile-first para motoristas autônomos, entregadores e pequenas operações que recebem listas de entregas em Excel e precisam transformar dados brutos em uma rota executável, registrável e auditável.

## Proposta de valor
- Importação de Excel sem exigir migração do processo atual do cliente.
- Agrupamento de múltiplos pacotes no mesmo ponto físico.
- Otimização por malha viária e sentidos permitidos.
- Navegação interna com sequência operacional.
- Retomada de rota e sincronização entre dispositivos.
- Proof of Delivery por pacote: horário, GPS, recebedor, ocorrência e evidência.
- Histórico de rotas, entregas e inteligência de endereços recorrentes.

## Receita recorrente
### Free — R$ 0/mês
Para aquisição e demonstração.
- até 2 rotas/mês
- até 25 paradas por rota
- importação Excel
- otimização básica
- histórico local limitado

### Motorista — R$ 19,90/mês
Plano de entrada para autônomos.
- até 30 rotas/mês
- até 80 paradas por rota
- navegação RouteFlow
- sincronização em nuvem
- retomada de rota
- histórico de 90 dias
- Proof of Delivery

### Pro — R$ 39,90/mês
Plano principal e recomendado.
- rotas mensais ampliadas
- até 200 paradas por rota
- histórico completo
- exportação operacional
- inteligência de endereços
- comprovantes e ocorrências
- suporte prioritário

### Equipe — R$ 99,90/mês
Para pequenas transportadoras e equipes locais.
- até 5 motoristas
- painel consolidado
- histórico da equipe
- indicadores de entrega
- gestão de ocorrências
- + R$ 14,90 por motorista adicional

### Business — a partir de R$ 249,90/mês
Para operações maiores.
- múltiplos usuários e gestores
- limites negociados
- relatórios e integrações
- suporte comercial
- onboarding assistido

## Estratégia de conversão
O produto deve permitir experimentar o valor antes da cobrança. O Free funciona como aquisição. O gatilho de upgrade ocorre quando o motorista passa a depender de histórico em nuvem, maior volume de rotas, Proof of Delivery e continuidade operacional.

Meta inicial: converter 8% a 15% dos usuários ativos gratuitos para planos pagos.

## Cenários de MRR
- 100 assinantes Motorista: R$ 1.990/mês.
- 250 assinantes, mix médio de R$ 29,90: aproximadamente R$ 7.475/mês.
- 500 assinantes, ticket médio de R$ 34,90: aproximadamente R$ 17.450/mês.
- 1.000 assinantes, ticket médio de R$ 39,90: aproximadamente R$ 39.900/mês.

Os valores são cenários de planejamento, não previsão garantida de receita.

## Métricas centrais
- MRR e ARR
- usuários ativos mensais
- rotas concluídas por usuário
- entregas por rota
- taxa de conclusão de rota
- taxa de falha de entrega
- conversão Free → Pago
- churn mensal
- ARPU
- custo de infraestrutura por rota
- CAC e payback

## Go-to-market
1. Beta fechado com motoristas reais.
2. Coletar métricas de 100 a 300 rotas reais antes de ampliar aquisição.
3. Conteúdo demonstrativo mostrando Excel → rota → entrega → comprovante.
4. Aquisição em comunidades de entregadores, motoristas autônomos e pequenos operadores logísticos.
5. Programa de indicação com crédito de assinatura.
6. Venda direta do plano Equipe para pequenos comércios, distribuidores, farmácias, assistências e operações de última milha.

## Critérios para cobrar
Antes de habilitar cobrança pública:
- migrations de produção aplicadas e verificadas;
- backup e recuperação do banco configurados;
- armazenamento persistente de fotos/evidências configurado;
- provedor de roteamento de produção com capacidade/SLA compatível;
- fluxo offline e sincronização posterior validado em campo;
- política de privacidade, termos de uso e canal de suporte publicados;
- pagamentos recorrentes e webhooks testados em sandbox e produção;
- monitoramento de erros, disponibilidade e custos habilitado;
- smoke test mobile em Android e iOS;
- teste de pelo menos uma rota real completa sem perda de dados.

## Política de produto
Recursos que não precisam bloquear a primeira comercialização: Zona Azul, IA avançada de previsão, gestão de frota corporativa completa e trânsito proprietário. Eles entram como expansão de ARPU e diferenciação após o beta comercial.
