import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'
import {front, back} from '../user_action/front_back.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'

const tpl = `<section class="vertical-align">
	<p id="group_repr"></p>
	<label>Grupare</label>
	<ul id="grouping" class="icon-button-set">
			<li data-group="g" class="tooltip" data-tooltip-text="Grupează - cel puțin 1 obiect" data-tooltip-bottom><img src="/icon/group.svg"></li>
			<li data-group="h" class="tooltip" data-tooltip-text="Degrupează orizontal, adică pe un singur nivel, toate obiectele din selecție" data-tooltip-bottom><img src="/icon/ungroup.svg"></li>
			<li data-group="hv" class="tooltip" data-tooltip-text="Degrupează total, orizontal dar și vertical" data-tooltip-bottom><img src="/icon/ungroup_all.svg"></li>
	</ul>
	<hr/>
	<label>Ordonare</label>
	<ul id="ordering" class="icon-button-set">
			<li data-order="f" class="tooltip" data-tooltip-text="Mai in față " data-tooltip-bottom><img src="/icon/front.svg"></li>
			<li data-order="b" class="tooltip" data-tooltip-text="Mai in spate" data-tooltip-bottom><img src="/icon/back.svg"></li>
	</ul>
	<hr/>
	<label>Oglindire</label>
	<ul id="flipping" class="icon-button-set">
			<li data-flip="h" class="tooltip" data-tooltip-text="Oglindire orizontală" data-tooltip-bottom><img src="/icon/flip-h.svg"></li>
			<li data-flip="v" class="tooltip" data-tooltip-text="Oglindire verticală" data-tooltip-bottom><img src="/icon/flip-v.svg"></li>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'move', 'poziționare')

export const $group_repr = $ui.querySelector('#group_repr')
export const $grouping = $ui.querySelector('#grouping')
$grouping.addEventListener('click', evt => {
	switch (evt.target.dataset.group) {
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

export const $ordering = $ui.querySelector('#ordering')
$ordering.addEventListener('click', evt => {
	switch (evt.target.dataset.order) {
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
	switch (evt.target.dataset.flip) {
		case 'h':
			mirror_h()
		break;
		case 'v':
			mirror_v()
		break;
	}
})
