import {$svg, ui_fragment, newtag} from '../dom.js'
import {wrap} from '../drawer.js'
import {loading} from '../loading.js'
import {dragging_all_marks_reset} from '../ui.js'
import {center} from '../pos.js'
import {$selection, $clicked} from '../selection/index.js'
import {add_patch} from '../idb.js'

const tpl = `<section class="vertical-align">
	<label for="file_svg" class="file-upload tooltip" data-tooltip-text="Alegeți un fișier svg de pe calculatorul dvs." data-tooltip-bottom>Fișier local</label>
	<input class="none" type="file" id="file_svg">
	<hr/>
	<a name="categories-mark" />
</section>`
export const $ui = wrap(ui_fragment(tpl), 'add-element', 'Forme')
const $file_svg = $ui.querySelector('#file_svg')

$file_svg.addEventListener('change', async () => {
	const file = $file_svg.files[0] ?? null
	if (!file) return
	const is_svg = $file_svg.value.split('.')?.pop()?.toLowerCase() === 'svg'
	if (!is_svg) return
	
	const [done,] = loading()
	
	const future = new Promise((resolve, reject) => {
		const reader = new FileReader()
		reader.onload = () => {
			resolve(reader.result)
		}
		reader.onerror = evt => reject(evt)
		reader.readAsText(file)
	})

	try {
		const svg_text = await future
		const parser = new DOMParser()
		const osvg = parser.parseFromString(svg_text, 'image/svg+xml')
		osvg.querySelectorAll('defs')?.children?.foreach($c => $defs.appendChild($c))
		osvg.querySelectorAll('style')?.children?.foreach($c => $style.appendChild($c))

		const tag = newtag('g')
		tag.classList.add('group')
		tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML)
		dragging_all_marks_reset()
		$selection.clear()
		$svg.appendChild(tag)
		center(tag)
		$clicked.from(tag).over()
		add_patch()
	} catch(e) {
		console.log(e)
	} finally {
		done()
		$file_svg.value = null
	}
})
