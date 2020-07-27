import {angle} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {add_patch, serialize_without_ants} from '../idb.js'

export function rotate(val) {
	const svg_before = serialize_without_ants()
	$selection.each($el => {
		angle($el, val)
		$clicked.from($el)
		$clicked.over()
	})
	add_patch(svg_before)
}
