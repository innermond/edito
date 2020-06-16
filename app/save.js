import {$svg} from './dom.js'

function toDataURL(url) {
	return new Promise((resolve, reject) => {
		let image = new Image()
		image.crossOrigin = 'anonymous'
		image.onload = () => {
				let canvas = document.createElement('canvas')
				canvas.width = image.naturalWidth
				canvas.height = image.naturalHeight

				canvas.getContext('2d').drawImage(image, 0, 0)
				try {
					let data = canvas.toDataURL('image/png')
					resolve(data)
				} catch (e) {
					reject(e)
				}
		}
		image.onerror = reject
		image.src = url	
	})
}

function isDataURL(s) {
    return !!s.match(isDataURL.regex)
}

isDataURL.regex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i

async function imagesAsUrldata($svgclone) {
	await $svgclone.querySelectorAll('image').forEach(async $img => {
			try {
				let data 
				if (isDataURL($img.href.baseVal)) {
					data = $img.href.baseVal
				} else {
					data = await toDataURL($img.href.baseVal)
				}
				let $clone = $img.cloneNode(true)
				$clone.id += '-cloned'
				$clone.setAttributeNS(null, 'data-href', $clone.href.baseVal)
				$clone.href.baseVal = data
				$img.parentNode.insertBefore($clone, $img)
				$img.remove()
			} catch (e) {
				console.log(e)
			}
	})
}

export const render_image = async (k=1, bleed=0) => {
	let $div = document.querySelector('#canvas')
	let $svgclone = $svg.cloneNode(true)
	let svgsize = $svgclone.viewBox.baseVal
	//TODO how modified svgsize affects rendered image ?
	svgsize.x -= bleed
	svgsize.y -= bleed
	svgsize.width += 2*bleed
	svgsize.height += 2*bleed
	$svgclone.width.baseVal.value += 2*bleed
	$svgclone.height.baseVal.value += 2*bleed

	await imagesAsUrldata($svgclone)

	setTimeout( ()=>{
		$svgclone.querySelectorAll('[data-ants=true]').forEach($ant => $ant.remove())

		const svgdata = new XMLSerializer().serializeToString($svgclone)
		const srcdata = btoa(unescape(encodeURIComponent(svgdata)))
		const cw = $svgclone.width.baseVal.value
		const ch = $svgclone.height.baseVal.value
		$svgclone.remove()
							
		let $canvas = document.createElement('canvas')
		$canvas.width = cw*k
		$canvas.height = ch*k
		$canvas.style.width = $canvas.width + 'px'
		$canvas.style.height = $canvas.height + 'px'
		let ctx = $canvas.getContext("2d")
		ctx.scale(k,k)

		let $img = document.createElement('img')
		$img.addEventListener('load', evt => {
				ctx.drawImage($img, 0, 0)
				let canvasdata = $canvas.toDataURL('image/png')
				$div.insertAdjacentHTML('afterEnd', '<img src="' + canvasdata  + '">')
				/*let a = document.createElement("a")
				a.download = "download_img" + ".png"
				a.href = canvasdata
				document.body.appendChild(a)
				a.click()*/
		})
		$img.setAttribute('src', 'data:image/svg+xml;base64,' + srcdata)
	}, 100)
}


