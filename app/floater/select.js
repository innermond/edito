import { $clicked, $selection } from "../selection/index.js";
import { $svg, ui_fragment } from "../dom.js";
import { toggle_select } from "../section/menubar.js";

const tpl = `<section class="movable" id="select">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Selectează toate obiectele vizibile" data-tooltip-bottom >Tot</label>
	<input data-tooltip-text="selectezi tot" data-tooltip-bottom type="checkbox" class="switch tooltip" id="select_all">
</div>
<div>
	<label class="tooltip" data-tooltip-text="Inversează selecția curentă - ce nu e selectat devine selecție" data-tooltip-bottom >Invers</label>
	<button class="tooltip" data-tooltip-text="Inversezi selecția" data-tooltip-bottom id="select_inverse"><img src="/icon/inverse.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Selecția trebuie să cuprindă in totalitate obiectele" data-tooltip-bottom >Cuprinzător</label>
	<input type="checkbox" data-tooltip-text="mod selectare" data-tooltip-bottom class="switch tooltip" id="select_inside">
</div>
<div>
	<img src="/icon/close.svg" class="close" />
</div>
</div>
</section>`;
export const $ui = ui_fragment(tpl);
export const $select_all = $ui.querySelector("#select_all");
export const $select_inverse = $ui.querySelector("#select_inverse");
export const $select_inside = $ui.querySelector("#select_inside");

export const is_selectable = ($e) => {
  if (
    $e.dataset.ants === "true" ||
    $e.dataset.rect === "true" ||
    $e.dataset.selectangle === "true" ||
    $e.classList.contains("rectpage") ||
    $e.id === "rectpage"
  )
    return false;
  const style = window.getComputedStyle($e);
  if (style.display === "none" || style.visibility === "hidden") return false;
  if (!("getBBox" in $e)) return false;
  const bb = $e.getBBox();
  if (bb.width === 0 || bb.height === 0) return false;

  return true;
};

$select_all.addEventListener("change", (evt) => {
  if ($select_all.checked) {
    Array.from($svg.children).forEach(($c) => {
      if (!is_selectable($c)) return;
      $selection.add($c);
    });
    if ($selection.size) $selection.as_ants();
  } else {
    if ($selection.size) {
      $selection.forEach(($e) => {
        $clicked.from($e).unover();
      });
    }
    $clicked.zero();
    $selection.clear();
  }
});

$select_inverse.addEventListener("click", (evt) => {
  Array.from($svg.children).forEach(($c) => {
    if (!is_selectable($c)) return;
    $selection.has($c) ? $clicked.from($c).unover() : $selection.add($c);
  });
  if ($selection.size > 0) {
    $selection.as_ants();
  }
});

$ui.querySelectorAll("[for]").forEach(($e) => {
  $e.addEventListener("click", (evt) => {
    evt.preventDefault();
  });
});

$ui.querySelector(".close").addEventListener("click", (evt) => {
  toggle_select();
});
