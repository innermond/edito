import { scaling } from "../dom.js";
import { $clicked, $selection } from "../selection/index.js";

export function scale(val) {
  $selection.each(($el) => {
    scaling($el, val);
    $el.ants.reset();
    $el.square.reset();
    $el.circle.reset();

    $el.dataset.prevScale = val;

    $clicked.from($el).over();
  });
}
