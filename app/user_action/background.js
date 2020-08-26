import { $svg } from "../dom.js";

export function background_color(color) {
  $svg.setAttributeNS(null, "viewport-fill", color);
  $svg.style.backgroundColor = color;
}
