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
    .querySelectorAll('[data-ants=true]')
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
  $canvas.width = cw * k;
  $canvas.height = ch * k;
  $canvas.style.width = $canvas.width + 'px';
  $canvas.style.height = $canvas.height + 'px';
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

export async function svg_png($svg_node, maxw = 200) {
  let $svgclone = $svg_node.cloneNode(true);
  $svgclone
    .querySelectorAll('[data-ants=true]')
    .forEach(($ant) => $ant.remove());
  await imagesAsUrldata($svgclone);

  const svgdata = new XMLSerializer().serializeToString($svgclone);
  const srcdata = btoa(unescape(encodeURIComponent(svgdata)));

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
      resolve([pngdata, svgdata]);
    });
    $img.addEventListener('error', (err) => reject(err));
    $img.setAttribute('src', 'data:image/svg+xml;base64,' + srcdata);
  });
}
