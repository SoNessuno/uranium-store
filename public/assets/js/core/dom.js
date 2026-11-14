export const $ = (selector, root = document) => root.querySelector(selector);
// el('div', { className: 'x', data: { i18n: 'key' } }, child, 'text')
export const el = (tag, { data, ...props } = {}, ...kids) => {
  const node = Object.assign(document.createElement(tag), props);
  if (data) Object.assign(node.dataset, data);
  node.append(...kids);
  return node;
};
