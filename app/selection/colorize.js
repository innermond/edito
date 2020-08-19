import {rgb_hex} from '../color.js'
import {$selection} from './grouping.js'

let tpl = '{}_previous_color'

export function colorize(prop, val) {
	const len = do_colorize($selection, prop, val)
	return len === 1 ? rgb_hex(val) : ''
}

export function uncolorize(prop) {
	colorize(prop, 'none')
}

function do_colorize($collection, prop, val) {
	const prev_prop = tpl.replace('{}', prop)
	let keep = 'none' !== val
	let val_dataset = val
	let len

	$collection.forEach($el => {
		let $ee = [$el]
		if ($el.nodeName === 'g') {
			$ee = Array.from($el.children)
		}
		if ($ee.length === 0) return

		for (const $e of $ee) {
			if ($e.nodeName === 'g') {
				const $xx = Array.from($e.children)
				if ($xx.length) do_colorize($xx, prop, val)
				continue
			}
			const has_none = 'none' === $e.style.getPropertyValue(prop)
			// has applied none color or at all
			// but knows its previous color
			if (has_none && prev_prop in $e.dataset) {
				val = $e.dataset[prev_prop]
				val_dataset = val
			}
			let keep_now = keep
			// receive a none color
			if (!keep_now) {
				// and dont know any about its previous color
				if (!(prev_prop in $e.dataset)) {
					val_dataset = $e.style.getPropertyValue(prop)
					keep_now = true
				} else {
					val_dataset = $e.dataset[prev_prop]
				}
			}
			$e.style.setProperty(prop, val)
			if (keep_now) $e.dataset[prev_prop] = val_dataset

			let $tt
			if ($e.nodeName==='text') {
				$tt = $e.querySelectorAll('tspan[style]')
				$tt.forEach($t => $t.style.fill='inherit')
			}	
		} 

		len = $ee.length
	})
	return len
}
