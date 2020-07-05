import {dragging_all_marks_reset} from './ui.js'
import {$svg, attr, newtag, element_from} from './dom.js'
import {point_screen} from './pos.js'
import {setm, m2e, m} from './mtx.js'
import {disable} from './click.js'
import {add_dragging, remove_dragging} from './drag.js'
import {add_panning, remove_panning} from './pan.js'
import {$clicked, $selection} from './selection/index.js'
import {is_selectable, $select_inside} from './floater/select.js'
import {centerpoint} from './pos.js'
import {zoom} from './zoom.js'
import {click} from './click.js'
import feature from './feature.js'
import movement from './cap.js'
import {cycle, moved, add_rectangling, remove_rectangling, $selectangle} from './selectangle.js'

const opt = feature.supportsPassive ? { passive: true } : false

function cycle_start(stage) {
	return evt => {
		if (!stage(evt)) return
		disable.click = true
	}
}
function cycle_end(stage) {
	return evt => {
		if (!disable.click) disable.click = moved
		const $pt = centerpoint($selectangle, $svg)
		let scale = 2
		const W = $svg.getBoundingClientRect().width
		let w = $selectangle.getBoundingClientRect().width
		scale = evt.ctrlKey ? w/W : W/w
		// is just a click?
		if ($selectangle?.width.baseVal.valueInSpecifiedUnits <= 1) evt.ctrlKey ? scale = 0.5 : scale = 2
		zoom(scale, $pt, 1)
		if (!stage(evt)) return
	}	
}

const md = evt => {
	(movement.activated.dive && evt.ctrlKey) ? 
	document.body.classList.add('out'):
	document.body.classList.remove('out')
}

export function add_diving() {
	cycle.start = cycle_start
	cycle.end = cycle_end
	cycle.step = null
	add_rectangling()
	document.body.addEventListener('keydown', md)
	document.body.addEventListener('keyup', md)
}

export function remove_diving() {
	remove_rectangling()
	document.body.removeEventListener('keydown', md)
	document.body.removeEventListener('keyup', md)
	document.body.classList.remove('out')
}
