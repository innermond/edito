import { scrollable } from '../app/div_scroller.js';
import fn from '../app/xobserver.js';

const rnd = () => Math.floor(Math.random() * 1000000);

const newtag_html = (n, v = null) => {
  n = document.createElement(n);
  n.setAttribute('id', '_' + rnd());
  if (!v) return n;

  attr(n, v);
  return n;
};

const ui_fragment = (html) => {
  const $ui = new DocumentFragment();
  let $tmp = newtag_html('div');
  $tmp.innerHTML = html;
  for (let $e of Array.from($tmp.children)) $ui.appendChild($e);
  return $ui;
};

const wrap = (newid) => {
  const tpl_box = `<div class="tool-drawer-scroll" name="box"></div>`;
  const $ui = ui_fragment(tpl_box);
  $ui.firstElementChild.id = newid;

  const $ss = $ui.querySelector('.tool-drawer-scroll');
  const ro = new ResizeObserver((ee) => {
    if (
      ee.length === 0 ||
      window.getComputedStyle(ee[0].target).height === '0px'
    )
      return;
    scrollable($ss);
    ro.unobserve($ss);
  });
  ro.observe($ss);

  return $ui;
};

const $model = wrap('model');
document.querySelector('#models').appendChild($model);

const layout_click_fn = async (evt) => {
  if (!evt.target.dataset.src) return;

  let imgsrc = evt.target.dataset.src
    .replace('stock-layouts-thumbs', 'stock-layouts')
    .replace('.png', '.svg');
  try {
    imgsrc = new URL(imgsrc);
    // left trim
    imgsrc = imgsrc.pathname.replace(/^\s*\//, '');
  } catch (e) {
    // TODO imgsrc = 'error.svg';
    imgsrc = 'blanc.svg';
  }
  window.location.href = `http://localhost:3000?model=${imgsrc}`;
};
build_infinite_rows('models', layout_click_fn, 'pliante')();

function build_infinite_rows(category_images_id, click_fn, toload) {
  return async () => {
    // we build list images for respective category
    let $el = document.querySelector(`#${category_images_id}`);
    let box = $el.querySelector(`[name=box]`);
    box.addEventListener('click', click_fn);
    box.innerHTML = '';

    try {
      const [loadimg, callback] = fn(10, toload);
      const $category_image_scroll = document.querySelector(
        `#${category_images_id} > .tool-drawer-scroll`,
      );
      const options = {
        root: $category_image_scroll,
        rootMargin: '0px',
        threshold: 0,
      };
      const observer = new IntersectionObserver(callback, options);
      loadimg(observer, box, 0, 10);
    } catch (e) {
      console.log(e);
    }
  };
}
