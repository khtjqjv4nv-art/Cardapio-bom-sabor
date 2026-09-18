# Cardápio digital — Restaurante Bom Sabor

Cardápio estático, responsivo e preparado para acesso por QR Code em celulares. O projeto usa Node.js apenas no desenvolvimento e gera HTML/CSS/imagens estáticas para hospedagem.

## Executar localmente

Requisitos: Node.js 22.12 ou superior.

```bash
npm install
npm run dev
```

O endereço local será exibido no terminal.

## Gerar a versão estática

```bash
npm run build
npm run check
```

A versão pronta para hospedagem será criada em `dist/`.

## Editar o cardápio

- `data/restaurant.json`: nome, contato, cores e futura tipografia oficial.
- `data/menu.json`: categorias, produtos, descrições, preços, pratos e acompanhamentos.
- `data/images.json`: associação entre imagens e itens do cardápio.
- `assets/originals/`: arquivos originais enviados pelo restaurante.

O comando de build converte as imagens usadas para WebP, cria tamanhos adequados para celular e mantém os originais separados. Para adicionar uma foto, coloque o original em `assets/originals/` e cadastre-o em `data/images.json`.

## Informação pendente

A fonte oficial ainda precisa ser informada pelo restaurante. Até essa definição, o site usa a fonte padrão do aparelho.

## Estrutura

O projeto não possui banco de dados, API, login, painel administrativo ou backend. O telefone de delivery usa um link `tel:` e funciona diretamente em celulares compatíveis.
