import { $svg, px } from '../dom.js';
import { m, setm } from '../mtx.js';
import { point_in } from '../pos.js';
import { $clicked, $selection } from '../selection/index.js';

export function handle_step(val, arrow) {
  if (!['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'].includes(arrow))
    return;

  const step = px(val);
  $selection.each(($e) => {
    let x = 0;
    let y = 0;
    switch (arrow) {
      case 'ArrowUp':
        x = 0;
        y = -step;
        break;
      case 'ArrowDown':
        x = 0;
        y = +step;
        break;
      case 'ArrowRight':
        x = +step;
        y = 0;
        break;
      case 'ArrowLeft':
        x = -step;
        y = 0;
        break;
      default:
        return;
    }
    let mtx = m($e);
    let bb = $e.getBBox();
    let $p = point_in($svg, bb.x, bb.y);
    $p = point_in($e, $p.x, $p.y);
    let x0 = $p.x,
      y0 = $p.y;
    $p = point_in($svg, bb.x + x, bb.y + y);
    $p = point_in($e, $p.x, $p.y);
    mtx = mtx.translate($p.x - x0, $p.y - y0);
    setm($e, mtx);
    $clicked.from($e);
    $clicked.over();
  });
}
