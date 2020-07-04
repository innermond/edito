import {$svg, attr, newtag} from './dom.js'
import {point_screen} from './pos.js'
import {$clicked} from './selection/index.js'
import feature from './feature.js'

const opt = feature.supportsPassive ? { passive: true } : false

export function add_rectangling() {
	$svg.addEventListener('mousedown', startRectangle);
	$svg.addEventListener('mouseup', endRectangle);
	$svg.addEventListener('mousemove', stepRectangle, opt);
	
	$svg.addEventListener('touchstart', startRectangle);
	$svg.addEventListener('touchend', endRectangle);
	$svg.addEventListener('touchmove', stepRectangle, opt);
}

export function remove_rectangling() {
	$svg.removeEventListener('mousedown', startRectangle);
	$svg.removeEventListener('mouseup', endRectangle);
	$svg.removeEventListener('mousemove', stepRectangle, opt);
	
	$svg.removeEventListener('touchstart', startRectangle);
	$svg.removeEventListener('touchend', endRectangle);
	$svg.removeEventListener('touchmove', stepRectangle, opt);
}

let $selectangle
const style =  'pointer-events:none;vector-effect:non-scaling-stroke;stroke-width:1;fill:none;stroke:#000000;stroke-opacity:1;stroke-miterlimit:2;stroke-dasharray:3,3;stroke-dashoffset:2'
let start = null
let moved = null
function startRectangle(evt) {
	if (moved !== null) return

	moved = false
	if (start !== null) return
	if ($clicked.clues.operating()) return

	start = point_screen(evt)

	$selectangle = newtag('rect', {style: style})
	$selectangle.dataset.selectangle = 'true'
	attr($selectangle, {x:start.x, y:start.y, width:1, height:1})
	$svg.appendChild($selectangle)
}

function endRectangle(evt) {
	start = null
	moved = null
	if (!$selectangle?.ownerSVGElement) return

	// fire specific callback here
	$selectangle.remove()
}

// top right
let tr = null
let br = null
function stepRectangle(evt) {
	if (moved === null) return
	moved = true
	if (moved === null) return
	if (start === null) return

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
}
