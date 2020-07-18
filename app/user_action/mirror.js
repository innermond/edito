import {mirror} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

export function mirror_h() {
	$selection.each($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			mirror($el, -1)
			$clicked.from($e)
			$clicked.over()
		})
	})
}

export function mirror_v() {
	$selection.each($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		$ee.forEach($e => {
			mirror($el, +1)
			$clicked.from($e)
			$clicked.over()
		})
	})
}
