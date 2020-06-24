import {attr, newtag} from '../dom.js'
import {setm, m2e, m, get_scale} from '../mtx.js'

 export class Ants {
	
	constructor(tagname='rect') {
		this.style =  'vector-effect:non-scaling-stroke;stroke-width:1;fill:none;stroke:#000000;stroke-opacity:1;stroke-miterlimit:2;stroke-dasharray:3,3;stroke-dashoffset:2'
		this.$shape = newtag(tagname, {dataAnts:true, dataRect:true, style:this.style})
		this.$owner = null
		this.$element = null
	}

	// attach shape to dom of owner's element
	// assumed that el is inserted into dom
	over($el) {
		this.$owner = $el.ownerSVGElement
		this.$shape.$element = $el
		if (!this.$shape.ownerSVGElement) this.$owner.appendChild(this.$shape)

		this.follow()
	}

	follow() {
		let $el = this.$shape.$element
		let bb = 'useThat' in $el ? $el.useThat.bbox : $el.getBBox()
		attr(this.$shape, {x:bb.x, y:bb.y, width:bb.width, height:bb.height})
		if ('useThat' in $el) {
			setm(this.$shape, m2e($el.useThat.el, $el))
		} else {
			setm(this.$shape, m2e($el, this.$owner))
		} 
	}

	reset() {
		this.$shape.remove()
	}

}

export class Square extends Ants {
	constructor(side=10) {
		super()
		this.side = side
		this.$shape = newtag('rect', {dataAnts:true, dataSquare:true, width:side, height:side, style: this.style})
		this.$shape.style.fill = 'white'
	}
	
	follow() {
		let $el = this.$shape.$element
		let bb = 'useThat' in $el ? $el.useThat.bbox : $el.getBBox()
		attr(this.$shape, {x:bb.x+bb.width-this.side*0.5, y:bb.y+bb.height*0.5-this.side*0.5})
			'useThat' in $el ? setm(this.$shape, m2e($el.useThat.el, $el)) : setm(this.$shape, m2e($el, this.$owner))
			
		let mtx = m(this.$shape)
		
		let [sx, sy] = get_scale(mtx)
		sx = 1/sx
		sy = 1/sy
		bb = this.$shape.getBBox()
		let x = bb.x+bb.width*0.5
		let y = bb.y+bb.height*0.5
		mtx = m(this.$shape).translate(x, y).scaleNonUniform(sx, sy).translate(-x, -y)
		setm(this.$shape, mtx)
	}

}

export class Circle extends Ants {
	constructor(r=5) {
		super()
		this.$shape = newtag('circle', {dataAnts:true, dataCircle:true, r:r, style: this.style})
		this.$shape.style.fill = 'white'
	}
	
	follow() {
		let $el = this.$shape.$element
		let bb = 'useThat' in $el ? $el.useThat.bbox : $el.getBBox()
		attr(this.$shape,{cx:bb.x, cy:bb.y+bb.height*0.5})
		'useThat' in $el ? setm(this.$shape, m2e($el.useThat.el, $el)) : setm(this.$shape, m2e($el, this.$owner))

		let mtx = m(this.$shape)
		
		let [sx, sy] = get_scale(mtx)
		sx = 1/sx
		sy = 1/sy
		bb = this.$shape.getBBox()
		let	x = bb.x+bb.width*0.5
		let	y = bb.y+bb.height*0.5
		mtx = m(this.$shape).translate(x, y).scaleNonUniform(sx, sy).translate(-x, -y)
		setm(this.$shape, mtx)
	}
}

export function ants_over($el) {
	if (!$el) return
	let $ants = $el.ants ?? new Ants()
	$ants.over($el)
}

export function square_over($el) {
	if (!$el) return
	let $square = $el.square ?? new Square(side)
	$square.over($el)
}

export function circle_over($el) {
	if (!$el) return
	let $circle = $el.circle ?? new Circle(side*0.5)
	$circle.over($el)
}

export class Clues {
	constructor(){
		this.reset()
	}

	reset() {
		this.dragging = false
		this.rotating = false
		this.sizing = false
	}

	is_reset() {
		return !this.dragging && !this.rotating && !this.sizing
	}

	operating() {
		// whitelist properties
		for (const clue of ['dragging', 'rotating', 'sizing']) {
			if (!!this[clue]) return true
		}
		return false
	}

	operation() {
		// whitelist properties
		for (const clue of ['dragging', 'rotating', 'sizing']) {
			if (!!this[clue]) return clue
		}
		return false
	}

	negate(cluename) {
		// whitelist properties
		['dragging', 'rotating', 'sizing'].forEach(clue => {
			if (clue === cluename) {
				this[clue] = !this[clue]
			} else {
				this[clue] = false
			} 
		})
	}
}
