import {newtag_html} from './dom.js'

export function tooltip($explained, adjx=0, adjy=0) {
	let classes =  'tooltip-text' + ('tooltipBottom' in $explained.dataset ? ' tooltip-bottom' : '')
	const $e = newtag_html('span', {'class': classes})
	$e.textContent = $explained.dataset.tooltipText
	// tooltip above everything
	$e.style.zIndex = 9999
	document.body.appendChild($e)

	const bb_thumb = $e.getBoundingClientRect()

	let move = false
	$explained.addEventListener('mouseenter', evt => {
		if ($explained.classList.contains('active')) {
			move = false
			return
		}
		move = true
		$e.classList.add('active')
	})
	let show_val = false
	$explained.addEventListener('mousedown', evt => {
		move = true
		show_val = true
	})
	$explained.addEventListener('mouseout', evt => {
		move = false
		show_val = false
		$e.classList.remove('active')
	})

	$explained.addEventListener('mousemove', evt => {
		if (move === false) return
		const bb = evt.currentTarget.getBoundingClientRect()
		const posx = evt.clientX // tooltip is appended directly to body
		// cease moving when exceeded x bounds of element
		if (posx < bb.left || posx > bb.left + bb.width ) {
			move = false
			return
		}
		// position
		const bb_tooltip = $e.getBoundingClientRect()
		$e.style.left = posx+ adjx + 'px'
		$e.style.top = bb.top + bb.height*0.5 + adjy + 'px'

		// only inout like html elements has meaningful value
		if (show_val && $explained?.type) $e.textContent = $explained.value
	})

	return $e
}
