import { $svg } from "./dom.js";
import { m2e } from "./mtx.js";

export const center = (tag) => {
  let bb = $svg.getBoundingClientRect();
  let bbtag = tag.getBBox();
  let $g = $svg;
  //let $g = $svg.querySelector(':scope > g')
  let pt = $svg.createSVGPoint();
  pt.x = bb.x + 0.5 * bb.width;
  pt.y = bb.y + 0.5 * bb.height;
  let ptsvg = pt.matrixTransform($g.getScreenCTM().inverse());
  ptsvg.x = ptsvg.x - (bbtag.x + 0.5 * bbtag.width);
  ptsvg.y = ptsvg.y - (bbtag.y + 0.5 * bbtag.height);
  let lst = tag.transform.baseVal;
  if (
    lst.length === 0 ||
    lst.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE
  ) {
    // Create an transform that translates by (0, 0)
    let translate = $svg.createSVGTransform();
    translate.setTranslate(0, 0);
    lst.insertItemBefore(translate, 0);
  }
  let tsf = $svg.createSVGTransform();
  tsf.setTranslate(ptsvg.x, ptsvg.y);
  lst.appendItem(tsf);
  lst.consolidate();
};

export function point_screen(evt) {
  const $pt = $svg.createSVGPoint();
  $pt.x = evt.clientX;
  $pt.y = evt.clientY;
  return $pt.matrixTransform($svg.getScreenCTM().inverse());
}

export function point_in($el, x, y) {
  let $pt = $svg.createSVGPoint();
  $pt.x = x;
  $pt.y = y;
  let is_svg = $el === $svg;
  let t = is_svg ? $svg.getScreenCTM() : m2e($el, $svg);
  return $pt.matrixTransform(t.inverse());
}

export const outpoint = (x, y, mtx) => {
  let p = $svg.createSVGPoint();
  p.x = x;
  p.y = y;
  return p.matrixTransform(mtx);
};

export const outpoints = (a, b = null) => {
  if (!b) b = a.ownerSVGElement;
  let bb, mtx;
  if ("useThat" in a) {
    bb = a.useThat.bbox;
    mtx = m(a).multiply(m(a.useThat.el));
  } else {
    bb = a.getBBox();
    mtx = m2e(a, b);
  }
  let pp = [];

  pp.push(outpoint(bb.x, bb.y, mtx));
  pp.push(outpoint(bb.x + bb.width, bb.y, mtx));
  pp.push(outpoint(bb.x + bb.width, bb.y + bb.height, mtx));
  pp.push(outpoint(bb.x, bb.y + bb.height, mtx));

  return pp;
};

export const centerpoint = (a, b) => {
  let mtx = m2e(a, b);
  let bb = a.getBBox();

  return outpoint(bb.x + bb.width * 0.5, bb.y + bb.height * 0.5, mtx);
};

let alignMap = {
  l: "left",
  c: "center",
  r: "right",
  t: "top",
  b: "bottom",
  m: "middle",
};

let align_objects = (oo, mode = "left", owner = null) => {
  if (oo.length === 0) return;
  let $box;
  if (oo.length === 1) {
    $box = rectpage();
    oo.push($box);
  }
  if (!owner) owner = oo[0].ownerSVGElement;

  let coord, sortfunc;

  let bysmallest = (a, b) => a[coord] - b[coord];
  let bybiggest = (a, b) => b[coord] - a[coord];

  switch (mode) {
    case "left":
      coord = "x";
      sortfunc = bysmallest;
      break;
    case "right":
      coord = "x";
      sortfunc = bybiggest;
      break;
    case "center":
      coord = "x";
      break;
    case "top":
      coord = "y";
      sortfunc = bysmallest;
      break;
    case "bottom":
      coord = "y";
      sortfunc = bybiggest;
      break;
    case "middle":
      coord = "y";
      break;
  }

  let pp, ref;
  for (let o of oo) {
    if (o.classList.contains("is-reference")) {
      ref = o;
    }
  }
  let pe = new Map();

  if (!["center", "middle"].includes(mode)) {
    for (let o of oo) {
      let pp = outpoints(o, owner);
      pp = pp.sort(sortfunc);
      pe.set(pp[0], o);
    }

    pp = Array.from(pe.keys()).sort(sortfunc);
    if (ref) {
      let pp = outpoints(ref, owner);
      pp = pp.sort(sortfunc);
      ref = pp.shift();
    } else {
      ref = pp.shift();
    }
  } else {
    for (let o of oo) {
      let p = centerpoint(o, owner);
      pe.set(p, o);
    }

    pp = Array.from(pe.keys());
    let p0 = pp.sort(bysmallest)[0];
    let p1 = pp.sort(bybiggest)[0];
    ref = ref
      ? centerpoint(ref, owner)
      : outpoint(
          p0.x + (p1.x - p0.x) * 0.5,
          p0.y + (p1.y - p0.y) * 0.5,
          m(owner)
        );
    /*for (let p of [p0, p1, ref]) {
			let mark = newtag('circle', {r:2, cx:p.x, cy:p.y, fill:'red'})
			owner.appendChild(mark)
		}*/
    //ref = [p1,p0].sort(bybiggest)[0]
  }

  pp.forEach((p) => {
    if (["left", "right", "center"].includes(mode)) {
      ref.y = p.y;
    } else if (["top", "bottom", "middle"].includes(mode)) {
      ref.x = p.x;
    }
    let o = pe.get(p);
    let mtx = m2e(owner, o);
    let op = p.matrixTransform(mtx);
    let oref = ref.matrixTransform(mtx);
    let dx = oref.x - op.x,
      dy = oref.y - op.y;
    appendm(o, owner.createSVGMatrix().translate(dx, dy));
    if (o.classList.contains("is-reference", "rectpage")) $box = o;
  });
};
