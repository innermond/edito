import {mirror, $svg} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {add_patch, serialize_without_ants} from '../idb.js'

export function mirror_h() {
	const svg_before = serialize_without_ants()
	$selection.each($el => {
		mirror($el, -1)
		$clicked.from($el)
		$clicked.over()
	})
	add_patch(svg_before)
}

export function mirror_v() {
	$selection.each($el => {
		mirror($el, +1)
		$clicked.from($el)
		$clicked.over()
	})
}
