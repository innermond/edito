import {ui_fragment, previousSiblingNoAnts, nextSiblingNoAnts} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

const tpl = `<button id="stack_front">Un pas in fata</button>
<button id="stack_back">Un pas in spate</button>`
const $ui = ui_fragment(tpl)

export const $stack_back = $ui.querySelector('#stack_back')
export const $stack_front = $ui.querySelector('#stack_front')
$stack_back.addEventListener('click', back)
$stack_front.addEventListener('click', front)

function back(evt) {
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
		$host.prepend($ui)
	}
	if ($selection.size > 1) $clicked.remove()
}

function front(evt) {
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
