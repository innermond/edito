import {$clicked, $selection} from '../../selection/index.js'

export function sizing_text(val) {
	if ($clicked.is_zero()) return
	$selection.forEach($el => {
		let $ee =  $el.nodeName === 'g' ? $el.children : [$el]
		for (let $e of $ee) {
			if ($e.nodeName==='text') {
				$e.style.fontSize = val+'pt'          
				const style = window.getComputedStyle($e)

				const $tt = Array.from($e.childNodes).filter($x => $x.nodeType === Node.TEXT_NODE || $x.nodeType === Node.ELEMENT_NODE) 
				$tt.forEach(($t, inx) => {
					if ($t.nodeType === Node.TEXT_NODE) return
					const is_positioned = !!$t.getAttributeNS(null, 'y')
					if (!is_positioned) return

					const tstyle = window.getComputedStyle($t) || style
					let tfz = tstyle.getPropertyValue('font-size')
					tfz = parseFloat(tfz)
					let tlh = tstyle.getPropertyValue('line-height')
					tlh = parseFloat(tlh)
					const tratio = tlh/tfz || 1.2

					$t.style.fontSize = $e.style.fontSize
					$t.style.lineHeight = 'inherit'
					let lh = style.getPropertyValue('line-height')
					if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
						let fz = style.getPropertyValue('font-size')
						if (fz === "") fz = '16px'
						fz = parseFloat(fz)
						lh = tratio * fz
						lh += 'px'
					}
					let div = lh.slice(-1) == "%" ? 0.01 : 1
					let lineHeight = parseFloat(lh)*div
					let y = 1.0*$e.getAttributeNS(null, 'y') + inx*lineHeight
					$t.setAttributeNS(null, 'y', y)
					$t.style.fontSize = 'inherit'
				})
			}	
		} 
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()

		$clicked.from($el)
		$el.over()
	})
}
