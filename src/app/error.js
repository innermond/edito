import { tooltip } from './tooltip.js';

export function Notify(dat, note = 'A avut loc o eroare!', err = null) {
  let iter = [];
  const are_manny = Array.isArray(dat);
  if (are_manny) {
    iter = dat;
  } else {
    iter.push([dat, note]);
  }
  let notes = [];
  iter.forEach(([$target, note]) => {
    if ($target) {
      clear($target);
      $target.classList.add('notify');
      $target.dataset.tooltipBottom = true;
      const $note = tooltip($target);
      const $attr = document.createAttribute('data-note');
      $note.setAttributeNode($attr);
      let errnote = note;
      if (note instanceof Function) {
        if (err === null) {
          errnote = note($target.value);
        } else {
          errnote = note(err);
        }
      }
      $note.textContent = errnote;
      notes.push(errnote);
      $note.style.backgroundColor = 'orange';
      $note.style.color = 'black';
      $note.Show();
    }
  });

  if (err === null && notes.length > 0) err = new Error(notes);
  // cut any happy execution
  throw err;
}

export const check = (fn, message) => {
  return (val) => {
    if (val instanceof MessageError) {
      return val.message;
    }
    if (val instanceof Error) {
      return message;
    }
    const ret = fn(val);
    if (typeof ret === 'string') return ret;
    return false;
  };
};

export function clear($target) {
  $target?.classList.remove('notify');
  $target.RemoveTooltip?.call();
  $target.ShowValue?.call(null, false);
}

export class MessageError extends Error {
  constructor(...args) {
    super(...args);
  }
}

// catch eror from async
export function Ycatch(fn_catch, fn, ...args) {
  return async (evt = null) => {
    if (evt) evt.preventDefault();
    try {
      if (args.length === 0) {
        await fn();
      } else {
        await fn(...args);
      }
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
      evt.target.ShowValue?.call();
      !args ? fn() : fn(...args);
      evt.target.UseExistentShowValue?.call(evt.target, false);
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

export function ycatch($target, note, ...fn) {
  // add handler once
  if (!$target.dataset.notifyErrorFocusin) {
    $target.addEventListener('focusin', (evt) => clear(evt.target));
    $target.dataset.notifyErrorFocusin = true;
  }

  // is run after run_fn is called
  const catch_fn = (err) => {
    if (Array.isArray(err)) {
      Notify(err);
    } else {
      Notify($target, note, err);
    }
  };

  let run_fn = () => {};
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

  const prepared_run_fn = async (params) => {
    // clear posible error visual hints
    if (Array.isArray($target)) {
      $target.forEach(([$t, _]) => clear($t));
    } else {
      clear($target);
    }
    if (note instanceof Function) {
      const mayerror = note($target.value);
      if (mayerror !== false) throw new MessageError(mayerror);
    }
    await run_fn(params);
  };

  // make func
  const composed_fn = Ycatch(catch_fn, prepared_run_fn, args);

  return composed_fn;
}

export function xcatch($target, note, ...fn) {
  // add handler once
  if (!$target.dataset.notifyErrorFocusin) {
    $target.addEventListener('focusin', (evt) => clear(evt.target));
    $target.dataset.notifyErrorFocusin = true;
  }

  // is run after run_fn is called
  const catch_fn = (err) => {
    if (Array.isArray(err)) {
      Notify(err);
    } else {
      Notify($target, note, err);
    }
  };

  let run_fn = () => {};
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
    // clear posible error visual hints
    if (Array.isArray($target)) {
      $target.forEach(([$t, _]) => clear($t));
    } else {
      clear($target);
    }
    // note can be a before / check function
    if (note instanceof Function) {
      const mayerror = note($target.value);
      if (mayerror !== false) throw new MessageError(mayerror);
    }
    run_fn(params);
  };

  // make func
  const composed_fn = Xcatch(catch_fn, prepared_run_fn, args);

  return composed_fn;
}

export const hideNote = () => {
  document.querySelectorAll('[data-note]')?.forEach(($note) => {
    const $target = document.querySelector(`[data-tooltip-id=${$note.id}]`);
    if (!$target) return;

    $target.HideTooltip();
  });
};
