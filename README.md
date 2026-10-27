# Site Express — landing page

Página de vendas da Site Express para donos de estética automotiva.
Publicada em https://vinriibeiro.github.io/site-express/ (GitHub Pages, branch `main`, raiz).

Site estático: HTML, CSS e JS sem dependências, fontes e imagens servidas localmente.

## Estrutura

- `index.html` — página principal
- `privacidade/` — privacidade e créditos das imagens
- `assets/css/site.css`, `assets/js/site.js` — estilos e comportamento
- `assets/js/config.js` — configuração (Meta Pixel)
- `tools/` — scripts para regenerar imagens, capturas dos modelos e a imagem de compartilhamento

## WhatsApp

Todos os botões são links comuns para `https://wa.me/556196113299` com a mensagem pronta codificada. Funcionam sem JavaScript.

Cada clique soma um contador **só no navegador do visitante** (`localStorage`, chave `siteExpress.cliquesWhatsApp`): total, contagem por botão e data do último clique. Nenhum dado pessoal, nada é enviado. Para conferir no seu navegador, rode `siteExpressCliques()` no console.

## Meta Pixel (desativado)

O código está pronto, mas só carrega com um ID real em `assets/js/config.js` (`metaPixelId`). Com o campo vazio, nenhum script da Meta é carregado. Para ativar:

1. Preencha `metaPixelId` com o ID real (só números).
2. Na Content-Security-Policy do `index.html`, acrescente `https://connect.facebook.net` em `script-src` e `https://www.facebook.com` em `img-src` e `connect-src`.
3. Atualize a seção "Meta Pixel" da página de privacidade **antes** de publicar.

Eventos enviados quando ativo: `PageView` e `Contact` no clique do WhatsApp.

## Rodar localmente

```
node tools/servidor.js        # http://localhost:8787/site-express/
```

## Imagens

- Fotos de terceiros: Harrycapta e Kotivalo (Wikimedia Commons, CC BY-SA 4.0). As versões modificadas seguem a mesma licença. Créditos em `privacidade/#creditos`.
- Telas dos modelos: capturas do catálogo https://vinriibeiro.github.io/modelos/ (empresas fictícias).
- Fontes Sora e Inter: SIL Open Font License 1.1.
