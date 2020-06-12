import {$clicked, $selection} from '../selection/index.js'
import {fill_opacity} from '../user_action/opacity.js'
import {stroke_opacity, stroke_width} from '../user_action/stroke.js'
import {colorize, uncolorize} from '../selection/colorize.js'
import {ui_fragment, display_none} from '../dom.js'
import {rgb_hex, computed_color} from '../color.js'
import {background_color} from '../user_action/background.js'
import {tooltip} from '../tooltip.js'
import {span_checkbox} from '../span_checkbox.js'

const tpl = `<section class="movable" id="fill_stroke_color">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Alegi culoarea de umplere" data-tooltip-bottom for="fill">Umplere</label>
	<div>
	<input type="checkbox" class="switch" id="fill-switch">
	<input type="color" id="fill" value="#000000">
	</div>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Schimbă opacitatea umplerii" data-tooltip-bottom for="fill-opacity">Opacitate</label>
	<input class="tooltip" data-tooltip-text="1" data-tooltip-bottom  type="range" min="0" max="1" value="1" step="0.01" id="fill-opacity">
</div>
<div>
	<label class="tooltip" data-tooltip-text="Schimbă culoarea conturului" data-tooltip-bottom for="stroke-fill">Contur</label>
	<div>
	<input type="checkbox" class="switch" id="stroke-fill-switch">
	<input type="color" id="stroke-fill" value="#000000">
	</div>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Schimbă opacitatea conturului" data-tooltip-bottom for="stroke-opacity">Opacitate</label>
	<input class="tooltip" data-tooltip-text="1" data-tooltip-bottom type="range" min="0" max="1" value="1" step="0.01" id="stroke-opacity">
</div>
<div>
	<label class="tooltip" data-tooltip-text="Schimbă grosimea conturului" data-tooltip-bottom for="stroke-width">Grosime</label>
	<input class="tooltip" data-tooltip-text="0" data-tooltip-bottom type="range" min="0.0" max="10" value="0" step="0.0001" id="stroke-width">
</div>
<div>
	<img src="/icon/close.svg" class="close" />
</div>
</div>
</section>`
export const $ui = ui_fragment(tpl)

$ui.querySelectorAll('[for]').forEach($e => {
	$e.addEventListener('click', evt => {
		evt.preventDefault()
	})
})

$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
	tooltip($e)
})

$ui.querySelectorAll('input[type=range]').forEach($e => $e.addEventListener('mousedown', evt => evt.stopPropagation()))

$ui.querySelector('img[class~="close"]').addEventListener('click', evt => {
	const $el = evt.target.closest('section')
	if ($el) display_none($el)
})

const $kk = $ui.querySelectorAll('input[type=checkbox][class~=switch]')
span_checkbox($kk)

export const $fill = $ui.querySelector('#fill')
$fill.addEventListener('input', evt => {
	if ($fill_switch.checked !== true) return
	$fill.style.backgroundColor = colorize('fill', $fill.value)
})
$fill.style.display = 'none'

// switch
export const $fill_switch = $ui.querySelector('#fill-switch')
$fill_switch.addEventListener('change', evt => {
	if ($fill_switch.checked === true) {
		const val = colorize('fill', $fill.value)
		$fill.style.display = 'block'
		$fill.value = val
		$fill.style.backgroundColor = val
	} else {
		uncolorize('fill')
		$fill.style.display = 'none'
	}
})

export const $fill_opacity = $ui.querySelector('#fill-opacity')
$fill_opacity.addEventListener('input', evt => fill_opacity($fill_opacity.value))

export const $stroke_fill = $ui.querySelector('#stroke-fill')
$stroke_fill.addEventListener('input', evt => {
	if ($stroke_fill_switch.checked !== true) return
	$stroke_fill.style.backgroundColor = colorize('stroke', $stroke_fill.value)
})
$stroke_fill.style.display = 'none'

export const $stroke_fill_switch = $ui.querySelector('#stroke-fill-switch')
$stroke_fill_switch.addEventListener('change', evt => {
	if ($stroke_fill_switch.checked === true) {
		const val = colorize('stroke', $stroke_fill.value)
		$stroke_fill.value = val
		$stroke_fill.style.backgroundColor = val
		//FIXME stroke color always create a visible contour 
		//even there is no width set
		$stroke_fill.style.display = 'block'
	} else {
		uncolorize('stroke')
		$stroke_fill.style.display = 'none'
	}
})

export const $stroke_width = $ui.querySelector('#stroke-width')
export const $stroke_opacity = $ui.querySelector('#stroke-opacity')

$stroke_width.addEventListener('input', evt => stroke_width($stroke_width.value))
$stroke_opacity.addEventListener('input', evt => stroke_opacity($stroke_opacity.value))    
