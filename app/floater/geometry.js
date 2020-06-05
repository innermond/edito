import {$clicked, $selection} from '../selection/index.js'
import {scale} from '../user_action/size.js'
import {rotate} from '../user_action/rotate.js'
import {ui_fragment, display_none} from '../dom.js'
import {handle_step} from '../user_action/step.js'
import {skewx, skewy} from '../user_action/skew.js'
import {tooltip} from '../tooltip.js'

const tpl = `<section class="movable" id="geometry">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Modifică mărimea proporțional" data-tooltip-bottom for="size">Scalare</label>
	<input class="tooltip" data-tooltip-text="1" data-tooltip-bottom  type="range" min="0.0001" max="2" value="1" step="0.0001" id="size">
</div>
<div>
<label class="tooltip" data-tooltip-text="Rotește obiectul" data-tooltip-bottom for="angle">Rotație</label>
<input class="tooltip" data-tooltip-text="0" data-tooltip-bottom   type="range" min="-180" max="180" value="0" step="0.0001" id="angle">
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

$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
	tooltip($e)
})

$ui.querySelector('img[class~="close"]').addEventListener('click', evt => {
	const $el = evt.target.closest('section')
	if ($el) display_none($el)
})

$ui.querySelectorAll('input[type=range]').forEach($e => $e.addEventListener('mousedown', evt => evt.stopPropagation()))

export const $size = $ui.querySelector('#size')
$size.addEventListener('input', evt => scale($size.value))

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
