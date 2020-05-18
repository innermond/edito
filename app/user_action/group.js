import {$svg, $defs, path_text} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {m2e, setm} from '../mtx.js'
import {get_filter} from '../filter.js'
import {dragging_all_marks_reset, $group_repr} from '../ui.js'

// grouping / degrouping
export function group() {
	if ($clicked.is_zero()) return
	if ($clicked.nodeName === 'g' && $selection.just($clicked)) {
		// degroup
		let $f = get_filter($clicked)
		// grouped elements
		let $ee = $clicked.children
		$ee = Array.from($ee).reverse()
		$ee.forEach(
			$e => {
				let $path = path_text($e)
                // matrix to preserve geometry 
                // while moving element to new parent
                let mtx = m2e($e, $svg)
                setm($e, mtx)
                const $father = $clicked.parentNode ?? $svg
                $father.insertBefore($e, $clicked)
				if ($f) {
					// copy filter applied to group
					// to each ex-grouped element
					// change the filter id to make it unique to element
					let $cloned = $f.cloneNode(true)
					$cloned.id = rnd()
					// host new filter to defs element
					$defs.appendChild($cloned)
					// bind filter with element
					set_filter($e, $cloned.id)
				}
			}
		)
		let $ff = $defs.querySelectorAll('filter')
		for (let $f of $ff) {
			let others = $svg.querySelectorAll('[filter="url(#'+$f.id+')"]')
			if (others.length === 0) $f.remove()
		}
		get_filter($clicked) ?.remove()
		$clicked.remove()

		$group_repr.innerHTML = ''
		dragging_all_marks_reset()
	} else {
		// group
		dragging_all_marks_reset()
		$selection.as_group().over()
	}
}
