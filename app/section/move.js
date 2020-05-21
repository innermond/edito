import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'
import {front, back} from '../user_action/front_back.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'
import {aligning, referencing} from '../user_action/align.js'
import {ul_select} from '../ul_select.js'
import {tooltip} from '../tooltip.js'

const tpl = `<section class="vertical-align">
	<p id="group_repr"></p>
	<label>Grupare</label>
	<select id="grouping" style="display:none">
		<option value="g">Grupează - cel puțin 1 obiect</option>
		<option value="h">Degrupează orizontal, adică pe un singur nivel, toate obiectele din selecție</option>
		<option value="hv">Degrupează total, orizontal dar și vertical</option>
	</select>
	<hr/>
	<label>Ordonare</label>
	<ul id="ordering" class="icon-button-set">
			<li data-value="f" class="tooltip" data-tooltip-text="Mai in față " data-tooltip-bottom><img src="/icon/front.svg"></li>
			<li data-value="b" class="tooltip" data-tooltip-text="Mai in spate" data-tooltip-bottom><img src="/icon/back.svg"></li>
	</ul>
	<hr/>
	<label>Oglindire</label>
	<ul id="flipping" class="icon-button-set">
			<li data-value="h" class="tooltip" data-tooltip-text="Oglindire orizontală" data-tooltip-bottom><img src="/icon/flip-h.svg"></li>
			<li data-value="v" class="tooltip" data-tooltip-text="Oglindire verticală" data-tooltip-bottom><img src="/icon/flip-v.svg"></li></ul>
	<hr/>
	<label>Aliniere</label>
<select id="align" style="display:none">
		<option>Aliniază</option>
		<option value="l">stanga</option>
		<option value="r">dreapta</option>
		<option value="c">centru</option>
		<option value="t">sus</option>
		<option value="b">jos</option>
		<option value="m">mijloc</option>
</select>
<select id="reference" style="display:none">
		<option>aliniere la</option>
		<option value="0">centru comun</option>
		<option value="1">ultimul selectat</option>
		<option value="2">primul selectat</option>
		<option value="3">pagina (cu bleed)</option>
		<option value="4">pagina (siguranța text)</option>
</select>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'move', 'poziționare')

export const $group_repr = $ui.querySelector('#group_repr')
export const $grouping = $ui.querySelector('#grouping')
$grouping.addEventListener('change', evt => {
	switch ($grouping.value) {
		case 'g':
			group()
		break;
		case 'h':
			ungroup()
		break;
		case 'hv':
			ungroup_all()
		break;
	}
})
const tooltiping_map = {'g': 'group', 'h': 'ungroup', 'hv': 'ungroup_all'}
const tooltiping = ($opt, $li) => {
	$li.dataset.tooltipText = $opt.textContent
	const attr = document.createAttribute('data-tooltip-bottom')
	$li.setAttributeNode(attr)
	$li.classList.add('tooltip')
	tooltip($li, 0, -10)
	return `<img src="/icon/${tooltiping_map[$opt.value]}.svg">`
}
const $ul = ul_select($grouping, tooltiping, {'class': 'icon-button-set', 'handle_select': false})
$ul.addEventListener('click', evt => {
	$ul.querySelectorAll('li[data-value][class~=active]').forEach($e => $e.classList.remove('active'))
	evt.target.classList.toggle('active')
})

export const $ordering = $ui.querySelector('#ordering')
$ordering.addEventListener('click', evt => {
	switch (evt.target.dataset.value) {
		case 'f':
			front()
		break;
		case 'b':
			back()
		break;
	}
})

export const $flipping = $ui.querySelector('#flipping')
$flipping.addEventListener('click', evt => {
	switch (evt.target.dataset.value) {
		case 'h':
			mirror_h()
		break;
		case 'v':
			mirror_v()
		break;
	}
})

export const $reference = $ui.querySelector('#reference')
$reference.addEventListener('change', evt => referencing($reference.value))
ul_select($reference)

export const $align = $ui.querySelector('#align')
$align.addEventListener('change', evt => aligning($align.value, $reference.value))
ul_select($align, $opt => `<img src="/icon/${$opt.value}.svg"> ${$opt.textContent}`)
