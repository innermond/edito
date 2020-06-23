export function addEventInterval($el, start_evt, start_func, pulse, end_evt, end_func) {
	let pulse_id = null
	
	const start = evt => {
		if (pulse_id) clearInterval(pulse_id) 
		pulse_id = setInterval(start_func, pulse)
	}
	
	const end = evt => {
		clearInterval(pulse_id) 
		pulse_id = null
		end_func()
	}

	$el.addEventListener(start_evt,start)
	$el.addEventListener(end_evt, end)
	// trap uncleared pulse by savage mouse movement when mouseup do not fire
	$el.addEventListener('mouseleave', evt => {if (pulse_id) clearInterval(pulse_id)})
}

