import {dragging_all_marks_reset} from './ui.js'
import {$svg, attr, newtag} from './dom.js'
import {point_screen} from './pos.js'
import {setm, m2e, m} from './mtx.js'
import {disable} from './click.js'
import {add_dragging, remove_dragging} from './drag.js'
import {add_panning, remove_panning} from './pan.js'
import {$clicked, $selection} from './selection/index.js'
import {is_selectable, $select_inside} from './floater/select.js'

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
	$svg.addEventListener('mouseup', endSelect);
	//$svg.addEventListener('mouseleave', endSelect);

	$svg.addEventListener('mousemove', select, opt);
	
	$svg.addEventListener('touchstart', startSelect);
	$svg.addEventListener('touchend', endSelect);
	$svg.addEventListener('touchmove', select, opt);
}

export function remove_selecting() {
	$svg.removeEventListener('mousedown', startSelect);
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
	if (evt.target !== $svg) return

	moved = false
	if (start !== null) return
	if (evt.target !== $svg) return
	if ($clicked.clues.operating()) return

	start = point_screen(evt)

	$selectangle = newtag('rect', {style: style})
	$selectangle.dataset.selectangle = 'true'
	attr($selectangle, {x:start.x, y:start.y, width:1, height:1})
	$svg.appendChild($selectangle)
	disable.click = true
}

function selection_ants(evt) {
	if (!evt.shiftKey) $selection.clear()
	const BB = $selectangle.getBoundingClientRect()
	Array.from($svg.children).forEach($c => {
		if (!is_selectable($c)) return

		const bb = $c.getBoundingClientRect()
		if (
			(!$select_inside.checked &&
			bb.top+bb.height > BB.top &&
			bb.left+bb.width > BB.left &&
			bb.bottom-bb.height < BB.bottom &&
			bb.right-bb.width < BB.right)
			||
			($select_inside.checked &&
			bb.top > BB.top &&
			bb.left > BB.left &&
			bb.bottom < BB.bottom &&
			bb.right < BB.right)
		) {
			$selection.add($c)
		}
	})
	dragging_all_marks_reset()
	$selection.as_ants()
}

function endSelect(evt) {
	start = null
	disable.click = moved
	moved = null
	if (!$selectangle?.ownerSVGElement) return

	selection_ants(evt)
	$selectangle.remove()
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
	
	selection_ants(evt)
}
