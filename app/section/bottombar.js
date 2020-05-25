import {ui_fragment, px} from '../dom.js'
import {$bleed} from '../ui.js'
import * as save from '../save.js'
import {deleting, undeleting, cloning} from '../user_action/del_undel_clone.js'

const tpl = `<section id="bottom-bar">
    <button id="delete_element">Sterge</button>
    <button id="undelete_element">Anulează</button>
    <button id="clone_element">Clonează obiect</button>
    <button id="save_svg">Preview</button>
    <button id="send_svg">Comandă</button>
</section>`

export const $ui = ui_fragment(tpl)

export const $delete_element = $ui.querySelector('#delete_element')
$delete_element.addEventListener('click', deleting)
export const $undelete_element = $ui.querySelector('#undelete_element')
$undelete_element.addEventListener('click', undeleting)
export const $clone_element = $ui.querySelector('#clone_element')
$clone_element.addEventListener('click', cloning)

export const $save_svg = $ui.querySelector('#save_svg')
export const $send_svg = $ui.querySelector('#send_svg')

$save_svg.addEventListener('click', evt => save.render_image())
$send_svg.addEventListener('click', evt => save.render_image(2, px($bleed.value)))
