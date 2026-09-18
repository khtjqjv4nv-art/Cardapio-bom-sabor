import { defineConfig } from 'vite';
import { renderMenu } from './scripts/render.mjs';

// O HTML é gerado no desenvolvimento/build. Não existe servidor de aplicação
// na hospedagem, nem necessidade de JavaScript no navegador para ler o menu.
export default defineConfig({
  base: './',
  plugins: [{
    name: 'static-menu',
    async transformIndexHtml(html) {
      const { head, body } = await renderMenu();
      return html.replace('<!-- HEAD -->', head).replace('<!-- MENU -->', body);
    },
    configureServer(server) {
      server.watcher.add(['data/*.json', 'scripts/render.mjs']);
      server.watcher.on('change', (file) => {
        if (file.includes('/data/') || file.includes('\\data\\')) {
          server.ws.send({ type: 'full-reload' });
        }
      });
    }
  }],
  build: { outDir: 'dist', emptyOutDir: true }
});
