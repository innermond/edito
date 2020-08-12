import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {emmiter, get_saves} from '../idb.js'

const tpl = `<section class="vertical-align">
	<a name="categories-mark" />
</section>`
export const $ui = wrap(ui_fragment(tpl), 'save-svg', 'Salvare')

const $mark = $ui.querySelector('a[name=categories-mark]')
emmiter.onDBAvailable(async () => {
	const ss = await get_saves()
	let $tmp = ''
	for (const s of ss) {
		$tmp += `<img src=${s.png}>`
	}
	$tmp = `<div class="full">${$tmp}</div>`
	$mark.insertAdjacentHTML('afterend', $tmp)
})
