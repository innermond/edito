import {$clicked, $selection} from '../selection/index.js'
import {fill_opacity} from '../user_action/opacity.js'
import {stroke_opacity, stroke_width} from '../user_action/stroke.js'
import {colorize, uncolorize} from '../selection/colorize.js'
import {ui_fragment} from '../dom.js'
import {rgb_hex, computed_color} from '../color.js'
import {background_color} from '../user_action/background.js'
import {addEventInterval} from '../event_interval.js'

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
	<div>
		<button id="stroke_plus" class="tooltip" data-tooltip-text="Mărește" data-tooltip-bottom ><img src="/icon/plus.svg"></button>
		<button id="stroke_minus" class="tooltip" data-tooltip-text="Micsorează" data-tooltip-bottom ><img src="/icon/minus.svg"></button>
	</div>
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
        $selection.forEach($e => $e.style.paintOrder = 'stroke')
	} else {
		uncolorize('stroke')
		$stroke_fill.style.display = 'none'
        $selection.forEach($e => $e.style.paintOrder = 'inherit')
	}
})

//export const $stroke_width = $ui.querySelector('#stroke-width')
export const $stroke_opacity = $ui.querySelector('#stroke-opacity')

const $stroke_plus = $ui.querySelector('#stroke_plus')
const $stroke_minus = $ui.querySelector('#stroke_minus')

const update_stroke_elements = v => {
    $stroke_plus.value = $stroke_minus.value = k
    if ($stroke_plus.dataset.tooltipId) {
        const $tooltip = document.getElementById($stroke_plus.dataset.tooltipId)
        if ($tooltip) $tooltip.textContent = k.toFixed(3)
    }
    if ($stroke_minus.dataset.tooltipId) {
        const $tooltip = document.getElementById($stroke_minus.dataset.tooltipId)
        if ($tooltip) $tooltip.textContent = k.toFixed(3)
    }
}

const step = 0.01
export let k = 0.1
export const set_k = v => {
    k = v
    update_stroke_elements(k)
}

const stop = 0
const start_func = way => {
	k = k + way*step

	if (way < 0 && k < stop) {
        k = stop
        stroke_width(k)
        return
    }
	stroke_width(k)
    update_stroke_elements(k)
}
const end_func = () => {}
addEventInterval($stroke_plus, 'mousedown', () => start_func(1), 10, 'mouseup', end_func)
addEventInterval($stroke_minus, 'mousedown', () => start_func(-1), 10, 'mouseup', end_func)

//$stroke_width.addEventListener('input', evt => stroke_width($stroke_width.value))
$stroke_opacity.addEventListener('input', evt => stroke_opacity($stroke_opacity.value))    
