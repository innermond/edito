import {$clicked, $selection} from '../selection/index.js'
import {scale} from '../user_action/size.js'
import {rotate} from '../user_action/rotate.js'
import {ui_fragment} from '../dom.js'
import {skewx, skewy} from '../user_action/skew.js'
import {addEventInterval} from '../event_interval.js'
import {ul_select_iconset} from '../ul_select.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'
import {add_patch, serialize_without_ants} from '../idb.js'

const tpl = `<section class="movable" id="geometry">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Modifică mărimea proporțional" data-tooltip-bottom>Scalare</label>
	<div>
		<button id="scale_plus" class="tooltip" data-tooltip-text="Mărește" data-tooltip-bottom ><img src="/icon/plus.svg"></button>
		<button id="scale_minus" class="tooltip" data-tooltip-text="Micșorează" data-tooltip-bottom ><img src="/icon/minus.svg"></button>
	</div>
</div>
<div>
<label class="tooltip" data-tooltip-text="Rotește obiectul" data-tooltip-bottom for="angle">Rotație</label>
<input class="tooltip" data-tooltip-text="0" data-tooltip-bottom   type="range" min="-180" max="180" value="0" step="0.0001" id="angle">
</div>
<div>
	<label class="tooltip" data-tooltip-text="Inversează sensul afișării obiectelor" data-tooltip-bottom>Oglindire</label>
	<select id="flipping" style="display:none">
			<option value="h">orizontală</option>
			<option value="v">verticală</option>
	</select>
	</div>
<div>
    <label class="tooltip" data-tooltip-text="Deformează obiectul pe orizontală" data-tooltip-bottom for="skewx">Deformare X</label>
    <input class="tooltip" data-tooltip-text="0" data-tooltip data-tooltip-bottom type="range" min="-180" max="180" value="0" step="0.0001" id="skewx">
</div>
<div>
    <label class="tooltip" data-tooltip-text="Deformează obiectul pe verticală" data-tooltip data-tooltip-bottom for="skewy">Deformare Y</label>
    <input class="tooltip" data-tooltip-text="0" data-tooltip data-tooltip-bottom type="range" min="-180" max="180" value="0" step="0.0001" id="skewy">
</div>
<div>
	<img src="/icon/close.svg" class="close" />
</div>
</div>
</section>`
export const $ui = ui_fragment(tpl)

const $scale_plus = $ui.querySelector('#scale_plus')
const $scale_minus = $ui.querySelector('#scale_minus')

const update_scale_elements = v => {
	v = v.toFixed(3)
	$scale_plus.value = $scale_minus.value = v
	if ($scale_plus.dataset.tooltipId) {
		const $tooltip = document.getElementById($scale_plus.dataset.tooltipId)
		if ($tooltip) $tooltip.textContent = v
	}
	if ($scale_minus.dataset.tooltipId) {
		const $tooltip = document.getElementById($scale_minus.dataset.tooltipId)
		if ($tooltip) $tooltip.textContent = v
	}
}

const step = 0.01
let k = 1
export const set_k = v => {
    k = v
    update_scale_elements(k)
}
const stop = 0.01
let svg_before = null 
const start_func = way => {
	k += way*step
	if (way < 0 && k < stop) {
			k = stop
	}
	scale(k)
	update_scale_elements(k)
}
const end_func = () => {
	add_patch(svg_before)
	svg_before = null
}
$scale_plus.addEventListener('mousedown', () => svg_before = serialize_without_ants())
addEventInterval($scale_plus, 'mousedown', () => start_func(1), 10, 'mouseup', end_func)
$scale_minus.addEventListener('mousedown', () => svg_before = serialize_without_ants())
addEventInterval($scale_minus, 'mousedown', () => start_func(-1), 10, 'mouseup', end_func)

export const $skewx = $ui.querySelector('#skewx')
export const $skewy = $ui.querySelector('#skewy')
$skewx.addEventListener('mousedown', () => svg_before = serialize_without_ants())
$skewx.addEventListener('mouseup', () => {
	add_patch(svg_before)
	svg_before = null
})
$skewx.addEventListener('input', () => {
	$selection.each($el => {
		skewx($el, $skewx.value)
		$clicked.from($el)
		$clicked.over()
	})
})
$skewy.addEventListener('mousedown', () => svg_before = serialize_without_ants())
$skewy.addEventListener('mouseup', () => {
	add_patch(svg_before)
	svg_before = null
})
$skewy.addEventListener('input', () => {
	$selection.each($el => {
		skewy($el, $skewy.value)
		$clicked.from($el)
		$clicked.over()
	})
})

export const $angle = $ui.querySelector('#angle')
$angle.addEventListener('mousedown', () => svg_before = serialize_without_ants())
$angle.addEventListener('input', () => rotate($angle.value))
$angle.addEventListener('mouseup', () =>{
	add_patch(svg_before)
	svg_before = null
})

export const $flipping = $ui.querySelector('#flipping')
const flip_val_svg_map = {'h': 'flip-h', 'v': 'flip-v'}
const $flipping_ul = ul_select_iconset($flipping, flip_val_svg_map, 0, -10)
$flipping.addEventListener('change', () => {
	const svg_before = serialize_without_ants()
	switch ($flipping.value) {
		case 'h':
			mirror_h()
		break;
		case 'v':
			mirror_v()
		break;
	}
	add_patch(svg_before)
	$flipping_ul.querySelector('li[class~=active]').classList.remove('active')
})
