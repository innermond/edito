import {$selection} from '../selection/grouping.js'
import {computed_color} from '../color.js'

export function stroke_width(val) {
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
			$el.style.strokeWidth = val
		}
		for (let $e of $ee) {
			$e.style.strokeWidth = val
			let $tt
			if ($e.nodeName==='text') {
				$tt = $e.querySelectorAll(':scope > tspan[style]')
				$tt.forEach($t => $t.style.strokeWidth = 'inherit')
			}	
		}
	})
}

export function stroke_opacity(color) {
	const val	= parseFloat(color)
	$selection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
			$el.style.strokeOpacity = val
		}
		$ee.forEach($e =>	$e.style.strokeOpacity = val)
	}) 
}
