import {newtag_html} from './dom.js'
import {tooltip} from './tooltip.js'

export function ul_select($select, opt_func=ul_select.opt_fn, options=ul_select.opts) {
	if (ul_select.opts !== options) options = Object.assign(Object.assign({}, ul_select.opts), options)
	if (!opt_func) opt_func = ul_select.opt_fn
	// create select like
	let html_options = Object.assign({}, options)
	if ('handle_select' in options) {
		delete html_options.handle_select
	}
	const $ul = newtag_html('ul', html_options)
	$select.dataset.ul_id = $ul.id
	Array.from($select.children).forEach($opt => {
		if (!$opt.hasAttribute('value')) return
		const $li = document.createElement('li')
		$li.dataset.value = $opt.value
		// add li with customised 
		$li.innerHTML = opt_func($opt, $li)
		$ul.appendChild($li)
	})
	// implement select like behaviour
	if (options.handle_select) {
		Array.from($ul.children).forEach($li =>
			$li.addEventListener('click', handle_ul_select($ul, $e => {
				$select.value = $e.dataset.value
				$select.dispatchEvent(new Event('change'));
			})))
	} else {
		Array.from($ul.children).forEach($li =>
			$li.addEventListener('click', evt => {
				$select.value = $li.dataset.value
				$select.dispatchEvent(new Event('change'))
			}))
	}
	// insert after replaced native select
	$select.parentNode.insertBefore($ul, $select.nextElementSibling)

	return $ul
}
ul_select.opt_fn = ($opt, $li)=>$opt.textContent
ul_select.opts = {'class': 'folded', 'handle_select': true}

function handle_ul_select($ul, func, keep_first=false) {
	const $ll = Array.from($ul.children)
	return evt => {
		$ll.forEach($el => {
			let isClicked = $el == evt.target
			if (!isClicked) {
				$el.style.display=='list-item'?  $el.style.display='none':$el.style.display='list-item'
			} else if (isClicked){
				$ul.insertAdjacentElement('afterbegin', $el)
				$el.style.display='list-item'
				func($el)
			} 
		})
	}
}

export function present_ul_select($sel, prop) {
	// it will makes change event to not trigger on native select
	let $opt = $sel.querySelector(`option[value="${prop}"]`)
	if (!$opt) {
		initial_ul_select($sel)
		return
	}
	
	$opt.selected = true
	const $ul_sel = document.querySelector('#'+$sel.dataset.ul_id)

	// this bits change only presentational it will not trigger a click event
	$ul_sel?.querySelectorAll(`li[data-value]`).forEach($e => {
		$e.style.display = 'none'
		if ($e.dataset.value === prop) {
			$e.style.display = 'list-item'
			$ul_sel.insertAdjacentElement('afterbegin', $e)
		}
	})
}

export function initial_ul_select($sel) {
	$sel.options[0].selected = true
	const $ul_sel = document.querySelector('#'+$sel.dataset.ul_id)

	$ul_sel?.querySelectorAll(`li[data-value]`).forEach($e => {
		$e.style.display = 'none'
		if ('first' in $e.dataset) {
			$e.style.display = 'list-item'
			$ul_sel.insertAdjacentElement('afterbegin', $e)
		}
	})
}

const tooltiping = (tooltiping_map, pos='bottom', adjx=0, adjy=0) => ($opt, $li) => {
	$li.dataset.tooltipText = $opt.textContent
	const attr = document.createAttribute(`data-tooltip-${pos}`)
	$li.setAttributeNode(attr)
	$li.classList.add('tooltip')
	tooltip($li, adjx, adjy)
	return `<img src="/icon/${tooltiping_map[$opt.value]}.svg">`
}

export function ul_select_iconset($select, val_svg_map) {
	const $ul = ul_select($select, tooltiping(val_svg_map), {'class': 'icon-button-set', 'handle_select': false})
	$ul.addEventListener('click', evt => {
		if(evt.target === $ul) return
		$ul.querySelectorAll('li[data-value][class~=active]').forEach($e => $e.classList.remove('active'))
		evt.target.classList.toggle('active')
	}, true) //The event propagation mode determines the order in which elements receive the event. 
	// is intercepted in capturing phase

	return $ul
}
