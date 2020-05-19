import {angle} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

export function rotate(val) {
	$selection.forEach($el => {
		angle($el, val)
		$clicked.from($el)
		$clicked.over()
	})
}
