import { tooltip } from './tooltip.js';

export function Notify($target, note = 'A avut loc o eroare!', err = null) {
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

  if (err === null) err = new Error(note);
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

// TODO it doesnt work properly
export function ycatch($target, message, ...fn) {
  return Ycatch((err) => error.Notify($target, message, err), ...fn);
}

const hideNote = () => {
  const $target = document.activeElement;
  const skip = !$target.classList.contains('notify');
  if (skip) return;

  $target?.Unshow();
  $target.classList.remove('notify');
};
document.addEventListener('focusin', hideNote);
document.addEventListener('blur', hideNote);
