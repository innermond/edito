const tpl = '<div class="scroller"><div class="thumb"></div></div>'
// needs $scrollee connected to dom
export const scrollable = $scrollee => {
		$scrollee.insertAdjacentHTML('beforeend', tpl)
		const $e = $scrollee.lastChild
		const $thumb = $e.firstChild
		$scrollee.addEventListener('mouseenter', evt => {
			const $s = $e.parentNode
			// there is hidden content in need to show ?
			const d = $s.scrollHeight - $s.clientHeight
								$e.style.opacity = 0.0
			if (d > 0) $e.style.opacity = 1.0
		})
		// hide scroller when leave scrollee
		$scrollee.addEventListener('mouseleave', evt => {
			if (move === false) {
				$e.style.opacity = 0.0
			}
		})

		// terminate
		$scrollee.addEventListener('mouseup', evt => {
			move = false
			$e.classList.remove('active')
		})

		const bb = $e.getBoundingClientRect()
		let H = window.getComputedStyle($e).height
		let h = window.getComputedStyle($thumb).height
		H = parseFloat(H)
		h = parseFloat(h)
		let move = false
		let adj = 0
		// initiale
		$e.addEventListener('mousedown', evt => {
			$e.classList.add('active')
			move = true
			adj = evt.clientY - $thumb.getBoundingClientRect().top
			if (adj > h) adj = h
			if (adj < 0) adj = 0
		})
		// terminate
		document.addEventListener('mouseup', evt => {
			if (move === false) return
			move = false
			$e.classList.remove('active')
			$e.style.opacity = 0.0
		})
		$e.addEventListener('click', evt => {
			const tbb = $thumb.getBoundingClientRect()
			let y = evt.clientY
			if (evt.clientY >= tbb.bottom) {
				y += tbb.height*0.5
			} else if (evt.clientY <= tbb.top) {
				y -= tbb.height*0.5
			} else if (evt.clientY > tbb.top && evt.clientY < tbb.top + tbb.height*0.5) {
				y -= tbb.top + tbb.height*0.5 - evt.clientY
			} else if (evt.clientY < tbb.bottom && evt.clientY > tbb.bottom - tbb.height*0.5) {
				y += evt.clientY - (tbb.bottom - tbb.height*0.5) 
			}
			mouse_pos(y)
		})
		// move the thumb
		document.addEventListener('mousemove', evt => {
			if (move === false) return
			mouse_pos(evt.clientY)
		})

		$scrollee.addEventListener('wheel', evt => {
			$e.classList.add('active')
			move = true
			let step = evt.deltaY > 0 ? 1 : evt.deltaY === 0 ? 0 : -1
			const $s = $e.parentNode
			// step could be an arbitrary number 
			// or calculated related la how much is the invisible part 
			// related to the visible one
			//const d = ($s.scrollHeight - $s.clientHeight)/$s.clientHeight
			//step *= Math.ceil(d)
			step *= 20
			const y = $thumb.getBoundingClientRect().top + step
			mouse_pos(y)
			move = false
		}, {'passive': true})

		function mouse_pos(y) {
			let posy = y - bb.top
			// define a sensitive spot area on scrollee
			// closser to scroller
			// that allow to scroll even position is outside of scroller
			/*const BB = $scrollee.getBoundingClientRect()
			let spot = BB.left + BB.width - evt.clientX
			if (posy < 0 || posy > bb.height || spot > 100) {
				move = false
				return
			}*/

			// position adjusted to compesate thumb height
			posy -= adj
			if (posy < 0) posy = 0
			if (posy > H - h) posy = H - h 
			$thumb.style.top = posy + 'px'
			adj = y - $thumb.getBoundingClientRect().top
			if (adj > h) adj = h
			if (adj < 0) adj = 0
			// move scrollee proportionally with thumb movement
			const $s = $e.parentNode
			const d = $s.scrollHeight - $s.clientHeight
			const percent_scroll =  posy / (H-h)
			$s.scrollTop = percent_scroll*d
		}
		const ro = new ResizeObserver( ee => {
			for (const e of ee) {
				const $s = e.target
				const d = $s.scrollHeight - $s.clientHeight
				const percent_scroll = $s.scrollTop / d
				$thumb.style.top = percent_scroll*(H - h) + 'px'
			}
		});

		// react to scrollee resising
		ro.observe($scrollee)
}

export function div_scroller($ss, add_scrollable_now=false) {
	// needs elements to be inserted in dom
	//  so execute the scrolling ritual after they have been inserted 
	add_scrollable_now ?
		$ss.forEach($element => scrollable($element)) :
		document.addEventListener('DOMContentLoaded', evt_dom_loaded => {
			$ss.forEach($element => scrollable($element))
		})
}
