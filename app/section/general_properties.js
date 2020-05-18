import {scale} from '../user_action/size.js'
import {fill_opacity} from '../user_action/opacity.js'
import {stroke_opacity, stroke_width} from '../user_action/stroke.js'
import {colorize, uncolorize} from '../selection/colorize.js'
import {ui_fragment, $svg, media_zoom} from '../dom.js'
import {wrap} from '../drawer.js'
import {rgb_hex, computed_color} from '../color.js'
import {background_color} from '../user_action/background.js'

const tpl = `<section class="vertical-align">
	<h3>Pagină</h3>
	<label class="tooltip" data-tooltip-text="Schimbi lățimea documentului" data-tooltip-bottom for="media_width">Lățime</label>
	<input type="number" id="media_width" value="210" />
	<label class="tooltip" data-tooltip-text="Modifică mărimea dimensiunii verticale a paginii" data-tooltip-bottom for="media_height">Înălțime</label>
	<input type="number" id="media_height" value="297" />
	<hr/>
	<label for="bleed">Bleed</label>
	<input type="number" min="0.0" max="5.0" value="2" step="0.5" id="bleed">
	<hr/>
	<label class="tooltip" data-tooltip-text="Alegi culoarea fundalului" data-tooltip-bottom  for="bkcolor">Background
		<input type="checkbox" class="switch" id="bkcolor-switch">
		<input type="color" id="bkcolor" value="#ffffff">
	</label>
	<hr/>
	<label for="size">Scalare</label>
	<input class="tooltip" data-tooltip-text="Modifică mărimea proporțional" data-tooltip-bottom  type="range" min="0.0001" max="2" value="1" step="0.0001" id="size">
	<hr/>
	<h3>Umplere</h3>
	<label class="tooltip" data-tooltip-text="Alegi culoarea de umplere" data-tooltip-bottom for="fill">Culoare
	<input type="checkbox" class="switch" id="fill-switch">
	<input type="color" id="fill" value="#000000">
	</label>

	<label for="fill-opacity">Opacitate</label>
	<input class="tooltip" data-tooltip-text="Schimbă opacitatea umplerii" data-tooltip-bottom  type="range" min="0" max="1" value="1" step="0.01" id="fill-opacity">
	<hr/>
	<h3>Contur</h3>
	<label class="tooltip" data-tooltip-text="Schimbă culoarea conturului" data-tooltip-bottom for="stroke-fill">Culoare
	<input type="checkbox" class="switch" id="stroke-fill-switch">
	<input type="color" id="stroke-fill" value="#000000">
	</label>

	<label for="stroke-opacity">Opacitate</label>
	<input class="tooltip" data-tooltip-text="Schimbă opacitatea conturului" data-tooltip-bottom type="range" min="0" max="1" value="1" step="0.01" id="stroke-opacity">

	<label for="stroke-width">Grosime</label>
	<input class="tooltip" data-tooltip-text="Schimbă grosimea conturului" data-tooltip-bottom type="range" min="0.0" max="10" value="0" step="0.0001" id="stroke-width">

</section>`
export const $ui = wrap(ui_fragment(tpl), 'properties', 'proprietăți')

export const $media_width = $ui.querySelector('#media_width')
export const $media_height = $ui.querySelector('#media_height')

// get media dimensions 
$media_width.value = $svg.width.baseVal.valueInSpecifiedUnits
$media_height.value = $svg.height.baseVal.valueInSpecifiedUnits

const media_zoom_event = evt =>	media_zoom($media_width.value, $media_height.value)

$media_width.addEventListener('change', media_zoom_event, true)
$media_height.addEventListener('change', media_zoom_event, true)

export const $bleed = $ui.querySelector('#bleed')

export const $bkcolor = $ui.querySelector('#bkcolor')
// try to gues background color of page
let bkcolor = $svg.getAttributeNS(null, 'viewport-fill')          
if (!bkcolor) bkcolor = $svg.style.backgroundColor || rgb_hex(computed_color('white'))
$bkcolor.value = bkcolor
$bkcolor.style.backgroundColor = bkcolor
$bkcolor.style.display = 'none'

$bkcolor.addEventListener('input', evt => {
	const val = $bkcolor.value
	background_color(val)
	$bkcolor.style.backgroundColor = val
})

export const $bkcolor_switch = $ui.querySelector('#bkcolor-switch')
$bkcolor_switch.addEventListener('change', evt => {
	if ($bkcolor_switch.checked === true) {
		const val = $bkcolor.value
		$bkcolor.style.display = 'block'
		$bkcolor.value = val
		$bkcolor.style.backgroundColor = val
		background_color(val)
	} else {
		// for svg background color '' is default color which is not black but none
		background_color('')
		$bkcolor.style.display = 'none'
	}
})

export const $size = $ui.querySelector('#size')
$size.addEventListener('input', evt => scale($size.value))

export const $fill = $ui.querySelector('#fill')
$fill.addEventListener('input', evt => {
	if ($fill_switch.checked !== true) return
	$fill.style.backgroundColor = colorize('fill', $fill.value)
})
$fill.style.display = 'none'

// switch
export const $fill_switch = $ui.querySelector('#fill-switch')
$fill_switch.addEventListener('change', evt => {
	if ($fill_switch.checked === true) {
		const val = colorize('fill', $fill.value)
		$fill.style.display = 'block'
		$fill.value = val
		$fill.style.backgroundColor = val
	} else {
		uncolorize('fill')
		$fill.style.display = 'none'
	}
})

export const $fill_opacity = $ui.querySelector('#fill-opacity')
$fill_opacity.addEventListener('input', evt => fill_opacity($fill_opacity.value))

export const $stroke_fill = $ui.querySelector('#stroke-fill')
$stroke_fill.addEventListener('input', evt => {
	if ($stroke_fill_switch.checked !== true) return
	$stroke_fill.style.backgroundColor = colorize('stroke', $stroke_fill.value)
})
$stroke_fill.style.display = 'none'

export const $stroke_fill_switch = $ui.querySelector('#stroke-fill-switch')
$stroke_fill_switch.addEventListener('change', evt => {
	if ($stroke_fill_switch.checked === true) {
		const val = colorize('stroke', $stroke_fill.value)
		$stroke_fill.value = val
		$stroke_fill.style.backgroundColor = val
		//FIXME stroke color always create a visible contour 
		//even there is no width set
		$stroke_fill.style.display = 'block'
	} else {
		uncolorize('stroke')
		$stroke_fill.style.display = 'none'
	}
})

export const $stroke_width = $ui.querySelector('#stroke-width')
export const $stroke_opacity = $ui.querySelector('#stroke-opacity')

$stroke_width.addEventListener('input', evt => stroke_width($stroke_width.value))
$stroke_opacity.addEventListener('input', evt => stroke_opacity($stroke_opacity.value))    
