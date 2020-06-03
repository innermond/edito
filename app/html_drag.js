const MAX_Z = 4
let PREV_Z = null, PREV_ID

export function dragElement($el) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0
	$el.addEventListener('mousedown', dragMouseDown)

	function dragMouseDown(e) {
		e = e || window.event
		e.preventDefault()
		pos3 = e.clientX
		pos4 = e.clientY
		$el.addEventListener('mouseup', closeDragElement)
		$el.addEventListener('mousemove', elementDrag)
		
		if ($el.id === PREV_ID) return
		if (PREV_ID && PREV_Z != null) {
			const $prev = document.getElementById(PREV_ID)
			if ($prev) $prev.style.zIndex = PREV_Z
		}
		PREV_Z = $el.style.zIndex
		PREV_ID = $el.id
		$el.style.zIndex = MAX_Z
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
		$el.removeEventListener('mousemove', elementDrag)
	}
}

export function show_hide($el) {
	const $select = $el.parentNode.querySelector('select[data-ul_id]')
	if (!$select) return

	const $wrap = $el.closest('.wrap-row')
	$el.addEventListener('click', evt => {
		let selector = '#' + $select.dataset.ul_id
		if ('show_hide' in $select.dataset) {
			$wrap?.querySelectorAll($select.dataset.show_hide)?.forEach($other => selector += ', #' + $other.dataset.ul_id)
		}
		$wrap?.querySelectorAll(selector).forEach($elem => {
			if (!('display' in $elem.dataset)) $elem.dataset.display = $elem.style.display
			$elem.style.display = $elem.style.display === 'none' ? $elem.dataset.display : 'none'
		})
	})
}
