import {$svg, attr, newtag} from './dom.js'
import {point_screen} from './pos.js'
import {setm, m2e, m} from './mtx.js'
import {click} from './click.js'
import {add_dragging, remove_dragging} from './drag.js'

let supportsPassive = false;
try {
  let opts = Object.defineProperty({}, 'passive', {
    get: function() {
      supportsPassive = true;
    }
  });
  window.addEventListener("testPassive", null, opts);
  window.removeEventListener("testPassive", null, opts);
} catch (e) {}
const opt = supportsPassive ? { passive: true } : false

export function add_selecting() {
	// manage selecting
	$svg.addEventListener('mousedown', startSelect);
	
	//$svg.addEventListener('click', clickSelect);
	$svg.removeEventListener('click', click);
	//remove_dragging()
	
	$svg.addEventListener('mouseup', endSelect);
	$svg.addEventListener('mouseleave', endSelect);

	$svg.addEventListener('mousemove', select, opt);
	
	$svg.addEventListener('touchstart', startSelect);
	$svg.addEventListener('touchend', endSelect);
	$svg.addEventListener('touchmove', select, opt);
}

export function remove_selecting() {
	// manage panging
	$svg.removeEventListener('mousedown', startSelect);

	//$svg.removeEventListener('click', clickSelect);
	$svg.addEventListener('click', click);
	//add_dragging()
	
	$svg.removeEventListener('mouseup', endSelect);
	$svg.removeEventListener('mouseleave', endSelect);

	$svg.removeEventListener('mousemove', select, opt);
	
	$svg.removeEventListener('touchstart', startSelect);
	$svg.removeEventListener('touchend', endSelect);
	$svg.removeEventListener('touchmove', select, opt);
}

let $selectangle
const style =  'vector-effect:non-scaling-stroke;stroke-width:1;fill:none;stroke:#000000;stroke-opacity:1;stroke-miterlimit:2;stroke-dasharray:3,3;stroke-dashoffset:2'
let start = null

function startSelect(evt) {
	if (start !== null) return
	if (evt.target !== $svg) return

	start = point_screen(evt)
	//evt.stopPropagation()

	$selectangle = newtag('rect', {style: style})
	attr($selectangle, {x:start.x, y:start.y, width:1, height:1})
	$svg.appendChild($selectangle)
	//setm($selectangle, m2e($selectangle, $svg))
	$svg.removeEventListener('click', click);
	$svg.addEventListener('click', clickSelect);
	remove_dragging()
}
function clickSelect(evt) {
	//evt.stopPropagation()
}
function endSelect(evt) {
	start = null
	$selectangle?.remove()
	$svg.addEventListener('click', click);
	$svg.removeEventListener('click', clickSelect);
	add_dragging()
}
// top right
let tr = null
let br = null
function select(evt) {
	if (start === null) return
	//if (evt.target !== $svg) return
	//evt.stopPropagation()

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
