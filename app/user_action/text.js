import {newtag} from '../dom.js'
import {$clicked} from '../selection/index.js'

export function keyup($target) {
	if ( $clicked.is_zero() || $clicked.nodeName !== 'text') return
	let $tt = Array.from($clicked.childNodes).filter($e => $e.nodeType === Node.TEXT_NODE || $e.nodeType === Node.ELEMENT_NODE) 

	const style = window.getComputedStyle($clicked)
	
	const lines = $target.value.split("\n")
	lines.forEach( (line, inx) => {
		let $t = $tt[inx] ?? null
		const is_text = $t?.nodeType === Node.TEXT_NODE
		if (!$t || is_text) {
			let $tspan = newtag('tspan')
			let lh = style?.getPropertyValue('line-height')
			if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
				let fz = style?.getPropertyValue('font-size') ?? ''
				if (fz === '') fz = '16px'
				lh = fz
			}
			let div = lh.slice(-1) == "%" ? 0.01 : 1
			let lineHeight = parseFloat(lh)*div
			let y = 1.0*$clicked.getAttributeNS(null, 'y') + inx*lineHeight
			$tspan.setAttributeNS(null, 'y', y)
			$tspan.setAttributeNS(null, 'x', 1.0*$clicked.getAttributeNS(null, 'x'))
			is_text ?
			$clicked.replaceChild($tspan, $t) :
			$clicked.appendChild($tspan)
			
			$t = $tspan
		}
		$t.innerHTML = line
	})

	let arr = [].slice.call($tt)
	while (arr.length > lines.length) {
			arr.pop().remove()    
	}
	
	$clicked.over()
}
