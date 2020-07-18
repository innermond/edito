import {$svg, $defs, path_text} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {m2e, setm} from '../mtx.js'
import {get_filter} from '../filter.js'
import {dragging_all_marks_reset, $group_repr} from '../ui.js'

// grouping / degrouping
export function ungroup(deep=false) {
	$selection.each($el => {
		ungroup_one($el, deep)
		$group_repr.innerHTML = ''
		dragging_all_marks_reset()
	})
}

export function ungroup_all() {
	ungroup(true)
}

const selector = 'g:not([data-layer])' 
export function ungroup_one($el, deep=false) {
	const is_group = true === $el.matches(selector)
	if (deep === false) {
		if (!is_group) return
	} else if (!is_group) {
		// descend into
		const $subel = $el.querySelector(selector)
		if ($subel) ungroup_one($subel, deep)
		return
	}
	// degroup
	let $f = get_filter($el)
	// grouped elements
	let $ee = $el.children
	$ee = Array.from($ee)
	$ee.forEach(
		$e => {
			// matrix to preserve geometry 
			// while moving element to new parent
			let mtx = m2e($e, $svg)
			setm($e, mtx)
			const $father = $el.parentNode ?? $svg
			$father.insertBefore($e, $el)
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

			if (deep) ungroup_one($e, deep)
		}
	)
	let $ff = $defs.querySelectorAll('filter')
	for (let $f of $ff) {
		let others = $svg.querySelectorAll('[filter="url(#'+$f.id+')"]')
		if (others.length === 0) $f.remove()
	}
	get_filter($el) ?.remove()
	$el.remove()
}

export function group() {
	if ($clicked.is_zero()) return
	// group
	dragging_all_marks_reset()
	$selection.as_group().over()
}
