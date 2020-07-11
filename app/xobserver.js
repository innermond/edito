function nth(el) {
	let i = 0;
	while (el.previousSibling != null && el !== el.previousSibling && el.nodeType === el.previousSibling.nodeType){
		i++
		el = el.previousSibling
	}
	return i
}

const blankimg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

export default function(nextnum=1, q='') {
	const loadimg = (observer, $box, a, z, nextnum=1) => {
		const opt = {
			 method: 'POST', 
			 mode: "same-origin",
			 credentials: "same-origin",
			 headers: {'Content-Type': 'application/json'},
			 body: JSON.stringify({a, z, q})
	 }
	 fetch('noscript.php', opt)
		.then(response => response.json())
		.then(json => {
			let url, img
			for (let inf of json) {
				url = inf[0]
				img = new Image()
				img.classList.add('late')
				img.dataset.src = location.protocol + '//' + location.host + '/img/' + url
				img.dataset.placeholder = blankimg
				img.src = blankimg
				img.width = inf[1]
				img.height = inf[2]
				let r = inf[1]/inf[2]
				$box.appendChild(img)
				let hx = parseFloat(window.getComputedStyle(img).height)
				let wx = r*hx
				img.style.width = wx + 'px'
				observer.observe(img)
			}
			if (img) img.callnext = next => loadimg(observer, $box, z, z + next)
		})			
	}

	const callback = (xx, obs) => {
		xx.forEach(x => {
			// threshold is crucial in the following reasoning
			// x leaves when it's (1-threshold)*height is outside the root
			// x enters when it's threshold*height is inside the root
			const yup = x.boundingClientRect.y < x.rootBounds.y;
			const xname = x.target.dataset.src.substring(x.target.dataset.src.lastIndexOf('/')+1)
			const loaded = (x.target.src === x.target.dataset.src)
			if (x.isIntersecting && !loaded) {
				window.requestAnimationFrame(()=>{
			x.target.onload = () => {
				if (x.target.src !== x.target.dataset.src) return
				x.target.classList.add('loaded')
			}
					x.target.src = x.target.dataset.src
						// enter-up
						if (! yup && 'callnext' in x.target){ 
							x.target.callnext(nextnum)
							delete(x.target.callnext)
						}
				})	
			} else if (loaded) {
				window.requestAnimationFrame(()=>{
					x.target.src = x.target.dataset.placeholder
					x.target.onload = null
					x.target.classList.remove('loaded')
					// leave-down
					//console.log( !yup && !x.target.pristine)
				})
			}		
		}) 
	}

	return [loadimg, callback]
}
