import {scaling} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {add_patch, serialize_without_ants} from '../idb.js'

export function scale(val) {
	const svg_before = serialize_without_ants()
	$selection.each($el => {
		scaling($el, val)
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()

		$el.dataset.prevScale = val

		$clicked.from($el).over()
	})
	add_patch(svg_before)
}
