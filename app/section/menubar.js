import {$svg, ui_fragment, newtag} from '../dom.js'
import {center} from '../pos.js'
import {tooltip} from '../tooltip.js'

const tpl = `<section id="menu-bar">
	<div>
		<ul id="tool-menu" class="vertical-align">
			<li id="tool-properties" data-panel="properties" class="tool-item tooltip" data-tooltip-text="Proprietăți generale ale paginii și obiectelor (text, imagine, etc)"><img src="/icon/properties.svg"></li>
			<li id="tool-move" data-panel="move" class="tool-item tooltip" data-tooltip-text="Alinierea și mișcarea obiectelor (text, imagine, etc)"><img src="/icon/move.svg"></li>
			<li id="tool-filter" data-panel="manage-filter" class="tool-item tooltip" data-tooltip-text="Adaugă filter"><img src="/icon/filter.svg"></li>
			<li id="tool-element" data-panel="add-element" class="tool-item tooltip" data-tooltip-text="Adaugă elemente grafice"><img src="/icon/add-element.svg"></li>
			<li id="tool-text" data-panel="add-text" class="tool-item tooltip" data-tooltip-text="Adaugă text"><img src="/icon/add-text.svg"></li>
			<li id="tool-image" data-panel="add-image" class="tool-item tooltip" data-tooltip-text="Adaugă imagini"><img src="/icon/add-image.svg"></li>
		</ul>
	</div>
</section>`
export const $ui = ui_fragment(tpl)

const $tool_menu = $ui.querySelector('#tool-menu')

document.addEventListener('tool_menu:all_inactive', evt => {
	toggle_all_inactive()
})

$tool_menu.addEventListener('click', evt => {
	const $me = evt.target
	toggle_active($me)
	toggle_panel($me)
})

$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
	tooltip($e)
})

function toggle_all_inactive() {
	$tool_menu.querySelectorAll('.tool-item.active').forEach($e => $e.classList.remove('active'))
}

function toggle_active($me) {
	$tool_menu.querySelectorAll('.tool-item.active').forEach($e => {if ($e !== $me) $e.classList.remove('active')})
	$me.classList.toggle('active')
}

function toggle_panel($el) {
	$el.dispatchEvent(new CustomEvent('panel:toggle', {bubbles: true, detail: {panel_id: $el.dataset.panel}}))
}
