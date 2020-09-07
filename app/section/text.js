import { $clicked } from '../selection/index.js';
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

export const observer = new MutationObserver(onenter);
observer.observe($textname, { childList: true });

$add_text_btn.addEventListener('click', with_undo(add_text, $textname));

$textname.addEventListener('keyup', (evt) => {
  evt.stopPropagation();
  const lines = $textname.innerHTML.split('<br>').join('');
  $clicked.innerHTML = lines;
  $clicked.over();
  add_patch();
});

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
