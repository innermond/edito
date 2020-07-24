import './feature.js'
import './click.js'
import './drag.js'
import './ul_select.js'
import {tooltip} from './tooltip.js'
import {span_checkbox} from './span_checkbox.js'
import {dragElement, show_hide} from './html_drag.js'

import {$section_menubar, $section_properties, $section_add_shape, $section_text, $section_image, $section_filter, $section_mask_clip_path, 
	$section_bottombar} from './section/index.js'

import {$floater_select, $floater_zoom, $floater_move, $floater_geometry, $floater_color} from './floater/index.js'

import {$svg, display_none, copy_viewbox} from './dom.js'
import {zoom_reset} from './zoom.js'
import './idb.js'

const $ui = new DocumentFragment()
$ui.appendChild($section_menubar)
$ui.appendChild($section_properties)
$ui.appendChild($section_filter)
$ui.appendChild($section_mask_clip_path)
$ui.appendChild($section_add_shape)
$ui.appendChild($section_text)
$ui.appendChild($section_image)
$ui.appendChild($section_bottombar)

$ui.appendChild($floater_select)
$ui.appendChild($floater_zoom)
$ui.appendChild($floater_move)
$ui.appendChild($floater_geometry)
$ui.appendChild($floater_color)

// here $ui is gone into document
document.querySelector('#editor').appendChild($ui)
$svg.style.width = '100%'
$svg.style.height = '100%'

document.querySelectorAll('.movable').forEach($e => {
	dragElement($e)
	$e.querySelectorAll('.wrap-row > div > label').forEach($el => show_hide($el))

	$e.dataset.display = $e.style.display
	$e.style.display = 'none'	

	const $img = $e.querySelector('img[class~="close"]')
	$img?.addEventListener('click', evt => {
		const $el = evt.target.closest('section')
		if ($el) {
			display_none($el)
			const qry = `[data-panel="${$el.id}"]`
			const $remote = document.querySelector(qry)
			$remote.classList.toggle('active')
		}
	})

	const $kk = $e.querySelectorAll('[type=checkbox][class~=switch]')
	span_checkbox($kk)

	$e.querySelectorAll('[class~="tooltip"]')?.forEach($e => {
		tooltip($e)
	})

	$e.querySelectorAll('input[type=range]')?.forEach($e => $e.addEventListener('mousedown', evt => evt.stopPropagation()))

})
document.querySelector('#canvas').style.opacity = 1
// assure viewbox is ok
const vbox = $svg.viewBox.baseVal
if (vbox.width === 0) vbox.width = $svg.width.baseVal.value
if (vbox.height === 0) vbox.height = $svg.height.baseVal.value
zoom_reset.viewbox = copy_viewbox($svg.viewBox)
