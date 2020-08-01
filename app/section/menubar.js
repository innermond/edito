import {$svg, ui_fragment, display_none, cycle_zindex} from '../dom.js'
import {center} from '../pos.js'
import {tooltip} from '../tooltip.js'

import movement from '../cap.js'
import {scrollable} from '../div_scroller.js'

import {dragging_all_marks_reset} from '../ui.js'
import {$clicked, $selection} from '../selection/index.js'
import {urlImage} from '../section/image.js'

const tpl = `<section id="menu-bar">
	<div>
		<ul id="tool-menu-sections" class="tool-menu vertical-align">
			<li id="tool-properties" data-panel="properties" class="tool-item tooltip" data-tooltip-text="Dimensiuni pagină, culoare fundal, mărime bleed, pas de mutare"><img src="/icon/properties.svg"></li>
			<li id="tool-filter" data-panel="manage-filter" class="tool-item tooltip" data-tooltip-text="Adaugă filter"><img src="/icon/filter.svg"></li>
			<li id="tool-combine" data-panel="mask-clip-path" class="tool-item tooltip" data-tooltip-text="Maschează, decupează, text pe curbă"><img src="/icon/effect.svg"></li>
			<li id="tool-element" data-panel="add-element" class="tool-item tooltip" data-tooltip-text="Adaugă elemente grafice"><img src="/icon/add-element.svg"></li>
			<li id="tool-text" data-panel="add-text" class="tool-item tooltip" data-tooltip-text="Adaugă text"><img src="/icon/add-text.svg"></li>
			<li id="tool-image" data-panel="add-image" class="tool-item tooltip" data-tooltip-text="Adaugă imagini"><img src="/icon/add-image.svg"></li>
		</ul>
		<ul id="tool-menu-floaters" class="tool-menu vertical-align">
			<li id="tool-select" data-panel="select" class="tool-item tooltip" data-tooltip-text="Selectează, indică și opțiuni specifice"><img src="/icon/pointer.svg"></li>
			<li id="tool-zoom" data-panel="zoom" class="tool-item tooltip" data-tooltip-text="Apropiere, depărtare, deplasare față de pagină"><img src="/icon/zoom.svg"></li>
			<li id="tool-geometry" data-panel="geometry" class="tool-item tooltip" data-tooltip-text="Ascunde/arată meniul flotant ce controlează proprietățile geometrice"><img src="/icon/move.svg"></li>
			<li id="tool-color" data-panel="fill_stroke_color" class="tool-item tooltip" data-tooltip-text="Ascunde/arată meniul flotant ce controlează proprietățile de culoare"><img src="/icon/fill.svg"></li>
			<li id="tool-order" data-panel="order" class="tool-item tooltip" data-tooltip-text="Ascunde/arată meniul de grupare, aliniere, ordine"><img src="/icon/four.svg"></li>
		</ul>
	</div>
</section>`
export const $ui = ui_fragment(tpl)

const $tool_floater = $ui.querySelector('#tool-menu-floaters')

$tool_floater.addEventListener('click', evt => {
	const $me = evt.target
	const fid = $me.dataset.panel
	const $floater = document.getElementById(fid)
	display_none($floater)
	cycle_zindex($floater)
	toggle_active($me)
})

$tool_floater.addEventListener('mouseover', evt => {
	const $me = evt.target
    if (!$me.classList.contains('active')) return
	const fid = $me.dataset.panel
	const $floater = document.getElementById(fid)
    if ($floater.style.display !== 'none') cycle_zindex($floater)
})

let have_area = false

const $select = $ui.querySelector('#tool-select')

let select_clicked = false
export const toggle_select = () => {
    if (select_clicked) {
        movement.select.off()
        if (have_area) document.body.classList.add('area')
    } else {
        movement.select.on()
        if (have_area) document.body.classList.remove('area')
    }
    select_clicked = !select_clicked
}

$select.addEventListener('click', toggle_select)

const $area = $ui.querySelector('#tool-zoom')
export const toggle_dive = () => {
    if(have_area) {
        movement.dive.off()
        document.body.classList.remove('area')
    } else {
        movement.dive.on()
        document.body.classList.add('area')
    }
    have_area = !have_area
}
$area.addEventListener('click', toggle_dive)

const $add_image = $ui.querySelector('#tool-image')
const load_colections_images = (() => {
	let already_loaded = false
	return async () => {
		if (already_loaded) {
			$add_image.removeEventListener('click', load_colections_images)
			return
		}
		try {
			let resp = await fetch('/app/data/image-category.json')
			if (!resp.ok) {
				throw new Error('response not ok')
			}
			resp = await resp.json()
			const $mark = document.getElementById('categories-images-mark')
			// add categories images to panel
			// assume just append
			let categories = ''
			Object.keys(resp).forEach(k => {
				categories += `<button class="category-image" id="category-${k}" value="${k}"><img src="/img/${resp[k]}"><div class="category-image-text">${k}</div></button>`
			})
			if (categories.length > 0) {
				$mark.insertAdjacentHTML('afterend', categories.repeat(100))
				already_loaded = true
				$mark.parentNode.querySelectorAll('button[class=category-image]').forEach($btn => {
					$btn.addEventListener('click', async () => {
						let $el = document.querySelector('#category-image')
						let box
						if (!$el) {
							let {$ui} = await import('./category_image.js')	
							const $element = $ui.querySelector('.tool-drawer-scroll')
							$el = $ui.firstChild
							document.querySelector('#editor').appendChild($ui)
							scrollable($element)

							box = document.querySelector('#box')
							box.addEventListener('click', async evt => {
								if (evt.target.nodeName.toLowerCase() !== 'img') return
								for (let cls of ['late', 'loaded']) {
									if (evt.target.classList.contains(cls)) continue
									return
								}

								dragging_all_marks_reset()
								$selection.clear()

								const imgsrc = evt.target.dataset.src.replace('stock-images-thumbs', 'stock-images')
								const tag = await urlImage(imgsrc, img => {
									center(img)
								})
								$svg.appendChild(tag)
								$clicked.from(tag).over()
							})
						}
						if (!box) box = document.querySelector('#box')
						box.innerHTML = ''
						try {
							const {default: fn} = await import('../xobserver.js')
							const [loadimg, callback] = fn(10, $btn.value) 
							const $category_image_scroll = document.querySelector('#category-image > .tool-drawer-scroll')
							const options = {
								root: $category_image_scroll,
								rootMargin: '0px',
								threshold: 0
							}
							const observer = new IntersectionObserver(callback, options)
							loadimg(observer, box, 0, 10)
						} catch (e) {
							console.log(e)
						}
						$el.dispatchEvent(new CustomEvent('panel:toggle', {bubbles: true, detail: {panel_id: $el.id}}))
					})
				})
			}
		} catch (e) {
			console.log(e)
		}
	}
})()
$add_image.addEventListener('click', load_colections_images)

const $tool_menu = $ui.querySelector('#tool-menu-sections')

document.addEventListener('tool_menu:all_inactive', () => {
	toggle_all_inactive()
})

$tool_menu.addEventListener('click', evt => {
	const $me = evt.target
	//toggle_active($me)
	toggle_panel($me)
})

$ui.querySelectorAll('[class~="tooltip"]').forEach($e => {
	tooltip($e)
})

function toggle_all_inactive() {
	$tool_menu.querySelectorAll('.tool-item.active').forEach($e => $e.classList.remove('active'))
}

function toggle_active($me, state=null) {
	$tool_menu.querySelectorAll('.tool-item.active').forEach($e => {if ($e !== $me) $e.classList.remove('active')})
	if (state === null) {
		$me.classList.toggle('active')
	} else {
		$me.classList[state].call('active')
	}
}

function toggle_panel($el) {
	$el.dispatchEvent(new CustomEvent('panel:toggle', {bubbles: true, detail: {panel_id: $el.dataset.panel}}))
}
