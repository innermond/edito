import {$svg, newtag} from '../dom.js'
import {center} from '../pos.js'
import {colorDefault} from '../ui.js'

export function add_rect() {
	let bb = $svg.getBBox()
	let rect = newtag('rect')
	rect.setAttributeNS(null, 'width', bb.width*0.25)
	rect.setAttributeNS(null, 'height', bb.height*0.25)
	rect.setAttributeNS(null, 'fill', colorDefault)
	$svg.appendChild(rect)
	// call center after apped to dom
	center(rect)
	let event = new CustomEvent('click', {bubbles: true})
	rect.dispatchEvent(event)
}

export function add_circle() {
	let bb = $svg.getBBox()
	let circle = newtag('circle')
	circle.setAttributeNS(null, 'cx', bb.width*0.5)
	circle.setAttributeNS(null, 'cy', bb.height*0.5)
	circle.setAttributeNS(null, 'r', bb.height*0.1)
	circle.setAttributeNS(null, 'fill', colorDefault)
	$svg.appendChild(circle)
	// call center after apped to dom
	center(circle)
	let event = new CustomEvent('click', {bubbles: true})
	circle.dispatchEvent(event)
}

export function add_line() {
	let bb = $svg.getBBox()
	let line = newtag('line')
	line.setAttributeNS(null, 'x1', bb.width*0.1)
	line.setAttributeNS(null, 'y1', bb.height*0.5)
	line.setAttributeNS(null, 'x2', bb.width*0.9)
	line.setAttributeNS(null, 'y2', bb.height*0.5)
	line.style.stroke = colorDefault
	line.style.strokeWidth =  '0.75'
	$svg.appendChild(line)
	// call center after apped to dom
	center(line)
	let event = new CustomEvent('click', {bubbles: true})
	line.dispatchEvent(event)
}

export function add_text(text='text nou') {
	let txt = newtag('text')
	txt.style.textAlign = 'center'
	txt.style.textAnchor = 'middle'
	let tspan = newtag('tspan')
	tspan.style.textAlign = 'inherit'
	tspan.style.textAnchor = 'inherit'
	tspan.style.fontSize = '20px'
	tspan.innerHTML = text
	tspan.setAttributeNS(null, 'x', 0)
	txt.appendChild(tspan)
	$svg.appendChild(txt)
	// call center after apped to dom
	center(txt)
	let event = new CustomEvent('click', {bubbles: true})
	tspan.dispatchEvent(event)
}
