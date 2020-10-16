import { ui_fragment } from '../dom.js';
import { wrap } from '../drawer.js';
import { group, ungroup, ungroup_all } from '../user_action/group.js';
import { front, back } from '../user_action/front_back.js';
import { mirror_h, mirror_v } from '../user_action/mirror.js';
import { add_rect, add_circle, add_line } from '../user_action/add.js';
import {
  masking,
  clipping,
  pathing,
  pathing_side,
} from '../user_action/mask_clip_path.js';

const tpl = `<section class="vertical-align">
	<label>Mască, decupare</label>
	<button id="masking">Maschează</button>
	<button id="cliping">Decupare formă</button>
	<button id="pathing">Atașează text</button>
	<button id="pathing_side">Schimbă partea</button>
</section>`;
export const $ui = wrap(ui_fragment(tpl), 'mask-clip-path', 'Combinare');

export const $masking = $ui.querySelector('#masking');
export const $cliping = $ui.querySelector('#cliping');
export const $pathing = $ui.querySelector('#pathing');
export const $pathing_side = $ui.querySelector('#pathing_side');

$masking.addEventListener('click', masking);
$cliping.addEventListener('click', clipping);
$pathing.addEventListener('click', pathing);
$pathing_side.addEventListener('click', pathing_side);
