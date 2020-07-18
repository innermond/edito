import {$svg, change_id, px} from '../dom.js'
import {appendm} from '../mtx.js'
import {dragging_all_marks_reset} from '../ui.js'
import {$clicked, $selection} from '../selection/index.js'
import {$step} from '../ui.js'

window.addEventListener('keydown', evt => {if (evt.key === 'Delete') deleting()})

export function locking(toggle=false) {
	let $clicked_original = $clicked
	$selection.forEach($el => {
		if ('lock' in $el.dataset) {
			if (toggle) {
				$el.removeAttribute('data-lock')
			}
			return
		}
		// create data-lock
		const $attr = document.createAttribute('data-lock')
		$el.setAttributeNode($attr)
		$clicked.from($el)
		$clicked.unover()
	})
	$clicked.from($clicked_original)
}

export function  deleting() {
	$selection.each($el => {
		grave.push([$el, $el.parentNode])
		$selection.delete($el)
		$el.remove()
	})
	dragging_all_marks_reset()
}

let grave = []
export function  undeleting() {
		while (grave.length) {
				let [$el, father] = grave.pop()
				father.appendChild($el)
		}            
}

export function cloning(evt) {
	let $new_selection = $selection.new_one()
	$selection.each($el => {
		let $el_cloned = $el.cloneNode(true)
		change_id($el_cloned)
		$el.parentNode.insertBefore($el_cloned, $el.nextElementSibling)
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()
		let dx=0, dy=px($step.value)
		appendm($el_cloned, $svg.createSVGMatrix().translate(dx, dy))
		$new_selection.add($el_cloned)
	})
	$selection.deselect()
	$new_selection.as_ants()
}
