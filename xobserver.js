let blankimg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
let nextnum = 1
//window.addEventListener('DOMContentLoaded', evt => {
	 function loadimg(observer, $box, a, z) {
		 fetch('noscript.php', {
			 method: 'POST', 
			 mode: "same-origin",
			 credentials: "same-origin",
			 headers: {'Content-Type': 'application/json'},
			 body: JSON.stringify({a, z})
		 })
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
				//img.callprev = prev => loadimg(observer, $box, a > prev ? a - prev :  a, prev)
			})			
	}

	function nth(el) {
		let i = 0;
		while (el.previousSibling != null && el !== el.previousSibling && el.nodeType === el.previousSibling.nodeType){
			i++
			el = el.previousSibling
		}
		return i
	}

	let callback = (xx, obs) => {
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
	
	let box = document.querySelector('#box')
	let category_image = document.querySelector('#category-image > .tool-drawer-scroll')
	let options = {
		root: category_image.parentNode,
		rootMargin:'0px 0px',
		threshold: 0
	}
	let observer = new IntersectionObserver(callback, options)
	loadimg(observer, box, 0, nextnum)

	//})
