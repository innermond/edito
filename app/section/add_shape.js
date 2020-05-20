import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'
import {front, back} from '../user_action/front_back.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'
import {add_rect, add_circle, add_line} from '../user_action/add.js'

const tpl = `<section class="vertical-align">
	<label>Adaugă forma</label>
	<button id="add_rect">Adaugă dreptunghi</button>
	<button id="add_circle">Adaugă cerc</button>
	<button id="add_line">Adaugă linie</button>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'add-element', 'Forme')

export const $add_rect = $ui.querySelector('#add_rect')
export const $add_circle = $ui.querySelector('#add_circle')
export const $add_line = $ui.querySelector('#add_line')

$add_rect.addEventListener('click', evt => add_rect())
$add_circle.addEventListener('click', evt => add_circle())
$add_line.addEventListener('click', evt => add_line())
