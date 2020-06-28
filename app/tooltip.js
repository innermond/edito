import {newtag_html} from './dom.js'

export function tooltip($explained, adjx=0, adjy=0) {
	let classes =  'tooltip-text' + ('tooltipBottom' in $explained.dataset ? ' tooltip-bottom' : '')
	const $e = newtag_html('span', {'class': classes})
	$e.textContent = $explained.dataset.tooltipText
	// tooltip above everything
	$e.style.zIndex = 9999
	$e.style.display = 'none'
	document.body.appendChild($e)

	$explained.dataset.tooltipId = $e.id

	const bb_thumb = $e.getBoundingClientRect()
	
	const position_top = (posx, bb) => {
		$e.style.left = posx + adjx + 'px'
		$e.style.top = bb.top + bb.height*0.5 + adjy + 'px'
		let bb_tooltip = $e.getBoundingClientRect()
		let inx = 0, peak = 30
		let top_overflow = (bb_tooltip.top < 0) 
		let checked = top_overflow
		while (top_overflow) {
			$e.style.width = (bb_tooltip.width + 1) + 'px'	
			$e.style.maxWidth = $e.style.width
			$e.style.left = posx + adjx + 'px'
			$e.style.top = bb.top + bb.height*0.5 + adjy + 'px'
			bb_tooltip = $e.getBoundingClientRect()
			top_overflow = bb_tooltip.top < 0 
			inx++
			if (inx > peak) break
		}
		// try to cope with right viewport overflowing
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		let next_overflow = false
		if (bb_tooltip.right > vw) {
			next_overflow = 'right'
		} if (bb_tooltip.left < 0) {
			next_overflow = 'left'
		}
		if (checked) {
			if (top_overflow && (inx > peak)) {
				$e.style.width = 'initial'  
				$e.style.maxWidth = 'initial'
				$e.classList.replace('tooltip-bottom', 'tooltip-top')
			}
		} 
		return next_overflow
	}

	const position_right = (posx, bb) => {
		let bb_tooltip = $e.getBoundingClientRect()
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		let overflow = bb_tooltip.right - vw
		let inx = 0, peak = 30
		while (overflow > 0) {
			$e.style.left = posx + adjx - overflow + 'px'
			bb_tooltip = $e.getBoundingClientRect()
			overflow = bb_tooltip.right - vw
			inx++
			if (inx > peak) break
		}
		let next_overflow = false
		if (bb_tooltip.left < 0) {
			next_overflow = 'left'
		}
		return next_overflow
	}

	const position_left = (posx, bb) => {
		let bb_tooltip = $e.getBoundingClientRect()
		const vw = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
		let overflow = bb_tooltip.left < 0 ? -1*bb_tooltip.left : 0
		let inx = 0, peak = 30
		while (overflow > 0) {
			$e.style.left = posx + adjx + overflow + 'px'
			bb_tooltip = $e.getBoundingClientRect()
			overflow = bb_tooltip.left < 0 ? -1*bb_tooltip.left : 0
			inx++
			if (inx > peak) break
		}
		let next_overflow = false
		if (bb_tooltip.left < 0) {
			next_overflow = 'left'
		}
		return next_overflow
	}

	const position = (posx, bb) => {
		// position
		let next = position_top(posx, bb)
		if (next === 'right') {
			next = position_right(posx, bb)
		}
		if (next === 'left') {
			next = position_left(posx, bb)
		}
	}

	let move = false
	$explained.addEventListener('mouseenter', evt => {
		if ($explained.classList.contains('active')) {
			move = false
			return
		}
		$e.style.display = 'initial'
		$e.style.width = 'min-content'
		$e.style.maxWidth = '8rem'
		move = true
		$e.classList.add('active')
	})
	let show_val = false

	$explained.addEventListener('mousedown', evt => {
		move = true
		show_val = true
		
		if (evt.target !== $explained) return
		const bb = evt.currentTarget.getBoundingClientRect()
		const posx = evt.clientX // tooltip is appended directly to body
		// cease moving when exceeded x bounds of element
		if (posx < bb.left || posx > bb.left + bb.width ) {
			move = false
			return
		}
		// position
		position(posx, bb)
		
		if (show_val && $explained?.type && 'value' in $explained && $explained.value.length) $e.textContent = $explained.value
	})

	$explained.addEventListener('mouseout', evt => {
		move = false
		show_val = false
		$e.classList.remove('active')
		$e.style.display = 'none'
		$e.setAttribute('class', classes)
	})

	$explained.addEventListener('mousemove', evt => {
		if (evt.target !== $explained) return
		if (move === false) return
		const bb = evt.currentTarget.getBoundingClientRect()
		const posx = evt.clientX // tooltip is appended directly to body
		// cease moving when exceeded x bounds of element
		if (posx < bb.left || posx > bb.left + bb.width ) {
			move = false
			return
		}
		position(posx, bb)
		if (show_val && $explained?.type && 'value' in $explained && $explained.value.length) $e.textContent = $explained.value
	})

	return $e
}
