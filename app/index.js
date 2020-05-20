import './click.js'
import './drag.js'
import './ul_select.js'
import {$section_menubar, $section_properties, $section_move, $section_add_shape, $section_text, $section_image} from './section/index.js'

import {$svg} from './dom.js'

/*function append($el) {
	// append only dom elements
	if (!($el instanceof Element || $el instanceof HTMLElement)) return
	// climbing on parentNode till top reaching
	while ($el.parentNode) $el = $el.parentNode
	// only fragments allowed
	if ($el.nodeName !== '#document-fragment') return
	// a document fragment may contains many nodes
	// posible already appended
	if (document.body.contains($el)) return
	document.body.appendChild($el)
}

for (let p in ui) append(ui[p])*/
const $ui = new DocumentFragment()
$ui.appendChild($section_menubar)
$ui.appendChild($section_properties)
$ui.appendChild($section_move)
$ui.appendChild($section_add_shape)
$ui.appendChild($section_text)
$ui.appendChild($section_image)

document.querySelector('#editor').appendChild($ui)
$svg.style.width = '100%'
$svg.style.height = '100%'

document.querySelector('#canvas').style.opacity = 1
