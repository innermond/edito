import { $svg, ui_fragment, newtag } from '../dom.js';
import { wrap } from '../drawer.js';
import { loading } from '../loading.js';
import { dragging_all_marks_reset } from '../ui.js';
import { center } from '../pos.js';
import { $selection, $clicked } from '../selection/index.js';
import { add_patch } from '../idb.js';
import { proxied_url } from './image.js';

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de imagine" data-tooltip-bottom>Adresa de web</label>
	<input id="url_svg" placeholder="https://imagine"><button id="add_url_svg">Adaugă URL imagine</button>
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

$add_url_svg.addEventListener('click', async () => {
  dragging_all_marks_reset();
  $selection.clear();

  const src = $url_svg.value;
  const u = new URL(src);

  const [done] = loading();

  const is_svg = u.pathname.split('.')?.pop()?.toLowerCase() === 'svg';
  if (is_svg) {
    try {
      const url_image = proxied_url(src);
      let resp;
      try {
        resp = await fetch(src);
      } catch (e) {
        resp = await fetch(url_image);
      }
      if (resp.ok) {
        let svg = await resp.text();
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
});
