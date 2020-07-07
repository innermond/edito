import {ui_fragment} from '../dom.js'
import {wrap} from '../drawer.js'

const tpl = `<style>
	#category-image {
		box-sizing: border-box;
	}

	#box {
		background-color: rgba(40, 40, 190, 255);
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
		filter: blur(5px) brightness(50%);
		transition: filter 1s ease;
	}
	img.late.loaded {
		filter: blur(0px) brightness(100%) drop-shadow(0px 0px 0px black);
	}
	img.late.loaded:hover {
		filter: blur(0px)  brightness(150%) drop-shadow(0px 0px 10px black);
	}

	img[activating=true]{
		border: 1px solid red;
	}
</style>

<section class="vertical-align">
	<div id="box"></div>
</section>`

export const $ui = wrap(ui_fragment(tpl), 'category-image', 'Temă')
