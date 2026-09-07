# RouteFlow — Commercial Readiness

## Estado
O RouteFlow possui núcleo funcional de roteirização, navegação, persistência, autenticação, histórico e Proof of Delivery em evolução. Este documento separa software implementável no repositório de dependências externas que exigem configuração/contratação antes da venda pública.

## Implementado
- importação Excel e preservação de colunas;
- agrupamento de entregas por parada física;
- otimização usando custos da malha viária dirigida;
- ajuste manual da ordem;
- estatísticas de rota e tempo de serviço;
- navegador interno;
- GPS e retomada de rota;
- autenticação e persistência PostgreSQL;
- sincronização de endereços, entregas e rotas;
- histórico de rotas e entregas;
- cadastro/inteligência operacional de endereço;
- Proof of Delivery com Entregue/Não entregue, GPS, recebedor, motivo e observação;
- estrutura de evidência fotográfica;
- plano de negócio recorrente.

## Dependências externas obrigatórias antes da cobrança pública
### 1. Storage de fotos
A seleção de foto existe, porém a evidência precisa ser enviada a storage persistente privado. Requisitos: URL assinada ou acesso autenticado, limite de tamanho, compressão, retenção e exclusão conforme política de privacidade.

### 2. Roteamento de produção
O endpoint público de demonstração do OSRM não é infraestrutura de SaaS. Configurar instância própria ou provedor comercial. Adicionar timeout, retry, quota e observabilidade.

### 3. Pagamentos recorrentes
Escolher provedor, criar produtos/preços, checkout, portal do assinante e webhooks. A API deve ser a fonte de verdade do plano e limites. Nunca liberar plano pago apenas por estado do frontend.

### 4. Infraestrutura
Migrar banco/API de qualquer tier temporário/gratuito para recursos adequados à produção, configurar backups, alertas, domínio, TLS, logs e monitoramento.

### 5. Jurídico/LGPD
Publicar Termos de Uso e Política de Privacidade revisados para a operação real. Definir base legal, finalidade e retenção para GPS, fotos, nomes de recebedores e dados importados das planilhas.

## Gate final de lançamento
- [ ] migration Proof of Delivery aplicada em produção
- [ ] fluxo Entregue validado em celular real
- [ ] fluxo Não entregue validado em celular real
- [ ] múltiplos pacotes na mesma parada validados
- [ ] retomada após fechar navegador validada
- [ ] perda e retorno de internet validados
- [ ] evidência fotográfica persistente validada
- [ ] roteador de produção configurado
- [ ] backup e restore testados
- [ ] monitoramento/alertas configurados
- [ ] checkout e webhook recorrente testados
- [ ] limites de plano testados no backend
- [ ] Termos e Privacidade publicados
- [ ] Android Chrome validado
- [ ] iPhone Safari validado
- [ ] rota real ponta a ponta validada

## Definição de 99%
Não considerar o produto “99% comercial” apenas porque a interface está pronta. O marco é atingido quando todos os itens acima que envolvem dados, pagamento e infraestrutura estão configurados e fisicamente validados. O 1% final corresponde a rollout controlado, observação de métricas e correções encontradas por usuários reais.
