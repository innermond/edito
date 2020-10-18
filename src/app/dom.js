import { $bleed } from './ui.js';
import { m2e, m, setm } from './mtx.js';

const ns = 'http://www.w3.org/2000/';
const nsattr = 'http://www.w3.org/1999/';
const xmlns = ns + 'svg';

const rnd = () => Math.floor(Math.random() * 1000000);

const attr = (n, v = null) => {
  for (let p in v) {
    n.setAttributeNS(
      null,
      p.replace(/[A-Z]/g, (m, p, o, s) => '-' + m.toLowerCase()),
      v[p],
    );
  }
};

const newtag = (n, v = null) => {
  n = document.createElementNS(xmlns, n);
  n.setAttributeNS(null, 'id', '_' + rnd());
  if (!v) return n;

  attr(n, v);
  return n;
};

export const newtag_html = (n, v = null) => {
  n = document.createElement(n);
  n.setAttribute('id', '_' + rnd());
  if (!v) return n;

  attr(n, v);
  return n;
};

export const ui_fragment = (html) => {
  const $ui = new DocumentFragment();
  let $tmp = newtag_html('div');
  $tmp.innerHTML = html;
  // do not iterate and modify / move node on a live collection
  // collection will be shorten while iterating
  // and next iteration will jump / skip element
  for (let $e of Array.from($tmp.children)) $ui.appendChild($e);
  return $ui;
};

export const $svg = document.querySelector('svg');

export let $defs, $style;

export const update_def_style = () => {
  $defs = document.querySelector('svg > defs') ?? newtag('defs');
  // force a def element to be there
  if (!$defs.ownerSVGElement) {
    $svg.insertBefore($defs, $svg.firstChild);
  }

  $style = $defs.querySelector(':scope > style');
  if (!$style) {
    $style = newtag('style');
    $defs.appendChild($style);
  }
};

export function update_wh($doc = $svg) {
  const box = $doc.viewBox.baseVal;
  const w = $doc.width.baseVal;
  const h = $doc.height.baseVal;
  // convert to mm from anything
  if (w.unitType !== SVGLength.SVG_LENGTHTYPE_MM) {
    if (w.value === 0) {
      // set value from viewbox
      // TODO assumed viewbox is in px, but can be in other units ?
      w.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX, box.width);
    }
    w.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_MM);
  }
  if (h.unitType !== SVGLength.SVG_LENGTHTYPE_MM) {
    if (h.value === 0) {
      // set value from viewbox
      h.newValueSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX, box.height);
    }
    h.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_MM);
  }
  $svg.width.baseVal.newValueSpecifiedUnits(
    w.unitType,
    w.valueInSpecifiedUnits,
  );
  $svg.height.baseVal.newValueSpecifiedUnits(
    h.unitType,
    h.valueInSpecifiedUnits,
  );
}

update_wh();
update_def_style();

export function group_parent($el) {
  if ($el.parentNode?.nodeName === 'g') {
    return $el.parentNode;
  }
  if ($el.nodeName === 'tspan') {
    return group_parent($el.parentNode);
  }
  return null;
}

function el_furthest($el, selector, gap = true) {
  let $further = null;
  let $next = $el?.parentElement;
  let fit;
  // climbing to top
  while ($next) {
    fit = $next.matches(selector);
    // no gap allowed so next element must fit
    if (!gap) {
      // go out
      if (!fit) break;
      $further = $next;
    } else {
      if (fit) $further = $next;
    }
    $next = $next.parentElement;
  }
  return $further;
}

export function element_from($el) {
  //$el = $el.closest('g[data-group=true]') ?? group_parent($el) ?? $el
  $el = el_furthest($el, 'g') ?? $el;
  if ($el && ['textPath', 'tspan'].includes($el.nodeName))
    $el = $el.closest('text');
  return $el;
}

export function change_id($el) {
  if ($el.children.length) {
    for (let $e of $el.children) change_id($e);
  }
  let id = $el.getAttributeNS(null, 'id');
  if (id) $el.setAttributeNS(null, 'id', id + rnd());
}

function rectpage(id = 'rectpage', d = px($bleed.value)) {
  if (id === null) id = 'rectpage';
  if (d === null) d = px($bleed.value);
  let x = $svg.viewBox.baseVal.x;
  let y = $svg.viewBox.baseVal.y;
  let w = $svg.viewBox.baseVal.width;
  let h = $svg.viewBox.baseVal.height;

  let $box = document.querySelector('#' + id);
  if (!$box) {
    $box = newtag('rect', {
      id: id,
      x: x - d,
      y: y - d,
      width: w + 2 * d,
      height: h + 2 * d,
      class: 'is-reference rectpage',
    });
    $box.setAttributeNS(null, 'fill', 'none');
    $box.setAttributeNS(null, 'stroke-fill', 'none');
    $box.setAttributeNS(null, 'stroke-width', '0');
    $svg.appendChild($box);
  } else {
    $box.classList.add('is-reference', 'rectpage');
    $box.setAttributeNS(null, 'x', x - d);
    $box.setAttributeNS(null, 'y', y - d);
    $box.setAttributeNS(null, 'width', w + 2 * d);
    $box.setAttributeNS(null, 'height', h + 2 * d);
  }
  return $box;
}

// units in mm returned as px
function px(units, zoom = true) {
  let r = newtag('rect', { width: units + 'mm', height: units + 'mm' });
  const u = r.width.baseVal;
  u.convertToSpecifiedUnits(SVGLength.SVG_LENGTHTYPE_PX);
  const v = zoom
    ? ($svg.getCTM()?.a ?? 1) * u.valueInSpecifiedUnits
    : u.valueInSpecifiedUnits;
  r = null;
  return v;
  //		return units*(parseFloat(window.getComputedStyle($svg).width)/$svg.width.baseVal.valueInSpecifiedUnits)
}

export function unit_conv(unit_src, u_dst) {
  if (unit_src.length === 0) return 0;
  const u_src = unit_src.substr(-2);
  if (u_src === u_dst) return parseFloat(unit_src);

  const div = document.createElement('div');
  const unit_val = 10;
  // assume unit is epressed as last 2 chars
  div.style.width = unit_val + u_src;
  document.body.appendChild(div);
  let unit_px;
  if (u_src !== 'px') {
    const ss = window.getComputedStyle(div);
    unit_px = parseFloat(ss.width);
  } else {
    unit_px = unit_val;
  }
  div.style.width = unit_val + u_dst;
  let k = window.getComputedStyle(div).width;
  k = unit_px / parseFloat(k);

  div.remove();

  return parseFloat(unit_src) * k;
}

export function get_paren_id($el, attr) {
  let f = $el?.getAttributeNS(null, attr);
  if (!f || f.length === 0) return null;
  return f.trim().match(/"?#([^\)]+)"?/)?.[1];
}

export function media_zoom(w, h) {
  $svg.setAttribute('width', w + 'mm');
  $svg.setAttribute('height', h + 'mm');
  $svg.width.baseVal.valueInSpecifiedUnits = w;
  $svg.viewBox.baseVal.width = $svg.width.baseVal.value;
  $svg.height.baseVal.valueInSpecifiedUnits = h;
  $svg.viewBox.baseVal.height = $svg.height.baseVal.value;
}

export function copy_viewbox(viewBox) {
  return {
    x: viewBox.baseVal.x,
    y: viewBox.baseVal.y,
    width: viewBox.baseVal.width,
    height: viewBox.baseVal.height,
  };
}

export function assign_viewbox($s, viewbox) {
  $s.viewBox.baseVal.x = viewbox.x;
  $s.viewBox.baseVal.y = viewbox.y;
  $s.viewBox.baseVal.width = viewbox.width;
  $s.viewBox.baseVal.height = viewbox.height;
}

export const scale_prevs = new Map();
export const scaling = ($el, k = 0) => {
  if (!$el) return;

  //const direction = k
  let prev = scale_prevs.get($el) ?? 1;
  scale_prevs.set($el, k);

  k = k / prev;
  let bb = $el.getBBox();
  let x = bb.x + bb.width / 2;
  x *= 1 - k;
  let y = bb.y + bb.height / 2;
  y *= 1 - k;

  let tsf = $svg.createSVGTransform();
  tsf.setScale(k, k);
  /*	switch (direction) {
	case 1:
			tsf.setScale(k,-k)
			break
	case -1:
			tsf.setScale(-k,k)
			break
	default:
			tsf.setScale(k,k)
	}
	*/
  let trans = $svg.createSVGTransform();
  trans.setTranslate(x, y);

  let lst = $el.transform.baseVal;
  lst.appendItem(trans);
  lst.appendItem(tsf);
};

export const get_angle = ($el) => {
  let m0 = $svg.createSVGTransform().matrix;
  let m = $el.transform?.baseVal?.consolidate()?.matrix || m0;
  return Math.atan2(m.b, m.a) * (180 / Math.PI);
};

export const angle_prevs = new Map();
export function angle($el, a) {
  let prev = angle_prevs.get($el) ?? 0;
  angle_prevs.set($el, a);
  a = a - prev;
  let bb = $el.getBBox();
  let cx = bb.x + bb.width / 2;
  let cy = bb.y + bb.height / 2;

  let tsf = $svg.createSVGTransform();
  tsf.setRotate(a, cx, cy);

  let lst = $el.transform.baseVal;
  lst.appendItem(tsf);
}

export const mirror = ($el, k) => {
  if (!$el) return;
  if (k !== 1 && k !== -1) return false;

  // create a group from element
  const $g = newtag('g');
  const $father = $el.parentElement || $el.ownerSVGElement;
  const $next = $el?.nextElementSibling;
  $next ? $father.insertBefore($g, $next) : $father.appendChild($g);
  $g.appendChild($el);
  let xg = m($g);
  let bb = $g.getBBox();
  let x = bb.x + bb.width / 2;
  let y = bb.y + bb.height / 2;
  if (k === -1) {
    xg = xg.flipY().translate(0, -2 * y);
  } else if (k === 1) {
    xg = xg.flipX().translate(-2 * x, 0);
  }
  setm($g, xg);
  const xel = m2e($el, $father);
  $father.insertBefore($el, $g);
  $father.insertBefore($el, $next);
  setm($el, xel);
  $g.remove();
};

export function set_xlink_href($el, id) {
  $el.setAttributeNS(nsattr + 'xlink', 'xlink:href', id);
}

export function text_path($e) {
  if ($e.nodeName !== 'path') return;
  let $tp = $svg.getElementsByTagNameNS(xmlns, 'textPath');
  $tp = Array.from($tp).filter(
    ($t) => $t.getAttributeNS(nsattr + 'xlink', 'href') === `#${$e.id}`,
  );
  $tp = $tp[0];
  return $tp.closest('text');
}

export function path_text($e) {
  if ($e.nodeName === 'text' && $e.firstChild?.nodeName === 'textPath') {
    let pathid = $e.firstChild.getAttributeNS(nsattr + 'xlink', 'href');
    if (pathid) {
      return $svg.querySelector(pathid);
    }
  }
  return;
}

export function previousSiblingNoAnts($el) {
  while (
    $el?.previousElementSibling?.dataset.ants === 'true' ||
    ['defs', 'style', 'metadata'].includes(
      $el?.previousElementSibling?.nodeName.toLowerCase(),
    )
  ) {
    $el = $el.previousElementSibling;
  }
  return $el?.previousElementSibling;
}

export function nextSiblingNoAnts($el) {
  while (
    $el?.nextElementSibling?.dataset.ants === 'true' ||
    ['defs', 'style', 'metadata'].includes(
      $el?.nextElementSibling?.nodeName.toLowerCase(),
    )
  ) {
    $el = $el.nextElementSibling;
  }
  return $el?.nextElementSibling;
}

export function display_none($el) {
  if (!$el) return;
  const state = window.getComputedStyle($el).display;
  if (!('display' in $el.dataset)) $el.dataset.display = state;
  $el.style.display =
    $el.style.display === 'none' ? $el.dataset.display : 'none';
}

const MAX_Z = 4;
let PREV_Z = null,
  PREV_ID;

export function cycle_zindex($el) {
  if ($el.id === PREV_ID) return;
  if (PREV_ID && PREV_Z != null) {
    const $prev = document.getElementById(PREV_ID);
    if ($prev) $prev.style.zIndex = PREV_Z;
  }
  PREV_Z = $el.style.zIndex;
  PREV_ID = $el.id;
  $el.style.zIndex = MAX_Z;
}

export const watch = (object) => {
  const handler = {
    get(target, property, receiver) {
      try {
        return new Proxy(target[property], handler);
      } catch (err) {
        return Reflect.get(target, property, receiver);
      }
    },
    defineProperty(target, property, descriptor) {
      console.log(target, property, descriptor.value);
      return Reflect.defineProperty(target, property, descriptor);
    },
    deleteProperty(target, property) {
      return Reflect.deleteProperty(target, property);
    },
  };

  return new Proxy(object, handler);
};

export function find_my_ants($el, shape = 'rect') {
  const $ants = $svg.querySelectorAll(
    `[data-ants="true"][data-${shape}="true"]`,
  );
  for (const $e of $ants) {
    if ($e.$element === $el) return $e;
  }
  return null;
}

export function human_aprox(...vv) {
  return vv.map((v) => v.toFixed(2));
}

export { attr, newtag, rnd, xmlns, nsattr, rectpage, px };
