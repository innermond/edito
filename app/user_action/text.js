import { $clicked } from '../selection/index.js';
import { text_svg_html } from '../ui.js';
import { observer } from '../section/text.js';

export let $lines = document.createDocumentFragment();

export function keyup($target, evt = null) {
  if ($clicked.is_zero() || $clicked.nodeName !== 'text') return;

  // not a delete / backspace / enter key
  // there is no new nodes added / removed
  if ([8, 46, 13].includes(evt.keyCode)) return;
  const lines = $target.innerHTML.split('<br>').join('');
  $clicked.innerHTML = lines;
  $clicked.over();
}
