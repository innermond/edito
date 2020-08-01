import {$svg, $defs, $style, ui_fragment, newtag} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {center} from '../pos.js'
import {dragging_all_marks_reset} from '../ui.js'

const tpl = `<input id="url_image"><button id="add_url_imagine">Adaugă URL imagine</button>
<input type="file" id="file_image">`
const $ui = ui_fragment(tpl)

export const $url_image = $ui.querySelector('#url_image')
export const $add_url_image = $ui.querySelector('#add_url_imagine')
export const $file_image = $ui.querySelector('#file_image')

$add_url_image.addEventListener('click', addUrlImage)
$file_image.addEventListener('change', addFileImage)

async function addUrlImage() {
	dragging_all_marks_reset()
	$selection.clear()

	let tag = newtag('image')
	if ($url_image.value.split('.')?.pop()?.toLowerCase() === 'svg') {
		let resp = await fetch($url_image.value)
		if (resp.ok) {
			let svg = await resp.text()
			let p = new DOMParser()
			let osvg = p.parseFromString(svg, 'image/svg+xml')
			osvg.querySelectorAll('defs')?.children?.foreach($c => $defs.appendChild($c))
			osvg.querySelectorAll('style')?.children?.foreach($c => $style.appendChild($c))
			tag = newtag('g')
			tag.classList.add('group')
			tag.insertAdjacentHTML('beforeend', osvg.documentElement.innerHTML)
			$svg.appendChild(tag)
			$clicked.from(tag).over()
		} else {
			console.log(resp.status)
		}
		return
	}

	tag.addEventListener('load', () => {
		center(tag)
		$url_image.value = ''
	})
	tag.href.baseVal =  $url_image.value
	$svg.appendChild(tag)
	$clicked.from(tag).over()
}

function addFileImage() {
	const file = $file_image.files[0] ?? null
	if (!file) return
	const reader = new FileReader()
	reader.addEventListener('load', () => {
		let $img = new Image()
		$img.src = reader.result
		$img.addEventListener('load', () => {
			let tag = newtag('image')
			tag.href.baseVal =  reader.result
			$svg.appendChild(tag)
			//$svg.querySelector(':scope > g').appendChild(tag)
			center(tag)
			$url_image.value = ''
			$clicked.from(tag).over()
			$file_image.value = null
	})
	}, false)	
	reader.readAsDataURL(file)
}
