import {$svg, $defs, newtag} from './dom.js'
import {$clicked, $selection} from './selection/index.js'
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
} from './ui.js'

export function ui(flt) {
	let val
	switch (flt?.dataset.type) {
		case 'shadow':
			let blur = flt.querySelector('feGaussianBlur')?.getAttributeNS(null, 'stdDeviation') || 5
			$shadow_blur.value = blur
			let color = flt.querySelector('feFlood')?.getAttributeNS(null, 'flood-color') || '#000000'
			$shadow_color.value = color
			let dx = flt.querySelector('feOffset')?.getAttributeNS(null, 'dx') || 0
			$shadow_dx.value = dx
			let dy = flt.querySelector('feOffset')?.getAttributeNS(null, 'dy') || 0
			$shadow_dy.value = dy
			let slope = flt.querySelector('feFuncA')?.getAttributeNS(null, 'slope') || 0.5
			$shadow_slope.value = slope
		break
		case 'grayscale':
			val = flt.querySelector('feColorMatrix')?.getAttributeNS(null, 'values')
			$grayscale.value = val
		break
		case 'blur':
			val = flt.querySelector('feGaussianBlur')?.getAttributeNS(null, 'stdDeviation')
			$blur.value = val
		break
		case 'sharpen':
			val = flt.querySelector('feConvolveMatrix')?.getAttributeNS(null, 'kernelMatrix')
			$sharpen.value = -1*val.split(' ')[4]
		break
		case 'hueRotate':
			val = flt.querySelector('feColorMatrix')?.getAttributeNS(null, 'values')
			$hue_rotate.value = val
		break
	}
}

let filterFuncMap = {
	'hueRotate':newhueRotate, 
	'grayscale':newgrayscale,
	'sharpen':newsharpen,
	'blur':newblur
}

export function updating(type, inner, prop, val=0) {
	let valfunc
	if (val?.call) {
		valfunc = val
	}
	return evt => {
		$selection.forEach($el => {
			val = valfunc ? valfunc(evt.target.value) : evt.target.value || val
			// there is no host filter attached at all
			if (!get_filter_id($el)) {
				let $flt = filterFuncMap[type]?.call(val)
				if (!$flt) return
				let $mtx = $flt.querySelector(inner)
				$defs.appendChild($flt)
				set_filter($el, $flt.id)
				$mtx.setAttributeNS(null, prop, val)
				return
			} 
			
			// there is a host filter, but has primitives we are looking for? 
			let $mtx = get_filter_inner($el, type, inner)
			// no primitives found
			if (!$mtx || !$mtx.length) {
				let $flt = get_filter($el)
				let $hostfilter = filterFuncMap[type]?.call(val)
				for (let $primitive of $hostfilter.children) {
					$flt.appendChild($primitive)
				}
				$mtx = $flt.querySelectorAll(inner)
				$mtx = Array.from($mtx)
			}
			$mtx = $mtx.pop()
			$mtx.setAttributeNS(null, prop, val)
		})
	}
}

function remove($el, filtername) {
	let $flt = get_filter_inner($el, filtername)
	if ($flt && $flt.length) {
		let $f
		while ($f = $flt.pop()) {
			let skyp = $f.dataset.pos == 'start'
			$f.remove()
			if (skyp) break
		}
		$flt = get_filter($el)
		if ($flt.children.length === 0) {
			unset_filter($el, $flt.id)
			let $others = $svg.querySelectorAll('[filter="#'+$flt.id+'"]')
			for (let $o of $others) {
				unset_filter($o, $flt.id)
			}
			$flt.remove()
		}
	}
}

export function get_filter($el) {
		let fid = get_filter_id($el)
		if (!fid || !fid.length) return
		let $flt = $svg.getElementById(fid)
		return $flt
}

export function get_filter_inner($el, datatype, innername=null) {
		let $f = get_filter($el)
		if (!$f) return
		let qry = `[data-type="${datatype}"]`
		if (innername) qry = `${innername}${qry},${qry} ${innername}`
		let $inner = $f.querySelectorAll(qry)
		$inner = Array.from($inner)
		return $inner
}

export function get_filter_id($el) {
	let f = $el?.getAttributeNS(null, 'filter')
	if (!f || f.length === 0) return null
	return f.trim().match(/"?#([^\)#]+)"?/)?.[1]
}

function unset_filter($el, fid) {
	let $ee = [$el]//$el.nodeName === 'g' ? Array.from($el.children) : [$el]
	$ee.forEach($e => {
		let f = $e.getAttributeNS(null, 'filter')
		if (!f) return
		$e.removeAttributeNS(null, 'filter')
	})
}

function set_filter($el, fid) {
	let val = $el.getAttributeNS(null, 'filter') || ''
	val = 'url(#' + fid + ')'
	let $ee = [$el]//$el.nodeName === 'g' ? Array.from($el.children) : [$el]
	$ee.forEach($e => $e.setAttributeNS(null, 'filter', val))
}

function newfilter_expanded() {
return newtag('filter', {x:'-200%', y:'-200%', width:'500%', height:'500%'})
}

function newshadow(blur=5, color='#000000', dx=0, dy=0, slope=0.5, source="SourceGraphic") {
		let flt = newfilter_expanded()
		let inner = `<feFlood data-pos="start" data-type="shadow" flood-color="${color}" in="${source}" result="flood"/>
		<feComposite data-type="shadow" in="flood" in2="${source}" operator="in" />
	 <feGaussianBlur data-type="shadow" stdDeviation="${blur}"/>
	 <feOffset data-type="shadow" dx="${dx}" dy="${dy}" result="offsetblur"/>
		<feComponentTransfer data-type="shadow">
			<feFuncA type="linear" slope="${slope}" />
		</feComponentTransfer>
		<feMerge data-pos="end" data-type="shadow" result="CurrentGraphic"> 
			<feMergeNode/>
			<feMergeNode in="${source}"/>
		</feMerge>`
		flt.innerHTML = inner
		return flt
}

function newgrayscale(val=0) {
	let flt = newfilter_expanded()
	let inner = `<feColorMatrix data-type="grayscale" type="saturate" values="${val}" result="CurrentGraphic" />`
	flt.innerHTML = inner
	return flt
}

function newblur(val=0) {
	let flt = newfilter_expanded()
	let inner = `<feGaussianBlur data-type="blur" stdDeviation="${val}" result="CurrentGraphic" />`
	flt.innerHTML = inner
	return flt
}

function newsharpen(val=0) {
	let flt = newfilter_expanded()
	let inner = `<feConvolveMatrix data-type="sharpen" order="3" kernelMatrix="1 -1 1 -1 -${val} -1 1 -1 1" result="CurrentGraphic" />`
	flt.innerHTML = inner
	return flt
}

function newhueRotate(val=0) {
	let flt = newfilter_expanded()
	let inner = `<feColorMatrix data-type="hueRotate" type="hueRotate" values="${val}" result="CurrentGraphic" />`
	flt.innerHTML = inner
	return flt
}

export const add_shadow = evt => {
	let blur = 5
	let color = '#000000'
	let dx = 0
	let dy = 0
	let slope = 0.5

	let $flt = get_filter($clicked)
	let $shadow = newshadow(blur,color,dx,dy,slope, $flt ? 'CurrentGraphic' : 'SourceGraphic')
	if ($flt) {
		let $f
		for($f of Array.from($shadow.children)) {
			$flt.appendChild($f)
		}
	} else {
		$defs.appendChild($shadow)
		set_filter($clicked, $shadow.id)
	}
}

export const removing = evt => {
	remove($clicked, 'shadow')
}

export const sharpening = function(){
	const max = 1, min = 0.005
	let val =  v => {
		// sharpen effect increase as we decrease v received from interface
		// so we flip ends of input range from user interface
		// then we revert v because of already reverted value received
		// legal ends are ~0 and 1
		// 1 = no sharp, ~0 = maximum sharp, image is always broken by yhis sharp value
		v = (max - v)
		if (v	< min) v = min // 0 makes image disapear
		return `1 -1 1 -1 -${v} -1 1 -1 1`
	}
	return updating('sharpen', 'feConvolveMatrix', 'kernelMatrix', val) 
}
