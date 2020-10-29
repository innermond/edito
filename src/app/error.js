export function Notify(err, $target) {
  $target && $target.classList.add('notify');

  // cut any happy execution
  throw err;
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
