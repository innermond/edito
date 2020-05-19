import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'
import {front, back} from '../user_action/front_back.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'

const tpl = `<section class="vertical-align">
	<label>Add</label>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'add-element', 'Forme')
