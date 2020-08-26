import { $svg, change_id, px, find_my_ants } from "../dom.js";
import { appendm } from "../mtx.js";
import { dragging_all_marks_reset } from "../ui.js";
import { $selection } from "../selection/index.js";
import { $step } from "../ui.js";

export function locking(toggle = false) {
  $selection.forEach(($el) => {
    const $shape = find_my_ants($el);
    if ("lock" in $el.dataset) {
      if ($shape) {
        $shape.style.stroke = "green";
        $shape.style.strokeWidth = "4";
      }
      if (toggle) {
        if ($shape) {
          $shape.style.stroke = "#ffffff";
          $shape.style.strokeWidth = "2";
        }
        $el.removeAttribute("data-lock");
      }
      return;
    }
    // create data-lock
    const $attr = document.createAttribute("data-lock");
    $el.setAttributeNode($attr);
    if ($shape) {
      $shape.style.stroke = "green";
      $shape.style.strokeWidth = "4";
    }
  });
}

export function deleting() {
  $selection.each(($el) => {
    $selection.delete($el);
    $el.remove();
  });
  dragging_all_marks_reset();
}

export function cloning() {
  let $new_selection = $selection.new_one();
  $selection.each(($el) => {
    let $el_cloned = $el.cloneNode(true);
    change_id($el_cloned);
    $el.parentNode.insertBefore($el_cloned, $el.nextElementSibling);
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();
    let dx = 0,
      dy = px($step.value);
    appendm($el_cloned, $svg.createSVGMatrix().translate(dx, dy));
    $new_selection.add($el_cloned);
  });
  $selection.deselect();
  $new_selection.as_ants();
}
