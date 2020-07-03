import {$svg} from './dom.js'
import {disable, click} from './click.js'
import {add_dragging, remove_dragging} from './drag.js'
import feature from './feature.js'

const opt = feature.supportsPassive ? { passive: true } : false

export function add_panning() {
	// manage panning
	$svg.addEventListener('mousedown', startPan);
	
	$svg.addEventListener('click', clickPan);
	$svg.addEventListener('mouseup', endPan);
	$svg.addEventListener('mousemove', pan, opt);
	$svg.addEventListener('mouseleave', endPan);
	$svg.addEventListener('touchstart', startPan);
	$svg.addEventListener('touchend', endPan);
	$svg.addEventListener('touchmove', pan, opt);
}

export function remove_panning() {
	// manage panging
	$svg.removeEventListener('mousedown', startPan);

	$svg.removeEventListener('click', clickPan);
	$svg.removeEventListener('mouseup', endPan);
	$svg.removeEventListener('mousemove', pan, opt);
	$svg.removeEventListener('mouseleave', endPan);
	$svg.removeEventListener('touchstart', startPan);
	$svg.removeEventListener('touchend', endPan);
	$svg.removeEventListener('touchmove', pan, opt);
}

let start
function startPan(evt) {
	document.body.classList.add('panning')
	start = {x: evt.clientX, y: evt.clientY}
	evt.stopPropagation()
}
function clickPan(evt) {
	evt.stopPropagation()
}
function endPan(evt) {
	document.body.classList.remove('panning')
	start = null
}

function pan(evt) {
	if (!start) return
	evt.stopPropagation()
	let current = {x: evt.clientX, y: evt.clientY}
	const dx = start.x - current.x
	const dy = start.y - current.y
	const ctm = $svg.getScreenCTM()
	$svg.viewBox.baseVal.x += dx/ctm.a
	$svg.viewBox.baseVal.y += dy/ctm.d
	start = current
}
