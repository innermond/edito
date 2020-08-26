import { $svg } from "./dom.js";

// history
const is_ant = ($e) => {
  const is =
    $e.dataset.ants === "true" ||
    $e.dataset.rect === "true" ||
    $e.dataset.selectangle === "true";

  return is;
};

let MM = [];
export const history = [];
let history_capacity = 10;
export const historic = new MutationObserver((mm) => {
  MM = mm;
});

$svg.addEventListener("mouseup", (evt) => {
  //console.log(MM)
  const batch = [];
  MM.forEach((m) => {
    if (!m) return;
    if (is_ant(m.target)) return;
    //console.log(m.type)
    switch (m.type) {
      case "childList":
        m.addedNodes.forEach(($e) => {
          if (is_ant($e)) return;
          //console.log('added', m)
          batch.push(m);
        });
        m.removedNodes.forEach(($e) => {
          if (is_ant($e)) return;
          //console.log('removed', m)
          batch.push(m);
        });
        break;
      case "attributes":
        if (is_ant(m.target)) break;
        //console.log(m, m.target, m.oldValue)
        batch.push(m);
        break;
    }
  });

  if (batch.length === 0) return;

  history.push(batch);
  const d = history.length - history_capacity;
  if (d > 0) history.splice(0, d);
  //console.log(history)
});

export const connect = () =>
  historic.observe($svg, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
    attributeOldValue: true,
    characterDataOldValue: true,
  });
