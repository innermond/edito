import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {emmiter, get_saves, del_save, apply_save} from '../idb.js'

const tpl = `<section class="vertical-align">
	<a name="categories-mark" />
</section>`
export const $ui = wrap(ui_fragment(tpl), 'save-svg', 'Salvare')

const $mark = $ui.querySelector('a[name=categories-mark]')
emmiter.onDBAvailable(async () => {
	let ss = await get_saves()
	let $tmp = ''
	ss = ss.reverse()
	for (const s of ss) {
		$tmp += `<div class="action" data-id="${s.id}" ><img data-thumb src=${s.png}><img src="/icon/close.svg" class="close"></img></div>`
	}
	$tmp = `<div class="full">${$tmp}</div>`
	$mark.insertAdjacentHTML('afterend', $tmp)
})

$mark.parentElement.addEventListener('click', async evt => {
	const $el = evt.target
	const $action = $el.closest('[class="action"]')

	if ($el.classList.contains('close')) {
		try {
			await del_save($action.dataset.id)
			$action.remove()
		} catch(e) {
			console.log(e)
		}
		return
	}

	if ('thumb' in $el.dataset) {
		try {
			await apply_save($action.dataset.id)
		} catch (e) {
			console.log(e)
		}
	}
})
