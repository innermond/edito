import './click.js'
import './drag.js'
import './ul_select.js'
import {dragElement, show_hide} from './html_drag.js'
import {$section_menubar, $section_properties, $section_add_shape, $section_text, $section_image, $section_filter, $section_mask_clip_path, 
	$section_bottombar} from './section/index.js'

import {$floater_move, $floater_geometry, $floater_color} from './floater/index.js'

import {$svg} from './dom.js'

const $ui = new DocumentFragment()
$ui.appendChild($section_menubar)
$ui.appendChild($section_properties)
$ui.appendChild($section_filter)
$ui.appendChild($section_mask_clip_path)
$ui.appendChild($section_add_shape)
$ui.appendChild($section_text)
$ui.appendChild($section_image)
$ui.appendChild($section_bottombar)

$ui.appendChild($floater_move)
$ui.appendChild($floater_geometry)
$ui.appendChild($floater_color)

document.querySelector('#editor').appendChild($ui)
$svg.style.width = '100%'
$svg.style.height = '100%'

document.querySelectorAll('.movable').forEach($e => {
	dragElement($e)
	//$e.querySelectorAll('.wrap-row > div > label').forEach($el => show_hide($el))
})
document.querySelector('#canvas').style.opacity = 1
