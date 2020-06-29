import {initial, dragging_marks_reset, dragging_all_marks_reset, dragging_all_marks_relax, dragging_all_marks_relax_except, after_click_update_ui} from './ui.js'
import {$svg, element_from} from './dom.js'
import {$selection} from './selection/grouping.js'
import {$clicked} from './selection/clicked.js'
import {add_selecting, remove_selecting} from './select.js'
//import {watch} from './dom.js'

//export const disable = watch({click: false})
export const disable = {click: false}

$svg.addEventListener('click', click);
//add_selecting()

export function click(evt) {
    if (disable.click) return

	// deselect anything
	if (evt.target === $svg) {
		if ($selection.size && $clicked.clues.operating()) {
			dragging_marks_reset($clicked)
			$clicked.over()
			return
		}
			$clicked.zero()
			$selection.clear()
			dragging_all_marks_reset()
			initial() //TODO update to drag select pan ui
			return
	}
	

	const belongs = ($selection.size > 1 && $selection.has($clicked))
	// dragging marks clicked
	if (!!evt.target.dataset.ants) {
		const $el = evt.target.$element
		const $ee = []
		switch (true) {
			case !!evt.target.dataset.rect:
				$clicked.clues.negate('dragging')
				$clicked.circle.$shape.style.color = 'white'
				$clicked.square.$shape.style.color = 'white'
				//$ee.push($clicked.circle.$shape, $clicked.square.$shape)
			break
			case !!evt.target.dataset.circle:
				$el.clues.negate('rotating')
				evt.target.style.fill = $el.clues.rotating ?'red':'white'
				$ee.push($el)
				$el.square.$shape.style.fill = 'white'
			break
			case !!evt.target.dataset.square:
				//$clicked.from(evt.target.$element)
				$el.clues.negate('sizing')
				evt.target.style.fill = $el.clues.sizing ?'red':'white'
				$ee.push($el)
				$el.circle.$shape.style.fill = 'white'
			break
		}
		$ee.length > 0 && dragging_all_marks_relax_except(...$ee)
		return
	}

	$clicked.over()
	dragging_all_marks_relax()

	let $el = element_from(evt.target) 
	$clicked.from($el)

	let show_marks = true
	if (evt.shiftKey) {
		$clicked.over()
	} else if (evt.ctrlKey) {
		const $target = element_from(evt.target)
		dragging_marks_reset($target)
		$selection.delete($target)
		$clicked.from($selection.values().next().value)
	} else if (!belongs){
		dragging_all_marks_reset()
		$selection.clear()
		$clicked.over()
	}

	after_click_update_ui($el)
}
