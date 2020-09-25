import { $selection, $clicked } from '../selection';
import { px } from '../dom.js';

export function stroke_width(val) {
  const val_units = val;
  // receive val units, apply to selection as pixels
  val = px(val);
  $selection.forEach(($el) => {
    $el.dataset.prevStroke = val_units;
    let $ee = [$el];
    if ($el.nodeName === 'g') {
      $ee = Array.from($el.children);
      $el.style.strokeWidth = val;
    }
    for (let $e of $ee) {
      $e.style.strokeWidth = val;
      let $tt;
      if ($e.nodeName === 'text') {
        $tt = $e.querySelectorAll(':scope > tspan[style]');
        $tt.forEach(($t) => ($t.style.strokeWidth = 'inherit'));
      }
      $clicked.from($e).follow();
    }
  });
}

export function stroke_opacity(color) {
  const val = parseFloat(color);
  $selection.forEach(($el) => {
    let $ee = [$el];
    if ($el.nodeName === 'g') {
      $ee = Array.from($el.children);
      $el.style.strokeOpacity = val;
    }
    $ee.forEach(($e) => ($e.style.strokeOpacity = val));
  });
}
