import {$clicked, $selection} from '../selection/index.js'
import {$svg, ui_fragment, display_none} from '../dom.js'
import {add_diving, remove_diving} from '../dive.js'
import {add_panning, remove_panning} from '../pan.js'
import {add_selecting, remove_selecting} from '../select.js'
import {add_dragging, remove_dragging} from '../drag.js'
import {zoom, zoom_reset} from '../zoom.js'
import {centerpoint} from '../pos.js'
import {ungroup_one} from '../user_action/group.js'
import {addEventInterval} from '../event_interval.js'
import {disable} from '../click.js'
import movement from '../cap.js'

const tpl = `<section class="movable" id="zoom">
<div class="wrap-row">
<div>
	<label class="tooltip" data-tooltip-text="Indică regiunea in care se va face zoom" data-tooltip-bottom for="zoom_area">Regiune</label>
	<button class="tooltip" data-tooltip-text="deactivează / activează zoom-ul prin indicarea zonei" data-tooltip-bottom id="zoom_area"><img src="/icon/zoom-region.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Apropiază pagina" data-tooltip-bottom for="zoom_in">Mărește</label>
	<button class="tooltip" data-tooltip-text="apasă continuu" data-tooltip-bottom id="zoom_in"><img src="/icon/zoom-plus.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Depărtează pagina" data-tooltip-bottom for="zoom_out">Micșorează</label>
	<button class="tooltip" data-tooltip-text="apasă continuu" data-tooltip-bottom id="zoom_out"><img src="/icon/zoom-minus.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Deplasezi punctul de vedere in pagină" data-tooltip-bottom for="pan">Deplasare</label>
	<button class="tooltip" data-tooltip-text="activezi/deactivezi glisarea" data-tooltip-bottom id="pan"><img src="/icon/pan.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Distanța de vedere inițială" data-tooltip-bottom for="zoom_reset">Inițial</label>
	<button id="zoom_reset"><img src="/icon/reset.svg"></button>
</div>
<div>
	<label class="tooltip" data-tooltip-text="Consideră apropierea / depărtarea ca editare reală a obiectelor. Se va printa așa cum se vede" data-tooltip-bottom >Modificare</label>
	<input data-tooltip-text="cum se vede" data-tooltip-bottom type="checkbox" class="switch tooltip" id="zoom_is_edit">
</div>
<div>
	<img src="/icon/close.svg" class="close" />
</div>
</div>
</section>`
export const $ui = ui_fragment(tpl)
export const $zoom_is_edit = $ui.querySelector('#zoom_is_edit')

export const $zoom_area = $ui.querySelector('#zoom_area')
const diving = () => {
	return evt => {
		if(movement.activated.dive) {
			movement.dive.off()
			document.body.classList.remove('area')
			$zoom_area.classList.remove('active')
		} else {
			movement.dive.on()
			document.body.classList.add('area')
			$zoom_area.classList.add('active')
		}
	}
}
$zoom_area.addEventListener('click', diving())
$zoom_area.addEventListener('mousedown', evt => $zoom_area.classList.toggle('active'))

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
			movement.pan.off()
			document.body.classList.remove('pan')
		} else {
			movement.pan.on()
			document.body.classList.add('pan')
		}
		have_pan = !have_pan
	}
}
$pan.addEventListener('click', panning())
$pan.addEventListener('mousedown', evt => $pan.classList.toggle('active'))

$ui.querySelectorAll('[for]').forEach($e => {
	$e.addEventListener('click', evt => {
		evt.preventDefault()
	})
})

