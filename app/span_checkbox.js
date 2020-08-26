import { newtag_html } from "./dom.js";

export function span_checkbox($ee) {
  $ee.forEach(($e) => {
    if ($e?.type !== "checkbox") return;

    const $span = newtag_html("span");
    if ($e.classList.contains("tooltip")) {
      $e.classList.toggle("tooltip");
      $span.classList.add("tooltip");
      if ("tooltipText" in $e.dataset) {
        $span.setAttribute("data-tooltip-text", $e.dataset.tooltipText);
      }
      if ("tooltipBottom" in $e.dataset) {
        const attr = document.createAttribute(`data-tooltip-bottom`);
        $span.setAttributeNode(attr);
      } else if ("tooltipTop" in $e.dataset) {
        const attr = document.createAttribute(`data-tooltip-top`);
        $span.setAttributeNode(attr);
      }
    }
    $e.parentNode.insertBefore($span, $e.nextElementSibling);

    $e.dataset.proxy = "#" + $span.id;

    $span.addEventListener("click", (evt) => {
      const val = $span.dataset.value;
      if (val === "1") {
        $span.dataset.value = "0";
        $e.checked = false;
      } else {
        $span.dataset.value = "1";
        $e.checked = true;
      }
      $e.dispatchEvent(new Event("change"));
      evt.preventDefault();
    });
    $span.addEventListener("mousedown", (evt) => {
      $e.dispatchEvent(new Event("mousedown"));
      evt.preventDefault();
    });
  });
}
