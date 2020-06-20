import {ui_fragment, $svg, media_zoom, copy_viewbox} from '../dom.js'
import {zoom, zoom_reset} from '../zoom.js'
import {$clicked, $selection} from '../selection/index.js'
import {scale} from '../user_action/size.js'
import {rotate} from '../user_action/rotate.js'
import {wrap} from '../drawer.js'
import {rgb_hex, computed_color} from '../color.js'
import {background_color} from '../user_action/background.js'
import {handle_step} from '../user_action/step.js'
import {ungroup_one} from '../user_action/group.js'
import {centerpoint} from '../pos.js'
import {add_panning, remove_panning} from '../pan.js'

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Schimbi lățimea documentului" data-tooltip-bottom for="media_width">Lățime</label>
	<input type="number" id="media_width" value="210" />
	<label class="tooltip" data-tooltip-text="Modifică mărimea dimensiunii verticale a paginii" data-tooltip-bottom for="media_height">Înălțime</label>
	<input type="number" id="media_height" value="297" />
	<hr/>
    <button id="zoom_in">Zoom +</button>
    <button id="zoom_out">Zoom -</button>
		<label class="tooltip" data-tooltip-text="Consideră zoomingul ca editare a obiectelor" data-tooltip-bottom ><input type="checkbox" class="switch" id="zoom_is_edit">editare</label>
    <button id="zoom_reset">Reset</button>
    <button id="pan">Pan</button>
	<hr/>
		<label class="tooltip" data-tooltip-text="Mărimea bleedului, distanța cu care se extinde pagina peste dimensiunile finale" data-tooltip-bottom for="bleed">Bleed</label>
	<input type="number" min="0.0" max="5.0" value="2" step="0.5" id="bleed">
    <label class="tooltip" data-tooltip-text="Stabilește mărimea pasului cu care se mută obiectele cu tastele săgeți" data-tooltip-bottom for="step">Mărime pas</label>
    <input type="number" min="0.01" max="90" value="2" step="0.1" id="step">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegi culoarea fundalului" data-tooltip-bottom  for="bkcolor">Background
		<input type="checkbox" class="switch" id="bkcolor-switch">
		<input type="color" id="bkcolor" value="#ffffff">
	</label>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'properties', 'pagină')

export const $zoom_is_edit = $ui.querySelector('#zoom_is_edit')

export const $media_width = $ui.querySelector('#media_width')
export const $media_height = $ui.querySelector('#media_height')

// get media dimensions 
$media_width.value = $svg.width.baseVal.valueInSpecifiedUnits
$media_height.value = $svg.height.baseVal.valueInSpecifiedUnits

const media_zoom_event = evt => {
	zoom_reset()
	media_zoom($media_width.value, $media_height.value)
	zoom_reset.viewbox = copy_viewbox($svg.viewBox)
}
$media_width.addEventListener('input', media_zoom_event, true)
$media_height.addEventListener('input', media_zoom_event, true)

function addEventInterval($el, start_evt, start_func, pulse, end_evt, end_func) {
	let pulse_id = null
	
	const start = evt => {
		pulse_id = setInterval(start_func, pulse)
	}
	
	const end = evt => {
		clearInterval(pulse_id) 
		end_func()
	}

	$el.addEventListener(start_evt,start)
	$el.addEventListener(end_evt, end)
}

const step = 1.01

const $zoomin = $ui.querySelector('#zoom_in')
const $zoomout = $ui.querySelector('#zoom_out')

let $g = null
let to = null
const start_func = scale => {
	if ($selection.size) {
		$g = $selection.as_group(true)
		to = centerpoint($g, $svg)
	}
	zoom(scale, to)
}
const end_func = () => {
	if ($g) {
		ungroup_one($g)
		$g = null
		to = null
	}
}

addEventInterval($zoomin, 'mousedown', () => start_func(step), 10, 'mouseup', end_func)
addEventInterval($zoomout, 'mousedown', () => start_func(1/step), 10, 'mouseup', end_func)

/*$zoomout.addEventListener('mousedown', evt => {
    let zoom_to = null
    if ($selection.size) {
        const $g = $selection.as_group(true)
        zoom_to = centerpoint($g, $svg)
        ungroup_one($g)
    }
		pulse_id = setInterval(()=>zoom(1/step, zoom_to), 5)
})
$zoomout.addEventListener('mouseup', evt => {
	clearInterval(pulse_id) 
})*/

const $zoomreset = $ui.querySelector('#zoom_reset')
$zoomreset.addEventListener('click', evt => zoom_reset())

const $pan = $ui.querySelector('#pan')
const panning = () => {
	let have_pan = false
	return evt => {
		if(have_pan) {
			remove_panning() 
			document.body.classList.remove('pan')
		} else {
			add_panning()
			document.body.classList.add('pan')
		}
		have_pan = !have_pan
	}
}
$pan.addEventListener('click', panning())

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
