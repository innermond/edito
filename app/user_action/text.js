//import {newtag} from '../dom.js'
import {$clicked} from '../selection/index.js'
import {text_svg_html} from '../ui.js'

export function keyup($target, evt=null) {
	if ( $clicked.is_zero() || $clicked.nodeName !== 'text') return
	
	// not a delete / backspace / enter key
	// there is no new nodes added / removed
	if (![8, 46, 13].includes(evt.keyCode)) {
		const lines = $target.innerHTML.split('<br>').join('')
		$clicked.innerHTML = lines
		return
	}
	//let $tt = Array.from($clicked.childNodes).filter($e => $e.nodeType === Node.TEXT_NODE || $e.nodeType === Node.ELEMENT_NODE) 

	//const style = window.getComputedStyle($clicked)
	
	const lines = $target.innerHTML.split('<br>')
	let prev_y = 1.0*$clicked.getAttributeNS(null, 'y')
	const change_y = $clicked.childNodes.length !== lines.length
	while($clicked.firstChild){
		$clicked.removeChild($clicked.firstChild)
	}
	let $prev_el = $clicked
	const $lines = document.createDocumentFragment()
	lines.forEach( (line, inx) => {
//TODO empty case manage
if (!line) return
		const $line = document.createRange().createContextualFragment(line).firstElementChild
		const style = window.getComputedStyle($prev_el)
		if ($line.nodeType === Node.TEXT_NODE) {
			$$clicked.appendChild($line)
		} else if ($line.nodeType === Node.ELEMENT_NODE) {
			// first line keeps position
			let line_y = 1.0*$line.getAttributeNS(null, 'y')
			if (inx > 0 && change_y) {
				let lh = style?.getPropertyValue('line-height')
				if (!lh || lh.toLowerCase() === 'normal' || lh.toLowerCase() === '0px') {
					let fz = style?.getPropertyValue('font-size') ?? ''
					if (fz === '') fz = '16px'
					lh = fz
				}
				let div = lh.slice(-1) == "%" ? 0.01 : 1
				let lineHeight = parseFloat(lh)*div
				while(prev_y >= line_y) {
					line_y += lineHeight
				}
				$line.setAttributeNS(null, 'y', line_y)
			}
			$prev_el = $line
			prev_y = line_y
			
			$lines.appendChild($line)
		}
	})

	const str = (new XMLSerializer()).serializeToString($lines)
	$clicked.innerHTML = str
	text_svg_html($clicked, $target)
	$clicked.over()
}
