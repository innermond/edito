const blankimg =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

export default function (nextnum = 1, q = '') {
  const loadimg = async (observer, $box, a, z) => {
    const opt = {
      method: 'POST',
      mode: 'same-origin',
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ a, z, q }),
    };
    try {
      let resp = await fetch('noscript.php', opt);
      const json = await resp.json();
      let url, img;
      for (let inf of json) {
        url = inf[0];
        img = new Image();
        img.classList.add('late');
        img.dataset.src =
          location.protocol + '//' + location.host + '/img/' + url;
        img.src = blankimg;
        img.width = inf[1];
        img.height = inf[2];
        let r = inf[1] / inf[2];
        $box.appendChild(img);
        let hx = parseFloat(window.getComputedStyle(img).height);
        let wx = r * hx;
        img.style.width = wx + 'px';
        img.style.height = hx + 'px';
        observer.observe(img);
      }
      if (img) img.callnext = (next) => loadimg(observer, $box, z, z + next);
    } catch (e) {
      console.log(e);
    }
  };

  const callback = (xx) => {
    xx.forEach((x) => {
      // threshold is crucial in the following reasoning
      // x leaves when it's (1-threshold)*height is outside the root
      // x enters when it's threshold*height is inside the root
      const yup = x.boundingClientRect.y < x.rootBounds.y;
      const loaded =
        x.target.src === x.target.dataset.src && x.target.complete === true;
      if (x.isIntersecting) {
        window.requestAnimationFrame(() => {
          // enters from bellow as blank image
          //if (!yup && !loaded) {
          if (!loaded) {
            x.target.onload = () => {
              if (x.target.src !== x.target.dataset.src) return;
              x.target.classList.add('loaded');
            };
            x.target.src = x.target.dataset.src;
            // enter-up
            if ('callnext' in x.target) {
              x.target.callnext(nextnum);
              delete x.target.callnext;
            }
            // enters from above as blank image
          } else if (yup && !loaded) {
            x.target.src = x.target.dataset.src;
          }
        });
        // leave to above
        //} else if (yup) {
      } else {
        window.requestAnimationFrame(() => {
          //const { height: h } = x.target;
          x.target.src = blankimg;
					// w already calculated
          //x.target.style.width = x.target.style.width;
          //x.target.style.height = h + 'px';
          x.target.onload = null;
          x.target.classList.remove('loaded');
        });
      }
    });
  };

  return [loadimg, callback];
}
