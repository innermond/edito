import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'

const tpl = `<section class="vertical-align">
	<a id="categories-shapes-mark" />
</section>`
export const $ui = wrap(ui_fragment(tpl), 'add-element', 'Forme')

const load_colections_shapes = (() => {
	let already_loaded = false
	return async () => {
		if (already_loaded) return

		try {
			let resp = await fetch('/app/data/shape-category.json')
			if (!resp.ok) {
				throw new Error('response not ok')
			}
			resp = await resp.json()
			const $mark = document.getElementById('categories-shapes-mark')
			// add categories images to panel
			// assume just append
			let categories = ''
			Object.keys(resp).forEach(k => {
				categories += `<button class="category-image" id="category-${k}" value="${k}"><img src="/img/${resp[k]}"><div class="category-image-text">${k}</div></button>`
			})
			if (categories.length > 0) {
				$mark.insertAdjacentHTML('afterend', categories.repeat(100))
				already_loaded = true
				/*$mark.parentNode.querySelectorAll('button[class=category-image]').forEach($btn => {
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
								add_patch()
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
				})*/
			}
		} catch (e) {
			console.log(e)
		}
	}
})()

load_colections_shapes()
