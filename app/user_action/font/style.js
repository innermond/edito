import { $clicked, $selection } from '../../selection/index.js';
import { unit_conv } from '../../dom.js';

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
        let fz = window.getComputedStyle($e).fontSize;
        // cant get fontsize from browser
        if (!fz) {
          // maybe is explicitly indicated as inline style
          fz = $e.style.fontSize ?? '16px';
          const ext = fz.slice(-2);
          // calculate fz in px
          if (ext !== 'px') fz = unit_conv(fz, 'px');
        }
        fz = parseFloat(fz);
        if (isNaN(fz)) fz = '16px';
        $e.querySelectorAll('tspan').forEach(($t, inx) => {
          let div = lh.slice(-1) == '%' ? 0.01 : 1;
          let lineHeight = lh * fz * div;
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
