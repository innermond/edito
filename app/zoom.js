import {$svg, copy_viewbox} from './dom.js'

export function zoom(scale, pt=null) {
	const b = $svg.viewBox.baseVal
	// svg center
	const cx = b.x+b.width*0.5, cy = b.y+b.height*0.5
	if (!pt) pt = {x: cx, y: cy}
	const dx = pt.x - cx, dy = pt.y - cy
	const sw = b.width/scale, sh = b.height/scale
	const step = 10
	const sx = dx/step+(b.width-sw)*0.5, sy = dy/step+(b.height-sh)*0.5

	// scaled dimensions
	b.x += sx, b.y += sy
	b.width = sw
	b.height = sh
}

export function zoom_reset($other=$svg, viewbox=zoom_reset.viewbox) {
    $other.viewBox.baseVal.width = viewbox.width
    $other.viewBox.baseVal.height = viewbox.height
    $other.viewBox.baseVal.x = viewbox.x
    $other.viewBox.baseVal.y = viewbox.y
}
zoom_reset.viewbox = copy_viewbox($svg.viewBox)
