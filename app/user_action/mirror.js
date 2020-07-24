import {mirror, $svg} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {add_patch} from '../idb.js'

export function mirror_h() {
	const svg_before = new XMLSerializer().serializeToString($svg)
	$selection.each($el => {
		mirror($el, -1)
		$clicked.from($el)
		$clicked.over()
	})
    const pp = add_patch(svg_before)
//	const [svg_before_rebuilded, results] = dmp.patch_apply(pp, svg_after)
	console.log(pp)

}

export function mirror_v() {
	$selection.each($el => {
		mirror($el, +1)
		$clicked.from($el)
		$clicked.over()
	})
}
