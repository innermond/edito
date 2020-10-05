import { $svg } from './dom.js';
import { proxied_url } from './section/image.js';

function toDataURL(url) {
  return new Promise((resolve, reject) => {
    let image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => {
      let canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      canvas.getContext('2d').drawImage(image, 0, 0);
      try {
        let data = canvas.toDataURL('image/png');
        resolve(data);
      } catch (e) {
        reject(e);
      }
    };
    image.onerror = reject;
    image.src = proxied_url(url);
  });
}

function load_image_data_url(img, data) {
  return new Promise((resolve, reject) => {
    img.onload = () => {
      resolve(true);
    };
    img.onerror = reject;
    img.href.baseVal = data;
  });
}

function isDataURL(s) {
  return !!s.match(isDataURL.regex);
}

isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;

async function imagesAsUrldata($svgclone) {
  const $ii = $svgclone.querySelectorAll('image');
  for (const $img of $ii) {
    try {
      let data;
      if (isDataURL($img.href.baseVal)) {
        data = $img.href.baseVal;
      } else {
        data = await toDataURL($img.href.baseVal);
      }
      let $clone = $img.cloneNode(true);
      $clone.id += '-cloned';
      $clone.setAttributeNS(null, 'data-href', $clone.href.baseVal);
      $img.parentNode.insertBefore($clone, $img);
      $img.remove();
      await load_image_data_url($clone, data);
    } catch (e) {
      console.log(e);
    }
  }
}

export const render_image = async (
  k = 1,
  bleed = 0,
  down = false,
  func = null,
  after = null,
) => {
  let $div = document.querySelector('#bkg_modal');
  let $svgclone = $svg.cloneNode(true);
  let svgsize = $svgclone.viewBox.baseVal;

  const rx = svgsize.width / $svgclone.width.baseVal.valueInSpecifiedUnits;
  const ry = svgsize.height / $svgclone.height.baseVal.valueInSpecifiedUnits;
  $svgclone.width.baseVal.valueInSpecifiedUnits += 2 * bleed;
  svgsize.x -= bleed * rx;
  svgsize.width += 2 * bleed * rx;
  $svgclone.height.baseVal.valueInSpecifiedUnits += 2 * bleed;
  svgsize.y -= bleed * ry;
  svgsize.height += 2 * bleed * ry;

  await imagesAsUrldata($svgclone);
  $svgclone
    .querySelectorAll('[data-ants=true],[data-selectangle=true]')
    .forEach(($ant) => $ant.remove());

  if (func != null && func instanceof Function) {
    func($svgclone);
  }

  const svgdata = new XMLSerializer().serializeToString($svgclone);
  const srcdata = btoa(unescape(encodeURIComponent(svgdata)));
  const cw = $svgclone.width.baseVal.value;
  const ch = $svgclone.height.baseVal.value;
  $svgclone = null;

  let $canvas = document.createElement('canvas');
  let cwidth = cw * k;
  let cheight = ch * k;
	// limit image generated for memory reason
	const ratio = cw/ch;
	const MAX_W = 1920;
	const MAX_H = 1080;
	if (cwidth > MAX_W) {
		cwidth = MAX_W;
		k = cwidth / cw;
		cheight = MAX_W / ratio;
	}
	if (cheight > MAX_H) {
		cheight = MAX_H;
		k = cheight / ch;
		cwidth = MAX_H * ratio;
	}
	$canvas.width = cwidth;
	$canvas.height = cheight;
  $canvas.style.width = cwidth + 'px';
  $canvas.style.height = cheight + 'px';
  let ctx = $canvas.getContext('2d');
  ctx.scale(k, k);

  let $img = document.createElement('img');
  $img.addEventListener('load', () => {
    ctx.drawImage($img, 0, 0);
    let canvasdata = $canvas.toDataURL('image/png');

    if (down) {
      let a = document.createElement('a');
      a.download = 'download' + '.png';
      a.href = canvasdata;
      document.body.appendChild(a);
      a.click();
    } else {
      $div.insertAdjacentHTML(
        'afterEnd',
        '<div class="preview" ><img src="' + canvasdata + '"></div>',
      );
    }
    if (after != null && after instanceof Function) {
      after();
    }
  });
  $img.setAttribute('src', 'data:image/svg+xml;base64,' + srcdata);
};

export async function svg_png($svg_node, include_images = false, maxw = 200) {
  let $svgclone = $svg_node.cloneNode(true);
  $svgclone.removeAttribute('xmlns');
  $svgclone.removeAttribute('xmlns:xlink');
  const prefix = 'http://www.w3.org/2000/xmlns/';
  if (!$svgclone.hasAttributeNS(prefix, 'xmlns')) {
    $svgclone.setAttributeNS(prefix, 'xmlns', 'http://www.w3.org/2000/svg');
  }

  if (!$svgclone.hasAttributeNS(prefix, 'xmlns:xlink')) {
    $svgclone.setAttributeNS(
      prefix,
      'xmlns:xlink',
      'http://www.w3.org/1999/xlink',
    );
  }
  $svgclone
    .querySelectorAll('[data-ants=true],[data-selectangle=true]')
    .forEach(($ant) => $ant.remove());
  // images are not embeded - this is what we save in database
  const svgdata = new XMLSerializer().serializeToString($svgclone);
  // embed images to help canvas generate thumbnail
  await imagesAsUrldata($svgclone);
  const svgdataEmbeded = new XMLSerializer().serializeToString($svgclone);
  const srcdata = btoa(unescape(encodeURIComponent(svgdataEmbeded)));

  const svg_data = include_images ? svgdataEmbeded : svgdata;

  const cw = $svgclone.width.baseVal.value;
  const s = maxw / cw;
  const r = $svgclone.width.baseVal.value / $svgclone.height.baseVal.value;
  $svgclone = null;

  let $canvas = document.createElement('canvas');
  $canvas.width = Math.min(cw, maxw);
  $canvas.height = $canvas.width / r;
  $canvas.style.width = $canvas.width + 'px';
  $canvas.style.height = $canvas.height + 'px';
  const ctx = $canvas.getContext('2d');
  ctx.scale(s, s);

  return new Promise((resolve, reject) => {
    let $img = document.createElement('img');
    $img.addEventListener('load', () => {
      ctx.drawImage($img, 0, 0);
      const pngdata = $canvas.toDataURL('image/png');
      $img = null;
      $canvas = null;
      resolve([pngdata, svg_data]);
    });
    $img.addEventListener('error', (err) => reject(err));
    $img.setAttribute('src', 'data:image/svg+xml;base64,' + srcdata);
  });
}
