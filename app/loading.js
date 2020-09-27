let $bkg = document.querySelector('#bkg_modal');
const $doc = document.querySelector('body');

// hide all: background and spinning
function done(fn) {
  if (fn instanceof Function) fn();
  $bkg.classList.remove('on');
  $bkg.classList.remove('loading-off');

  if ($bkg.parentNode !== $doc) $doc.appendChild($bkg);
}

// hide just spinning
function stop(fn) {
  if (fn instanceof Function) fn();
  $bkg.classList.add('loading-off');
}

let fn_onclick;

export function loading(onclick, $host='body') {
  if (!$bkg) {
    $bkg = document.createElement('div');
    $bkg.id = 'bkg_modal';
    done();
    $host = typeof $host === 'string' ?  document.querySelector($host) : $host;
    $host.appendChild($bkg);
  }

  // remove prev registered click handler
  $bkg.removeEventListener('click', fn_onclick);
  fn_onclick = onclick instanceof Function ? () => done(onclick) : done;
  $bkg.addEventListener('click', fn_onclick);

  $bkg.classList.add('on');

  return [done, stop];
}

export function with_loading_after(fn, ms) {
	return async () => {
		let done = null;
		let peak = setTimeout(()=> {
			[done] = loading();
		}, ms);
		try {
			await fn();
		} catch (e) {
			console.log(e);
		} finally {
			if (done !== null) done();
			clearTimeout(peak);
			done = null;
		}
	}
};
