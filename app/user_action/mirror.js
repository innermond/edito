import {ui_fragment, mirror} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

const tpl = `<button id="fliph">Oglindire orizontală</button>
<button id="flipv">Oglindire verticală</button>`
const $ui = ui_fragment(tpl)

export const $fliph = $ui.querySelector('#fliph')
export const $flipv = $ui.querySelector('#flipv')
$fliph.addEventListener('click', mirror_h)
$flipv.addEventListener('click', mirror_w)

function mirror_h(evt) {
	$selection.forEach($el => {
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

function mirror_w(evt) {
	$selection.forEach($el => {
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
