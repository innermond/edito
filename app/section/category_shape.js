import { ui_fragment } from '../dom.js';
import { wrap } from '../drawer.js';

const tpl = `<style>
	.tool-drawer-scroll > section > [name=box] {
		background-color: transparent;
		transition: background-color 1s, border 1s;
		width: 100%;
		max-width: 400px;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: center;
		align-content: flex-start;
		position: relative;
		margin:0;
		padding:0;
	}
	
	img.late, body[class~=div-scroller-active] img.late.loaded:not(:hover) {
		width: 200px;
		max-width: 100%;
		height: 100%;
		flex: 0 1 auto;
		filter: grayscale(100%) brightness(150%);
		transition: filter 0.5s ease, box-shadow 0.5s ease;
	}
	img.late.loaded {
		filter: grayscale(100%) brightness(100%);
		box-shadow: 0px 0px 0px white, 0px 0px 0px white;
	}
	img.late:hover {
		filter: grayscale(0%)  brightness(150%);
		box-shadow: 0px -10px 75px white, 0px 10px 75px white;
		z-index: 2;
	}
	img.late.loaded:hover {
		background-color: white;
	}
</style>

<section class="vertical-align">
	<div name="box"></div>
</section>`;

export const $ui = wrap(ui_fragment(tpl), 'category-shape', 'Temă');
