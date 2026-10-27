# Maresia OS · oferta para provedores de internet

Kit de demonstração para vender a pequenos provedores, no mesmo modelo do Gamenet OS. **Maresia Fibra é uma marca fictícia**; todos os números são de simulação.

- `index.html`: apresentação da proposta (problemas, módulos, perfis, telas, processos, arquitetura, integrações, plano, custos, riscos).
- `prototipo/`: protótipo navegável (12 áreas, 4 perfis, cobrança com histórico e auditoria salvos no navegador, PWA).
- `landing/`: landing page de provedor (planos, consulta de cobertura por CEP que abre o WhatsApp).
- `assets/`: logo, logo branco e ícone da marca fictícia.

O WhatsApp da landing aponta para o número da Site Express, para que o teste de um prospect chegue até você.

## Rodar localmente

```bash
cd provedores
python -m http.server 8765
```

Abra http://localhost:8765.
