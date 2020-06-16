import {ui_fragment, px, zoom_reset} from '../dom.js'
import {$bleed} from '../ui.js'
import * as save from '../save.js'
import {deleting, undeleting, cloning} from '../user_action/del_undel_clone.js'
import {tooltip} from '../tooltip.js'
import {$zoom_is_edit} from './general_properties.js'

const tpl = `<section id="bottom-bar">
		<p id="group_repr"></p>
    <button id="delete_element"><img class="tooltip" data-tooltip-text="Șterge elementul" data-tooltip-bottom src="/icon/delete.svg"></button>
    <button id="undelete_element"><img class="tooltip" data-tooltip-text="Anulează ultima ștergere" data-tooltip-bottom src="/icon/undelete.svg"></button>
    <button id="clone_element"><img class="tooltip" data-tooltip-text="Clonează elementul" data-tooltip-bottom src="/icon/copy.svg"></button>
    <button id="save_svg"><img class="tooltip" data-tooltip-text="Previzualizează documentul" data-tooltip-bottom src="/icon/preview.svg"></button>
    <button id="send_svg"><img class="tooltip" data-tooltip-text="Comandă" data-tooltip-bottom src="/icon/order.svg"></button>
</section>`

export const $ui = ui_fragment(tpl)
$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
	tooltip($e, 0, -10)
})

export const $group_repr = $ui.querySelector('#group_repr')
export const $delete_element = $ui.querySelector('#delete_element')
$delete_element.addEventListener('click', deleting)
export const $undelete_element = $ui.querySelector('#undelete_element')
$undelete_element.addEventListener('click', undeleting)
export const $clone_element = $ui.querySelector('#clone_element')
$clone_element.addEventListener('click', cloning)

export const $save_svg = $ui.querySelector('#save_svg')
export const $send_svg = $ui.querySelector('#send_svg')

$save_svg.addEventListener('click', evt => {
	if (!$zoom_is_edit.checked) zoom_reset()
	let $bkg = document.querySelector('#bkg_modal')
	if (!$bkg) {
			$bkg = document.createElement('div')
			$bkg.id = 'bkg_modal'
	}
	$bkg.addEventListener('click', evt => {
			$bkg.style.display = 'none'
			document.querySelectorAll('div[class~=preview]').forEach($d => $d.remove())
	})
	$bkg.style.display = 'block'
	document.querySelector('body').appendChild($bkg)
	save.render_image()
})
$send_svg.addEventListener('click', evt => {
	if (!$zoom_is_edit.checked) zoom_reset()
	const dpi_scale = 300/72 // scale rendered image suposedly produced native at 72 dpi as much as needed to be printed at 300 dpi
	save.render_image(dpi_scale, $bleed.value, true)
})
