import { getMe } from '../core/api.js';
import { $ } from '../core/dom.js';
import { initOrders, loadOrders } from './orders.js';
import { initProducts, loadProducts } from './products.js';

const showOrders = on => {
  $('#orders').hidden = !on; $('#prods').hidden = on;
  $('#tO').classList.toggle('on', on); $('#tP').classList.toggle('on', !on);
  on ? loadOrders() : loadProducts();
};

const me = await getMe();
if (!me?.staff) $('#gate').hidden = false;
else {
  $('#who').textContent = me.name; $('#app').hidden = false;
  initOrders(); initProducts(); loadOrders();
  $('#tO').onclick = () => showOrders(true); $('#tP').onclick = () => showOrders(false);
  setInterval(() => { if (!$('#orders').hidden) loadOrders(); }, 30000);
}
