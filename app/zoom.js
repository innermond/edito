import {$svg, copy_viewbox} from './dom.js'

export function zoom(scale, bb=null) {
    const b = $svg.viewBox.baseVal
    let dx = b.width
    let dy = b.height
    b.width /= scale
    b.height /= scale
    dx -= b.width
    dy -= b.height
    b.x += dx*0.5
    b.y += dy*0.5
    if (bb) {
        b.x += 1
        b.y += 1
    }
}

export function zoom_reset($other=$svg, viewbox=zoom_reset.viewbox) {
    $other.viewBox.baseVal.width = viewbox.width
    $other.viewBox.baseVal.height = viewbox.height
    $other.viewBox.baseVal.x = viewbox.x
    $other.viewBox.baseVal.y = viewbox.y
}
zoom_reset.viewbox = copy_viewbox($svg.viewBox)

