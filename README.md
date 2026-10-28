# Site Express — landing page

Página de vendas da Site Express para pequenos negócios e profissionais de serviços (estética automotiva é um dos segmentos). Identidade: roxo `#7C3AED`, preto `#0B0A10`, lilás `#C4B5FD` e branco; símbolo de barras inclinadas.
Publicada em https://vinriibeiro.github.io/site-express/ (GitHub Pages, branch `main`, raiz).

Site estático: HTML, CSS e JS sem dependências, fontes e imagens servidas localmente.

## Estrutura

- `index.html` — página principal
- `privacidade/` — privacidade e créditos das imagens
- `assets/css/site.css`, `assets/js/site.js` — estilos e comportamento
- `assets/js/config.js` — configuração (Meta Pixel)
- `tools/` — scripts para regenerar imagens, capturas dos modelos e a imagem de compartilhamento

## WhatsApp

Todos os botões são links comuns para `https://wa.me/5561996113299` com a mensagem pronta codificada. Funcionam sem JavaScript.

Cada clique soma um contador **só no navegador do visitante** (`localStorage`, chave `siteExpress.cliquesWhatsApp`): total, contagem por botão e data do último clique. Nenhum dado pessoal, nada é enviado. Para conferir no seu navegador, rode `siteExpressCliques()` no console.

## Origem das conversas (código `ref`)

Links com `?ref=<código>` (ou `utm_source` + `utm_content`) fazem a mensagem pronta do WhatsApp terminar com `(ref: <código>)`. Exemplos: `?ref=ig-bio`, `?ref=ads-a`, `?ref=ads-b`. O código é limpo (letras, números e hífen, até 24 caracteres), fica só na aba (`sessionStorage`) e aparece no texto antes de o visitante enviar. Assim a conversa que chega no WhatsApp diz de onde veio, sem cookie. Registre a origem no lead do Site Express OS.

## Meta Pixel

ID `3383205965216129`, configurado em `assets/js/config.js` (`metaPixelId`). Código-base oficial carregado por `assets/js/site.js`.

- **Consentimento (LGPD):** nada da Meta é carregado antes de o visitante tocar em "Aceitar" no aviso de privacidade. A escolha fica no `localStorage` (`siteExpress.consentimentoPixel`). O link "Preferências de privacidade" no rodapé (ou `#preferencias` na URL) reabre o aviso; recusar depois de aceitar faz `fbq('consent','revoke')` e apaga `_fbp`/`_fbc`.
- **Eventos:** `PageView` ao carregar (com consentimento) e `Contact` no clique de qualquer `a[data-wa]`, no máximo **um por carregamento de página**, com `content_name: whatsapp_<botão>`. `Contact` = intenção de contato, não conversa nem venda.
- Sem a tag `<noscript>` do Pixel, porque ela dispararia sem consentimento.
- A Content-Security-Policy do `index.html` libera `connect.facebook.net` e `www.facebook.com`.
- Ao mudar o que é enviado, atualize a seção "Meta Pixel" de `privacidade/`.

## Rodar localmente

```
node tools/servidor.js        # http://localhost:8787/site-express/
```

## Imagens

- Fotos de terceiros: Harrycapta e Kotivalo (Wikimedia Commons, CC BY-SA 4.0). As versões modificadas seguem a mesma licença. Créditos em `privacidade/#creditos`.
- Telas dos modelos: capturas do catálogo https://vinriibeiro.github.io/modelos/ (empresas fictícias). Modelos de outros segmentos: `node tools/capturar-demos.js <playwright> [base]` e `node tools/imagens.js <sharp> demos`.
- As fotos de polimento e gotas não aparecem mais na página desde o reposicionamento (arquivos mantidos).
- Fontes Sora e Inter: SIL Open Font License 1.1.
