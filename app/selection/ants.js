import {$svg, px, attr, newtag} from '../dom.js'
import {setm, m2e, m, get_scale} from '../mtx.js'
import {point_in} from '../pos.js'

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
		this.$owner = $el.ownerSVGElement || $svg
		this.$shape.$element = $el
		if (!this.$shape.ownerSVGElement) this.$owner.appendChild(this.$shape)

		this.follow()
	}

    bbox($el) {
        const bk = $el.getBoundingClientRect()
        const 
        tl = point_in($el.ownerSVGElement, bk.x, bk.y),
        br = point_in($el.ownerSVGElement, bk.right, bk.bottom),
        w = br.x - tl.x,
        h = br.y - tl.y

		let bb
        if ('useThat' in $el) {
            bb = $el.useThat.bbox
        } else {
            bb = {x:tl.x, y:tl.y, width:w, height:h}
        }

        return bb
    }

    draw_point($p, fill='red') {
        let p = $p //point_in($svg, $p.x, $p.y)
        //p = p.matrixTransform($svg.getCTM().inverse())
        const r = 2
        const mark = newtag('circle', {r:2, cx:p.x, cy:p.y, fill})
        $svg.appendChild(mark)
    }

    arr_del(arr, x) {
        const i = arr.indexOf(x)
        if (i > -1) {
            arr.splice(i, 1)
        }
    }

    candidate_points(pp, xy, val) {
        return pp.filter(p => p[xy] == val)
    }

    bbox_contour($el) {
        const points = []
        let step = 1
        const len = $el.getTotalLength ?? null
        if (!len) return this.bbox($el)
        const z = $el.getTotalLength()
        if (z > 500) step = Math.ceil(z/500)
        const a = 0
        const point_at = $el.getPointAtLength ?? null
        if (!point_at) return this.bbox($el)

        let pt
        for (let i = a; i < z; i += step) {
            pt = $el.getPointAtLength(i)
            points.push(pt)
        }

        let l = points.sort((a, b) => a.x - b.x)[0]
        const ll = this.candidate_points(points, 'x', l.x)
        // chose the lower left to not compete with top
        l = ll.sort((a, b) => b.y - a.y)[0]
                l = l.matrixTransform(m2e($el, $svg))
                this.arr_del(points, l)
       //         this.draw_point(l, 'silver')
        let r = points.sort((a, b) => b.x - a.x)[0]
                r = r.matrixTransform(m2e($el, $svg))
                this.arr_del(points, r)
         //       this.draw_point(r, 'green')
        let t = points.sort((a, b) => a.y - b.y)[0]
        const tt = this.candidate_points(points, 'y', t.y)
        t = tt.sort((a, b) => a.x - b.x)[0]
                t = t.matrixTransform(m2e($el, $svg))
                this.arr_del(points, t)
           //     this.draw_point(t, 'blue')
        let b = points.sort((a, b) => b.y - a.y)[0]
                b = b.matrixTransform(m2e($el, $svg))
                this.arr_del(points, b)
             //   this.draw_point(b, 'magenta')
       
        let def = []
        let arr = [l, t, r, b, l]
            arr.forEach(p => {
                def.push(`${p.x},${p.y}`) 
            } )
        def = def.join(' ')

        const poly = newtag('polyline', {points: def, stroke: 'red'})
        $svg.appendChild(poly)

        let bb = poly.getBBox()
        poly.remove()
        return bb

        arr = [l, r, t, b]
            arr.forEach(p => {
                this.draw_point(p)
            } )

        const tl = point_in($el, l.x, t.y)
        const br = point_in($el, r.x, b.y)

        arr = [tl, br]
            arr.forEach(p => {
                p = p.matrixTransform(m2e($el, $svg))
                this.draw_point(p, 'cyan')
            } )
        
        const w = br.x - tl.x,
        h = br.y - tl.y

	//	let bb
        if ('useThat' in $el) {
            bb = $el.useThat.bbox
        } else {
            bb = {x:tl.x, y:tl.y, width:w, height:h}
        }

        return bb
    }

	follow() {
		let $el = this.$shape.$element
		let bb = this.bbox_contour($el) 
		attr(this.$shape, {x:bb.x, y:bb.y, width:bb.width, height:bb.height})
        //setm(this.$shape, m2e($el, this.$owner))
		/*if ($el && 'useThat' in $el) {
			setm(this.$shape, m2e($el.useThat.el, $el))
		} else {
			setm(this.$shape, m2e($el, this.$owner))
		}*/
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
		let bb = $el && 'useThat' in $el ? $el.useThat.bbox : $el.getBBox()
		attr(this.$shape,{cx:bb.x, cy:bb.y+bb.height*0.5})
		$el && 'useThat' in $el ? setm(this.$shape, m2e($el.useThat.el, $el)) : setm(this.$shape, m2e($el, this.$owner))

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
