import {$svg, attr, newtag} from './dom.js'
import {point_screen} from './pos.js'
import {$clicked, $selection} from './selection/index.js'
import feature from './feature.js'

export const cycle = {
	start: stage => stage,
	end: stage => stage,
	step: stage => stage,
}

const opt = feature.supportsPassive ? { passive: true } : false
const cycle_consolidated = {start: null, end: null, step: null}
export function add_rectangling() {
	// here are dynamic added functions to handle events
	// they must be named functions to be found by removeEventListener
	cycle_consolidated.start = cycle.start(startRectangle)
	cycle_consolidated.end = cycle.end(endRectangle)
	cycle_consolidated.step = cycle.step(stepRectangle)

	$svg.addEventListener('mousedown', cycle_consolidated.start)
	$svg.addEventListener('mouseup', cycle_consolidated.end)
	$svg.addEventListener('mousemove', cycle_consolidated.step, opt)
	
	//$svg.addEventListener('touchstart', startRectangle)
	//$svg.addEventListener('touchend', endRectangle)
	//$svg.addEventListener('touchmove', stepRectangle, opt)
}

export function remove_rectangling() {
	$svg.removeEventListener('mousedown', cycle_consolidated.start)
	$svg.removeEventListener('mouseup', cycle_consolidated.end)
	$svg.removeEventListener('mousemove', cycle_consolidated.step, opt)
	
	//$svg.removeEventListener('touchstart', startRectangle)
	//$svg.removeEventListener('touchend', endRectangle)
	//$svg.removeEventListener('touchmove', stepRectangle, opt)
}

export let $selectangle
const style =  'pointer-events:none;vector-effect:non-scaling-stroke;stroke-width:1;fill:none;stroke:#000000;stroke-opacity:1;stroke-miterlimit:2;stroke-dasharray:3,3;stroke-dashoffset:2'
let start = null
export let moved = null
function startRectangle(evt) {
	if (moved !== null) return false
	if (start !== null) return false
	if ($clicked.clues.operating()) return false
	moved = false

	start = point_screen(evt)

	$selectangle = newtag('rect', {style: style})
	$selectangle.dataset.selectangle = 'true'
	attr($selectangle, {x:start.x, y:start.y, width:1, height:1})
	$svg.appendChild($selectangle)
	return true
}

function endRectangle(evt) {
	start = null
	moved = null
	if (!$selectangle?.ownerSVGElement) return false

	$selectangle.remove()
	return true
}

// top right
let tr = null
let br = null
function stepRectangle(evt) {
	if (moved === null) return false
	if (start === null) return false
	moved = true

	const current = point_screen(evt)
	const dx = start.x - current.x
	const dy = start.y - current.y
	const bb = $selectangle.getBBox()
	
	let newwidth = bb.width + dx
	let newheight = bb.height + dy
	let x = start.x, y = start.y
	tr = newwidth <= 0 && (dx < 0 && tr === null) || tr
	if (tr) {
		newwidth = bb.width - dx
		x = start.x - newwidth
		if (newwidth <= 0) tr = null
	}
	br = newheight <= 0 && (dy < 0 && br === null) || br
	if (br) {
		newheight = bb.height - dy
		y = start.y - newheight
		if (newheight <= 0) br = null
	}
	if (newwidth >= 0 && newheight >= 0) attr($selectangle, {x:x, y:y, width: newwidth, height: newheight})

	start = current
	return true
}
