import {$svg, ui_fragment, change_id, px} from '../dom.js'
import {appendm} from '../mtx.js'
import {dragging_all_marks_reset} from '../ui.js'
import {$clicked, $selection} from '../selection/index.js'
import {$step} from '../ui.js'

const tpl = `<button id="delete_element">Sterge</button>
<button id="undelete_element">Anulează</button>
<button id="clone_element">Clonează obiect</button>
`
const $ui = ui_fragment(tpl)

export const $delete_element = $ui.querySelector('#delete_element')
$delete_element.addEventListener('click', deleting)
export const $undelete_element = $ui.querySelector('#undelete_element')
$undelete_element.addEventListener('click', undeleting)
export const $clone_element = $ui.querySelector('#clone_element')
$clone_element.addEventListener('click', cloning)

window.addEventListener('keydown', evt => {if (evt.key === 'Delete') deleting()})

function  deleting() {
	$selection.forEach($el => {
		grave.push([$el, $el.parentNode])
		$el.remove()
	})
	dragging_all_marks_reset()
}

let grave = []
function  undeleting() {
		while (grave.length) {
				let [$el, father] = grave.pop()
				father.appendChild($el)
		}            
}

function cloning(evt) {
	const $new_selection = []
	$selection.forEach($el => {
		let $el_cloned = $el.cloneNode(true)
		change_id($el_cloned)
		$el.parentNode.insertBefore($el_cloned, $el.nextSibling)
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
