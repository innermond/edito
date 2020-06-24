import {xmlns, element_from} from '../dom.js'
import {Ants, Square, Circle, Clues} from './ants.js'
import {$selection} from './grouping.js'

// svg element clicked / selected
// as we cant instanciate directly a SVGElement
// we create a dummy SVGElement
// which is zero value for $clicked
const $zero = document.createElementNS(xmlns, 'rect')

export let $clicked

// replace $clicked with other SVGElement
// and reattach necesarry methos
const from = ($el, prefer_group=true) => {
	$el = prefer_group ? element_from($el) : $el
	if ($clicked === $el) return $clicked
	if (is_clicked_element($el)) {
		$clicked = $el
		return $clicked
	}

	$clicked = $el ?? $zero
	attach_methods($clicked)
	$clicked.valueOf = () => !$clicked.is_zero()
	$clicked.ants = new Ants()
	$clicked.square = new Square()
	$clicked.circle = new Circle()
	$clicked.clues = new Clues()

	return $clicked
}
const zero = () => {
	from($zero)
	$selection.delete($clicked)
	return $clicked
}
const is_zero = () => $clicked === $zero
// marks (ants/rect+square+circle) over $clicked
const over = () => {
	// no-op when zero
	if ($clicked.is_zero()) return
    if (
        $clicked.classList.contains('is-reference') && 
        $clicked.classList.contains('rectpage')
    ) 
        return

	if (!$clicked.ants){
		$clicked.ants = new Ants()
	} 
	$clicked.ants.over($clicked)
	if (!$clicked.square){
		$clicked.square = new Square()
	} 
	$clicked.square.over($clicked)
	if (!$clicked.circle){
		$clicked.circle = new Circle()
	} 
	$clicked.circle.over($clicked)

	$selection.add($clicked)
}
const unover = () => {
	$clicked.square?.reset()
	$clicked.circle?.reset()
	$clicked.ants?.reset()
	$selection.delete($clicked)
}
const follow = () => {
	$clicked.ants?.follow($clicked)
	$clicked.square?.follow($clicked)
	$clicked.circle?.follow($clicked)
}

const methods = [from, zero, is_zero, over, unover, follow]
const attach_methods = $el => methods.forEach(m => $el[m.name] = m)

const is_clicked_element = $el => {
	if (!$el) return false
	for (let m of methods)  {
		let has = m.name in $el 
		if (!has) return false	
	}
	return true
}

// initialize $clicked here
// attach methods
from($zero)
