import { dragging_all_marks_reset } from './ui.js';
import { $svg, element_from } from './dom.js';
import { point_screen, point_in, outpoint } from './pos.js';
import { m, setm } from './mtx.js';
import { $clicked, $selection } from './selection/index.js';
import { disable } from './click.js';
import { add_patch } from './idb.js';

// manage dragging
export function add_dragging() {
  $svg.addEventListener('mousedown', startDrag);
  $svg.addEventListener('mouseup', endDrag);
  $svg.addEventListener('mousemove', drag);
  $svg.addEventListener('mouseleave', endDrag);
}

export function remove_dragging() {
  $svg.removeEventListener('mousedown', startDrag);
  $svg.removeEventListener('mouseup', endDrag);
  $svg.removeEventListener('mousemove', drag);
  $svg.removeEventListener('mouseleave', endDrag);
}

add_dragging();

let mouseStart;
let moved = null;
// is startDrag ~= click event?
function startDrag(evt) {
  if (moved !== null) return;
  const $el = element_from(evt.target);
  const on_locked = 'lock' in $el.dataset;
  const on_stop_dragg = $el === $svg || on_locked;
  if (on_stop_dragg) return;

  moved = false;
  // avoid ants elements
  if (!('ants' in evt.target.dataset)) {
    if (
      !evt.shiftKey &&
      !evt.ctrlKey &&
      !$selection.has(element_from(evt.target))
    )
      dragging_all_marks_reset();
    $clicked.from($el);
  }
  // posibly a click on an embeded svg into a svg
  // TODO check if point_screen will work
  // in case of an embeded svg
  let $othersvg = $el.closest('svg');
  let $pt = $othersvg.createSVGPoint();
  // TODO: needed for an embeded svg???
  //$pt = $pt.matrixTransform($svg.getScreenCTM().inverse())
  $pt.x = evt.clientX;
  $pt.y = evt.clientY;
  mouseStart = $pt.matrixTransform($svg.getScreenCTM().inverse());
}

function endDrag() {
  if (moved === null) {
    disable.click = false;
    return;
  }
  $clicked.clues.dragging = false;
  disable.click = moved;
  if (moved) add_patch();
  moved = null;
}

function drag(evt) {
  if (moved === null) return;
  switch (true) {
    case !$clicked:
      return;
    case $clicked.is_zero():
      return;
    //		case $clicked.clues.is_reset():
    //			return
  }

  moved = true;
  $clicked.clues.dragging = true;

  let $othersvg = $clicked.closest('svg');
  let $pt = $othersvg.createSVGPoint();
  $pt = $pt.matrixTransform($svg.getScreenCTM().inverse());
  let current = point_screen(evt);
  if (!$clicked.ants.$shape.isConnected) {
    $selection.clear();
    $clicked.over();
  }
  const $original = $clicked;
  const $active = $selection.get_active_element(['rotating', 'sizing']);
  $selection.each(($x) => {
    if ($active && $x !== $active) return;
    $clicked.from($x);
    let $pta = point_in($clicked, current.x, current.y);
    let $ptz = point_in($clicked, mouseStart.x, mouseStart.y);
    $pt.x = $pta.x - $ptz.x;
    $pt.y = $pta.y - $ptz.y;
    let bb = $clicked.getBBox();
    let mtx = m($clicked);
    // rotation
    if ($clicked.clues.rotating) {
      let x = bb.x + bb.width * 0.5;
      let y = bb.y + bb.height * 0.5;
      if ('useThat' in $clicked) {
        bb = $clicked.useThat.bbox;
        x = bb.x + bb.width * 0.5;
        y = bb.y + bb.height * 0.5;
        // TODO: relative boxes
        let mtx = m($clicked.useThat.el);
        let p = outpoint(x, y, mtx);
        x = p.x;
        y = p.y;
      }
      mtx = mtx.translate(x, y);
      setm($clicked, mtx);
      let $pta = point_in($clicked, current.x, current.y);
      if ($pta.x != 0 && $pta.y != 0)
        mtx = mtx.rotateFromVector(-$pta.x, -$pta.y);
      mtx = mtx.translate(-x, -y);
    } else if ($clicked.clues.sizing) {
      let x = bb.x;
      let y = bb.y;
      if ('useThat' in $clicked) {
        bb = $clicked.useThat.bbox;
        x = bb.x;
        y = bb.y;
        // TODO: relative boxes
        let mtx = m($clicked.useThat.el);
        let p = outpoint(x, y, mtx);
        x = p.x;
        y = p.y;
      }
      mtx = mtx.translate(x, y);
      let dx = 1 + $pta.x / bb.width - $ptz.x / bb.width;
      let dy = 1 + $pta.y / bb.height - $ptz.y / bb.height;
      if (evt.shiftKey) {
        mtx = mtx.scaleNonUniform(dx, dy);
      } else {
        mtx = mtx.scale(dx, dy);
      }
      mtx = mtx.translate(-x, -y);
    } else {
      mtx = mtx.translate($pt.x, $pt.y);
    }
    setm($clicked, mtx);
    if ($clicked?.textPath) {
      // textPath path is replicating in its coordinates system
      // the transformations made to $clicked path in its own coordinates system
      setm(
        $clicked.textPath.path,
        $clicked.textPath.text.getCTM().inverse().multiply($clicked.getCTM()),
      );
    }
    $clicked.over();
    $clicked.follow();
  });
  mouseStart = current;
  $clicked.from($original);
}
