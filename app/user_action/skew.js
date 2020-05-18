import {ui_fragment} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {m, setm} from '../mtx.js'

const tpl = `<label for="skewx">Deformare orizontală</label>
		<input type="range" min="-180" max="180" value="0" step="0.0001" id="skewx">
		
		<label for="skewy">Deformare verticală</label>
		<input type="range" min="-180" max="180" value="0" step="0.0001" id="skewy">`
const $ui = ui_fragment(tpl)

export const $skewx = $ui.querySelector('#skewx')
export const $skewy = $ui.querySelector('#skewy')
$skewx.addEventListener('input', skew_x)
$skewy.addEventListener('input', skew_y)

function skew_x(evt) {
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			skewx($e, $skewx.value)
			$clicked.from($e)
			$clicked.over()
		})
	})
}

function skewx($el, a) {
		let prev = skewx.prevs.get($el) ?? 0
		skewx.prevs.set($el,  a)
		a = a - prev
		let bb = $el.getBBox()
		let x = bb.x + bb.width/2
		let y = bb.y + bb.height/2

		let mtx = m($el)
		mtx = mtx.translate(x,y).skewX(a).translate(-x,-y)
		setm($el, mtx)
}
skewx.prevs = new Map() 

function skew_y(evt) {
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			skewy($e, $skewy.value)
			$clicked.from($e)
			$clicked.over()
		})
	})
}

function skewy($el, a) {
		let prev = skewy.prevs.get($el) ?? 0
		skewy.prevs.set($el,  a)
		a = a - prev
		let bb = $el.getBBox()
		let x = bb.x + bb.width/2
		let y = bb.y + bb.height/2

		let mtx = m($el)
		mtx = mtx.translate(x,y).skewY(a).translate(-x,-y)
		setm($el, mtx)
}
skewy.prevs = new Map() 
