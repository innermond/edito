import { tooltip } from './tooltip.js';

export function Notify(err, $target, note='A avut loc o eroare!') {
 if ($target) {
	clear($target);
	$target.classList.add('notify');
 $target.dataset.tooltipBottom = true;
	const $note = tooltip($target);
	$note.textContent = note;
	$note.style.backgroundColor = 'orange';
	$note.style.color = 'black';
	$note.Show();
 }
  // cut any happy execution
  throw err;
}

function clear($target) {
	$target.classList.remove('notify');
	const id = $target.dataset.tooltipId;
	if (id) {
		document.getElementById(id)?.remove();
	}
}

// catch eror from async
export function Ycatch(fn, args, fn_catch) {
  return async () => {
    try {
      !args ? await fn() : await fn(...args);
    } catch (e) {
      if (!fn_catch) fn_catch = console.log;
      if (fn_catch instanceof Function) fn_catch(e);
    }
  };
}
