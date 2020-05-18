import {newtag_html} from './dom.js'

export function ul_select($select, opt_func=val=>val) {
	// create select like
	const $ul = newtag_html('ul', {'class': 'folded'})
	$select.dataset.ul_id = $ul.id
	Array.from($select.children).forEach($opt => {
		const $li = document.createElement('li')
		$li.dataset.value = $opt.value
		// add li with customised 
		$li.innerHTML = opt_func($opt.value)
		$ul.appendChild($li)
	})
	// implement select like behaviour
	Array.from($ul.children).forEach($li =>
		$li.addEventListener('click', handle_ul_select($ul, $e => {
			$select.value = $e.dataset.value
			$select.dispatchEvent(new Event('change'));
		})))
	// insert after replaced native select
	$select.parentNode.insertBefore($ul, $select.nextSibling)
}

function handle_ul_select($ul, func) {
	const $ll = Array.from($ul.children)
	let $first = $ul.querySelector('li:first-child')
	const attr = document.createAttribute('data-first')
	$first.setAttributeNode(attr)
	return evt => {
		$ll.forEach($el => {
			let isFirst = ($el == $first)
			let isClicked = $el == evt.target
			if (!isClicked && !isFirst) {
				$el.style.display=='list-item'?  $el.style.display='none':$el.style.display='list-item'
			} else if (isClicked && !isFirst){
				$ul.prepend($el)
				//$first.style.display='none'
				$el.style.display='list-item'
				func($el)
			} else if (isClicked && isFirst) {
				$first.style.display = 'list-item'
			}else if (!isClicked && isFirst){
				$first.style.display = 'none'
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
			$ul_sel.prepend($e)
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
			$ul_sel.prepend($e)
		}
	})
}
