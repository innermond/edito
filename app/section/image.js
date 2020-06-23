import {$svg, $defs, $style, ui_fragment, newtag} from '../dom.js'
import {$clicked, $selection} from '../selection/index.js'
import {center} from '../pos.js'
import {ul_select} from '../ul_select.js'
import {wrap} from '../drawer.js'
import {dragging_all_marks_reset} from '../ui.js'

const tpl = `<section class="vertical-align">
	<label class="tooltip" data-tooltip-text="Introduceți o adresă validă de imagine" data-tooltip-bottom>Adresa de web</label>
	<input id="url_image" placeholder="https://imagine"><button id="add_url_imagine">Adaugă URL imagine</button>
	<hr/>
	<label for="file_image" class="file-upload tooltip" data-tooltip-text="Alegeți o imagine de pe calculatorul dvs." data-tooltip-bottom>Fișier local</label>
	<input type="file" id="file_image">
	<button id="images" class="tooltip" data-tooltip-text="Alege din imaginile deja incărcate" data-tooltip-bottom>Librărie</button>
</section>`
export const $ui = wrap(ui_fragment(tpl), 'add-image', 'imagini')

export const $url_image = $ui.querySelector('#url_image')
export const $add_url_image = $ui.querySelector('#add_url_imagine')
export const $file_image = $ui.querySelector('#file_image')

$add_url_image.addEventListener('click', addUrlImage)
$file_image.addEventListener('change', addFileImage)

async function addUrlImage(evt) {
	dragging_all_marks_reset()
	$selection.clear()

	const proxyurl =  'http://localhost:3000/cors.php?url=' 
	//''https://cors-anywhere.herokuapp.com/'
	let tag = newtag('image')
	if ($url_image.value.split('.')?.pop()?.toLowerCase() === 'svg') {
		try {
			let resp = await fetch(proxyurl + $url_image.value)
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
		} catch(e) {
			console.log(e)
		}
		return
	}

	tag.addEventListener('load', evt => {
		center(tag)
		$url_image.value = ''
		console.log(tag)
	})
	tag.href.baseVal = $url_image.value
	$svg.appendChild(tag)
	$clicked.from(tag).over()
}

function addFileImage(evt) {
	dragging_all_marks_reset()
	$selection.clear()

	const file = $file_image.files[0] ?? null
	if (!file) return
	const reader = new FileReader()
	reader.addEventListener('load', () => {
		let $img = new Image()
		$img.src = reader.result
		$img.addEventListener('load', evt => {
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
