import {previousSiblingNoAnts, nextSiblingNoAnts} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'


export function back(last=null) {
	if ($selection.size > 1) $selection.as_group(true) // temporary group; $selection is kept intact
	let $host = $clicked.closest('g:not([data-group=true])') || $clicked.ownerSVGElement
	if ($host === $clicked) $host = $clicked.ownerSVGElement
	if (!$host) return
	const $prev = last ? $host.firstElementChild : previousSiblingNoAnts($clicked)
	const $ui = new DocumentFragment()
	let $ee = $selection.size > 1 && $clicked.nodeName === 'g' && $clicked.dataset.group === 'true' ? Array.from($clicked.children) : [$clicked]
	for (let $e of $ee) $ui.appendChild($e)
	if ($prev && !last) {
		$host.insertBefore($ui, $prev)
	} else {
		$host.insertBefore($ui, $host.firstElementChild)
	}
	if ($selection.size > 1) $clicked.remove()
}

export function front(first=null) {
	if ($selection.size > 1) $selection.as_group(true) // temporary group; $selection is kept intact
	let $host = $clicked.closest('g:not([data-group=true])') || $clicked.ownerSVGElement
	if ($host === $clicked) $host = $clicked.ownerSVGElement
	if (!$host) return
	let $next = first ? $host.lastElementChild : nextSiblingNoAnts($clicked)
	const $ui = new DocumentFragment()
	let $ee = $selection.size > 1 && $clicked.nodeName === 'g' && $clicked.dataset.group === 'true' ? Array.from($clicked.children) : [$clicked]
	for (let $e of $ee) $ui.appendChild($e)
    $next = nextSiblingNoAnts($next)
	if ($next && !first) {
		$host.insertBefore($ui, $next)
	} else {
		$host.appendChild($ui)
	}
	if ($selection.size > 1) $clicked.remove()
}
