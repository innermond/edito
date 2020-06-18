import {$svg} from './dom.js'

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

export function add_panning() {
	// manage panging
	$svg.addEventListener('mousedown', startPan, opt);
	$svg.addEventListener('click', clickPan, Object.assign(opt, {capture: true}));
	$svg.addEventListener('mouseup', endPan, opt);
	$svg.addEventListener('mousemove', pan, opt);
	$svg.addEventListener('mouseleave', endPan, opt);
	$svg.addEventListener('touchstart', startPan, opt);
	$svg.addEventListener('touchend', endPan, opt);
	$svg.addEventListener('touchmove', pan, opt);
}

export function remove_panning() {
	// manage panging
	$svg.removeEventListener('mousedown', startPan, opt);
	$svg.removeEventListener('click', clickPan, Object.assign(opt, {capture: true}));
	$svg.removeEventListener('mouseup', endPan, opt);
	$svg.removeEventListener('mousemove', pan, opt);
	$svg.removeEventListener('mouseleave', endPan, opt);
	$svg.removeEventListener('touchstart', startPan, opt);
	$svg.removeEventListener('touchmove', pan, opt);
}

let start
function startPan(evt) {
	start = {x: evt.clientX, y: evt.clientY}
	evt.stopPropagation()
}
function clickPan(evt) {
	evt.stopPropagation()
}
function endPan(evt) {
	start = null
}

function pan(evt) {
	if (!start) return
	evt.stopPropagation()
	let current = {x: evt.clientX, y: evt.clientY}
	const dx = start.x - current.x
	const dy = start.y - current.y
	const ctm = $svg.getCTM()
	$svg.viewBox.baseVal.x += dx/ctm.a
	$svg.viewBox.baseVal.y += dy/ctm.d
	start = current
}
