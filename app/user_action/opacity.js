import { $selection } from "../selection/index.js";

export function fill_opacity(opacity) {
  const val = parseFloat(opacity);
  $selection.each(($el) => {
    //let $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el]
    let $ee = [$el];
    if ($el.nodeName === "g") {
      $ee = Array.from($el.children);
      // apply color to the group element
      // even subsequently we add to the children
      // same color as well
      $el.style.fillOpacity = val;
    }
    $ee.forEach(($e) => {
      $e.nodeName === "image"
        ? ($e.style.opacity = val)
        : ($e.style.fillOpacity = val);
    });
  });
}
