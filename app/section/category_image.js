import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'

const tpl = `<style>
	#category-image {
		box-sizing: border-box;
	}

	#box {
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
	
	img.late {
		max-width: 100%;
		height: 150px;
		max-height: 150px;
		flex: 0 1 auto;
		filter: grayscale(100%) blur(10px) brightness(50%);
		transition: filter 1s ease, box-shadow 1s ease;
	}
	img.late.loaded {
		filter: grayscale(100%) blur(0px) brightness(100%);
		box-shadow: 0px 0px 0px white, 0px 0px 0px white;
	}
	img.late.loaded:hover {
		filter: grayscale(0%) blur(0px)  brightness(150%);
		box-shadow: 0px -10px 75px white, 0px 10px 75px white;
		z-index: 2;
	}

	img[activating=true]{
		border: 1px solid red;
	}
</style>

<section class="vertical-align">
	<div id="box"></div>
</section>`

export const $ui = wrap(ui_fragment(tpl), 'category-image', 'Temă')
