import { $svg, $defs, $style, ui_fragment, newtag } from '../dom.js';
import { $clicked, $selection } from '../selection/index.js';
import { center } from '../pos.js';
import { wrap } from '../drawer.js';
import { dragging_all_marks_reset } from '../ui.js';
import { with_undo } from '../idb.js';

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de imagine" data-tooltip-bottom>Adresa de web</label>
	<input id="url_image" placeholder="https://imagine"><button id="add_url_imagine">Adaugă URL imagine</button>
	<hr/>
	<label for="file_image" class="file-upload tooltip" data-tooltip-text="Alegeți o imagine de pe calculatorul dvs." data-tooltip-bottom>Fișier local</label>
	<input class="none" type="file" id="file_image">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegeți o colecție de imagini" data-tooltip-bottom>Librărie</label>
	<a name="categories-mark"/>
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'add-image', 'imagini');

export const $url_image = $ui.querySelector('#url_image');
export const $add_url_image = $ui.querySelector('#add_url_imagine');
export const $file_image = $ui.querySelector('#file_image');

$add_url_image.addEventListener('click', with_undo(addUrlImage));
$file_image.addEventListener('change', with_undo(addFileImage));

async function addUrlImage() {
  dragging_all_marks_reset();
  $selection.clear();

  const tag = await urlImage($url_image.value, (img) => {
    center(img);
    $url_image.value = '';
  });
  $svg.appendChild(tag);
  $clicked.from(tag).over();
}

export function proxied_url(src) {
  const proxyorigin = 'http://localhost:3000';
  const proxyurl = proxyorigin + '/cors.php?url=';

  let url_image = new URL(src);
  if (url_image.origin !== proxyorigin) {
    url_image = proxyurl + src;
  } else {
    url_image = src;
  }

  return url_image;
}

export async function urlImage(src, onload) {
  const url_image = proxied_url(src);

  let tag = newtag('image');
  const is_svg = src.split('.')?.pop()?.toLowerCase() === 'svg';
  if (is_svg) {
    try {
      let resp = await fetch(url_image);
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

        tag = newtag('g');
        tag.classList.add('group');
        tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML);

        return tag;
      } else {
        console.log(resp.status);
      }
    } catch (e) {
      console.log(e);
    }

    return null;
  }

  tag.addEventListener('load', () => {
    onload(tag);
  });
  tag.href.baseVal = url_image;

  return tag;
}

function addFileImage() {
  dragging_all_marks_reset();
  $selection.clear();

  const file = $file_image.files[0] ?? null;
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener(
    'load',
    () => {
      let $img = new Image();
      $img.src = reader.result;
      $img.addEventListener('load', () => {
        let tag = newtag('image');
        tag.href.baseVal = reader.result;
        $svg.appendChild(tag);
        center(tag);
        $url_image.value = '';
        $clicked.from(tag).over();
        $file_image.value = null;
      });
    },
    false,
  );
  reader.readAsDataURL(file);
}
