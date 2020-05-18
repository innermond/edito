import {$svg} from '../../dom.js'
import {outpoint} from '../../pos.js'
import {m2e, appendm} from '../../mtx.js'
import {$clicked, $selection} from '../../selection/index.js'

export const modeMap = {l: 'start', c: 'middle', r: 'end'}
const start_offset_map = {l:'0%', c:'50%', r:'100%'}
export function aligning_text(align_mode) {
	if ($clicked.is_zero()) return
	$selection.forEach($el => {
		let $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el]
		$ee.forEach($e => {
			let $original_e = $e
			let is_text
			if ($e.nodeName === 'text') is_text = true
			if (is_text){
				let has_textpath = $e.firstChild?.nodeName === 'textPath'
				if (has_textpath) {
					let $tp = $e.querySelector('textPath')
					let offset = start_offset_map[$align_text.options[$align_text.selectedIndex].value] ?? null
					if (offset) $tp.setAttributeNS(null, 'startOffset', offset)
				}
				let bb = $e.getBBox()
				let p0 = outpoint(bb.x, bb.y, m2e($e, $svg))
				p0 = p0.matrixTransform(m2e($svg,$e))
				const mode = modeMap[align_mode]?? null
				if (mode) {
					$e.style.setProperty('text-align', mode !== 'middle' ? mode : 'center' )
					$e.style.setProperty('text-anchor', mode)
				}
				let $tt = $e.querySelectorAll('tspan')
				for (let $elem of $tt) {
					$elem.style.setProperty('text-align','inherit')
					$elem.style.setProperty('text-anchor', 'inherit')
				}
				bb = $e.getBBox()
				if ($e == $original_e && !has_textpath) {
					let p1 = outpoint(bb.x, bb.y, m2e($e, $svg))
					p1 = p1.matrixTransform(m2e($svg,$e))
					let dx = p1.x-p0.x
					let dy = p1.y-p0.y
					appendm($e,$svg.createSVGMatrix().translate(-dx,-dy))
				} 
			} 
		})

		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()
		$clicked.from($el)
		$el.over()
	})
}
