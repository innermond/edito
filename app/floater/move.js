import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {group, ungroup, ungroup_all} from '../user_action/group.js'
import {front, back} from '../user_action/front_back.js'
import {mirror_h, mirror_v} from '../user_action/mirror.js'
import {aligning, referencing} from '../user_action/align.js'
import {ul_select, ul_select_iconset} from '../ul_select.js'
import {tooltip} from '../tooltip.js'

const tpl = `<section class="movable" id="top-bar">
	<p id="group_repr"></p>
	<div class="wrap-row">
	<div>
	<select id="grouping" style="display:none">
		<option value="g">Grupează</option>
		<option value="h">Degrupează</option>
		<option value="hv">Degrupează tot</option>
	</select>
	<label>Grupare</label>
	</div>
	<div>
	<select id="ordering" style="display:none">
			<option value="f">Mută mai in față</option>
			<option value="b">Mută mai in spate</option>
	</select>
	<label>Mutare</label>
	</div>
	<div>
	<select id="flipping" style="display:none">
			<option value="h">Oglindire orizontală</option>
			<option value="v">Oglindire verticală</option>
	</select>
	<label>Oglindire</label>
	</div>
	<div>
	<select id="align" data-show_hide="#reference" style="display:none">
			<option>Aliniază</option>
			<option value="l">stanga</option>
			<option value="r">dreapta</option>
			<option value="c">centru</option>
			<option value="t">sus</option>
			<option value="b">jos</option>
			<option value="m">mijloc</option>
	</select>
	<label>Aliniere</label>
	</div>
	<div>
	<select id="reference" style="display:none">
			<option>aliniere la</option>
			<option value="0">centru comun</option>
			<option value="1">ultimul selectat</option>
			<option value="2">primul selectat</option>
			<option value="3">pagina (cu bleed)</option>
			<option value="4">pagina (siguranța text)</option>
	</select>
	</div>
</section>`
export const $ui = ui_fragment(tpl)

export const $group_repr = $ui.querySelector('#group_repr')
export const $grouping = $ui.querySelector('#grouping')
const group_val_svg_map = {'g': 'group', 'h': 'ungroup', 'hv': 'ungroup_all'}
const $grouping_ul = ul_select_iconset($grouping, group_val_svg_map, 0, -10)
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
	$grouping_ul.querySelector('li[class~=active]').classList.remove('active')
})

export const $ordering = $ui.querySelector('#ordering')
const order_val_svg_map = {'f': 'front', 'b': 'back'}
const $ordering_ul = ul_select_iconset($ordering, order_val_svg_map, 0, -10)
$ordering.addEventListener('change', evt => {
	switch ($ordering.value) {
		case 'f':
			front()
		break;
		case 'b':
			back()
		break;
	}
	$ordering_ul.querySelector('li[class~=active]').classList.remove('active')
})

export const $flipping = $ui.querySelector('#flipping')
const flip_val_svg_map = {'h': 'flip-h', 'v': 'flip-v'}
const $flipping_ul = ul_select_iconset($flipping, flip_val_svg_map, 0, -10)
$flipping.addEventListener('change', evt => {
	switch ($flipping.value) {
		case 'h':
			mirror_h()
		break;
		case 'v':
			mirror_v()
		break;
	}
	$flipping_ul.querySelector('li[class~=active]').classList.remove('active')
})

export const $reference = $ui.querySelector('#reference')
$reference.addEventListener('change', evt => referencing($reference.value))
ul_select($reference, null, null)

export const $align = $ui.querySelector('#align')
const align_val_svg_map = {'l': 'l', 'r': 'r', 'c': 'c', 't': 't', 'b': 'b', 'm': 'm'}
const $align_ul = ul_select_iconset($align, align_val_svg_map, 0, -10)
$align.addEventListener('change', evt => {
	aligning($align.value, $reference.value)
	$align_ul.querySelector('li[class~=active]').classList.remove('active')
})
