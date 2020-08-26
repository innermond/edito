import { mirror } from "../dom.js";
import { $clicked, $selection } from "../selection/index.js";

export function mirror_h() {
  $selection.each(($el) => {
    mirror($el, -1);
    $clicked.from($el);
    $clicked.over();
  });
}

export function mirror_v() {
  $selection.each(($el) => {
    mirror($el, +1);
    $clicked.from($el);
    $clicked.over();
  });
}
