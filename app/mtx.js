// assume element is not detached from dom, has ownerSVGElement

const setm = (e, m) => {
  e.transform.baseVal.initialize(
    e.ownerSVGElement?.createSVGTransformFromMatrix(m)
  );
};

const appendm = (e, m) =>
  e.transform.baseVal.appendItem(
    e.ownerSVGElement?.createSVGTransformFromMatrix(m)
  );

const m2e = (a, e) => {
  if (!e) e = a.ownerSVGElement;
  const mtxa = a.getScreenCTM();
  return e.getScreenCTM().inverse().multiply(mtxa);
};

const m = (e) =>
  e.transform.baseVal.consolidate()?.matrix ||
  e.ownerSVGElement?.createSVGMatrix() ||
  e.createSVGMatrix();
//|| {a:1, b:0, c:0, d:1, e:0, f:0}

const get_u = (m) => {
  return Math.atan2(m.b, m.a) * (180 / Math.PI);
};

const get_scale = (m) => {
  return [Math.sqrt(m.a * m.a + m.b * m.b), Math.sqrt(+m.c * m.c + m.d * m.d)];
};

export { setm, appendm, m2e, m, get_u, get_scale };
