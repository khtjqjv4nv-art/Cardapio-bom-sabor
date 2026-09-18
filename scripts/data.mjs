import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const readJson = async (file) => JSON.parse(await readFile(path.join(root, file), 'utf8'));

export async function loadData() {
  const [restaurant, menu, images] = await Promise.all([
    readJson('data/restaurant.json'), readJson('data/menu.json'), readJson('data/images.json')
  ]);
  validateData(restaurant, menu, images);
  return { restaurant, menu, images };
}

export function validateData(restaurant, menu, images) {
  const requireText = (value, field) => {
    if (typeof value !== 'string' || !value.trim()) throw new Error(`${field}: texto obrigatório.`);
  };
  const ids = new Set();
  const uniqueId = (value) => {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value ?? '')) throw new Error(`ID inválido: ${value}`);
    if (ids.has(value)) throw new Error(`ID duplicado: ${value}`);
    ids.add(value);
  };
  const imageIds = new Set();
  for (const image of images) {
    uniqueId(image.id);
    imageIds.add(image.id);
    requireText(image.source, `${image.id}.source`);
    if (path.isAbsolute(image.source) || image.source.includes('..') || /[\\/]/.test(image.source)) {
      throw new Error(`${image.id}: coloque o original diretamente em assets/originals.`);
    }
    if (!['logo', 'photo'].includes(image.kind)) throw new Error(`${image.id}: tipo de imagem inválido.`);
    if (image.crop) for (const field of ['left', 'top', 'width', 'height']) {
      if (!Number.isInteger(image.crop[field]) || image.crop[field] < (['width','height'].includes(field) ? 1 : 0)) {
        throw new Error(`${image.id}: recorte inválido (${field}).`);
      }
    }
  }
  requireText(restaurant.name, 'restaurant.name');
  new Intl.NumberFormat(restaurant.locale, { style: 'currency', currency: restaurant.currency });
  if (!imageIds.has(restaurant.logo)) throw new Error('Logo ausente no manifesto de imagens.');
  for (const color of Object.values(restaurant.brand.colors)) {
    if (!/^#[a-f\d]{6}$/i.test(color)) throw new Error('As cores devem usar formato hexadecimal #RRGGBB.');
  }
  const fonts = restaurant.brand.fonts;
  if (fonts !== null) {
    for (const key of ['body', 'heading']) {
      requireText(fonts[key], `brand.fonts.${key}`);
      if (/[;{}<>]/.test(fonts[key])) throw new Error('Nome de fonte inválido.');
    }
  }
  if (restaurant.delivery && !/^\+[0-9]{10,15}$/.test(restaurant.delivery.phone)) {
    throw new Error('Telefone deve incluir +, código do país e DDD.');
  }
  ids.clear();
  ['conteudo', 'pratos', 'acompanha', 'delivery'].forEach((id) => ids.add(id));
  for (const category of menu.categories) {
    uniqueId(category.id);
    requireText(category.name, 'category.name');
    if (!Array.isArray(category.items) || !category.items.length) throw new Error(`Categoria vazia: ${category.id}`);
    for (const item of category.items) {
      uniqueId(item.id);
      requireText(item.name, 'item.name');
      if (!Number.isSafeInteger(item.priceInCents) || item.priceInCents < 0) throw new Error(`${item.id}: preço ausente ou inválido.`);
      if (item.image && !imageIds.has(item.image)) throw new Error(`${item.id}: imagem não cadastrada.`);
      if (item.image) requireText(item.imageAlt, `${item.id}.imageAlt`);
    }
  }
  if (!Array.isArray(menu.dishes)) throw new Error('dishes: informe uma lista.');
  for (const dish of menu.dishes) {
    uniqueId(dish.id);
    requireText(dish.name, `${dish.id}.name`);
    if (dish.image && !imageIds.has(dish.image)) throw new Error(`${dish.id}: imagem não cadastrada.`);
    if (dish.image) requireText(dish.imageAlt, `${dish.id}.imageAlt`);
  }
  if (!Array.isArray(menu.sides)) throw new Error('sides: informe uma lista.');
  menu.sides.forEach((value) => requireText(value, 'sides'));
}
