import { add_clicking } from './click.js';
import { add_dragging } from './drag.js';
import { tooltip } from './tooltip.js';
import { span_checkbox } from './span_checkbox.js';
import { dragElement, show_hide } from './html_drag.js';
import * as error from './error.js';

import {
  $section_menubar,
  $section_properties,
  $section_add_layout,
  $section_add_shape,
  $section_text,
  $section_image,
  $section_filter,
  $section_mask_clip_path,
  $section_bottombar,
  $section_save,
} from './section/index.js';

import {
  $floater_select,
  $floater_zoom,
  $floater_move,
  $floater_geometry,
  $floater_color,
} from './floater/index.js';

import { $svg, display_none, copy_viewbox } from './dom.js';
import { zoom_reset } from './zoom.js';
import { load_fonts_of } from './user_action/font/fontface.js';
import { $textname, text_svg_html } from './ui.js';

// put after all imports else exception
// TODO understand why
import './idb.js';

const $ui = new DocumentFragment();
$ui.appendChild($section_menubar);
$ui.appendChild($section_properties);
$ui.appendChild($section_filter);
$ui.appendChild($section_mask_clip_path);
$ui.appendChild($section_add_layout);
$ui.appendChild($section_add_shape);
$ui.appendChild($section_text);
$ui.appendChild($section_image);
$ui.appendChild($section_bottombar);
$ui.appendChild($section_save);

$ui.appendChild($floater_select);
$ui.appendChild($floater_zoom);
$ui.appendChild($floater_move);
$ui.appendChild($floater_geometry);
$ui.appendChild($floater_color);

// here $ui is gone into document
const $ed = document.querySelector('#editor');
$ed.appendChild($ui);
$svg.style.width = '100%';
$svg.style.height = '100%';

// here we start
function main() {
  add_clicking();
  add_dragging();

  document.querySelectorAll('.movable').forEach(($e) => {
    dragElement($e);
    $e.querySelectorAll('.wrap-row > div > label').forEach(($el) =>
      show_hide($el),
    );

    $e.dataset.display = $e.style.display;
    $e.style.display = 'none';

    const $img = $e.querySelector('img[class~="close"]');
    $img?.addEventListener('click', (evt) => {
      const $el = evt.target.closest('section');
      if ($el) {
        display_none($el);
        const qry = `[data-panel="${$el.id}"]`;
        const $remote = document.querySelector(qry);
        $remote.classList.toggle('active');
      }
    });

    const $kk = $e.querySelectorAll('[type=checkbox][class~=switch]');
    span_checkbox($kk);

    $e.querySelectorAll('[class~="tooltip"]')?.forEach(($e) => {
      tooltip($e);
    });

    $e.querySelectorAll('input[type=range]')?.forEach(($e) =>
      $e.addEventListener('mousedown', (evt) => evt.stopPropagation()),
    );
  });
  document.querySelector('#canvas').style.opacity = 1;
  // assure viewbox is ok
  const vbox = $svg.viewBox.baseVal;
  if (vbox.width === 0) vbox.width = $svg.width.baseVal.value;
  if (vbox.height === 0) vbox.height = $svg.height.baseVal.value;
  zoom_reset.viewbox = copy_viewbox($svg.viewBox);

  // cycle through svg and load all fonts found
  load_fonts_of($svg);

  // a lone click on document surface is a sign to close all floaters ans sections activated
  // and all rectangle selections on svg
  // and all error notes
  $ed.addEventListener('click', (evt) => {
    if (document.body.classList.contains('div-scroller-outside')) {
      document.body.classList.remove('div-scroller-outside');
      return;
    }
    if (evt.target !== $ed) return;
    const $ll = $ed.querySelectorAll('li[class~=active]');
    $ll.forEach(($li) => {
      $li.click();
    });

    $svg
      .querySelectorAll('[data-ants=true],[data-selectangle=true]')
      .forEach(($ant) => $ant.remove());

    document
      .querySelectorAll('.tooltip-text.active')
      ?.forEach(($note) => $note.classList.remove('active'));
  });

  // all texts on mouseup update text html element
  $svg.addEventListener('mouseup', (evt) => {
    const $el = evt.target.closest('text');
    if ($el === null || $el.nodeName.toLowerCase() !== 'text') return;
    text_svg_html($el, $textname);
  });
}

try {
  main();
} catch (e) {
  console.log(e);
}
