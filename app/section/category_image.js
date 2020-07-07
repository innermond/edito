import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'

const tpl = `<section class="vertical-align">
	<label>Adaugă forma</label>
	<button id="add_rect">Adaugă dreptunghi</button>
	<button id="add_circle">Adaugă cerc</button>
	<button id="add_line">Adaugă linie</button>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'category-image', 'Temă')
