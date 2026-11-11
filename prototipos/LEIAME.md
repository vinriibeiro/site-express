# Protótipos · Soluções Digitais Express

Demonstrações navegáveis, 100% no navegador, com **empresas e dados fictícios** (semente fixa, sempre iguais). Nada é enviado a servidor algum.

| Pasta | O que mostra |
| --- | --- |
| `gestao-comercial/` | Gestão comercial: indicadores, funil, equipes, metas e importação de planilha (inspirado no case Seven Telecom) |
| `pedidos-atendimento/` | Pedidos/ordens em quadro, conversa de WhatsApp e espaço para o chatbot |
| `app-campo/` | Aplicativo de campo para celular: visitas, registro e sincronização |
| `_base/tokens.css` | Cores, fontes e componentes comuns (azul profundo, Sora + Inter locais) |

Padrão: barra "SIMULAÇÃO" no topo, lateral azul profunda, dados em `data.js`, lógica em `app.js`, sem dependências externas. Ao personalizar para um cliente, troque `data.js` pelos conectores reais.
