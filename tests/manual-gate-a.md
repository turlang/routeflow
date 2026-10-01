# Roteiro manual do Gate A

Branch: `codex/gate-a-stash-reconciliation`. Cenários ainda não executados em
navegador real; anote passou/falhou, horário e versão.

## Preparação

Use frontend e API desta branch em ambiente local/de teste, banco isolado, duas
contas sintéticas A/B e dois perfis de navegador. Site publicado e contêiner
principal antigo não recebem este PR. No frontend, execute
`npm.cmd run dev -- --port 5500`, abra `http://localhost:5500` e configure em
Conta a API de teste, que deve permitir essa origem em CORS. Permita GPS e use
Excel sintético com três entregas e colunas Latitude, Longitude, Destination
Address e Sequence (coordenadas válidas, sem 0,0).

## Isolamento

1. Entre como A, importe, optimize, inicie uma rota e salve um comprovante.
2. Saia e entre como B no mesmo perfil: mapa/GPS, comprovante e telas devem
   abandonar o estado de A; endereços, entregas e rotas de A não podem aparecer.
3. Volte a A: os dados devem continuar recuperáveis. Dados convidados/legados
   ficam separados, sem adoção automática; antigos podem ser exportados.
4. Para manter uma fila de A durante a troca, bloqueie `*/v1/routes*` via Request
   blocking do DevTools, mantendo autenticação online. Gere progresso em A,
   entre em B, remova o bloqueio e confira Network: nenhuma rota de A pode ser
   enviada como B. Voltar a A deve permitir retry. Não copie tokens dos headers.
5. Confira também outra aba, grupos do mapa, Área do Assinante e Administração
   (se aplicável): cobertura automatizada desses controles adicionais é limitada.

## Offline

1. Como A autenticada, prepare e valide a rota online. Cálculo viário e mapas
   novos dependem da rede; este teste verifica salvamento/sincronização.
2. DevTools → Network → Offline: inicie a rota, registre entregas e avance;
   teste também concluí-la sem conexão. Dados devem permanecer locais e Conta
   deve indicar rota aguardando sincronização.
3. Volte a Online e aguarde retry. Confira no segundo perfil da mesma conta uma
   única rota, progresso final e entregas sem duplicação; fila deve esvaziar.
4. Erro de quota/4xx visível ou sessão expirada é bloqueio, não aprovação. Rota
   criada como convidado permanece no convidado. Separe falha de mapa/GPS de
   falha de salvamento. Repita com fechar/reabrir para verificar persistência.

## Retomada

1. Inicie outra rota em A, complete uma parada, feche/reabra a página e retome:
   mesma ordem, próximo destino, dados da planilha e histórico.
2. Entre como A em outro perfil/dispositivo com a mesma API. Confira snapshot e
   progresso; avance nos dois clientes e reconecte, sem regressão/duplicação.
3. Sem fila local pendente, conclua/cancele no segundo cliente e reabra o
   primeiro online: a resposta confirmada sem rota ativa deve remover a retomada
   antiga e fechar mapa/GPS dessa rota. Histórico deve continuar disponível.
4. Repita bloqueando a API ou ficando offline no primeiro cliente: falha de rede
   não confirma encerramento e deve preservar o cache para retomada offline.
5. Repita com avanço offline pendente no primeiro cliente. Se o servidor confirmar
   estado final conflitante, a navegação deve fechar e a fila deve guardar o
   snapshot offline com mensagem de atenção. Não deve reabrir a rota no servidor
   nem apagar silenciosamente a alteração local. Registre o conflito para revisão.

A correção destes casos tem regressões automatizadas; a reprodução real em dois
dispositivos ainda é necessária para fechar BLK-004 e aceitar Gate A.

PWA/APK, CORS implantado, recarga completa offline, provedor viário e pagamentos
reais permanecem pendentes. Nunca inclua senhas, tokens ou dados reais no relato.
