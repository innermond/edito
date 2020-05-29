import {newtag_html} from './dom.js'

export function span_checkbox($ee) {
	$ee.forEach($e => {
		if ($e?.type !== 'checkbox') return
		
		const $span = newtag_html('span')		
		$e.parentNode.insertBefore($span, $e.nextSibling)

		$e.dataset.proxy = '#'+$span.id
		
		$span.addEventListener('click', evt => {
			const val = $span.dataset.value
			if (val === '1') {
				$span.dataset.value = '0'
				$e.checked = false
			} else {
				$span.dataset.value = '1'
				$e.checked = true
			}
			$e.dispatchEvent(new Event('change'))
			evt.preventDefault()
		})
	})
}
