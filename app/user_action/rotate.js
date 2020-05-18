import {$svg, ui_fragment, angle} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'

const tpl = `<label for="angle">Rotație</label>
    <input type="range" min="-180" max="180" value="0" step="0.0001" id="angle">`
const $ui = ui_fragment(tpl)

export const $angle = $ui.querySelector('#angle')
$angle.addEventListener('input', rotate)

function rotate(evt) {
	$selection.forEach($el => {
		angle($el, $angle.value)
		$clicked.from($el)
		$clicked.over()
	})
}
