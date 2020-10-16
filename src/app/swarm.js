import { $svg } from './dom.js';
import { center } from './pos.js';
import { scrollable } from './div_scroller.js';
import { dragging_all_marks_reset } from './ui.js';
import { $clicked, $selection } from './selection/index.js';
import { urlImage } from './section/image.js';
import { add_patch } from './idb.js';

// when click on a part of the swarm
const default_click_fn = async (evt) => {
  const imgsrc = evt.target.dataset.src.replace(
    'stock-images-thumbs',
    'stock-images',
  );
  const tag = await urlImage(imgsrc, (img) => {
    center(img);
  });
  $svg.appendChild(tag);
  $clicked.from(tag).over();
};

// makes an event handler
export const make_click_fn = (fn = default_click_fn) => {
  return async (evt) => {
    if (evt.target.nodeName.toLowerCase() !== 'img') return;
    for (let cls of ['late', 'loaded']) {
      if (evt.target.classList.contains(cls)) continue;
      return;
    }

    dragging_all_marks_reset();
    $selection.clear();

    fn(evt);

    add_patch();
  };
};

// build the personalised workhorse handler for swarm
export default (
  categories_data,
  image_panel,
  category_images_id,
  click_fn = make_click_fn(),
) => {
  let already_loaded = false;
  // this must be runs once
  // to build infinete scrollers
  async function fn() {
    if (already_loaded) {
      this.removeEventListener('click', fn);
      return;
    }
    try {
      let resp = await fetch(`./data/${categories_data}`);
      if (!resp.ok) {
        throw new Error('response not ok');
      }
      resp = await resp.json();

      const $mark = document.querySelector(
        `#${this.dataset.panel} [name=categories-mark]`,
      );
      // add categories images to panel
      // assume just append
      let categories = '';
      Object.keys(resp).forEach((k) => {
        categories += `<button class="category-image" id="${categories_data}-${k}" value="${k}"><img src="/img/${resp[k]}"><div class="category-image-text">${k}</div></button>`;
      });
      if (categories.length > 0) {
        //$mark.insertAdjacentHTML('afterend', categories);
        // TODO now we repeat to have enough categories
        $mark.insertAdjacentHTML('afterend', categories.repeat(100));
        already_loaded = true;
        $mark.parentNode
          .querySelectorAll('button[class=category-image]')
          // on categories button click
          .forEach(($btn) => {
            $btn.addEventListener(
              'click',
              build_infinite_rows(
                image_panel,
                category_images_id,
                click_fn,
                $btn.value,
              ),
            );
          });
      }
    } catch (e) {
      console.log(e);
    }
  }

  return fn;
};

export function build_infinite_rows(
  image_panel,
  category_images_id,
  click_fn,
  toload,
) {
  return async () => {
    // we build list images for respective category
    let $el = document.querySelector(`#${category_images_id}`);
    let box;
    if (!$el) {
      let { $ui } = await import(`./${image_panel}`);
      const $element = $ui.querySelector('.tool-drawer-scroll');
      $el = $ui.firstChild;
      document.querySelector('#editor').appendChild($ui);
      scrollable($element);

      box = document.querySelector(`#${category_images_id} [name=box]`);
      box.addEventListener('click', click_fn);
    }
    if (!box) box = document.querySelector(`#${category_images_id} [name=box]`);
    box.innerHTML = '';
    try {
      const { default: fn } = await import('./xobserver.js');
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
    $el.dispatchEvent(
      new CustomEvent('panel:toggle', {
        bubbles: true,
        detail: { panel_id: $el.id },
      }),
    );
  };
}
