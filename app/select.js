import { dragging_all_marks_reset } from './ui.js';
import { $svg, attr, newtag, element_from } from './dom.js';
import { disable } from './click.js';
import { $selection } from './selection/index.js';
import { is_selectable, $select_inside } from './floater/select.js';
import {
  cycle,
  moved,
  add_rectangling,
  remove_rectangling,
  $selectangle,
} from './selectangle.js';

function cycle_start(stage) {
  return (evt) => {
    const $el = element_from(evt.target);
    const on_locked = 'lock' in $el.dataset;
    const on_allowed = $el === $svg || on_locked;
    if (!on_allowed) return;
    if (!stage(evt)) return;
    disable.click = true;
  };
}
function cycle_end(stage) {
  return (evt) => {
    if (!disable.click) disable.click = moved;
    if (!stage(evt)) return;
  };
}
function cycle_step(stage) {
  return (evt) => {
    if (!stage(evt)) return;
    selection_ants(evt);
  };
}

export function add_selecting() {
  cycle.start = cycle_start;
  cycle.end = cycle_end;
  cycle.step = cycle_step;
  add_rectangling();
}

export function remove_selecting() {
  remove_rectangling();
}

function selection_ants(evt) {
  if (!evt.shiftKey && !evt.ctrlKey) $selection.clear();
  const BB = $selectangle.getBoundingClientRect();
  Array.from($svg.children).forEach(($c) => {
    if (!is_selectable($c)) return;
    if ($selection.has($c) && !evt.ctrlKey) return;

    const bb = $c.getBoundingClientRect();
    if (
      (!$select_inside.checked &&
        bb.top + bb.height > BB.top &&
        bb.left + bb.width > BB.left &&
        bb.bottom - bb.height < BB.bottom &&
        bb.right - bb.width < BB.right) ||
      ($select_inside.checked &&
        bb.top > BB.top &&
        bb.left > BB.left &&
        bb.bottom < BB.bottom &&
        bb.right < BB.right)
    ) {
      evt.ctrlKey ? $selection.delete($c) : $selection.add($c);
    }
  });
  dragging_all_marks_reset();
  $selection.as_ants();
}
