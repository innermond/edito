import {$clicked, $selection} from '../selection/index.js'
import {$svg, ui_fragment, display_none} from '../dom.js'
import {add_panning, remove_panning} from '../pan.js'
import {zoom, zoom_reset} from '../zoom.js'
import {centerpoint} from '../pos.js'
import {ungroup_one} from '../user_action/group.js'

const tpl = `<section class="movable" id="zoom">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Apropiază pagina" data-tooltip-bottom for="zoom_in">Mărește</label>
	<button id="zoom_in"><img src="/icon/zoom-plus.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Depărtează pagina" data-tooltip-bottom for="zoom_out">Micșorează</label>
	<button id="zoom_out"><img src="/icon/zoom-minus.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Consideră zoomingul ca editare a obiectelor" data-tooltip-bottom >Modificare</label>
	<input type="checkbox" class="switch" id="zoom_is_edit">
</div>
<div>
	<label class="tooltip" data-tooltip-text="Distanța de vedere inițială" data-tooltip-bottom for="zoom_reset">Inițial</label>
	<button id="zoom_reset"><img src="/icon/reset.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Deplasezi punctul de vedere" data-tooltip-bottom for="pan">Deplasare</label>
	<button id="pan"><img src="/icon/pan.svg"></button>
</div>
<div>
	<img src="/icon/close.svg" class="close" />
</div>
</div>
</section>`
export const $ui = ui_fragment(tpl)
export const $zoom_is_edit = $ui.querySelector('#zoom_is_edit')

function addEventInterval($el, start_evt, start_func, pulse, end_evt, end_func) {
	let pulse_id = null
	
	const start = evt => {
		if (pulse_id) clearInterval(pulse_id) 
		pulse_id = setInterval(start_func, pulse)
	}
	
	const end = evt => {
		clearInterval(pulse_id) 
		pulse_id = null
		end_func()
	}

	$el.addEventListener(start_evt,start)
	$el.addEventListener(end_evt, end)
	// trap uncleared pulse by savage mouse movement when mouseup do not fire
	$el.addEventListener('mouseleave', evt => {if (pulse_id) clearInterval(pulse_id)})
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

$ui.querySelectorAll('[for]').forEach($e => {
	$e.addEventListener('click', evt => {
		evt.preventDefault()
	})
})
