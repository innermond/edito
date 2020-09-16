import { $clicked } from '../selection/index.js';
import {newtag} from '../dom.js';
import { add_text } from '../user_action/add.js';
import { aligning_text } from '../user_action/font/align.js';
import { load_font } from '../user_action/font/fontface.js';
import {
  styling_text,
  case_text,
  spacing_text,
  spacing_lines_text,
} from '../user_action/font/style.js';
import { sizing_text } from '../user_action/font/size.js';
import { ui_fragment } from '../dom.js';
import { ul_select } from '../ul_select.js';
import { wrap } from '../drawer.js';
import { addEventListenerUndo, add_patch, with_undo } from '../idb.js';

const tpl = `<section class="vertical-align">
	
		<button id="add-text-btn">Adaugă text nou</button>

			<label>Text</label>
			<div contenteditable="true" aria-autocomplete="none" spellcheck="false" id="textname" class="textarea"></div>

			<label>Aliniere</label>
			<ul id="text-features" class="icon-button-set">
					<li data-align="l" class="tooltip" data-tooltip-text="Aliniază la stanga, pentru că stanga este o directie foarte buna" data-tooltip-bottom><img src="/icon/align-left.svg"></li>
					<li data-align="c" class="tooltip" data-tooltip-text="Aliniază la centru" data-tooltip-bottom><img src="/icon/align-center.svg"></li>
					<li data-align="r" class="tooltip" data-tooltip-text="Aliniază la dreapta" data-tooltip-bottom><img src="/icon/align-right.svg"></li>
					<li data-case="true" class="tooltip" data-tooltip-text="Caz text" data-tooltip-bottom><img src="/icon/uppercase.svg"></li>
					<li data-style="italic" class="tooltip" data-tooltip-text="Înclină text" data-tooltip-bottom><img src="/icon/italic.svg"></li>
					<li data-style="bold" class="tooltip" data-tooltip-text="Bolduiește text" data-tooltip-bottom><img src="/icon/bold.svg"></li>
			</ul>
		
		<label for="fonts">Font</label>
		<select id="fonts" style="display:none">
				<option>Alege un font...</option>
				<option value="Roboto">Roboto</option>
				<option value="Trade Winds">Trade Winds</option>
				<option value="Lacquer">Lacquer</option>
				<option value="Lobster">Lobster</option>
				<option value="Krona One">Krona One</option>
				<option value="Fira Code">Fira Code</option>
				<option value="Fira Mono">Fira Mono</option>
				<option value="Ubuntu Mono">Ubuntu Mono</option>
		</select>
		
		<label for="font-size">Mărime font</label>
		<input class="tooltip" data-tooltip-text="Mărime font in puncte" data-tooltip-bottom type="range" min="7" max="300" value="10" step="1" id="font-size">
			
		<label for="word-spacing">Spațiere cuvinte</label>
		<input class="tooltip" data-tooltip-text="Modifici spațiul dintre cuvinte" data-tooltip-bottom type="range" min="-20" max="20" value="0" step="0.01" id="word-spacing">

		<label for="letter-spacing">Spațiere caractere</label>
		<input class="tooltip" data-tooltip-text="Modifici spațiul dintre caractere" data-tooltip-bottom type="range" min="-10" max="10" value="0" step="0.01" id="letter-spacing">

		<label for="line-spacing">Spațiere randuri</label>
		<input class="tooltip" data-tooltip-text="Modifici spațiul dintre randuri" data-tooltip-bottom type="range" min="0" max="12" value="1.2" step="0.01" id="line-spacing">
	</section>`;
export const $ui = wrap(ui_fragment(tpl), 'add-text', 'text');

export const $textname = $ui.querySelector('#textname');
const $add_text_btn = $ui.querySelector('#add-text-btn');

// textname before changes
let $old_textname = null;
$textname.addEventListener('keydown', (evt) => {
  $old_textname = $textname.cloneNode(true);
});
// after keydown dom modifications may occur
function onenter(ml, obs) {
  if ($old_textname === null) return;
  obs.disconnect(); 

  let keep_old = true;
  for (const m of ml) {
    if (m.addedNodes.length) {
      const just_br = Array.from(m.addedNodes).every(e => 'br' === e.nodeName.toLowerCase());
      const just_text = Array.from(m.addedNodes).every(e => ['br', '#text'].includes(e.nodeName.toLowerCase()))

      // do not allow adding nodes others than text mixed with br
      keep_old = !just_text;
      // do not allow just br
      if (just_br) keep_old = true;
      break;
    }
    if (m.removedNodes.length) {
      keep_old = false;
      break;
    }
  }
keep_old = false;
  // restore textname before adding/removing nodes
  if (keep_old) $textname.innerHTML = $old_textname.innerHTML;
  $old_textname = null;
  obs.observe($textname, { childList: true });
}

//export const observer = new MutationObserver(onenter);
//observer.observe($textname, { childList: true });

$add_text_btn.addEventListener('click', with_undo(add_text, $textname));

$textname.addEventListener('keyup', (evt) => {
  evt.stopPropagation();
	// extract content of any not-svg element
	convert_text_to_elements_and_separators(textname);

	// prepare to apply textname to svg
	const $clone = $clicked.cloneNode(true);
	$clone.innerHTML = '';
	for(const $x of $textname.childNodes) {
		$clone.appendChild($x.cloneNode(true));
	};
	console.log($clone.childNodes);
	reposition($clone); 
  
	// apply new content
	$clicked.innerHTML = $clone.innerHTML.split('<br>').join('');
  $clicked.over();
  add_patch();
});

// modify $el content to have "rows" (represented by tspan) separated by br elements
function convert_text_to_elements_and_separators($el) {
	const $tt = $el.children;
	// prevent occurence of separated elements with same id
	Array.from($el.children).forEach($c => $c.removeAttributeNS(null, 'id'));

	// find separations - assumed as div elements
	// TODO check for all valuable browsers if div tag is used to separate
	const $separator = 'div'; // legal for Chrome / Firefox
	const $last = Array.from($el.querySelectorAll($separator)).pop();
	Array.from($tt).forEach($t => {
		if (['tspan', 'br'].includes($t.nodeName.toLowerCase())) return;
		
		// now $t is a div or other element that means separation
		if ($t === $last) {
			$el.insertBefore(document.createElement('br'), $t);
			// there are more elelents after so do a separation
			if ($last.nextElementSibling !== null) $el.insertBefore(document.createElement('br'), $last.nextElementSibling);
		}

		// extract content of separation
		Array.from($t.childNodes).forEach($c => {
			$el.insertBefore($c, $t);
		})

		$t.remove()
	})

	// remove non meaningfull empty tag, mostly tspans
	Array.from($el.querySelectorAll(':empty')).filter($x => $x.nodeName.toLowerCase() !== 'br').forEach($x => $x.remove());
}

function unhtml(str) {
	const tmp = document.createElement('div');
	tmp.innerHTML = str;
	return tmp.textContent || tmp.innerText || '';
}

// paste date is brutally striped by tags
$textname.addEventListener('paste', evt => {
	evt.preventDefault();

	const paste = (evt.clipboardData || window.clipboardData).getData('text');
	const sel = window.getSelection();
	if (!sel.rangeCount) return;
	sel.deleteFromDocument();
	
	const txt = document.createTextNode(unhtml(paste));
	const range = sel.getRangeAt(0);
	range.insertNode(txt);
})

function group_elements_into_lines($cc, $sep='br') {
	const lines = [];
	let line = [];
	// makes lines as separated by br tag
	Array.from($cc).forEach($c => {
		if ($c.nodeName.toLowerCase() === $sep) {
			lines.push(line);
			line = [];
			return;
		}
		// element must be text or tspan
		// anyother is converted to text node
		const as_text = !['#text', 'tspan'].includes($c.nodeName.toLowerCase());
		if (as_text) {
			line.push(document.createTextNode($c.textContent));
		} else {
			line.push($c);
		}
	});
	if (line.length) lines.push(line);

	return lines;
}

function unposition_inside($e) {
	Array.from($e.children).forEach($c => {
		if ($c.children.length) unposition_inside($c);
		$c.removeAttributeNS(null, 'x');
		$c.removeAttributeNS(null, 'y');
	})
}

function reposition($text) {
	const $cc = $text.childNodes;
	const lines = group_elements_into_lines($cc);
	// we have lines
	// lets reposition them on y and x axis
	let prev = $text
	let prev_ystep = prev.getAttributeNS(null, 'ystep') || line_height($text);
	let prev_y = prev.getAttributeNS(null, 'y');
	let y = prev_y;  
	const y_is_number = (!isNaN(y) && y !== null);

	let prev_x = prev.getAttributeNS(null, 'x');
	let x = prev_x;
	const x_is_number = (!isNaN(x) && x !== null);
	
	for (const line of lines) {
		const just_one_element = line.length === 1 && line[0].nodeType === Node.ELEMENT_NODE;

		// consume line and collect it to $line_container
		let $line_container = newtag('tspan');
		if (just_one_element && line[0].nodeName.toLowerCase() !== '#text') $line_container = line[0];
		
		// position line as parent
		if (y_is_number && 'setAttributeNS' in $line_container) $line_container.setAttributeNS(null, 'y', y);
		if (x_is_number && 'setAttributeNS' in $line_container) $line_container.setAttributeNS(null, 'x', x);
		if ('setAttributeNS' in $line_container) $line_container.setAttributeNS(null, 'ystep', prev_ystep);

		// find a reference node to insert line
		let $before_node = line[line.length-1]?.nextElementSibling;
		while ($before_node?.nodeName.toLowerCase() === 'br') {
			$before_node = $before_node.nextElementSibling;
		}

		// compute x, y of a line
		// proces every line child
		line.forEach( 
			($e) => {
				switch ($e.nodeName.toLowerCase()){
					case '#text':
						$line_container.appendChild($e);
					break;
					default:
						unposition_inside($e);
						if (!just_one_element) {
							$e.removeAttributeNS(null, 'x');
							$e.removeAttributeNS(null, 'y');
							$line_container.appendChild($e);
						}
				}
			}
		)

		$text.insertBefore($line_container, $before_node);

		// prepare position for next line
		y = +y + prev_ystep;
		if (y === prev_y) {
			y += line_height(prev);
		}
		prev_y = y;
		x = prev_x;
	}
}

function line_height($e) {
	const css = window.getComputedStyle($e);
	let fs = css.getPropertyValue('font-size') || '16px';
	fs = parseFloat(fs);
	let lh = css.getPropertyValue('line-height') || fs*1.25;
	return lh;
}

export const $text_features = $ui.querySelector('#text-features');
$text_features.addEventListener('click', (evt) => {
  if (evt.target.dataset?.align) {
    $text_features
      .querySelectorAll('li[data-align][class~=active]')
      .forEach(($e) => $e.classList.remove('active'));
    aligning_text(evt.target.dataset?.align);
  } else if (evt.target.dataset?.style) {
    if (!evt.target.classList.contains('active')) {
      styling_text(evt.target.dataset?.style);
    } else {
      styling_text(evt.target.dataset?.style, 'normal');
    }
  } else if (evt.target.dataset?.case) {
    if (evt.target.classList.contains('active')) {
      case_text('down');
      $textname.innerHTML = $textname.innerHTML.toLowerCase();
    } else {
      case_text('up');
      $textname.innerHTML = $textname.innerHTML.toUpperCase();
    }
  }
  add_patch();
  evt.target.classList.toggle('active');
});

export const $font_size = $ui.querySelector('#font-size');
addEventListenerUndo(
  $font_size,
  'input',
  () => {
    sizing_text($font_size.value);
  },
  'mouseup',
);

export const $word_spacing = $ui.querySelector('#word-spacing');
addEventListenerUndo(
  $word_spacing,
  'input',
  () => {
    spacing_text('word-spacing', $word_spacing.value);
  },
  'mouseup',
);

export const $letter_spacing = $ui.querySelector('#letter-spacing');
addEventListenerUndo(
  $letter_spacing,
  'input',
  () => {
    spacing_text('letter-spacing', $letter_spacing.value);
  },
  'mouseup',
);

export const $line_spacing = $ui.querySelector('#line-spacing');
addEventListenerUndo(
  $line_spacing,
  'input',
  () => {
    spacing_lines_text($line_spacing.value);
  },
  'mouseup',
);

export const $fonts = $ui.querySelector('#fonts');
$fonts.addEventListener('change', with_undo(load_font, $fonts));

ul_select($fonts, ul_select.opt_fn, { class: 'folded relative' });
