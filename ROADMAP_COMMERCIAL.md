# RouteFlow — Roadmap para Beta Comercial

## Objetivo
Transformar o protótipo funcional atual em um SaaS de entregas comercializável sem comprometer o fluxo já validado de importação, otimização e navegação.

## Gate A — Persistência e identidade
- Backend/API de produção.
- Banco PostgreSQL.
- Autenticação por usuário.
- Endereços vinculados ao usuário/equipe.
- Migração progressiva do histórico e cadastro hoje mantidos localmente.
- Sincronização entre celular e desktop.
- Cache local para operação com conexão instável.

Critério de aceite: trocar de dispositivo e continuar vendo endereços, configurações e histórico do mesmo usuário.

## Gate B — Prova de entrega
- Status por entrega: pendente, entregue, não entregue.
- Data e hora registradas pelo sistema.
- Coordenada GPS e precisão no momento da conclusão.
- Foto opcional como comprovante.
- Observação/ocorrência.
- Motivo de insucesso.
- Preservar N° Pacote e dados originais da planilha.

Critério de aceite: uma entrega concluída gera um registro auditável com pacote, endereço, horário e posição.

## Gate C — Histórico de rotas
- Rota como entidade persistente.
- Data/hora de início e término.
- Distância planejada e realizada quando disponível.
- Quantidade de entregas/paradas.
- Concluídas e não entregues.
- Histórico pesquisável por data/endereço/pacote.
- Exportação de relatório.

Critério de aceite: o usuário consegue abrir uma rota antiga e reconstruir o que aconteceu naquele dia.

## Gate D — Inteligência operacional de endereços
- Todo endereço importado é cadastrado automaticamente.
- Novos endereços iniciam como Casa.
- Reimportação atualiza o cadastro existente, sem duplicação.
- Tipos: Casa, Comércio, Trabalho, Prédio com porteiro, Prédio sem porteiro.
- Horário de funcionamento.
- Instruções de acesso.
- Estacionamento/parada.
- Observações.
- Contagem e histórico de visitas.
- Volume Pequeno/Médio/Grande por entrega, evoluindo depois para peso/quantidade de volumes.

Critério de aceite: informações aprendidas em uma rota reaparecem automaticamente quando o endereço retorna.

## Gate E — Roteamento de produção
- Remover dependência operacional do servidor público de demonstração do OSRM.
- Provedor/instância de roteamento com SLA compatível com uso comercial.
- Tratamento de indisponibilidade e retentativas.
- Monitoramento de latência/erros.
- Custos de roteamento mensuráveis.

Critério de aceite: uma falha de serviço externo não apaga a rota e é apresentada de forma recuperável ao motorista.

## Gate F — Camadas urbanas
- Arquitetura de camadas geográficas por cidade.
- Zona Azul somente por fonte oficial/licenciada e atualizável.
- Exibir informação antes da chegada ao destino.
- Preparar estrutura para restrições locais futuras.

Critério de aceite: nenhuma área de estacionamento regulamentado é inferida ou inventada pelo aplicativo.

## Gate G — SaaS e planos
Planos iniciais sugeridos:
- Free: validação/uso limitado.
- Motorista: R$ 19,90/mês.
- Pro: R$ 39,90/mês.
- Equipe: R$ 99,90/mês.
- Business: a partir de R$ 249,90/mês.

Implementar limites no servidor, assinatura, estado da assinatura, cancelamento e período de teste antes da abertura pública.

## Gate H — Beta comercial
- Termos de uso e política de privacidade/LGPD.
- Backup e restauração.
- Logs e observabilidade sem registrar dados sensíveis desnecessários.
- Métricas de produto: rotas, entregas, km, duração e falhas.
- Fluxo de suporte/feedback.
- PWA instalável.
- Testes móveis reais.

Critério de aceite: piloto controlado com entregadores reais sem depender do computador de desenvolvimento.

## Ordem oficial
A → B → C → E → D/F em paralelo → G → H.

O núcleo de roteirização/navegação atual deve permanecer funcional durante toda a migração. A camada local existente deve funcionar como fallback/cache enquanto o backend é introduzido.