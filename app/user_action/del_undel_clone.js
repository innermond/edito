import {$svg, change_id, px} from '../dom.js'
import {appendm} from '../mtx.js'
import {dragging_all_marks_reset} from '../ui.js'
import {$clicked, $selection} from '../selection/index.js'
import {$step} from '../ui.js'

window.addEventListener('keydown', evt => {if (evt.key === 'Delete') deleting()})

export function  deleting() {
	$selection.forEach($el => {
		grave.push([$el, $el.parentNode])
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
	const $new_selection = []
	$selection.forEach($el => {
		let $el_cloned = $el.cloneNode(true)
		change_id($el_cloned)
		$el.parentNode.insertBefore($el_cloned, $el.nextElementSibling)
		$el.ants.reset()
		$el.square.reset()
		$el.circle.reset()
		let dx=0, dy=px($step.value)
		appendm($el_cloned, $svg.createSVGMatrix().translate(dx, dy))
		$new_selection.push($el_cloned)
	})
	$selection.clear()
	$new_selection.forEach($el_cloned => {
		$clicked.from($el_cloned)
		$clicked.over()
	})
}
