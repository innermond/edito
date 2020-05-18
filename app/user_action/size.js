import {$svg, scaling} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

export function scale(val) {
	$selection.forEach($el => {
		scaling($el, val)
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()

		$clicked.from($el).over()
	})
}
