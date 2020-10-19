import {
  ui_fragment,
  $svg,
  media_zoom,
  copy_viewbox,
  human_aprox,
} from '../dom.js';
import { zoom_reset } from '../zoom.js';
import { wrap } from '../drawer.js';
import { rgb_hex, computed_color } from '../color.js';
import { background_color } from '../user_action/background.js';
import { handle_step } from '../user_action/step.js';
import { addEventInterval } from '../event_interval.js';
import { add_patch, with_undo } from '../idb.js';
import { is_selectable } from '../floater/select.js';
import { deleting } from '../user_action/del_undel_clone.js';
import { $selection } from '../selection/index.js';

const tpl = `<section class="vertical-align">
<div class="wrap-row section">
<div>
	<label class="tooltip" data-tooltip-text="Schimbi lățimea documentului" data-tooltip-bottom for="media_width">Lățime</label>
	<input type="number" class="num3" id="media_width" value="210" />
</div>
<div>
	<label class="tooltip" data-tooltip-text="Modifică mărimea dimensiunii verticale a paginii" data-tooltip-bottom for="media_height">Înălțime</label>
	<input type="number" class="num3" id="media_height" value="297" />
</div>
</div>
</hr>
	<button class="tooltip" data-tooltip-text="Începi o pagină nouă, cu dimensiunile de mai sus" data-tooltip-bottom id="new_page">Pagină nouă</button>
	<hr/>
	<label class="tooltip" data-tooltip-text="Activezi / dezactivezi culoarea de fundal" data-tooltip-bottom  for="bkcolor">Background
		<input class="tooltip" data-tooltip-text="alege culoare" data-tooltip-bottom type="color" id="bkcolor" value="#ffffff">
		<input type="checkbox" class="switch" id="bkcolor-switch">
	</label>
	<hr/>
	<label class="tooltip" data-tooltip-text="Arată pagina in intregime" data-tooltip-bottom for="all_visible">
	Pagină intreagă
		<input type="checkbox" class="switch" id="all_visible">
	</label>
	<label class="tooltip" data-tooltip-text="Arată pagina la dimensiunile de printare / reale" data-tooltip-bottom for="real">
	Dimensiuni reale
		<input type="checkbox" class="switch" id="real">
	</label>
	<label class="tooltip" data-tooltip-text="Modifică mărimea proporțional" data-tooltip-bottom>Scalare
		<button id="canvas_plus" class="tooltip" data-tooltip-text="Mărește" data-tooltip-bottom ><img src="/icon/plus.svg"></button>
		<button id="canvas_minus" class="tooltip" data-tooltip-text="Micșorează" data-tooltip-bottom ><img src="/icon/minus.svg"></button>
	</label>
	<hr/>
<div class="wrap-row section">
<div>
		<label class="tooltip" data-tooltip-text="Mărimea bleedului, distanța cu care se extinde pagina peste dimensiunile finale" data-tooltip-bottom for="bleed">Bleed</label>
	<input type="number" class="num3" min="0.0" max="5.0" value="2" step="0.5" id="bleed">
	</div>
	<div>
    <label class="tooltip" data-tooltip-text="Stabilește mărimea pasului cu care se mută obiectele cu tastele săgeți" data-tooltip-bottom for="step">Pas</label>
    <input type="number" class="num3" min="0.01" max="90" value="2" step="0.1" id="step">
	</div>
	</div>
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'properties', 'pagină');

export const $media_width = $ui.querySelector('#media_width');
export const $media_height = $ui.querySelector('#media_height');
const $all_visible = $ui.querySelector('#all_visible');
const $real = $ui.querySelector('#real');

// get media dimensions
[$media_width.value, $media_height.value] = human_aprox(
  $svg.width.baseVal.valueInSpecifiedUnits,
  $svg.height.baseVal.valueInSpecifiedUnits,
);

// TODO load from idb a page then a new page. undo after new page is buggy
const $new_page = $ui.querySelector('#new_page');
$new_page.addEventListener('click', () => {
  Array.from($svg.children).forEach(($c) => {
    $c.removeAttribute('data-lock');
    if (!is_selectable($c)) return;
    $selection.add($c);
  });
  background_color('');
  $bkcolor.style.display = 'none';
  with_undo(deleting)();
});
//let current_canvas_width

/*const show_at_real_dimensions = () => {
	const $canvas = document.querySelector('#canvas')
	if ($real.checked) {
		$canvas.style.width = 'auto'
	} else {
		if(!$all_visible.checked) {
		 $canvas.style.width = '100%'
		} else {
			//$canvas.style.width = current_canvas_width
			media_zoom_event()
		}
	}
}*/
// FIXME for real dimensions auto is not appropriate
const media_zoom_event = () => {
  const $canvas = document.querySelector('#canvas');
  $canvas.style.width = '100%';
  //current_canvas_width = $canvas.style.width

  zoom_reset();
  media_zoom($media_width.value, $media_height.value);
  zoom_reset.viewbox = copy_viewbox($svg.viewBox);

  // fit?
  /*	if (!$all_visible.checked) {
		if ($real.checked) show_at_real_dimensions()
		return
	}
*/
  if ($real.checked) {
    $canvas.style.width = 'auto';
    //show_at_real_dimensions()
    //return
  }
  if (!$all_visible.checked) return;
  const $bottom = document.querySelector('#bottom-bar');
  let canvas_box = $canvas.getBoundingClientRect();
  let bottom_box = $bottom.getBoundingClientRect();
  let d = canvas_box.bottom - bottom_box.top;
  let adj = 10;
  while (d >= 0) {
    if (d < adj) {
      d = adj;
    }
    const k = canvas_box.width / canvas_box.height;
    if (canvas_box.width <= 0 || canvas_box.height <= 0) break;
    let newh = canvas_box.height - d;
    let neww = newh * k;
    $canvas.style.width = neww + 'px';
    canvas_box = $canvas.getBoundingClientRect();
    bottom_box = $bottom.getBoundingClientRect();
    d = canvas_box.bottom - bottom_box.top;
  }
  //current_canvas_width = $canvas.style.width
};

const media_zoom_undo = with_undo(media_zoom_event);
$media_width.addEventListener('change', media_zoom_undo);
$media_height.addEventListener('change', media_zoom_undo);

$all_visible.addEventListener('change', media_zoom_undo);
$real.addEventListener('change', media_zoom_undo);

export const $bleed = $ui.querySelector('#bleed');

export const $step = $ui.querySelector('#step');
document.addEventListener('keyup', (evt) => {
  handle_step($step.value, evt.key);
  add_patch();
});
export const $bkcolor = $ui.querySelector('#bkcolor');
// try to gues background color of page
let bkcolor = $svg.getAttributeNS(null, 'viewport-fill');
if (!bkcolor)
  bkcolor = $svg.style.backgroundColor || rgb_hex(computed_color('white'));
$bkcolor.value = bkcolor;
$bkcolor.style.backgroundColor = bkcolor;
$bkcolor.style.display = 'none';

const bkg_color_change = () => {
  const val = $bkcolor.value;
  background_color(val);
  $bkcolor.style.backgroundColor = val;
};

$bkcolor.addEventListener('change', () => {
  bkg_color_change();
  add_patch();
});
$bkcolor.addEventListener('input', bkg_color_change);

export const $bkcolor_switch = $ui.querySelector('#bkcolor-switch');
const bkg_color_switch_change = () => {
  if ($bkcolor_switch.checked === true) {
    const val = $bkcolor.value;
    $bkcolor.style.display = 'block';
    $bkcolor.value = val;
    $bkcolor.style.backgroundColor = val;
    background_color(val);
  } else {
    // for svg background color '' is default color which is not black but none
    background_color('');
    $bkcolor.style.display = 'none';
  }
};

$bkcolor_switch.addEventListener('change', () => {
  bkg_color_switch_change();
  add_patch();
});

const $canvas_plus = $ui.querySelector('#canvas_plus');
const $canvas_minus = $ui.querySelector('#canvas_minus');

const update_canvas_elements = (v) => {
  v = v.toFixed(3);
  $canvas_plus.value = $canvas_minus.value = v;
  if ($canvas_plus.dataset.tooltipId) {
    const $tooltip = document.getElementById($canvas_plus.dataset.tooltipId);
    if ($tooltip) $tooltip.textContent = v;
  }
  if ($canvas_minus.dataset.tooltipId) {
    const $tooltip = document.getElementById($canvas_minus.dataset.tooltipId);
    if ($tooltip) $tooltip.textContent = v;
  }
};

const step = 10;
const stop = 50;
let k = 0;
const start_func = (way) => {
  k = way * step;
  const $canvas = document.querySelector('#canvas');
  let v = $canvas.getBoundingClientRect().width;
  v += k;
  if (v < stop) v = stop;
  //const v = parseFloat(window.getComputedStyle($canvas).width) + k
  $canvas.style.width = v + 'px';
  update_canvas_elements(v);
};
const end_func = () => {};
addEventInterval(
  $canvas_plus,
  'mousedown',
  () => start_func(1),
  10,
  'mouseup',
  end_func,
);
addEventInterval(
  $canvas_minus,
  'mousedown',
  () => start_func(-1),
  10,
  'mouseup',
  end_func,
);
