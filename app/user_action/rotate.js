import { angle } from '../dom.js';
import { $clicked, $selection } from '../selection/index.js';
import { add_patch } from '../idb.js';

export function rotate(val) {
  $selection.each(($el) => {
    angle($el, val);
    $clicked.from($el);
    $clicked.over();
  });
  add_patch();
}
