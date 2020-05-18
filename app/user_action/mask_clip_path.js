import {$svg, $defs, ui_fragment, get_paren_id, newtag, path_text, set_xlink_href} from '../dom.js'
import {setm, m, m2e} from '../mtx.js'
import {$clicked, $selection} from '../selection/index.js'
import {dragging_all_marks_reset} from '../ui.js'

const tpl = `<button id="masking">Maschează</button>
<button id="cliping">Decupare formă</button>
<button id="pathing">Atașează text</button>
<button id="pathing_side">Schimbă partea</button>`
const $ui = ui_fragment(tpl)

export const $masking = $ui.querySelector('#masking')
export const $cliping = $ui.querySelector('#cliping')
export const $pathing = $ui.querySelector('#pathing')
export const $pathing_side = $ui.querySelector('#pathing_side')

$masking.addEventListener('click', masking)
$cliping.addEventListener('click', clipping)
$pathing.addEventListener('click', pathing)
$pathing_side.addEventListener('click', pathing_side)

function masking(evt) {
	if ($clicked.is_zero()) return

	let maskid
	if (maskid = get_paren_id($clicked, 'mask')) {
		$masking.innerText = 'Maschează'
		let $mask = $svg.getElementById(maskid)
		let $shape = $mask.children[0]
		setm($shape, m($clicked).multiply(m($shape)))
		$clicked.parentNode.appendChild($shape)
		$mask.remove()
		$clicked.removeAttributeNS(null, 'mask')		
		delete $clicked.useThat
		dragging_all_marks_reset()
	} else if ($selection.size == 2) {
		let $newmask = newtag('mask')
		$newmask.setAttributeNS(null, 'clipPathUnits', 'userSpaceOnUse')
		let [$newshape, $masked] = Array.from($selection)
		if (['text', 'path', 'rect',  'ellipse', 'circle', 'image', 'g'].includes($newshape.nodeName)) {
			setm($newshape, m2e($newshape, $masked))
			$newmask.appendChild($newshape)
			$defs.appendChild($newmask)
			$masked.setAttributeNS(null, 'mask', `url(#${$newmask.id})`)

			let event = new CustomEvent('click', {bubbles: true})
			$masked.dispatchEvent(event)
		}
		$masking.innerText = 'Demaschează'
	}

}

function clipping(evt) {
	if ($clicked.is_zero()) return

	let clipid
	if (clipid = get_paren_id($clicked, 'clip-path')) {
		$cliping.innerText = 'Decupează'
		let $clip = $svg.getElementById(clipid)
		let $shape = $clip.children[0]
		setm($shape, m($clicked).multiply(m($shape)))
		$clicked.parentNode.appendChild($shape)
		$clip.remove()
		$clicked.removeAttributeNS(null, 'clip-path')		
		delete $clicked.useThat
		dragging_all_marks_reset()
	} else if ($selection.size == 2) {
		let $newclip = newtag('clipPath')
		$newclip.setAttributeNS(null, 'clipPathUnits', 'userSpaceOnUse')
		let [$newshape, $cliped] = Array.from($selection)
		if (['text', 'path', 'rect', 'ellipse', 'circle', 'g'].includes($newshape.nodeName)) {
			setm($newshape, m2e($newshape, $cliped))
			$newclip.appendChild($newshape)
			$defs.appendChild($newclip)
			$cliped.setAttributeNS(null, 'clip-path', `url(#${$newclip.id})`)

			let event = new CustomEvent('click', {bubbles: true})
			$cliped.dispatchEvent(event)
		}
		$cliping.innerText = 'Decupează'
	}

}

function pathing(evt) {
	if ($clicked.is_zero()) return

	let $path = path_text($clicked)
	if ($path) {
		$pathing.innerText = 'Atasează text'
		// remove from path
		// get text layout when still on path
		let width = $clicked.getComputedTextLength()
		let dx = $clicked.style.getPropertyValue('text-anchor')
		switch (dx) {
			case 'start':
				dx = 0
			break
			case 'middle':
				dx = width*0.5
			break
			case 'end':
				dx = width
			break
			default:
				dx = 0
		}
		let $textpath = $clicked.querySelector('textPath')
		// apply former text layout
		let bb = $clicked.getBBox()
		$clicked.setAttributeNS(null, 'x',  bb.x+dx)
		$clicked.setAttributeNS(null, 'y', bb.y)
		// break text path union
		$clicked.appendChild($clicked.querySelector('tspan'))
		$textpath.remove()
		$path.style.visibility = 'visible'
		if ('textPathOriginalMatrix' in $clicked) setm($path, $clicked.textPathOriginalMatrix)
		$clicked.textPathCloned?.remove()

		// show ants
		$clicked.over()
	} else if ($selection.size == 2) {
		// put text on path
		$pathing.innerText = 'Detasează text'
		// $selection must have one text element and one path element
		let $text, $path
		for (let $e of $selection) {
			if ($e.nodeName === 'text') {
				$text = $e
				continue
			} else if (['path', 'rect', 'circle'].includes($e.nodeName)) {
				$path = $e
				continue
			} 
		}
		let both = !!$text && !!$path
		if (!both) return

		// position is dictated by the path, we have to make x, y irrelevant by zeroing
		$text.setAttributeNS(null, 'x', 0)
		$text.setAttributeNS(null, 'y', 0)

		/*The path data coordinates within the referenced ‘path’ element are assumed to be in the same coordinate system as the current ‘text’ element, not in the coordinate system where the ‘path’ element is defined. The ‘transform’ attribute on the referenced ‘path’ element represents a supplemental transformation relative to the current user coordinate system for the current ‘text’ element, including any adjustments to the current user coordinate system due to a possible ‘transform’ attribute on the current ‘text’ element*/
		let $path_cloned = $path.cloneNode(true)
		$path_cloned.textPath = {path: $path, text: $text}
		$text.textPathCloned = $path_cloned
		$text.textPathOriginalMatrix = m($path)
		let mtx_path = m($text).multiply(m($path))
		$text.parentNode.append($path_cloned)
		setm($path_cloned, mtx_path)
		$path.style.visibility = 'hidden'
		
		let $tp = newtag('textPath')
		set_xlink_href($tp, '#'+$path.id)		
		let offset = $text.style.getPropertyValue('text-anchor') ?? 'start'
		offset = {'start': '0%', 'middle': '50%', 'end': '100%'}[offset]
		$tp.setAttributeNS(null, 'startOffset', offset)
		$tp.appendChild($text.children[0])
		$tp.querySelectorAll('tspan').forEach($e => {
			$e.removeAttributeNS(null, 'x')
			$e.removeAttributeNS(null, 'y')
		})
		$text.appendChild($tp)
		dragging_all_marks_reset()
		$clicked.from($text).over()
	}
}

let path_fn
async function pathing_side(evt) {
	if ($clicked.nodeName !== 'text') return
	let $path = path_text($clicked)
	if (!$path) return
	// check is side attribute produce effect
	let p0 = $clicked.getStartPositionOfChar(0)
	$clicked.querySelector('textPath')?.setAttributeNS(null, 'side', $pathing_side.value)
	let p1 = $clicked.getStartPositionOfChar(0)
	let not_implemented = (p0.x===p1.x && p0.y===p1.y)
	if (not_implemented && !path_fn) {
		const {default: pathing_func} = await import('../reverse.js')
		path_fn = pathing_func()
	} 
	if (not_implemented && path_fn) {
		let d_reversed = path_fn.reverse($path.getAttributeNS(null, 'd'))
		$path.setAttributeNS(null, 'd', d_reversed)
	}

	$clicked.over()
}
