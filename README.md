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

Cada prato em `data/menu.json` possui seu próprio `id`, `image` e `imageAlt`. Enquanto `image` estiver como `null`, o cardápio mostra o espaço reservado “Foto em breve”. Para inserir uma foto real:

1. coloque o arquivo original em `assets/originals/`;
2. cadastre o arquivo em `data/images.json` usando o mesmo identificador do prato;
3. substitua `null` em `image` pelo identificador e preencha `imageAlt`;
4. execute `npm run build` para gerar as versões WebP.

## Informação pendente

A fonte oficial ainda precisa ser informada pelo restaurante. Até essa definição, o site usa a fonte padrão do aparelho.

## Estrutura

O projeto não possui banco de dados, API, login, painel administrativo ou backend. O telefone de delivery usa um link `tel:` e funciona diretamente em celulares compatíveis.
