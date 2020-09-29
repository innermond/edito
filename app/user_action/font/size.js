import { $clicked, $selection } from '../../selection/index.js';

export function sizing_text(val) {
  if ($clicked.is_zero()) return;
  $selection.forEach(($el) => {
    let $ee = $el.nodeName === 'g' ? $el.children : [$el];
    for (let $e of $ee) {
      if ($e.nodeName === 'text') {
        const style = window.getComputedStyle($e);
        const base = style.getPropertyValue('font-size');
        $e.style.fontSize = val + 'pt';
        const modified = style.getPropertyValue('font-size');
        const r = parseFloat(modified) / parseFloat(base);
        sizing($e, r);
        $e.setAttributeNS(null, 'y', $e.getStartPositionOfChar(0).y);
      }
    }
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $clicked.from($el);
    $el.over();
  });
}

function sizing($e, r, pos = true) {
  const $tt = Array.from($e.childNodes).filter(
    ($x) => $x.nodeType === Node.TEXT_NODE || $x.nodeType === Node.ELEMENT_NODE,
  );
  $tt.forEach(($t) => {
    if ($t.nodeType === Node.TEXT_NODE) return;

    const tstyle = window.getComputedStyle($t);
    let tfz = tstyle.getPropertyValue('font-size');
    tfz = r * parseFloat(tfz);
    $t.style.fontSize = tfz + 'px';

    if (!pos) return;

    let y0 = $e.getStartPositionOfChar(0).y;
    let y = $t.getStartPositionOfChar(0).y;
    const is_positioned = Number.isFinite(parseFloat(y));
    if (is_positioned) {
      y = parseFloat(y);
      let dy = 0;
      dy = y - y0;
      dy = r * dy;
      $t.setAttributeNS(null, 'y', y0 + dy);
    }
    // do not y position, only rows are y positioned
    if ($t.querySelectorAll('tspan').length) sizing($t, r, false);
  });
}
