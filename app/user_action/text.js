import {$svg, newtag} from '../dom.js'
import {$clicked} from '../selection/index.js'

export function keyup($target) {
	if ( ! $clicked || $clicked.nodeName !== 'text') return
	let $tt = $clicked.querySelectorAll('tspan')
	let i = $tt.length - 1

	let attrs
	let style

	while (i >= 0 ){
		if ($tt[i]) {
				attrs = $tt[i].attributes
				style = window.getComputedStyle($tt[i])
				break
		}
		i--
	}
	
	const lines = $target.value.split("\n")
	lines.forEach( (line, inx) => {
		let $t = $tt[inx] ?? null
		if ( ! $t) {
				let $tspan = newtag('tspan')
				for (let i = 0, len = attrs.length, attr; attr = attrs.item(i); i++) {
						if (attr.localName === 'id' || attr.localName.indexOf(':') !== -1) continue
						$tspan.setAttributeNS(null, attr.localName, attr.nodeValue)
				}
				let lh = style.getPropertyValue('line-height')
				if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
					let fz = style.getPropertyValue('font-size')
					if (fz === "") fz = '16px'
					lh = fz
				}
				let div = lh.slice(-1) == "%" ? 0.01 : 1
				let lineHeight = parseFloat(lh)*div
				let y = 1.0*$clicked.getAttributeNS(null, 'y') + inx*lineHeight
				$tspan.setAttributeNS(null, 'y', y)
				$clicked.appendChild($tspan)
				$t = $tspan
		}
		$t.innerHTML = line
		$clicked.over()
	})

	let arr = [].slice.call($tt)
	while (arr.length > lines.length) {
			arr.pop().remove()    
	}
}
