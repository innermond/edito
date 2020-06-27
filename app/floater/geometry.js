import {$clicked, $selection} from '../selection/index.js'
import {scale} from '../user_action/size.js'
import {rotate} from '../user_action/rotate.js'
import {ui_fragment} from '../dom.js'
import {handle_step} from '../user_action/step.js'
import {skewx, skewy} from '../user_action/skew.js'
import {addEventInterval} from '../event_interval.js'
import {ul_select_iconset} from '../ul_select.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'

const tpl = `<section class="movable" id="geometry">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Modifică mărimea proporțional" data-tooltip-bottom for="size">Scalare</label>
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
const start_func = way => {
	k += way*step
	if (way < 0 && k < stop) {
			k = stop
	}
	scale(k)
	update_scale_elements(k)
}
const end_func = () => {}
addEventInterval($scale_plus, 'mousedown', () => start_func(1), 10, 'mouseup', end_func)
addEventInterval($scale_minus, 'mousedown', () => start_func(-1), 10, 'mouseup', end_func)

export const $skewx = $ui.querySelector('#skewx')
export const $skewy = $ui.querySelector('#skewy')
$skewx.addEventListener('input', evt => {
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			skewx($e, $skewx.value)
			$clicked.from($e)
			$clicked.over()
		})
	})
})
$skewy.addEventListener('input', evt => {
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			skewy($e, $skewy.value)
			$clicked.from($e)
			$clicked.over()
		})
	})
})

export const $angle = $ui.querySelector('#angle')
$angle.addEventListener('input', evt => rotate($angle.value))

export const $flipping = $ui.querySelector('#flipping')
const flip_val_svg_map = {'h': 'flip-h', 'v': 'flip-v'}
const $flipping_ul = ul_select_iconset($flipping, flip_val_svg_map, 0, -10)
$flipping.addEventListener('change', evt => {
	switch ($flipping.value) {
		case 'h':
			mirror_h()
		break;
		case 'v':
			mirror_v()
		break;
	}
	$flipping_ul.querySelector('li[class~=active]').classList.remove('active')
})
