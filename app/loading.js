let $bkg = document.querySelector('#bkg_modal');
// hide all: background and spinning
function done(fn) {
  if (fn instanceof Function) fn();
  $bkg.classList.remove('on');
  $bkg.classList.remove('loading-off');
}

// hide just spinning
function stop(fn) {
  if (fn instanceof Function) fn();
  $bkg.classList.add('loading-off');
}

let fn_onclick;

export function loading(onclick) {
  if (!$bkg) {
    $bkg = document.createElement('div');
    $bkg.id = 'bkg_modal';
    done();
    document.querySelector('body').appendChild($bkg);
  }

  // remove prev registered click handler
  $bkg.removeEventListener('click', fn_onclick);
  fn_onclick = onclick instanceof Function ? () => done(onclick) : done;
  $bkg.addEventListener('click', fn_onclick);

  $bkg.classList.add('on');

  return [done, stop];
}
