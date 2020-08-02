import {$svg, $style} from '../../dom.js'
import {$clicked, $selection} from '../../selection/index.js'

// native forEach method is not async
// it will go without waiting for completion

export function load_font($fonts) {
	const inx = $fonts.selectedIndex
	if (inx === 0) {
			return
	}
	const $opt = $fonts.options[inx]
	$selection.forEachAsync(async $el => {
			const $ee = $el.nodeName === 'g' ? Array.from($el.children) : [$el]
			for (let $e of $ee) {
				if (!$e || $e.nodeName!=='text') continue
				// wait the font to be loaded
				await load_font_remote($opt.text)
				// apply font to text element
				$e.style.fontFamily = $opt.text 
				$e.querySelectorAll('tspan').forEach( $x => $x.style.fontFamily = 'inherit')

				// apply marks to element that posibly contains 
				// the previous text element
				// or is the text element
				$el.ants.reset()
				$el.square.reset()
				$el.circle.reset()
				// TODO change $clicked to be class based
				// as over method operate on $clicked global
				// we should change $clicked to point to $el
				$clicked.from($el)
				$el.over()
			}
	})
}

// load font from google into webpage
let loaded = {}
const load_font_remote = async text => {
	let url = `https://fonts.googleapis.com/css?family=` + text.replace(/["']+/g, '').replace(/\s+/,'+') + '&display=swap'
	if (url in loaded) return

	//FIXME catch exception
	let response = await fetch(url)
	if (!response.ok) {
		console.log(response.error)
		return
	}	
	let txt = await response.text()
	let start = '/* latin */'
	let end = '}'
	let arr = txt.split("\n")
	let pos = arr.indexOf(start)
	if (pos === -1) return
	let src
	let splitBy = ', '
	while (arr[++pos] !== end) {   
			if (arr[pos].trim().substr(0, 4) === 'src:') {
					src = arr[pos].trim().substr(4)
					let xx = src.split(splitBy)
					let x
					while (x = xx.pop()){
							if (x.trim().substr(0, 3) == 'url' ) {
									src = x.substr(0,x.length-1)
									break
							}
					}
			break
			}
	}

	// load font
	let furl = /\(([^(]+)\)/.exec(src)?.[1]
	if (!furl) return
	let resp = await fetch(furl)
	let bb = await resp.arrayBuffer()
	txt = String.fromCharCode(...new Uint8Array(bb))
	let b64 = btoa(txt)
	
	src =`url(data:application/font-woff;charset=utf-8;base64,${b64}) format('woff')` 
	let fontcode = new FontFace(text, src)
	const fontcode_str = 
	`
@font-face {
font-display: swap;
font-family: "${text}";
src: url(data:application/font-woff;charset=utf-8;base64,${b64}) format('woff');
}`   

	const ff = await fontcode.load()
	if (ff.status === 'error') return
	ff.display = 'swap'
	ff.family = text
	
	document.fonts.add(ff)
	// we need to add font to style to let canvas when saving to display custom fonts properly
    $style.innerHTML += fontcode_str

	loaded[url] = true
}

// load fonts used in svg document
$svg.querySelectorAll('tspan').forEach($tspan => {
	if (/^\s+$/g.test($tspan.innerText)) return
	let ff = $tspan.style.fontFamily
	if (/(sans\-serif|serif)/.test(ff)) return
	if (!ff) {
		ff = $tspan.parentNode.style.fontFamily
		if (/(sans\-serif|serif)/.test(ff)) return
		if (!ff) return
	}
	load_font_remote(ff)
	$tspan.parentNode.style.fontFamily = ff
	$tspan.parentNode.querySelectorAll('tspan').forEach( $el => $el.style.fontFamily = 'inherit' )
})
