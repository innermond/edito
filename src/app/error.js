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

	if (note instanceof Function) note = note($target.value);
  if (err === null && note) err = new Error(note);
  // cut any happy execution
  throw err;
}

export function clear($target) {
  $target?.classList.remove('notify');
  $target.RemoveTooltip?.call();
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

// catch eror from sync
export function Xcatch(fn_catch, fn, ...args) {
  return (evt = null) => {
    if (evt) {
      evt.preventDefault();
    }
    try {
      !args ? fn() : fn(...args);
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
	// add handler once
	if (!$target.dataset.notifyErrorFocusin) {
		$target.addEventListener('focusin', (evt) => clear(evt.target));
		$target.dataset.notifyErrorFocusin = true;
	}
  $target.addEventListener('focusin', () => clear($target));
  return Ycatch((err) => Notify($target, message, err), ...fn);
}

export function xcatch($target, note, ...fn) {
	// add handler once
	if (!$target.dataset.notifyErrorFocusin) {
		$target.addEventListener('focusin', (evt) => clear(evt.target));
		$target.dataset.notifyErrorFocusin = true;
	}
	
	// is run after run_fn is called
	const catch_fn = (err) => Notify($target, note, err);

	let run_fn = ()=>{};
	let args = [];
	switch (fn.length) {
		case 0:
		break;
		case 1:
			run_fn = fn.pop();
		break;
		default:
			[run_fn, args] = fn;
	}
	const prepared_run_fn = (params) => {
		// note can be a before / check function
		if (note instanceof Function) {
			// copy function here
			prepared_run_fn.note_call = note;
		}
		// overwrite note for catch_fn
		note = prepared_run_fn.note_call?.call(null, $target.value);
		if (note !== false) {
			throw new Error(note);
		}
		run_fn(params);
	};

	// make func
	const composed_fn = Xcatch(
		catch_fn,	
		prepared_run_fn,
		args,
	);
	
	return composed_fn;
}

export const hideNote = () => {
  document.querySelectorAll('[data-note]')?.forEach(($note) => {
    const $target = document.querySelector(`[data-tooltip-id=${$note.id}]`);
    if (!$target) return;

    $target.HideTooltip();
  });
};
