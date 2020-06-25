import {display_none, cycle_zindex} from './dom.js'

export function dragElement($el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	$el.addEventListener('mousedown', dragMouseDown)

	function dragMouseDown(e) {
		e = e || window.event
		e.preventDefault()
		pos3 = e.clientX
		pos4 = e.clientY
		$el.addEventListener('mouseup', closeDragElement)
		$el.addEventListener('mouseleave', closeDragElement)
		$el.addEventListener('mousemove', elementDrag)
		
		cycle_zindex($el)
	}

	function elementDrag(e) {
		e = e || window.event
		e.preventDefault()
		// calculate the new cursor position:
		pos1 = pos3 - e.clientX
		pos2 = pos4 - e.clientY
		pos3 = e.clientX
		pos4 = e.clientY
		// set the $element's new position:
		$el.style.top = ($el.offsetTop - pos2) + "px"
		$el.style.left = ($el.offsetLeft - pos1) + "px"
	}

	function closeDragElement() {
		$el.removeEventListener('mouseup', closeDragElement)
		$el.removeEventListener('mouseleave', closeDragElement)
		$el.removeEventListener('mousemove', elementDrag)
	}
}

export function show_hide($el) {
	const $select = $el.parentNode.querySelector('select[data-ul_id]')

	const $wrap = $el.closest('.wrap-row')
	$el.addEventListener('click', evt => {
		evt.stopPropagation()
		$el.classList.toggle('humbled')
		let $next = $el.nextElementSibling
		while ($next) {
			if ($next !== $select) {
				display_none($next)
			}
			$next = $next.nextElementSibling
		}
		if (!$select) return
		let selector = '' //'#' + $select.dataset.ul_id
		if ('show_hide' in $select.dataset) {
			$wrap?.querySelectorAll($select.dataset.show_hide)?.forEach($other => selector += '#' + $other.dataset.ul_id)
		}
		if (selector) $wrap?.querySelectorAll(selector).forEach($elem => {
			display_none($elem)
		})
	})
}
