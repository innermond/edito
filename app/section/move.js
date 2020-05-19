import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'

const tpl = `<section class="vertical-align">
	<p id="group_repr"></p>
	<button id="group">Grupează</button>
	<button id="ungroup">Degrupează</button>
	<button id="ungroup_all">Degrupează tot</button>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'move', 'poziționare')

export const $group_repr = $ui.querySelector('#group_repr')
export const $group = $ui.querySelector('#group')
$group.addEventListener('click', evt => group())
export const $ungroup = $ui.querySelector('#ungroup')
$ungroup.addEventListener('click', evt => ungroup())
export const $ungroup_all = $ui.querySelector('#ungroup_all')
$ungroup_all.addEventListener('click', evt => ungroup_all())
