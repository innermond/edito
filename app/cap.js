import {add_diving, remove_diving} from './dive.js'
import {add_panning, remove_panning} from './pan.js'
import {add_selecting, remove_selecting} from './select.js'
import {add_dragging, remove_dragging} from './drag.js'
import {disable} from './click.js'
//import {watch} from './dom.js'

const activated_default = {drag: true, select: false, pan: false, dive: false}
const activated = Object.assign({}, activated_default)
//const activated = watch(Object.assign({}, activated_default))

const movement = {drag: {}, pan: {}, dive: {}, select: {}}

movement.activated = activated

movement.drag.off = () => {
	activated.drag = false
	remove_dragging()
}

movement.drag.on = () => {
	activated.drag = true
	add_dragging()
}

movement.pan.off = () => {
	activated.pan = false
	remove_panning() 

	disable.click = false
	if (activated.drag) add_dragging()
	if (activated.select) movement.select.on()
	if (activated.dive) movement.dive.on()
}

movement.pan.on = () => {
	activated.pan = true
	
	disable.click = true
	remove_selecting()
	remove_diving() 
	remove_dragging() 
	
	add_panning()
}

movement.dive.off = () => {
	activated.dive = false
	remove_diving() 

	disable.click = false
	if (activated.drag) movement.drag.on()
	if (activated.select) movement.select.on()
	if (activated.pan) movement.pan.on()
}

movement.dive.on = () => {
	activated.dive = true
	if (activated.pan) return
	
	disable.click = true
	remove_panning()
	remove_selecting()
	remove_dragging() 

	add_diving()
}

movement.select.off = () => {
	activated.select = false
	remove_selecting() 

	disable.click = false
	if (activated.drag) add_dragging()
	if (activated.dive) movement.dive.on()
	if (activated.pan) movement.pan.on()
}

movement.select.on = () => {
	activated.select = true
	
	disable.click = true
	remove_panning()
	remove_diving() 
	
	add_selecting()
}

export default movement
