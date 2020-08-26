import { ui_fragment } from "../dom.js";
import { group, ungroup, ungroup_all } from "../user_action/group.js";
import { front, back } from "../user_action/front_back.js";
import { aligning, referencing } from "../user_action/align.js";
import { ul_select, ul_select_iconset } from "../ul_select.js";
import { tooltip } from "../tooltip.js";
import { add_patch } from "../idb.js";

const tpl = `<section class="movable" id="order">
	<div class="wrap-row">
	<div>
	<label class="tooltip" data-tooltip-text="Grupezi obiectele ca și cum ar fi un singur obiect" data-tooltip-bottom>Grupare</label>
	<select id="grouping" style="display:none">
		<option value="g">Grupează</option>
		<option value="h">Degrupează</option>
		<option value="hv">Degrupează tot</option>
	</select>
	</div>
	<div>
	<label class="tooltip" data-tooltip-text="Mută mai in față sau mai in spate obiectele " data-tooltip-bottom>Mutare</label>
	<select id="ordering" style="display:none">
			<option value="f">față</option>
			<option value="b">spate</option>
			<option value="fx">primul</option>
			<option value="bx">ultimul</option>
	</select>
	</div>
	<div>
	<label class="tooltip" data-tooltip-text="Aliniază obiectele in raport cu ele sau cu pagina" data-tooltip-bottom>Aliniere</label>
	<select id="align" data-show_hide="#reference" style="display:none">
			<option>Aliniază</option>
			<option value="l">stanga</option>
			<option value="r">dreapta</option>
			<option value="t">sus</option>
			<option value="b">jos</option>
			<option value="c">centru</option>
			<option value="m">mijloc</option>
	</select>
	</div>
	<div>
	<select id="reference" style="display:none">
			<option>aliniere la</option>
			<option value="0">centru comun</option>
			<option value="1">ultimul</option>
			<option value="2">primul</option>
			<option value="3">pagină bleed</option>
			<option value="4">siguranța text</option>
	</select>
	</div>
	<div class="folded-neighbor">
		<img src="/icon/close.svg" class="close" />
	</div>
</div>
</section>`;
export const $ui = ui_fragment(tpl);

export const $grouping = $ui.querySelector("#grouping");
const group_val_svg_map = { g: "group", h: "ungroup", hv: "ungroup_all" };
const $grouping_ul = ul_select_iconset($grouping, group_val_svg_map, 0, -10);
$grouping.addEventListener("change", () => {
  switch ($grouping.value) {
    case "g":
      group();
      break;
    case "h":
      ungroup();
      break;
    case "hv":
      ungroup_all();
      break;
  }
  add_patch();
  $grouping_ul.querySelector("li[class~=active]").classList.remove("active");
});

export const $ordering = $ui.querySelector("#ordering");
const order_val_svg_map = { f: "front", b: "back", fx: "first", bx: "last" };
const $ordering_ul = ul_select_iconset($ordering, order_val_svg_map, 0, -10);
$ordering.addEventListener("change", () => {
  switch ($ordering.value) {
    case "f":
      front();
      break;
    case "b":
      back();
      break;
    case "fx":
      front(true);
      break;
    case "bx":
      back(true);
      break;
  }
  add_patch();
  $ordering_ul.querySelector("li[class~=active]").classList.remove("active");
});

export const $reference = $ui.querySelector("#reference");
$reference.addEventListener("change", () => referencing($reference.value));
const reference_map = {
  0: "la centrul grupului format din obiectele selectate",
  1: "la ultimul obiect selectat",
  2: "la primul obiect selectat",
  3: "la pagina extinsă cu bleed / margine de taiere",
  4: "la un dreptunghi interior paginii ca să protejeze textul de tăiere",
};
const tooltiping = (tooltiping_map, pos = "bottom", adjx = 0, adjy = 0) => (
  $opt,
  $li
) => {
  if ($opt.value in tooltiping_map) {
    $li.dataset.tooltipText = tooltiping_map[$opt.value];
    const attr = document.createAttribute(`data-tooltip-${pos}`);
    $li.setAttributeNode(attr);
    $li.classList.add("tooltip");
    tooltip($li, adjx, adjy);
  }
  return $opt.textContent;
};
ul_select($reference, tooltiping(reference_map));

export const $align = $ui.querySelector("#align");
const align_val_svg_map = { l: "l", r: "r", c: "c", t: "t", b: "b", m: "m" };
const $align_ul = ul_select_iconset($align, align_val_svg_map, 0, -10);
$align.addEventListener("change", () => {
  aligning($align.value, $reference.value);
  add_patch();
  $align_ul.querySelector("li[class~=active]").classList.remove("active");
});
