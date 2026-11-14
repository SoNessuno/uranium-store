import { api } from '../core/api.js';
import { productCard } from './product-card.js';
import { openOrder } from './order-dialog.js';

// Loads the products and renders them into `grid` (re-rendered on language change).
export async function mountShowcase(grid, emptyBox, me, limit = Infinity) {
  const items = (await api('products').catch(() => [])).slice(0, limit);
  const draw = () => {
    grid.replaceChildren(...items.map(p => productCard(p, item => openOrder(item, me))));
    emptyBox.hidden = items.length > 0;
  };
  draw();
  document.addEventListener('langchange', draw);
}
