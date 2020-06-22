import {previousSiblingNoAnts, nextSiblingNoAnts} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'


export function back(evt) {
	if ($selection.size > 1) $selection.as_group(true) // temporary group; $selection is kept intact
	let $host = $clicked.closest('g:not([data-group=true])') || $clicked.ownerSVGElement
	if ($host === $clicked) $host = $clicked.ownerSVGElement
	if (!$host) return
	const $prev = previousSiblingNoAnts($clicked)
	const $ui = new DocumentFragment()
	let $ee = $selection.size > 1 && $clicked.nodeName === 'g' && $clicked.dataset.group === 'true' ? Array.from($clicked.children) : [$clicked]
	for (let $e of $ee) $ui.appendChild($e)
	if ($prev) {
		$host.insertBefore($ui, $prev.previousElementSibling)
	} else {
		$host.insertAdjacentElement('afterbegin', $ui)
	}
	if ($selection.size > 1) $clicked.remove()
}

export function front(evt) {
	if ($selection.size > 1) $selection.as_group(true) // temporary group; $selection is kept intact
	let $host = $clicked.closest('g:not([data-group=true])') || $clicked.ownerSVGElement
	if ($host === $clicked) $host = $clicked.ownerSVGElement
	if (!$host) return
	const $next = nextSiblingNoAnts($clicked)
	const $ui = new DocumentFragment()
	let $ee = $selection.size > 1 && $clicked.nodeName === 'g' && $clicked.dataset.group === 'true' ? Array.from($clicked.children) : [$clicked]
	for (let $e of $ee) $ui.appendChild($e)
	if ($next) {
		$host.insertBefore($ui, $next.nextElementSibling)
	} else {
		$host.appendChild($ui)
	}
	if ($selection.size > 1) $clicked.remove()
}
