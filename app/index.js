import './click.js'
import './drag.js'
import './ul_select.js'
import {$section_menubar, $section_properties, $section_move, $section_add_shape, $section_text, $section_image, $section_filter, $section_mask_clip_path} from './section/index.js'

import {$svg} from './dom.js'

const $ui = new DocumentFragment()
$ui.appendChild($section_menubar)
$ui.appendChild($section_properties)
$ui.appendChild($section_move)
$ui.appendChild($section_filter)
$ui.appendChild($section_mask_clip_path)
$ui.appendChild($section_add_shape)
$ui.appendChild($section_text)
$ui.appendChild($section_image)

document.querySelector('#editor').appendChild($ui)
$svg.style.width = '100%'
$svg.style.height = '100%'

document.querySelector('#canvas').style.opacity = 1
