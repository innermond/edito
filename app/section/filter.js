import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import * as filter from '../filter.js'

const tpl = `<section class="vertical-align">
    <button id="add_shadow">Adaugă umbră</button>
    <button id="remove_shadow">Scoate umbra</button>
    <label for="shadow_blur">Blur umbră</label>
    <input type="range" min="0" max="50" value="5" step="0.01" id="shadow_blur">
    <label for="shadow_slope">Intensitate umbră</label>
    <input type="range" min="0" max="1" value="0.5" step="0.01" id="shadow_slope">
    <label for="shadow_dx">Distanțare umbră pe lățime</label>
    <input type="range" min="-50" max="50" value="0" step="0.01" id="shadow_dx">
    <label for="shadow_dy">Distanțare umbră pe inălțime </label>
    <input type="range" min="-50" max="50" value="0" step="0.01" id="shadow_dy">
    <label for="shadow_color">Culoare umbră
			<input type="color" id="shadow_color" value="#000000">
		</label>
		<hr/>
    <label for="grayscale">Ton de gri</label>
    <input type="range" min="0" max="2" value="1" step="0.01" id="grayscale">
		<hr/>
    <label for="blur">Blurează</label>
    <input type="range" min="0" max="20" value="0" step="0.001" id="blur">
		<hr/>
    <label for="sharpen">Clarifică</label>
    <input type="range" min="0.0" max="1" value="0" step="0.001" id="sharpen">
		<hr/>
    <label for="hue_rotate">Rotește culorile</label>
    <input type="range" min="0" max="360" value="0" step="0.001" id="hue_rotate">
		<hr/>
    <label for="shadow_color">Sticlos
			<input type="checkbox" id="glass" class="switch" value="2">
		</label>
    <label for="glass_one">Schimbă one</label>
    <input type="range" min="0" max="5" value="0.2" step="0.001" id="glass_one">
    <label for="glass_two">Schimbă two</label>
    <input type="range" min="0" max="10" value="0.5" step="0.001" id="glass_two">
</section>`
export const $ui = wrap(ui_fragment(tpl), 'manage-filter', 'Filter')

export const $shadow_blur = $ui.querySelector('#shadow_blur')
export const $shadow_slope = $ui.querySelector('#shadow_slope')
export const $shadow_dx = $ui.querySelector('#shadow_dx')
export const $shadow_dy = $ui.querySelector('#shadow_dy')
export const $shadow_color = $ui.querySelector('#shadow_color')
export const $add_shadow = $ui.querySelector('#add_shadow')
export const $remove_shadow = $ui.querySelector('#remove_shadow')
export const $grayscale = $ui.querySelector('#grayscale')
export const $blur = $ui.querySelector('#blur')
export const $sharpen = $ui.querySelector('#sharpen')
export const $hue_rotate = $ui.querySelector('#hue_rotate')
export const $glass = $ui.querySelector('#glass')
export const $glass_one = $ui.querySelector('#glass_one')
export const $glass_two = $ui.querySelector('#glass_two')

$shadow_blur.addEventListener('input', filter.updating('shadow', 'feGaussianBlur', 'stdDeviation'))
$shadow_slope.addEventListener('input', filter.updating('shadow', 'feFuncA', 'slope'))
$shadow_dx.addEventListener('input', filter.updating('shadow', 'feOffset', 'dx'))
$shadow_dy.addEventListener('input', filter.updating('shadow', 'feOffset', 'dy'))
$shadow_color.addEventListener('input',filter.updating('shadow', 'feFlood', 'flood-color'))
$add_shadow.addEventListener('click', filter.add_shadow)
$remove_shadow.addEventListener('click', filter.removing('shadow'))
$grayscale.addEventListener('input', filter.updating('grayscale', 'feColorMatrix', 'values', 1))
$blur.addEventListener('input', filter.updating('blur', 'feGaussianBlur', 'stdDeviation'))
$sharpen.addEventListener('input', filter.sharpening())
$hue_rotate.addEventListener('input',filter.updating('hueRotate', 'feColorMatrix', 'values'))
const glassing = filter.updating('glass', 'feGaussianBlur[one]', 'stdDeviation')
const unglassing = filter.removing('glass')
$glass.addEventListener('change',evt => {
	if ($glass.checked) {
		glassing(evt)
	} else {
		unglassing()
	}
})
$glass_one.addEventListener('input', filter.updating('glass', 'feGaussianBlur[one]', 'stdDeviation'))
$glass_two.addEventListener('input', filter.updating('glass', 'feGaussianBlur[two]', 'stdDeviation'))

