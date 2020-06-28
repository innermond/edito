import {dragging_all_marks_reset} from './ui.js'
import {$svg, attr, newtag} from './dom.js'
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

export function add_diving() {
	// manage selecting
	$svg.addEventListener('mousedown', startSelect);
	
	//$svg.addEventListener('click', clickSelect, false);
	//$svg.removeEventListener('click', click);
	disable.click = true
	remove_dragging()
	if (document.body.classList.contains('pan')) {
		document.body.classList.remove('pan')
		document.body.classList.add('pan-stopped')
		remove_panning()
	}
	
	$svg.addEventListener('mouseup', endSelect);
	//$svg.addEventListener('mouseleave', endSelect);

	$svg.addEventListener('mousemove', select, opt);
	
	$svg.addEventListener('touchstart', startSelect);
	$svg.addEventListener('touchend', endSelect);
	$svg.addEventListener('touchmove', select, opt);
}

export function remove_diving() {
	// manage selecting
	$svg.removeEventListener('mousedown', startSelect);

	//$svg.removeEventListener('click', clickSelect, false);
	//$svg.addEventListener('click', click);
	disable.click = false
	add_dragging()
	if (document.body.classList.contains('pan-stopped')) {
		document.body.classList.remove('pan-stopped')
		add_panning()
		document.body.classList.add('pan')
	}

	$svg.removeEventListener('mouseup', endSelect);
	//$svg.removeEventListener('mouseleave', endSelect);

	$svg.removeEventListener('mousemove', select, opt);
	
	$svg.removeEventListener('touchstart', startSelect);
	$svg.removeEventListener('touchend', endSelect);
	$svg.removeEventListener('touchmove', select, opt);
}

let $selectangle
const style =  'pointer-events:none;vector-effect:non-scaling-stroke;stroke-width:1;fill:none;stroke:#000000;stroke-opacity:1;stroke-miterlimit:2;stroke-dasharray:3,3;stroke-dashoffset:2'
let start = null
let moved = null
function startSelect(evt) {
	if (moved !== null) return
	//if (evt.target !== $svg) return

	moved = false
	if (start !== null) return
	//if (evt.target !== $svg) return
	if ($clicked.clues.operating()) return

	start = point_screen(evt)
	//evt.stopPropagation()

	$selectangle = newtag('rect', {style: style})
	$selectangle.dataset.selectangle = 'true'
	attr($selectangle, {x:start.x, y:start.y, width:1, height:1})
	$svg.appendChild($selectangle)
	//setm($selectangle, m2e($selectangle, $svg))
	$svg.removeEventListener('click', click);
	//$svg.addEventListener('click', clickSelect);
	//remove_dragging()
}
/*function clickSelect(evt) {
	evt.stopPropagation()
	$svg.addEventListener('click', click)
}*/

function dive(scale, pt, step) {
	zoom(scale, pt, 1)
}

function endSelect(evt) {
	start = null
	disable.click = moved
	moved = null
	if (!$selectangle?.ownerSVGElement) return

	const $pt = centerpoint($selectangle, $svg)
	let scale = 2
	const W = $svg.getBoundingClientRect().width
	const w = $selectangle.getBoundingClientRect().width
	scale = W/w
	dive(scale, $pt, 1)
	$selectangle.remove()
	//evt.stopPropagation()
	//$svg.addEventListener('click', click)
	//$svg.removeEventListener('click', clickSelect);
	//add_dragging()
	disable.click = false
}

// top right
let tr = null
let br = null
function select(evt) {
	if (moved === null) return
	moved = true
	if (moved === null) return
	if (start === null) return
	//if (evt.target !== $svg) return
	//evt.stopPropagation()
	disable.click = true

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
