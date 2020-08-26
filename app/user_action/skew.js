import { m, setm } from '../mtx.js';

export function skewx($el, a) {
  let prev = skewx.prevs.get($el) ?? 0;
  skewx.prevs.set($el, a);
  a = a - prev;
  let bb = $el.getBBox();
  let x = bb.x + bb.width / 2;
  let y = bb.y + bb.height / 2;

  let mtx = m($el);
  mtx = mtx.translate(x, y).skewX(a).translate(-x, -y);
  setm($el, mtx);
}
skewx.prevs = new Map();

export function skewy($el, a) {
  let prev = skewy.prevs.get($el) ?? 0;
  skewy.prevs.set($el, a);
  a = a - prev;
  let bb = $el.getBBox();
  let x = bb.x + bb.width / 2;
  let y = bb.y + bb.height / 2;

  let mtx = m($el);
  mtx = mtx.translate(x, y).skewY(a).translate(-x, -y);
  setm($el, mtx);
}
skewy.prevs = new Map();
