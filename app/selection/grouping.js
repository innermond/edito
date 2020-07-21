import {$svg, newtag, nextSiblingNoAnts} from '../dom.js'
import {$clicked} from './clicked.js'
import {OPERATIONS_ROT_SIZE} from './ants.js'

class selection extends Set {
	new_one() {
		let $fresh = new selection()
		return $fresh
	}

	as_group(temporary=false) {
		if (this.size === 0) return $clicked.zero()
		// locked elements kept out	of set
		const $locked = Array.from(this).filter($e => {
			if ('lock' in $e.dataset) {
				this.delete($e)
				return true
			}
			return false
		})

		let arr = Array.from(this)
		// order as in source code
		// marks elements for subsequent retrieval
		arr.forEach($e => $e.setAttribute('data-source-order', ''))
		// get elements ordered as in source code
		const $ordered = $svg.querySelectorAll('[data-source-order]')
		arr = Array.from($ordered)
		arr.forEach($e => $e.removeAttribute('data-source-order'))

		let $next = nextSiblingNoAnts(arr[arr.length-1])
		// assure  nextelementsibling is not in current set
		while (this.has($next?.nextElementSibling)) {
			$next = nextSiblingNoAnts($next.nextElementSibling)
		}
		const $g = newtag('g', {dataGroup:true})

		// do not append $next 
		arr.forEach($e => {if ($next !== $e) $g.appendChild($e)})
		$next
		? $svg.insertBefore($g, $next) && this.has($next) && $g.appendChild($next)
		: $svg.appendChild($g)
		if (!temporary) {
			this.clear() 
			// TODO when clear all selection make ants dissapear too or is needed so much this clear() ?
		} else {
			// add back to selection
			for (const $k of $locked) this.add($k)
		}

		return $clicked.from($g)
	}

	as_ants() {
		this.forEach($e => {
			$clicked.from($e)
			$clicked.over()
		})
	}

	deselect() {
		this.forEach($e => {
			$clicked.from($e)
			$clicked.unover()
		})
		this.clear()
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
		const $active = this.get_active_element(OPERATIONS_ROT_SIZE)
		if ($active) {
			func($active)
			return
		}
		this.forEach($el => {
			if ('lock' in $el.dataset) return
			func($el)
			/*let $ee = [$el]
			if ($el.nodeName === 'g') {
				$ee = Array.from($el.children)
			}
			$ee.forEach($e => func($e))*/
		})
	}

	get_active_element(ops=null) {
		const $found = Array.from(this).filter($el => $el.clues?.operating(ops))
		return $found.length ? $found.pop() : null
	}
		
}
export let $selection = new selection()
