import { $svg, $defs, $style, ui_fragment, newtag } from '../dom.js';
import { $clicked, $selection } from '../selection/index.js';
import { center } from '../pos.js';
import { wrap } from '../drawer.js';
import { dragging_all_marks_reset } from '../ui.js';
import { loading } from '../loading.js';
import { with_undo_async } from '../idb.js';
import { MessageError, ycatch, check, clear } from '../error.js';

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de imagine" data-tooltip-bottom>Adresa de web</label>
	<input id="url_image" placeholder="https://imagine"><button id="add_url_imagine">Adaugă URL imagine</button>
	<hr/>
	<label id="for_file_image" tabindex="1000">Imagini de pe hard disc</label>
	<label for="file_image" class="file-upload tooltip" data-tooltip-text="Alegeți o imagine de pe calculatorul dvs." data-tooltip-bottom>Fișier local</label>
	<input class="none" type="file" id="file_image">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegeți o colecție de imagini" data-tooltip-bottom>Librărie</label>
	<a name="categories-mark"/>
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'add-image', 'imagini');

export const $url_image = $ui.querySelector('#url_image');
const $a_file_image = $ui.querySelector('#for_file_image');
export const $add_url_image = $ui.querySelector('#add_url_imagine');
export const $file_image = $ui.querySelector('#file_image');

$add_url_image.addEventListener(
  'click',
  ycatch(
    $url_image,
    check((val) => {
      if (val === '' || val.match(/^\s+$/) !== null)
        return 'introduceți adresa unei imagini';
    }, 'adresa introdusă nu produce un fișier imagine'),
    with_undo_async(addUrlImage),
  ),
);
$url_image.addEventListener('keyup', (evt) => evt.stopPropagation());

$a_file_image.addEventListener('click', () => {
  clear($a_file_image);
});

$file_image.addEventListener(
  'change',
  ycatch(
    $a_file_image,
    check(() => {
      const file = $file_image.files[0] ?? null;
      if (!file) return false;
      const is_image = /jpe?g|png/i.test(
        $file_image.value.split('.')?.pop()?.toLowerCase(),
      );
      if (!is_image) return 'fișierul ales nu este tip jpg sau png';
    }, 'fișierul nu poate fi utilizat'),
    with_undo_async(add_file_image),
  ),
);

async function addUrlImage() {
  dragging_all_marks_reset();
  $selection.clear();

  const src = $url_image.value;
  const u = new URL(src);

  const [done] = loading();

  const load_image_fully = (img) => {
    center(img);
    $url_image.value = '';
    done();
  };

  let resp, url_image, err_first;
  try {
    resp = await fetch(src);
  } catch (e) {
    url_image = proxied_url(u.href);
    err_first = e;
  }

  try {
    if (err_first) {
      resp = await fetch(url_image);
      const typ = resp.headers.get('Content-Type');
      if (!/jpe?g|png|svg|octet\-stream/i.test(typ)) {
        throw new MessageError(
          `[${err_first.message}] nu se recepționează un fișier imagine`,
        );
      }
    }
  } catch (e) {
    throw e;
  } finally {
    done();
  }

  try {
    const tag = await urlImage(resp, load_image_fully);
    $svg.appendChild(tag);
    $clicked.from(tag).over();
  } catch (e) {
    done();
    throw e;
  }
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

export async function urlImage(resp, onload) {
  let url = resp;
  if (resp instanceof Response) url = resp.url;
  const is_svg = url.split('.')?.pop()?.toLowerCase() === 'svg';
  if (!is_svg) {
    const tag = newtag('image');
    tag.addEventListener('load', () => {
      onload(tag);
    });
    tag.href.baseVal = url;

    return tag;
  }

  try {
    let resp = await fetch(url);
    if (resp.ok) {
      const tag = newtag('g');
      tag.addEventListener('load', () => {
        onload(tag);
      });

      let svg = await resp.text();
      let p = new DOMParser();
      let osvg = p.parseFromString(svg, 'image/svg+xml');
      osvg
        .querySelectorAll('defs')
        ?.children?.foreach(($c) => $defs.appendChild($c));
      osvg
        .querySelectorAll('style')
        ?.children?.foreach(($c) => $style.appendChild($c));

      tag.classList.add('group');
      tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML);

      try_load_images(tag);

      return tag;
    } else {
      //onload(tag);
      throw new MessageError(
        `adresa introdusă se comportă nefavorabil [code: ${resp.status}]`,
      );
    }
  } catch (e) {
    //onload(tag);
    throw new MessageError(
      `adresa introdusă se comportă nefavorabil [${e.message}]`,
    );
  }
}

// custom load event like
// default trigger load event on target
export function try_load_images($container, $evt = null) {
  // check all svg images has been loaded
  const imgs_loaded = [];
  const $kk = $container.querySelectorAll('image[*|href]');
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
  Promise.all(imgs_loaded).then((loaded) => {
    loaded = loaded.every((x) => x === true);
    if (!loaded) {
      throw new Error('not all images loaded');
    }

    if ($evt !== false) {
      if ($evt === null) $evt = new Event('load');
      $container.dispatchEvent($evt);
    }
  });
}

async function add_file_image() {
  dragging_all_marks_reset();
  $selection.clear();

  const file = $file_image.files[0];

  const [done] = loading();

  const reader = new FileReader();
  const future_result = new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (evt) => reject(evt);
    reader.readAsDataURL(file);
  });

  let $img = new Image();
  try {
    $img.src = await future_result;
  } catch (e) {
    done();
    throw new MessageError(`operațiune nereușită [${e.message}]`);
  }

  const future_src = new Promise((resolve, reject) => {
    $img.onload = () => {
      resolve(true);
    };
    $img.onerror = (evt) => reject(evt);
  });

  try {
    await future_src;
    let tag = newtag('image');
    tag.href.baseVal = reader.result;
    $svg.appendChild(tag);
    center(tag);
    $url_image.value = '';
    $clicked.from(tag).over();
    $file_image.value = null;
  } catch (e) {
    throw new MessageError(`operațiune nereușită [${e.message}]`);
  } finally {
    done();
  }
}
