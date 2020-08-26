import {
  initial,
  dragging_marks_reset,
  dragging_all_marks_reset,
  dragging_all_marks_relax,
  dragging_all_marks_relax_except,
  after_click_update_ui,
} from './ui.js';
import { $svg, element_from } from './dom.js';
import { $selection } from './selection/grouping.js';
import { $clicked } from './selection/clicked.js';

export const disable = { click: false };

$svg.addEventListener('click', click);

export function click(evt) {
  if (disable.click) return;

  // deselect anything
  const $tel = element_from(evt.target);
  const on_locked = 'lock' in $tel.dataset;
  const on_stopping = $tel === $svg || on_locked;
  if (on_stopping) {
    const $active = on_locked ? $tel : $selection.get_active_element();
    if ($active) {
      $clicked.from($active);
      dragging_marks_reset($clicked);
      if (on_locked) dragging_all_marks_reset();
      $clicked.over();
      return;
    }
    $clicked.zero();
    $selection.clear();
    dragging_all_marks_reset();
    initial(); //TODO update to drag select pan ui
    return;
  }

  const belongs = $selection.size > 1 && $selection.has($clicked);
  // dragging marks clicked
  if (!!evt.target.dataset.ants) {
    const $el = evt.target.$element;
    const $ee = [];
    switch (true) {
      case !!evt.target.dataset.rect:
        $clicked.clues.negate('dragging');
        $clicked.circle.$shape.style.color = 'white';
        $clicked.square.$shape.style.color = 'white';
        //$ee.push($clicked.circle.$shape, $clicked.square.$shape)
        break;
      case !!evt.target.dataset.circle:
        $el.clues.negate('rotating');
        evt.target.style.fill = $el.clues.rotating ? 'red' : 'white';
        $ee.push($el);
        $el.square.$shape.style.fill = 'white';
        break;
      case !!evt.target.dataset.square:
        //$clicked.from(evt.target.$element)
        $el.clues.negate('sizing');
        evt.target.style.fill = $el.clues.sizing ? 'red' : 'white';
        $ee.push($el);
        $el.circle.$shape.style.fill = 'white';
        break;
    }
    $ee.length > 0 && dragging_all_marks_relax_except(...$ee);
    return;
  }

  $clicked.over();
  dragging_all_marks_relax();

  let $el = element_from(evt.target);
  $clicked.from($el);

  let show_marks = true;
  if (evt.shiftKey) {
    $clicked.over();
  } else if (evt.ctrlKey) {
    const $target = element_from(evt.target);
    dragging_marks_reset($target);
    $selection.delete($target);
    $clicked.from($selection.values().next().value);
  } else if (!belongs) {
    dragging_all_marks_reset();
    $selection.clear();
    $clicked.over();
  }

  after_click_update_ui($el);
}
