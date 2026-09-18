import { loadData, readJson } from './data.mjs';

export const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);

export async function renderMenu() {
  const { restaurant, menu } = await loadData();
  const images = await readJson('src/generated/images.json');
  const e = escapeHtml;
  const money = new Intl.NumberFormat(restaurant.locale, { style: 'currency', currency: restaurant.currency });
  const image = (id, alt, className, eager = false, logo = false) => {
    const asset = images[id];
    if (!asset) throw new Error(`Imagem ${id} não foi convertida. Execute npm run images.`);
    return `<img class="${className}" src="${e(asset.src)}" srcset="${asset.variants.map((variant) => `${e(variant.src)} ${variant.width}w`).join(', ')}" sizes="${logo ? '108px' : '(min-width: 900px) 340px, (min-width: 560px) 200px, 38vw'}" width="${asset.width}" height="${asset.height}" alt="${e(alt)}" loading="${eager ? 'eager' : 'lazy'}" decoding="async"${eager ? ' fetchpriority="high"' : ''}>`;
  };
  const navigation = menu.categories.map((category) => ({ id: category.id, label: category.navigationLabel || category.name }));
  if (menu.dishes.length) navigation.push({ id:'pratos', label:'Pratos' });
  if (menu.sides.length) navigation.push({ id:'acompanha', label:'Acompanha' });
  if (restaurant.delivery) navigation.push({ id:'delivery', label:'Delivery' });
  let itemIndex = 0;
  const categories = menu.categories.map((category) => `<section class="menu-section" id="${e(category.id)}" aria-labelledby="heading-${e(category.id)}">
    <div class="section-heading"><h2 id="heading-${e(category.id)}">${e(category.name)}</h2><span class="heading-rule" aria-hidden="true"></span></div>
    <div class="menu-grid">${category.items.map((item) => `<article class="menu-item" aria-labelledby="${e(item.id)}">
      ${item.image ? `<div class="dish-image">${image(item.image, item.imageAlt, 'dish-photo', itemIndex++ === 0)}</div>` : ''}
      <div class="dish-content">
        <h3 id="${e(item.id)}">${e(item.name)}</h3>
        ${item.description ? `<p class="dish-description">${e(item.description)}</p>` : ''}
        ${(item.additionalInformation || []).map((info) => `<p class="item-note">${e(info)}</p>`).join('')}
        <div class="price-block"><p class="price">${e(money.format(item.priceInCents / 100))}</p>${restaurant.delivery?.priceNote ? `<p class="delivery-note">${e(restaurant.delivery.priceNote)}</p>` : ''}</div>
      </div>
    </article>`).join('')}</div>
  </section>`).join('');
  const list = (items, className) => `<ul class="${className}">${items.map((item) => `<li>${e(item)}</li>`).join('')}</ul>`;
  const dishCards = menu.dishes.map((dish) => `<article class="dish-card" aria-labelledby="dish-${e(dish.id)}">
    <div class="dish-card-image">
      ${dish.image
        ? image(dish.image, dish.imageAlt, 'dish-card-photo')
        : `<div class="dish-photo-placeholder" role="img" aria-label="Espaço reservado para a foto de ${e(dish.name)}"><span>Foto em breve</span></div>`}
    </div>
    <h3 id="dish-${e(dish.id)}">${e(dish.name)}</h3>
  </article>`).join('');
  const fonts = restaurant.brand.fonts;
  const brandStyle = `:root{--color-background:${restaurant.brand.colors.background};--color-text:${restaurant.brand.colors.text};--color-accent:${restaurant.brand.colors.accent};--color-surface:${restaurant.brand.colors.surface};${fonts ? `--font-body:${fonts.body};--font-heading:${fonts.heading};` : ''}}`;
  return {
    head: `<title>Cardápio | ${e(restaurant.name)}</title>
      <meta name="description" content="Cardápio do ${e(restaurant.name)}. Consulte os valores das marmitas, opções de pratos, acompanhamentos e contato para delivery.">
      <meta name="theme-color" content="${e(restaurant.brand.colors.background)}">
      <link rel="icon" type="image/webp" href="${e(images[restaurant.logo].src)}">
      <style>${brandStyle}</style>`,
    body: `<a class="skip-link" href="#conteudo">Ir para o cardápio</a>
      <header class="brand-header">
        <div class="brand-inner">
          ${image(restaurant.logo, `Logo original do ${restaurant.name}`, 'brand-logo', true, true)}
          <div class="brand-name"><p class="eyebrow">Restaurante</p><h1>${e(restaurant.name.replace(/^Restaurante\s+/i, ''))}</h1><p class="menu-label">Cardápio</p></div>
        </div>
      </header>
      <nav class="category-nav" aria-label="Seções do cardápio"><div class="nav-inner">${navigation.map(({id,label}) => `<a href="#${e(id)}">${e(label)}</a>`).join('')}</div></nav>
      <main id="conteudo" class="page" tabindex="-1">
        ${categories}
        <div class="details-grid">
          ${menu.dishes.length ? `<section class="dishes-section" id="pratos" aria-labelledby="pratos-title"><div class="section-heading"><h2 id="pratos-title">Pratos</h2><span class="heading-rule" aria-hidden="true"></span></div><div class="dish-cards">${dishCards}</div></section>` : ''}
          ${menu.sides.length ? `<section class="sides-section detail-section" id="acompanha" aria-labelledby="acompanha-title"><div class="section-heading"><h2 id="acompanha-title">Acompanha</h2></div>${list(menu.sides, 'sides-list')}</section>` : ''}
        </div>
        ${restaurant.additionalInformation.length ? `<section class="additional-section" aria-label="Informações adicionais">${restaurant.additionalInformation.map((info) => `<p>${e(info)}</p>`).join('')}</section>` : ''}
        ${restaurant.delivery ? `<section class="delivery-section" id="delivery" aria-labelledby="delivery-title"><div><h2 id="delivery-title">Delivery</h2><a class="phone-link" href="tel:${e(restaurant.delivery.phone)}" aria-label="Ligar para o delivery: ${e(restaurant.delivery.phoneDisplay)}">${e(restaurant.delivery.phoneDisplay)}</a></div><a class="call-button" href="tel:${e(restaurant.delivery.phone)}"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M7 3H4a1 1 0 0 0-1 1c0 9.4 7.6 17 17 17a1 1 0 0 0 1-1v-3l-5-2-2 2a16 16 0 0 1-7-7l2-2-2-5Z"/></svg>Ligar para delivery</a></section>` : ''}
      </main>
      <footer class="site-footer"><p>${e(restaurant.name)}</p></footer>`
  };
}
