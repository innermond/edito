import {initial, dragging_marks_reset, dragging_all_marks_reset, dragging_all_marks_relax, after_click_update_ui} from './ui.js'
import {$svg, element_from} from './dom.js'
import {$selection} from './selection/grouping.js'
import {$clicked} from './selection/clicked.js'

$svg.addEventListener('click', click);

export function click(evt) {
	// deselect anything
	if (evt.target.nodeName === 'svg') {
			$clicked.zero()
			$selection.clear()
			dragging_all_marks_reset()
			initial()
			return
	}

	// dragging marks clicked
	if (!!evt.target.dataset.ants) {
		switch (true) {
			case !!evt.target.dataset.rect:
				$clicked.clues.negate('dragging')
				$clicked.circle.$shape.style.color = 'white'
				$clicked.square.$shape.style.color = 'white'
			break
			case !!evt.target.dataset.circle:
				$clicked.from(event.target.$element)
				$clicked.clues.negate('rotating')
				event.target.style.fill = $clicked.clues.rotating ?'red':'white'
				$clicked.square.$shape.style.fill = 'white'
			break
			case !!evt.target.dataset.square:
				$clicked.from(event.target.$element)
				$clicked.clues.negate('sizing')
				evt.target.style.fill = $clicked.clues.sizing ?'red':'white'
				$clicked.circle.$shape.style.fill = 'white'
			break
		}
		return
	}
	
	dragging_all_marks_relax()

	let $el = element_from(evt.target) 
	$clicked.from($el)

	let show_marks = true
	if (evt.shiftKey) {
		$clicked.over()
	} else if (evt.ctrlKey) {
		dragging_marks_reset($clicked)
		$selection.delete($clicked)
		$clicked.from($selection.values().next().value)
	} else {
		dragging_all_marks_reset()
		$selection.clear()
		$clicked.over()
	}

	after_click_update_ui($el)
}
