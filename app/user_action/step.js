import {$svg, px, ui_fragment} from '../dom.js'
import {m, setm} from '../mtx.js'
import {point_in} from '../pos.js'
import {$clicked, $selection} from '../selection/index.js'

const tpl = `<label for="step">Mărime pas</label>
<input type="number" min="0.01" max="90" value="2" step="0.1" id="step">`
const $ui = ui_fragment(tpl)

export const $step = $ui.querySelector('#step')

window.addEventListener('keydown', evt => {      
	const step = px($step.value)
	$selection.forEach($e => {
		let t = $svg.createSVGTransform()
		let mtx = m($e)
		let x = 0
		let y = 0
		switch (evt.key){
		case  'ArrowUp':
			x=0
			y=-step
		break
		case 'ArrowDown':
			x=0
			y=+step
		break
		case 'ArrowRight':
			x=+step
			y=0
		break
		case 'ArrowLeft':
			x=-step
			y=0
		break
		default:
			return
		}
		let bb = $e.getBBox()
		let $p = point_in($svg, bb.x, bb.y)
		$p = point_in($e, $p.x, $p.y)
		let x0 = $p.x, y0 = $p.y
		$p = point_in($svg, bb.x+x, bb.y+y)
		$p = point_in($e, $p.x, $p.y)
		mtx = mtx.translate($p.x-x0,$p.y-y0)
		setm($e, mtx)
		$clicked.from($e)
		$clicked.over()
	})
})
