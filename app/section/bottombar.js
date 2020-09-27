import { ui_fragment } from '../dom.js';
import { zoom_reset } from '../zoom.js';
import { $bleed } from '../ui.js';
import { render_image } from '../save.js';
import { deleting, cloning, locking } from '../user_action/del_undel_clone.js';
import { tooltip } from '../tooltip.js';
import { $zoom_is_edit } from '../floater/zoom.js';
import { apply_last_patch, with_undo, redo } from '../idb.js';
import { with_loading_after, loading } from '../loading.js';

const tpl = `<section id="bottom-bar">
		<p id="group_repr"></p>
    <button class="tooltip" data-tooltip-text="Blochează/deblochează obiectul/selecția" data-tooltip-bottom id="lock"><img src="/icon/lock.svg"></button>
    <button class="tooltip" data-tooltip-text="Renunță la modificări" data-tooltip-bottom id="undo"><img src="/icon/undo.svg"></button>
    <button class="tooltip" data-tooltip-text="Refaci modificările" data-tooltip-bottom id="redo"><img src="/icon/redo.svg"></button>
    <button id="delete_element" class="tooltip" data-tooltip-text="Șterge elementul" data-tooltip-bottom><img src="/icon/delete.svg"></button>
    <button id="clone_element" class="tooltip" data-tooltip-text="Clonează elementul" data-tooltip-bottom><img src="/icon/copy.svg"></button>
    <button id="prev_svg" class="tooltip" data-tooltip-text="Previzualizează documentul" data-tooltip-bottom><img src="/icon/preview.svg"></button>
    <button id="send_svg" class="tooltip" data-tooltip-text="Comandă" data-tooltip-bottom><img src="/icon/order.svg"></button>
</section>`;

export const $ui = ui_fragment(tpl);

$ui.querySelectorAll('[class~="tooltip"]')?.forEach(($e) => {
  tooltip($e);
});

const $lock = $ui.querySelector('#lock');
$lock.addEventListener('click', with_undo(locking, true));

export const $group_repr = $ui.querySelector('#group_repr');

export const $delete_element = $ui.querySelector('#delete_element');
$delete_element.addEventListener('click', with_undo(deleting));

const deleting_undo = with_undo(deleting);
document.addEventListener('keyup', (evt) => {
  if (evt.key === 'Delete') deleting_undo();
});

export const $clone_element = $ui.querySelector('#clone_element');
$clone_element.addEventListener('click', with_undo(cloning));

export const $prev_svg = $ui.querySelector('#prev_svg');
export const $send_svg = $ui.querySelector('#send_svg');

$prev_svg.addEventListener('click', async () => {
  let func = null;
  if (!$zoom_is_edit.checked) func = ($svg_clone) => zoom_reset($svg_clone);

  const [, stop] = loading(() =>
    document
      .querySelectorAll('div[class~=preview]')
      .forEach(($d) => $d.remove()),
  );
  await render_image(1, 0, false, func, stop);
});

$send_svg.addEventListener('click', async () => {
  let func = null;
  if (!$zoom_is_edit.checked) func = ($svg_clone) => zoom_reset($svg_clone);
  const dpi_scale = 300 / 72; // scale rendered image suposedly produced native at 72 dpi as much as needed to be printed at 300 dpi
  const [done] = loading();
  await render_image(dpi_scale, $bleed.value, true, func, () => {
    done();
    document
      .querySelectorAll('div[class~=preview]')
      .forEach(($d) => $d.remove());
  });
});

const $undo = $ui.querySelector('#undo');
$undo.addEventListener('click', with_loading_after(apply_last_patch, 50));

const $redo = $ui.querySelector('#redo');
$redo.addEventListener('click', with_loading_after(redo, 50));
