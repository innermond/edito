import { tooltip } from './tooltip.js';

export function Notify($target, note = 'A avut loc o eroare!', err = null) {
  if ($target) {
    clear($target);
    $target.classList.add('notify');
    $target.dataset.tooltipBottom = true;
    const $note = tooltip($target);
		const $attr = document.createAttribute('data-note');
		$note.setAttributeNode($attr);
    $note.textContent = note;
    $note.style.backgroundColor = 'orange';
    $note.style.color = 'black';
    $note.Show();
  }

  if (err === null) err = new Error(note);
  // cut any happy execution
  throw err;
}

function clear($target) {
  $target?.classList.remove('notify');
	$target.Unshow?.call()
}

// catch eror from async
export function Ycatch(fn_catch, fn, ...args) {
  return async (evt = null) => {
    if (evt) {
      evt.preventDefault();
    }
    try {
      !args ? await fn() : await fn(...args);
    } catch (e) {
      if (!fn_catch) fn_catch = console.log;
      if (fn_catch instanceof Function) {
        // Notify in order to cut happy path
        // is (re)throwing
        // so catch it here
        try {
          fn_catch(e);
        } catch (e) {
          console.log(e);
        }
      }
    }
  };
}

export function ycatch($target, message, ...fn) {
  return Ycatch((err) => Notify($target, message, err), ...fn);
}

export const hideNote = () => {
	document.querySelectorAll('[data-note]')?.forEach(($note) => {
		const $target = document.querySelector(`[data-tooltip-id=${$note.id}]`);
		if (!$target) return;

		$target.Unshow();
		$target.classList.remove('notify');
	})
};
