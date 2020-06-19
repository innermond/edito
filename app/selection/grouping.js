import {$svg, newtag, nextSiblingNoAnts} from '../dom.js'
import {$clicked} from './clicked.js'

export let $selection = new class extends Set {
	as_group(temporary=false) {
		if (this.size === 0) return $clicked.zero()

		let $next = nextSiblingNoAnts($clicked)
		// assure  nextelementsibling is not in current set
		while (this.has($next?.nextElementSibling)) {
			$next = nextSiblingNoAnts($next.nextElementSibling)
		}
		const $g = newtag('g', {dataGroup:true})
		let arr = Array.from(this)
		// order as in source code
		// marks elements for subsequent retrieval
		arr.forEach($e => {
			$e.setAttribute('data-source-order', '')
		})
		// get elements ordered as in source code
		const $ordered = $svg.querySelectorAll('[data-source-order]')
		arr = Array.from($ordered)

		// do not append $next 
		arr.forEach($e => {if ($next !== $e) $g.appendChild($e)})
		$next
		? $svg.insertBefore($g, $next) && $g.appendChild($next)
		: $svg.appendChild($g)
		if (!temporary) this.clear()
		return $clicked.from($g)
	}

	as_ants() {
		this.forEach($e => {
			$clicked.from($e)
			$clicked.over()
		})
	}

	async forEachAsync(func) {
		for (let e of this) {
			await func(e)
		}
	} 

	just($el) {
		return this.has($el) && this.size === 1
	}

	each(func) {
		this.forEach($el => {
			let $ee = [$el]
			if ($el.nodeName === 'g') {
				$ee = Array.from($el.children)
			}
			$ee.forEach($e => func($e))
		})
	}
		
}() 
