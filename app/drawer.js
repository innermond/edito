import {ui_fragment} from './dom.js'
import {tooltip} from './tooltip.js'
import {div_scroller} from './div_scroller.js'
import {span_checkbox} from './span_checkbox.js'

const tpl = `<section data-closeable class="tool-drawer vertical-align">
	<div class="title">
	<img src="/icon/close.svg" class="close">
	</div>

	<div class="tool-drawer-scroll">
	</div>

	<button id="add-text-cancel" class="cancel">Închide</button>
</section>`
export const wrap = ($el, newid, title, add_scrollable_now=false) => {
	const $ui = ui_fragment(tpl)
	$ui.firstElementChild.id = newid
	$ui.querySelector('[class="title"]').firstChild.textContent = title
	$ui.querySelector('[class="tool-drawer-scroll"]').appendChild($el) 

	$ui.querySelectorAll('[class~=close], [class~=cancel]').forEach($e => $e.addEventListener('click', x_cancel_operation))

	const $ss = $ui.querySelectorAll('.tool-drawer-scroll')
	div_scroller($ss, add_scrollable_now)
	const $kk = $ui.querySelectorAll('input[type=checkbox][class~=switch]')
	span_checkbox($kk)

	$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
		tooltip($e, 0, -10)
	})
	
return $ui
}

function x_cancel_operation(evt) {
	evt.target.closest('[data-closeable]')?.classList.remove('active')
	this.dispatchEvent(new CustomEvent('tool_menu:all_inactive', {bubbles: true}))
}

document.addEventListener('panel:toggle', evt => {
	const panel_id = evt.detail.panel_id
	document.querySelectorAll('section.active').forEach($el => {
		if ($el.id !== panel_id) $el.classList.remove('active')
	})
	const $panel = document.getElementById(panel_id)
	if ($panel) {
		$panel.classList.toggle('active')
		if (evt.target.dataset.panel !== panel_id) return
		const $actives = evt.target.parentNode.querySelectorAll('.tool-item.active')
		$actives.forEach($e => {if ($e !== evt.target) $e.classList.remove('active')})
		$panel.classList.contains('active') ? evt.target.classList.add('active') : evt.target.classList.remove('active')
	}
})
