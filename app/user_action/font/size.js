import {$clicked, $selection} from '../../selection/index.js'

export function sizing_text(val) {
	if ( ! $clicked) return
	$selection.forEach($el => {
		let $ee =  $el.nodeName === 'g' ? $el.children : [$el]
		for (let $e of $ee) {
			if ($e.nodeName==='text') {
				$e.style.fontSize = val+'pt'          
				let $tt
				$tt = $e.querySelectorAll('tspan[style]')
				$tt.forEach(($t, inx) => {
					$t.style.fontSize = $e.style.fontSize
					let style = window.getComputedStyle($e)
					let lh = style.getPropertyValue('line-height')
					if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
						let fz = $t.style.getPropertyValue('font-size')
						if (fz === "") fz = '16px'
						lh = fz
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
