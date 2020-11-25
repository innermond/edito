import { $svg, ui_fragment, newtag } from '../dom.js';
import { wrap } from '../drawer.js';
import { loading } from '../loading.js';
import { dragging_all_marks_reset } from '../ui.js';
import { center } from '../pos.js';
import { $selection, $clicked } from '../selection/index.js';
import { add_patch } from '../idb.js';
import { proxied_url } from './image.js';
import { ycatch, MessageError } from '../error.js';

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de imagine" data-tooltip-bottom>Adresa de web</label>
	<input id="url_svg" placeholder="https://adresă-fișier,svg">
	<button id="add_url_svg" class="tooltip" data-tooltip-text="Doar fișiere tip .svg" data-tooltip-bottom >Adaugă grafica</button>
	<hr/>
	<label for="file_svg" class="file-upload tooltip" data-tooltip-text="Alegeți un fișier svg de pe calculatorul dvs." data-tooltip-bottom>Fișier local</label>
	<input class="none" type="file" id="file_svg">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegeți o colecție de vectori" data-tooltip-bottom>Librărie</label>
	<a name="categories-mark" />
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'add-element', 'Forme');
const $file_svg = $ui.querySelector('#file_svg');
const $url_svg = $ui.querySelector('#url_svg');
const $add_url_svg = $ui.querySelector('#add_url_svg');

$add_url_svg.addEventListener(
  'click',
  ycatch(
    $url_svg,
    (val) => {
      if (val instanceof MessageError) {
        return val.message;
      }
      if (val instanceof Error) {
        return 'adresa introdusă nu produce un fișier de tip SVG';
      }
      if (val === '' || val.match(/^\s+$/) !== null)
        return 'introduceți adresa fișierului vectorial de tip SVG';
      return false;
    },
    add_url_svg,
  ),
);

$file_svg.addEventListener('change', async () => {
  const file = $file_svg.files[0] ?? null;
  if (!file) return;
  const is_svg = $file_svg.value.split('.')?.pop()?.toLowerCase() === 'svg';
  if (!is_svg) return;

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
    const osvg = parser.parseFromString(svg_text, 'image/svg+xml');
    osvg
      .querySelectorAll('defs')
      ?.children?.foreach(($c) => $defs.appendChild($c));
    osvg
      .querySelectorAll('style')
      ?.children?.foreach(($c) => $style.appendChild($c));

    const tag = newtag('g');
    tag.classList.add('group');
    tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML);
    dragging_all_marks_reset();
    $selection.clear();
    $svg.appendChild(tag);
    center(tag);
    $clicked.from(tag).over();
    add_patch();
  } catch (e) {
    console.log(e);
  } finally {
    done();
    $file_svg.value = null;
  }
});

async function add_url_svg() {
  dragging_all_marks_reset();
  $selection.clear();

  const src = $url_svg.value;
  // TODO if src is an external url with no svg extension, a download link perhaps,
  // may be a god ideea to visit root site and grab all cookies (xcfr ones)
  // and then try to download
  // is a very nonuniform surface to cope with; many download servers are "walled" by CSFR token tehnique
  // amd ;ist goes on
  const u = new URL(src);

  const [done] = loading();

  //const is_svg = u?.pathname.split('.').pop().toLowerCase() === 'svg';
  //if (is_svg) {
  try {
    const url_image = proxied_url(u.href);
    let resp;
    try {
      resp = await fetch(src);
    } catch (e) {
      resp = await fetch(url_image);
    }
    let svg = '';
    const dec = new TextDecoder('utf8');
    if (resp.ok) {
      const r = resp.body.getReader();
      while (true) {
        const { value: v, done: end } = await r.read();
        if (end) break;
        svg += dec.decode(v);
      }

      let p = new DOMParser();
      let osvg = p.parseFromString(svg, 'image/svg+xml');
      osvg
        .querySelectorAll('defs')
        ?.children?.foreach(($c) => $defs.appendChild($c));
      osvg
        .querySelectorAll('style')
        ?.children?.foreach(($c) => $style.appendChild($c));

      const tag = newtag('g');
      tag.classList.add('group');
      tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML);
      dragging_all_marks_reset();
      $selection.clear();
      $svg.appendChild(tag);
      center(tag);
      $clicked.from(tag).over();
      add_patch();
    } else {
      console.log(resp.status);
    }
  } catch (e) {
    console.log(e);
  }
  done();
}
