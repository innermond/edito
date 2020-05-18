import {$svg, ui_fragment, rectpage, px} from '../dom.js'
import {outpoint, outpoints, centerpoint} from '../pos.js'
import {m, m2e, appendm} from '../mtx.js'
import {$clicked, $selection} from '../selection/index.js'
import {$bleed, dragging_all_marks_reset} from '../ui.js'

const tpl = `<select id="align">
		<option>Aliniază</option>
		<option value="l">stanga</option>
		<option value="r">dreapta</option>
		<option value="c">centru</option>
		<option value="t">sus</option>
		<option value="b">jos</option>
		<option value="m">mijloc</option>
</select>
<select id="reference">
		<option>aliniere la</option>
		<option value="0">centru comun</option>
		<option value="1">ultimul selectat</option>
		<option value="2">primul selectat</option>
		<option value="3">pagina (cu bleed)</option>
		<option value="4">pagina (siguranța text)</option>
</select>`

const $ui = ui_fragment(tpl)

export const $align = $ui.querySelector('#align')
$align.addEventListener('change', aligning)
export const $reference = $ui.querySelector('#reference')
$reference.addEventListener('change', referencing)

function aligning(evt) {
	if ($clicked.is_zero()) return
	set_reference($reference.value)
	let mode = alignMap[evt.target.value] ?? ''
	let is_group = $clicked.nodeName === 'g' 
	let $ee = is_group ? Array.from($clicked.children) : [$clicked]
	if ($selection.size > 1) $ee = Array.from($selection)

	align_objects($ee, mode, $svg)
	dragging_all_marks_reset()
	$clicked.over()
}

const alignMap = {l: 'left', c: 'center', r: 'right', t: 'top', b: 'bottom', m: 'middle'}
const align_objects = (oo, mode='left', owner=null) => {
	if (oo.length === 0) return
	let $box
	if (oo.length === 1 ) {
		$box = rectpage()
		oo.push($box)
	}
	if (!owner) oo[0].ownerSVGElement

	let coord, sortfunc

	let bysmallest = (a,b) => a[coord]-b[coord]
	let bybiggest = (a,b) => b[coord]-a[coord]

	switch (mode) {
		case 'left':
		coord = 'x'
		sortfunc = bysmallest
		break
		case 'right':
		coord = 'x'
		sortfunc = bybiggest
		break
		case 'center':
		coord = 'x'
		break
		case 'top':
		coord = 'y'
		sortfunc = bysmallest
		break
		case 'bottom':
		coord = 'y'
		sortfunc = bybiggest
		break
		case 'middle':
		coord = 'y'
		break
	}

	let pp, ref
	for (let o of oo) {
		if (o.classList.contains('is-reference')) {
			ref = o
		}
	}
	let pe = new Map()

	if (!['center', 'middle'].includes(mode)) {
		for (let o of oo) {
			let pp = outpoints(o, owner)
			pp = pp.sort(sortfunc)
			pe.set(pp[0], o)
		}

		pp = Array.from(pe.keys()).sort(sortfunc)
		if (ref) {
			let pp = outpoints(ref, owner)
			pp = pp.sort(sortfunc)
			ref = pp.shift()
		} else {
			ref = pp.shift()
		}
	} else {
		for (let o of oo) {
			let p = centerpoint(o, owner)
			pe.set(p, o)
		}

		pp = Array.from(pe.keys())
		let p0 = pp.sort(bysmallest)[0]
		let p1 = pp.sort(bybiggest)[0]
		ref = ref ? centerpoint(ref, owner) : outpoint(p0.x+(p1.x-p0.x)*0.5, p0.y+(p1.y-p0.y)*0.5, m(owner))
		/*for (let p of [p0, p1, ref]) {
			let mark = newtag('circle', {r:2, cx:p.x, cy:p.y, fill:'red'})
			owner.appendChild(mark)
		}*/
		//ref = [p1,p0].sort(bybiggest)[0]
	}

	pp.forEach(p => {
		if (['left', 'right', 'center'].includes(mode)) {
			ref.y = p.y
		} else if (['top', 'bottom', 'middle'].includes(mode)) {
			ref.x = p.x
		}
		let o = pe.get(p)
		let mtx = m2e(owner,o)
		let op = p.matrixTransform(mtx)
		let oref = ref.matrixTransform(mtx)
		let dx = oref.x-op.x, dy = oref.y-op.y
		appendm(o, owner.createSVGMatrix().translate(dx, dy))
		if (o.classList.contains('is-reference', 'rectpage')) $box = o
	})
}

function set_reference(to) {
	$selection.forEach($e => $e.classList.remove('is-reference'))
	switch (to) {
		case '1':
		$clicked.classList.add('is-reference')
		break
		case '2':
		let $e = $selection.values().next().value
		$e ? $e.classList.add('is-reference') :  $clicked.classList.add('is-reference')
		break
		case '3':
		let $box = rectpage()
		$selection.add($box)
		break
		case '4':
		let $box_text = rectpage(null, -1*px(3))
		$selection.add($box_text)
		break
	}
}

function referencing(evt) {
	if ($clicked.is_zero()) return
	set_reference(evt.target.value)
}
