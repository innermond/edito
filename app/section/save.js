import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'
import {emmiter, get_saves, del_save, apply_save} from '../idb.js'
import {loading} from '../loading.js'
import {update_svg} from '../idb.js'

const tpl = `<section class="vertical-align">
	<label for="open-file-svg" class="tooltip" data-tooltip-text="Deschide un fișier svg de pe disc" data-tooltip-bottom><img src="/icon/open-file.svg">
	<input class="none" type="file" id="open-file-svg">
	</label>
	<a name="categories-mark" />
</section>`
export const $ui = wrap(ui_fragment(tpl), 'save-svg', 'Salvare')
const $open_file = $ui.querySelector('#open-file-svg')

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

	const [done,] = loading()

	if ($el.classList.contains('close')) {
		try {
			await del_save($action.dataset.id)
			$action.remove()
		} catch(e) {
			console.log(e)
		} finally {
			done()
		}
		return
	}

	if ('thumb' in $el.dataset) {
		try {
			await apply_save($action.dataset.id)
		} catch (e) {
			console.log(e)
		} finally {
			done()
		}
	}

	done()
})

$open_file.addEventListener('input', async () => {
	const file = $open_file.files[0] ?? null
	if (!file) return
	
	const future = new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result)
		}
		reader.onerror = reject
		reader.readAsText(file)
	})

	const svg_text = await future
	const parser = new DOMParser()
	const doc = parser.parseFromString(svg_text, 'image/svg+xml')
	update_svg(doc)
})
