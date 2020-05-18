export function rgb_hex(rgb) {
	rgb = computed_color(rgb)
	var a = rgb.split("(")[1].split(")")[0].split(",");
	return "#" + a.map(function(x) {
		x = parseInt(x).toString(16);
		return (x.length == 1) ? "0"+x : x;
	}).join("");
}

export function valid_color(input) {
		return computed_color(input) !== ""
}

export function computed_color(input) {
		let $div = document.createElement('div')
		document.body.appendChild($div)
		$div.style.color = input
		let color = window.getComputedStyle($div).color
		$div.remove()
		return color
}

export function rgba_color(c) {
	const
		can  = document.createElement( 'canvas' ),
		ctx  = can.getContext( '2d' )
	can.width = can.height = 1
	ctx.fillStyle = c
	ctx.fillRect( 0, 0, 1, 1 ) //paint the canvas
	const
		img  = ctx.getImageData( 0, 0, 1, 1 ),
		data = img.data,
		rgba = {
				r: data[ 0 ], //0-255 red
				g: data[ 1 ], //0-255 green
				b: data[ 2 ], //0-255 blue
				a: data[ 3 ]  //0-255 opacity (0 being transparent, 255 being opaque)
		}
	return rgba
}
