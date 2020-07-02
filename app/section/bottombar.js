import {$svg, ui_fragment, px, copy_viewbox} from '../dom.js'
import {zoom_reset} from '../zoom.js'
import {$bleed} from '../ui.js'
import {render_image} from '../save.js'
import {deleting, undeleting, cloning} from '../user_action/del_undel_clone.js'
import {tooltip} from '../tooltip.js'
import {$zoom_is_edit} from '../floater/zoom.js'
import {history, historic, connect} from '../history.js'

const tpl = `<section id="bottom-bar">
		<p id="group_repr"></p>
    <button class="tooltip" data-tooltip-text="Renunță la modificări" id="undo"><img src="/icon/undo.svg"></button>
    <button id="delete_element"><img class="tooltip" data-tooltip-text="Șterge elementul" data-tooltip-bottom src="/icon/delete.svg"></button>
    <button id="undelete_element"><img class="tooltip" data-tooltip-text="Anulează ultima ștergere" data-tooltip-bottom src="/icon/undelete.svg"></button>
    <button id="clone_element"><img class="tooltip" data-tooltip-text="Clonează elementul" data-tooltip-bottom src="/icon/copy.svg"></button>
    <button id="save_svg"><img class="tooltip" data-tooltip-text="Previzualizează documentul" data-tooltip-bottom src="/icon/preview.svg"></button>
    <button id="send_svg"><img class="tooltip" data-tooltip-text="Comandă" data-tooltip-bottom src="/icon/order.svg"></button>
</section>`

export const $ui = ui_fragment(tpl)

	$ui.querySelectorAll('[class~="tooltip"]')?.forEach($e => {
		tooltip($e)
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

$save_svg.addEventListener('click', async evt => {
	const current_viewbox = copy_viewbox($svg.viewBox)
	let func = null
	if (!$zoom_is_edit.checked) func = $svg_clone => zoom_reset($svg_clone)
	let $bkg = document.querySelector('#bkg_modal')
	if (!$bkg) {
			$bkg = document.createElement('div')
			$bkg.id = 'bkg_modal'
			$bkg.classList.remove('on')
			$bkg.addEventListener('click', evt => {
				$bkg.classList.remove('on')
				document.querySelectorAll('div[class~=preview]').forEach($d => $d.remove())
			})
	}
	$bkg.classList.add('on')
	document.querySelector('body').appendChild($bkg)
	await render_image(1, 0, false, func)
})
$send_svg.addEventListener('click', async evt => {
	const current_viewbox = copy_viewbox($svg.viewBox)
	let func = null
	if (!$zoom_is_edit.checked) func = $svg_clone => zoom_reset($svg_clone)
	const dpi_scale = 300/72 // scale rendered image suposedly produced native at 72 dpi as much as needed to be printed at 300 dpi
	await render_image(dpi_scale, $bleed.value, true, func)
})

const $undo = $ui.querySelector('#undo')
$undo.addEventListener('click', evt => {
	if (history.length === 0) return
	historic.disconnect()
	const batch = history.pop()
	batch.reverse().forEach(m => {
		console.log(m)
	})
	connect()
})
