import { $clicked, $selection } from '../../selection/index.js';

export function styling_text(style_text, val = '') {
  $selection.forEach(($el) => {
    const $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el];
    let fontStyle = 'fontStyle';
    if (style_text === 'bold') fontStyle = 'fontWeight';
    if (val != '') style_text = val;
    $ee.forEach(($e) => {
      if ($e.nodeName === 'text') {
        $e.style[fontStyle] = style_text;
        $e.querySelectorAll('tspan').forEach(
          ($t) => ($t.style.fontStyle = 'inherit'),
        );
      }
    });
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $clicked.from($el);
    $el.over();
  });
}

export function case_text(mode) {
  let caseFunc = mode === 'up' ? 'toUpperCase' : 'toLowerCase';
  $selection.forEach(($el) => {
    const $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el];
    $ee.forEach(($e) => {
      if ($e.nodeName === 'text') {
        $e.querySelectorAll('tspan').forEach(
          ($t) => ($t.textContent = $t.textContent[caseFunc]()),
        );
      }
    });
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $clicked.from($el);
    $el.over();
  });
}

export function spacing_text(spacing_property, val = '') {
  $selection.forEach(($el) => {
    const $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el];
    $ee.forEach(($e) => {
      if ($e.nodeName === 'text') {
        $e.style[spacing_property] = val + 'mm';
        $e.querySelectorAll('tspan').forEach(
          ($t) => ($t.style.fontStyle = 'inherit'),
        );
      }
    });
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $clicked.from($el);
    $el.over();
  });
}

export function spacing_lines_text(lh = '') {
  $selection.forEach(($el) => {
    const $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el];
    $ee.forEach(($e) => {
      if ($e.nodeName === 'text') {
        $e.style.lineHeight = lh;
        $e.querySelectorAll('tspan').forEach(($t, inx) => {
          let fz = window.getComputedStyle($e).fontSize;
          if (
            !lh ||
            lh.toLowerCase() === 'normal' ||
            lh.toLowerCase() === '0px'
          ) {
            if (fz === '') fz = '16px';
          }
          let div = lh.slice(-1) == '%' ? 0.01 : 1;
          let lineHeight = lh * parseFloat(fz) * div;
          let y = 1.0 * $e.getAttributeNS(null, 'y') + inx * lineHeight;
          $t.setAttributeNS(null, 'y', y);
        });
      }
    });
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $clicked.from($el);
    $el.over();
  });
}
