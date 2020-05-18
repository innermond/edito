import {ui_fragment, px} from '../dom.js'
import {$bleed} from '../ui.js'
import * as save from '../save.js'

const tpl = `<button id="save_svg">Salvează</button>
<button id="send_svg">Comandă</button>`
const $ui = ui_fragment(tpl)

export const $save_svg = $ui.querySelector('#save_svg')
export const $send_svg =$ui.querySelector('#send_svg')

$save_svg.addEventListener('click', evt => save.render_image())
$send_svg.addEventListener('click', evt => save.render_image(2, px($bleed.value)))
