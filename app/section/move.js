import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group} from '../user_action/group.js'

const tpl = `<section class="vertical-align">
	<p id="group_repr"></p>
	<button id="group">Grupează</button> <p id="group_repr"></p>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'move', 'poziționare')

export const $group_repr = $ui.querySelector('#group_repr')
export const $group = $ui.querySelector('#group')
$group.addEventListener('click', evt => group())
