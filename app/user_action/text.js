import { $clicked } from '../selection/index.js';
import { text_svg_html } from '../ui.js';
import { observer } from '../section/text.js';

export let $lines = document.createDocumentFragment();

export function keyup($target, evt = null) {
  if ($clicked.is_zero() || $clicked.nodeName !== 'text') return;

  // not a delete / backspace / enter key
  // there is no new nodes added / removed
  if (![8, 46, 13].includes(evt.keyCode)) {
    const lines = $target.innerHTML.split('<br>').join('');
    $clicked.innerHTML = lines;
    return;
  }

  const lines = $target.innerHTML.split('<br>');
  let prev_y = 1.0 * $clicked.getAttributeNS(null, 'y');
  let prev_x = 1.0 * $clicked.getAttributeNS(null, 'x');
  const change_y = $clicked.childNodes.length - lines.length;
	// $clicked text contains the old version
	// $textname has new content with br elements marking new lines 
	// whose positions need to be calculated
  while ($clicked.firstChild) {
    $clicked.removeChild($clicked.firstChild);
  }
  let $prev_el = $clicked;
  $lines = document.createDocumentFragment();
  lines.forEach((line, inx) => {
    //TODO empty case manage
    if (!line) line = '<tspan />';
    const $part = document.createRange().createContextualFragment(line);
    if ($part.childNodes.length > 1) {
      // FIXME br vs y
      $part.childNodes.forEach(($c) => {
        $c.removeAttributeNS(null, 'x');
        $c.removeAttributeNS(null, 'y');
      });
    }
    const $line = $part.firstElementChild;
    const style = window.getComputedStyle($prev_el);
    if ($line.nodeType === Node.TEXT_NODE) {
      $$clicked.appendChild($line);
    } else if ($line.nodeType === Node.ELEMENT_NODE) {
			$line.removeAttributeNS(null, 'y');
      let line_y = prev_y;//1.0 * $line.getAttributeNS(null, 'y') ?? prev_y;
      // first line keeps position
      if (inx > 0 && change_y != 0) {
        let lh = style?.getPropertyValue('line-height');
        if (
          !lh ||
          lh.toLowerCase() === 'normal' ||
          lh.toLowerCase() === '0px'
        ) {
          let fz = style?.getPropertyValue('font-size') ?? '';
          if (fz === '') fz = '16px';
          lh = fz;
        }
        let div = lh.slice(-1) == '%' ? 0.01 : 1;
        let lineHeight = parseFloat(lh) * div;
        while (prev_y >= line_y) {
          line_y += lineHeight;
        }
        $line.setAttributeNS(null, 'y', line_y);
        $line.setAttributeNS(null, 'x', prev_x);
      }
      $prev_el = $line;
      prev_y = line_y;

      $lines.appendChild($part);
    }
  });

  const str = new XMLSerializer().serializeToString($lines);
  $clicked.innerHTML = str;
  observer.disconnect();
  text_svg_html($clicked, $target);
  observer.observe($target, { childList: true });

  $clicked.over();
}
