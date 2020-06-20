import {$textname, $text_features, $font_size, $word_spacing, $letter_spacing, $line_spacing} from './section/text.js'
import{$fonts} from './section/text.js'
import{$delete_element, $undelete_element, $clone_element} from './section/bottombar.js'
import {$media_width, $media_height, $bleed, $step, $bkcolor} from './section/page.js'
import {$add_rect, $add_circle, $add_line} from './section/add_shape.js'
import {$url_image, $add_url_image, $file_image} from './section/image.js'
import {$masking, $cliping, $pathing, $pathing_side} from './section/mask_clip_path.js'
import {
	$shadow_blur,
	$shadow_slope,
	$shadow_dx,
	$shadow_dy,
	$shadow_color,
	$add_shadow,
	$remove_shadow,
	$grayscale,
	$blur,
	$sharpen,
	$hue_rotate
} from './section/filter.js'
import {$save_svg, $group_repr, $send_svg} from './section/bottombar.js'

import{$align, $reference, $grouping, $ordering, $flipping} from './floater/move.js'
import{$size, $angle, $skewx, $skewy} from './floater/geometry.js'
import{$fill, $stroke_fill, $stroke_fill_switch, $stroke_width, $stroke_opacity, $fill_opacity, $fill_switch} from './floater/color.js'

export {$media_width, $media_height, $bleed, $step,
$fonts,
$text_features,
$align, $reference, $size,
$delete_element, $undelete_element,
$angle, 
$flipping,
$fill, 
$stroke_fill, $stroke_width, $stroke_opacity, 
$bkcolor, $fill_opacity, $fill_switch,
$skewx, $skewy, 
$grouping, $group_repr, $ordering,
$add_rect, $add_circle, $add_line,
$url_image, $add_url_image, $file_image,
$masking, $cliping, $pathing, $pathing_side,
$shadow_blur,
$shadow_slope,
$shadow_dx,
$shadow_dy,
$shadow_color,
$add_shadow,
$remove_shadow,
$grayscale,
$blur,
$sharpen,
$hue_rotate,
$save_svg, $send_svg
}

import {$svg, get_angle, scale_prevs, angle_prevs, get_paren_id, newtag, unit_conv} from './dom.js'
import {skewx, skewy} from './user_action/skew.js' // TODO move it to dom.js
import {$selection} from './selection/index.js'
import {rgb_hex, valid_color} from './color.js'
import {modeMap} from './user_action/font/align.js'
import * as filter from './filter.js'
import {initial_ul_select, present_ul_select} from './ul_select.js'

export const colorDefault = '#000000'

// initial values our user interface shows
export function initial() {
	initial_ul_select($fonts)
	$font_size.value = 10
	$text_features.querySelectorAll('li[class~=active]').forEach($e => $e.classList.remove('active'))
	$size.value = 1
	$angle.value = 0
	$textname.value = ''
	$textname.setAttribute('rows', 1)
	$fill.value = colorDefault
	$fill.style.backgroundColor = colorDefault
	$fill_opacity.value = 1
	$stroke_fill.value = colorDefault
	$stroke_fill.style.backgroundColor = colorDefault
	$stroke_opacity.value = 1
	$stroke_width.value = 0
	$group_repr.innerHTML = ''
	//$url_image.value = ''
}

export function after_click_update_ui($el) {
	if ($el.nodeName === 'text') {
		let anchor = $el.style.getPropertyValue('text-anchor')
		for (let key in modeMap) {
				if (anchor === modeMap[key]) {
						anchor = key
						break
				}
		}
		if (anchor !== '') {
				let $optselected = $align.querySelector(`option[value="${anchor}"]`)
						if ($optselected) {
								$optselected.selected = true
						}
		}

		select_text_prop($fonts, $el, 'font-family')
		select_text_prop($text_features, $el, 'font-style')
		select_text_prop($text_features, $el, 'text-align')
		
		$font_size.value = unit_conv($el.style.fontSize, 'pt') || 10
		$word_spacing.value = unit_conv($el.style.wordSpacing, 'mm')
		$letter_spacing.value = unit_conv($el.style.letterSpacing, 'mm')
		$line_spacing.value = $el.style.lineHeight || 1.2

		let text = ''
		$el.querySelectorAll('tspan').forEach($t => text += $t.innerHTML + "\n")
		$textname.value = text.trim()
		
		if ($textname.value !== '') {
			if ($textname.value !== $textname.value.toUpperCase()) $text_features.querySelector('li[data-case]').classList.remove('active')
			else if ($textname.value === $textname.value.toUpperCase()) $text_features.querySelector('li[data-case]').classList.add('active')
			$textname.setAttribute('rows', Math.min(3, $el.querySelectorAll('tspan').length ?? 1))
		}
	} else {
		$align.options[0].selected = true
		initial_ul_select($fonts)
		$textname.setAttribute('rows', 1)
		$font_size.value = 10
		$text_features.querySelectorAll('li[class~=active]').forEach($e => $e.classList.remove('active'))
		$size.value = 1
		$angle.value = 0
		$textname.value = ''
		$textname.setAttribute('rows', 1)
	}
	
	$size.value = scale_prevs.get($el) ?? 1

	const au = angle_prevs.get($el) ?? get_angle($el)
	angle_prevs.set($el, au)
	$angle.value = au

	$skewx.value = skewx.prevs.get($el)
	$skewy.value = skewy.prevs.get($el)
	
	const fill = $el.style.getPropertyValue('fill')
	$fill.value = colorDefault	
	if (fill && (valid_color(fill) !== false) && (fill !== 'none')) {
		$fill.value = rgb_hex(fill)
	}
	$fill.style.backgroundColor = $fill.value

	let opacity = $el.style.getPropertyValue('fill-opacity')
	$fill_opacity.value = 1
	if (opacity!='') $fill_opacity.value = opacity    

	let stroke_width = $el.style.getPropertyValue('stroke-width')
	if (stroke_width!='') $stroke_width.value = parseFloat(stroke_width)

	let stroke_opacity = $el.style.getPropertyValue('stroke-opacity')
	$stroke_opacity.value = 1
	if (stroke_opacity!='') $stroke_opacity.value = stroke_opacity    

	let stroke_fill = $el.style.getPropertyValue('stroke')
	$stroke_fill.value = colorDefault
	if (stroke_fill && (valid_color(stroke_fill ) !== false) && (stroke_fill !== 'none')) {
		$stroke_fill .value = rgb_hex(stroke_fill )
	}
	$stroke_fill.style.backgroundColor = $stroke_fill.value

	if (!['', 'none'].includes(stroke_fill)) {
		$stroke_fill_switch.checked = true
		$stroke_fill.style.display = 'block'
		const xid = $stroke_fill_switch.dataset.proxy
		if (xid) {
			const $span = document.querySelector(xid)
			$span.dataset.value = '1'
		}
	} else {
		$stroke_fill_switch.checked = false
		$stroke_fill.style.display = 'none'
		const xid = $stroke_fill_switch.dataset.proxy
		if (xid) {
			const $span = document.querySelector(xid)
			$span.dataset.value = '0'
		}
		$stroke_fill.style.backgroundColor = 'black'
	} 
	if (fill != 'none') {
		$fill_switch.checked = true
		$fill.style.display = 'block'
		const xid = $fill_switch.dataset.proxy
		if (xid) {
			const $span = document.querySelector(xid)
			$span.dataset.value = '1'
		}
	} else {
		$fill_switch.checked = false
		$fill.style.display = 'none'
		const xid = $fill_switch.dataset.proxy
		if (xid) {
			const $span = document.querySelector(xid)
			$span.dataset.value = '0'
		}
		$fill.style.backgroundColor = 'black'
	}

	let group_repr = ''
	for (let $e of $selection) group_repr += `${$e.nodeName}#${$e.id} `
	$group_repr.innerHTML = `[ ${group_repr}]`

	//TODO drop useThat approach????
	// update ui to reflect clicked element
	/*let clipid
	if (clipid = get_paren_id($el, 'clip-path')) {
		let $clip = $svg.getElementById(clipid).children[0]
		let $father = $clip.parentNode
		$el.parentNode.appendChild($clip)
		if (!$el.useThat) $el.useThat = {
			bbox: $clip.getBBox(),
			el: $clip
		}
		$father.appendChild($clip)
	}*/

	/*let maskid
	if (maskid = get_paren_id($el, 'mask')) {
		let $mask = $svg.getElementById(maskid).children[0]
		let $father = $mask.parentNode
		$el.parentNode.appendChild($mask)
		if (!$el.useThat) $el.useThat = {
			bbox: $mask.getBBox(),
			el: $mask
		}
		$father.appendChild($mask)
	}*/

	if ($el.querySelector(':scope > textPath')) {
		$pathing.textContent = 'Detașează text'
	} else {
		$pathing.textContent = 'Atasează text'
	}

	let $host_filter = filter.get_filter($el)
	if ($host_filter) {
		let $ff = Array.from($host_filter.children)
		let $flt
		for (let $f of $ff){
			$f = $f.cloneNode(true)
			if ($f.dataset.pos === 'end') {
				$flt.appendChild($f)
				filter.ui($flt)
				$flt = null
			} else if ($f.dataset.pos === 'start'){
				$flt = newtag('filter', {'data-type': $f.dataset.type})
				$flt.appendChild($f)
			} else if (!$f.dataset.pos) {
				if ($flt)	$flt.appendChild($f)
				else {
					$flt = newtag('filter', {'data-type': $f.dataset.type})
					$flt.appendChild($f)
					filter.ui($flt)
					$flt = null
				}
			}
		}
	}

}

export function dragging_marks_reset($el) {
	$el.clues.reset()
	$el.square.$shape.style.fill = 'white'
	$el.circle.$shape.style.fill = 'white'
	$el.unover()
}

export function dragging_all_marks_reset() {
	$svg.querySelectorAll('[data-ants="true"]').forEach($e => {
		// all marks paint in white - inactive color
		if (!$e.dataset.rect) $e.style.fill = 'white'
		$e.$element.clues.reset()
		$e.remove()
	})
}

export function dragging_all_marks_relax() {
	$svg.querySelectorAll('[data-ants="true"]').forEach($e => {
		// all marks paint in white - inactive color
		if (!$e.dataset.rect) $e.style.fill = 'white'
		$e.$element.clues.reset()
	})
}
		
export function select_text_prop($sel, $el, property) {
	let prop = $el.style.getPropertyValue(property)
	prop = prop.replace(/["']+/g, '')
	switch (property) {
		case 'text-align':
			if (prop === 'center') prop = 'middle'
			//prop = Object.keys(modeMap).find(k => modeMap[k] === prop)
			$sel.querySelectorAll('li[data-align]').forEach($e => {
				$e.classList.remove('active')
				const found = modeMap[$e.dataset?.align] === prop 
				if (found) {
					$e.classList.add('active')
				} 
			})
		break
		case 'font-style':
			$sel.querySelectorAll('li[data-style]').forEach($e => {
				$e.classList.remove('active')
			})
			let prop_weight = $el.style.getPropertyValue('font-weight')
			prop_weight = prop_weight.replace(/["']+/g, '')
			$sel.querySelectorAll('li[data-style]').forEach($e => {
				if (prop === $e.dataset?.style) $e.classList.add('active')
				if (prop_weight === $e.dataset?.style) $e.classList.add('active')
			})
		break
		case 'font-family':
				present_ul_select($sel, prop)
		break;
	}
}
