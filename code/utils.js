function toDegrees(rad) {
    return rad * (180/Math.PI);
}

function polarToCartesian(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

function arc_R(R, r = 0) {
    return d3.arc()
      .innerRadius(r)
      .outerRadius(R);
  }


function rot(angle) {
    return "rotate(" + (angle / Math.PI * 180) + ")";
  }

function getMax(data,variable = 'PropertyLevel') {
  return d3.max(data, function(d) {return parseInt(d[variable]);});
}

function getMin(data,variable = 'PropertyLevel') {
  return d3.min(data, function(d) {return  parseInt(d[variable]);})
}


function format_value(v, keep_float = false){
  if ((v / 1000) >= 1) {
    v = Math.round(v / 1000) + "K";
  } else {
    if (!keep_float)
        v = Math.ceil(v);
  }
  return v
}


// TODO: remove this func
var group2color = d3.scaleOrdinal()
  .domain(["Angeling", "Poring", "Poporing", "Marin", "Magmaring", "Drops", "Metaling", "Others"])
  .range(["#d4d8d8", "#fa978e", "#c8db93", "#b0a7c1", "#f58658", "#eac699", "#ca8e8c", "#c3d7e3"])