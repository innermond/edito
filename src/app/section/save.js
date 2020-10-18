import { ui_fragment, $svg } from '../dom.js';
import { wrap } from '../drawer.js';
import { emmiter, get_saves, del_save, apply_save } from '../idb.js';
import { loading } from '../loading.js';
import { update_svg } from '../idb.js';
import { svg_png } from '../save.js';
import { save_svg, clear_patch } from '../idb.js';
import { load_fonts_of } from '../user_action/font/fontface.js';
import { proxied_url, try_load_images } from '../section/image.js';
import { with_undo } from '../idb.js';
import { dragging_all_marks_reset } from '../ui.js';
import { $selection } from '../selection/index.js';

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de fișier svg" data-tooltip-bottom>Adresă svg</label>
	<input id="url_doc_svg" placeholder="https://fisier.svg"><button id="add_url_doc_svg">Adaugă URL fișier svg</button>
	<hr/>
	<div class="row">
		<label for="open-file-svg"><img class="tooltip" data-tooltip-text="Deschide un fișier svg de pe disc" data-tooltip-bottom src="/icon/open-file.svg">
		<input class="none" type="file" id="open-file-svg">
		</label>
		<label for="save_svg"><img class="tooltip" data-tooltip-text="Salvează" data-tooltip-bottom id="save_svg" src="/icon/save.svg"></label>
	<label class="tooltip" data-tooltip-text="Imaginile online sunt descarcate și incluse In salvare" data-tooltip-bottom for="save_with_images">
Copiere imagini
		<input type="checkbox" class="switch" id="save_with_images">
	</label>
	</div>
	<hr/>
	<label class="tooltip" data-tooltip-text="Documentele salvate" data-tooltip-bottom>Salvări</label>
	<p id="save-estimate-storage"></p>
	<a name="categories-mark" />
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'save-svg', 'Salvare');
const $add_url_doc_svg = $ui.querySelector('#add_url_doc_svg');
const $url_doc_svg = $ui.querySelector('#url_doc_svg');
$add_url_doc_svg.addEventListener('click', with_undo(addUrlSvg));
const $open_file = $ui.querySelector('#open-file-svg');

async function addUrlSvg() {
  dragging_all_marks_reset();
  $selection.clear();
  await urlSvg($url_doc_svg.value);
}

export async function urlSvg(src) {
  try {
    const url = new URL(src);
    const is_svg = url.pathname.split('.')?.pop()?.toLowerCase() === 'svg';
    if (!is_svg) return;
  } catch (e) {
    return;
  }

  const [done] = loading();

  try {
    const url_doc_svg = proxied_url(src);
    let resp = await fetch(url_doc_svg);
    if (!resp.ok) throw new Error('could not load svg');
    const svg_text = await resp.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg_text, 'image/svg+xml');
    update_svg(doc);
    load_fonts_of($svg);
    try_load_images($svg, false);
  } catch (e) {
    console.log(e);
  } finally {
    done();
    $url_doc_svg.value = null;
  }
}

const $save_with_images = $ui.querySelector('#save_with_images');

const $estimate = $ui.querySelector('#save-estimate-storage');
async function estimate_storage() {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const { usage, quota } = await navigator.storage.estimate();
    const percentUsed = ((usage / quota) * 100).toFixed(4);
    const usageInMib = (usage / (1024 * 1024)).toFixed(2);
    const quotaInGib = (quota / (1024 * 1024 * 1000)).toFixed(0);

    const details = `utilizare: ${usageInMib}Mb (${percentUsed}% din ${quotaInGib} GB)`;

    $estimate.innerText = details;
  }
}

const $mark = $ui.querySelector('a[name=categories-mark]');

let saves_loaded = false;
document.addEventListener('panel:toggle', async (evt) => {
  if (saves_loaded === true) return;

  const panel_id = evt.detail.panel_id;
  if (panel_id !== 'save-svg') return;
  const $panel = document.getElementById(panel_id);
  if (!$panel || !$panel.classList.contains('active')) return;

  if (emmiter.DB === null) return;

  const [done] = loading(null, $mark.parentNode);
  try {
    estimate_storage();
    let ss = await get_saves();

    let $tmp = '';
    ss = ss.reverse();
    for (const s of ss) {
      $tmp += `<div class="action" data-id="${s.id}" ><img data-thumb src=${s.png}><img src="/icon/close.svg" class="close"></img></div>`;
    }
    $tmp = `<div class="full">${$tmp}</div>`;
    $mark.insertAdjacentHTML('afterend', $tmp);
    saves_loaded = true;
  } catch (e) {
    console.log(e);
  } finally {
    done();
  }
});

$mark.parentElement.addEventListener('click', async (evt) => {
  const $el = evt.target;
  const $action = $el.closest('[class="action"]');

  if ($el.classList.contains('close')) {
    const [done] = loading();
    try {
      estimate_storage();
      await del_save($action.dataset.id);
      $action.remove();
    } catch (e) {
      console.log(e);
    } finally {
      done();
    }
    return;
  }

  if ('thumb' in $el.dataset) {
    const [done] = loading();
    try {
      await apply_save($action.dataset.id);
      load_fonts_of($svg);
      // check all svg images has been loaded
      const imgs_loaded = [];
      const $kk = $svg.querySelectorAll('image[*|href]');
      $kk.forEach(($img) =>
        imgs_loaded.push(
          new Promise((resolve, reject) => {
            $img.onload = () => {
              resolve(true);
            };
            $img.onerror = reject;
          }),
        ),
      );
      let loaded = await Promise.all(imgs_loaded);
      loaded = loaded.every((x) => x === true);
      if (!loaded) throw new Error('not all images loaded');
    } catch (e) {
      console.log(e);
    } finally {
      done();
    }
    return;
  }

  if ($el.id === 'save_svg') {
    const [done] = loading();
    const data = await svg_png($svg, !!$save_with_images.checked);
    try {
      const result = await save_svg(...data);
      await estimate_storage();
      let saved = `<div class="action" data-id="${result[0]}" ><img data-thumb src=${data[0]}><img src="/icon/close.svg" class="close"></img></div>`;
      const $place = document.querySelector(
        '#save-svg a[name=categories-mark]+div.full',
      );
      $place.insertAdjacentHTML('afterbegin', saved);
      clear_patch();
    } catch (e) {
      console.log(e);
    } finally {
      evt.stopPropagation();
      done();
    }
    return;
  }
});

$open_file.addEventListener('change', async () => {
  const file = $open_file.files[0] ?? null;
  if (!file) return;

  const [done] = loading();

  const future = new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (evt) => reject(evt);
    reader.readAsText(file);
  });

  try {
    const svg_text = await future;
    const parser = new DOMParser();
    const doc = parser.parseFromString(svg_text, 'image/svg+xml');
    update_svg(doc);
  } catch (e) {
    console.log(e);
  } finally {
    done();
    $open_file.value = null;
  }
});
