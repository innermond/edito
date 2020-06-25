import {initial, dragging_marks_reset, dragging_all_marks_reset, dragging_all_marks_relax, after_click_update_ui} from './ui.js'
import {$svg, element_from} from './dom.js'
import {$selection} from './selection/grouping.js'
import {$clicked} from './selection/clicked.js'
import {add_selecting, remove_selecting} from './select.js'

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
	
	dragging_all_marks_relax()

	const belongs = ($selection.size > 1 && $selection.has($clicked))
	$clicked.over()
	// dragging marks clicked
	if (!!evt.target.dataset.ants) {
		switch (true) {
			case !!evt.target.dataset.rect:
				$clicked.clues.negate('dragging')
				$clicked.circle.$shape.style.color = 'white'
				$clicked.square.$shape.style.color = 'white'
			break
			case !!evt.target.dataset.circle:
				$clicked.from(evt.target.$element)
				$clicked.clues.negate('rotating')
				evt.target.style.fill = $clicked.clues.rotating ?'red':'white'
				$clicked.square.$shape.style.fill = 'white'
			break
			case !!evt.target.dataset.square:
				$clicked.from(evt.target.$element)
				$clicked.clues.negate('sizing')
				evt.target.style.fill = $clicked.clues.sizing ?'red':'white'
				$clicked.circle.$shape.style.fill = 'white'
			break
		}
		return
	}

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
