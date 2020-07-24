import {mirror, $svg} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {diff_match_patch} from 'diff-match-patch'

export function mirror_h() {
	const svg_before = new XMLSerializer().serializeToString($svg)
	$selection.each($el => {
		mirror($el, -1)
		$clicked.from($el)
		$clicked.over()
	})
	const svg_after = new XMLSerializer().serializeToString($svg)
	const dmp = new diff_match_patch()
	const diff = dmp.diff_main(svg_after, svg_before)
	const pp = dmp.patch_make(svg_after, diff)
	const [svg_before_rebuilded, results] = dmp.patch_apply(pp, svg_after)
	console.log(svg_before, svg_before_rebuilded, results)

}

export function mirror_v() {
	$selection.each($el => {
		mirror($el, +1)
		$clicked.from($el)
		$clicked.over()
	})
}
