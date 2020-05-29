import {$clicked, $selection} from '../selection/index.js'
import {scale} from '../user_action/size.js'
import {rotate} from '../user_action/rotate.js'
import {fill_opacity} from '../user_action/opacity.js'
import {stroke_opacity, stroke_width} from '../user_action/stroke.js'
import {colorize, uncolorize} from '../selection/colorize.js'
import {ui_fragment, $svg, media_zoom} from '../dom.js'
import {wrap} from '../drawer.js'
import {rgb_hex, computed_color} from '../color.js'
import {background_color} from '../user_action/background.js'
import {handle_step} from '../user_action/step.js'
import {skewx, skewy} from '../user_action/skew.js'

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Schimbi lățimea documentului" data-tooltip-bottom for="media_width">Lățime</label>
	<input type="number" id="media_width" value="210" />
	<label class="tooltip" data-tooltip-text="Modifică mărimea dimensiunii verticale a paginii" data-tooltip-bottom for="media_height">Înălțime</label>
	<input type="number" id="media_height" value="297" />
	<hr/>
	<label for="bleed">Bleed</label>
	<input type="number" min="0.0" max="5.0" value="2" step="0.5" id="bleed">
    <label for="step">Mărime pas</label>
    <input type="number" min="0.01" max="90" value="2" step="0.1" id="step">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegi culoarea fundalului" data-tooltip-bottom  for="bkcolor">Background
		<input type="checkbox" class="switch" id="bkcolor-switch">
		<input type="color" id="bkcolor" value="#ffffff">
	</label>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'properties', 'pagină')

export const $media_width = $ui.querySelector('#media_width')
export const $media_height = $ui.querySelector('#media_height')

// get media dimensions 
$media_width.value = $svg.width.baseVal.valueInSpecifiedUnits
$media_height.value = $svg.height.baseVal.valueInSpecifiedUnits

const media_zoom_event = evt =>	media_zoom($media_width.value, $media_height.value)

$media_width.addEventListener('input', media_zoom_event, true)
$media_height.addEventListener('input', media_zoom_event, true)

export const $bleed = $ui.querySelector('#bleed')

export const $step = $ui.querySelector('#step')
document.addEventListener('keyup', evt => handle_step($step.value, evt.key))      

export const $bkcolor = $ui.querySelector('#bkcolor')
// try to gues background color of page
let bkcolor = $svg.getAttributeNS(null, 'viewport-fill')          
if (!bkcolor) bkcolor = $svg.style.backgroundColor || rgb_hex(computed_color('white'))
$bkcolor.value = bkcolor
$bkcolor.style.backgroundColor = bkcolor
$bkcolor.style.display = 'none'

$bkcolor.addEventListener('input', evt => {
	const val = $bkcolor.value
	background_color(val)
	$bkcolor.style.backgroundColor = val
})

export const $bkcolor_switch = $ui.querySelector('#bkcolor-switch')
$bkcolor_switch.addEventListener('change', evt => {
	if ($bkcolor_switch.checked === true) {
		const val = $bkcolor.value
		$bkcolor.style.display = 'block'
		$bkcolor.value = val
		$bkcolor.style.backgroundColor = val
		background_color(val)
	} else {
		// for svg background color '' is default color which is not black but none
		background_color('')
		$bkcolor.style.display = 'none'
	}
})
