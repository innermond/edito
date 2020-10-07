import { ui_fragment } from '../dom.js';
import { wrap } from '../drawer.js';

const tpl = `<section class="vertical-align">
	<div name="box"></div>
</section>`;

export const $ui = wrap(ui_fragment(tpl), 'category-layout', 'Modele');
