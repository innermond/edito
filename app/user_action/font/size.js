import {$clicked, $selection} from '../../selection/index.js'
import {point_in} from '../../pos.js'

export function sizing_text(val) {
	if ($clicked.is_zero()) return
	$selection.forEach($el => {
		let $ee =  $el.nodeName === 'g' ? $el.children : [$el]
		for (let $e of $ee) {
			if ($e.nodeName==='text') {
				const style = window.getComputedStyle($e)
				const base = style.getPropertyValue('font-size')
				$e.style.fontSize = val+'pt'          
				const modified = style.getPropertyValue('font-size')
				const r = parseFloat(modified)/parseFloat(base)
				sizing($e, r)
			}
		} 
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()

		$clicked.from($el)
		$el.over()
	})
}

function sizing ($e, r) {
	const $tt = Array.from($e.childNodes).filter($x => $x.nodeType === Node.TEXT_NODE || $x.nodeType === Node.ELEMENT_NODE) 
	$tt.forEach($t => {
		if ($t.nodeType === Node.TEXT_NODE) return

		if ($t.style.fontSize === "") {
			$t.style.fontSize = 'inherit'
		} else {
			const tstyle = window.getComputedStyle($t)
			let tfz = tstyle.getPropertyValue('font-size')
			tfz = r*parseFloat(tfz)
			$t.style.fontSize = tfz + 'px'
		}

		let y = $t.getAttributeNS(null, 'y')
		const is_positioned = Number.isFinite(parseFloat(y))

		if (is_positioned) {
			y = parseFloat(y)
			let y0 = $e.getAttributeNS(null, 'y')
			y0 = parseFloat(y0)
			let dy = 0
			dy = y - y0 //r > 1 ? y-y0 : y0-y
			dy = r*dy
			y0 = $e.getStartPositionOfChar(0).y
		/*	
			const style = window.getComputedStyle($e)
		 	const tstyle = window.getComputedStyle($t) || style
			let tfz = tstyle.getPropertyValue('font-size')
			tfz = parseFloat(tfz)
			let tlh = tstyle.getPropertyValue('line-height')
			tlh = parseFloat(tlh)
			const tratio = tlh/tfz || 1.25

			let lh = style.getPropertyValue('line-height')
			if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
				let fz = style.getPropertyValue('font-size')
				if (fz === "") fz = '16px'
				lh = tratio * parseFloat(fz)
				lh += 'px'
			}
			let div = lh.slice(-1) == "%" ? 0.01 : 1
			let lineHeight = parseFloat(lh)*div
			let y = 1.0*$e.getAttributeNS(null, 'y') + inx*lineHeight
			$t.setAttributeNS(null, 'y', y)
			*/
			$t.setAttributeNS(null, 'y', y0 + dy)
		}
		if ($t.querySelectorAll('tspan')) sizing($t, r)
		//$t.style.fontSize = 'inherit'
	})
}
