function toDegrees(rad) {
    return rad * (180/Math.PI);
}

function polarToCartesian(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

var color = d3.scaleOrdinal()
  .domain(["Angeling", "Poring", "Poporing", "Marin", "Magmaring", "Drops", "Metaling", "Others"])
  .range(["#d4d8d8", "#fa978e", "#c8db93", "#b0a7c1", "#f58658", "#eac699", "#ca8e8c", "#c3d7e3"])
