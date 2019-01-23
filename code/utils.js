function toDegrees(rad) {
    return rad * (180/Math.PI);
}

function polarToCartesian(angle, radius) {
  return {
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius
  };
}

var group2color = d3.scaleOrdinal()
  .domain(["Angeling", "Poring", "Poporing", "Marin", "Magmaring", "Drops", "Metaling", "Others"])
  .range(["#d4d8d8", "#fa978e", "#c8db93", "#b0a7c1", "#f58658", "#eac699", "#ca8e8c", "#c3d7e3"])

const Properties = ["Holy", "Fire", "Water", "Ghost", "Earth", "Shadow", "Undead", "Poison", "Neutral"];

var colorProp = d3.scaleOrdinal()
  .domain(Properties)
  .range(["#ffb3ff", "#ffd699", "#ccf2ff", "#ccccff", "#e6ccb3", "#d1b3ff", "#ff9999", "#99ff99", "#d9e6f2"]);


function arc_R(R, r = 0) {
    return d3.arc()
      .innerRadius(r)
      .outerRadius(R);
  }

function rot(angle) {
    return "rotate(" + (angle / Math.PI * 180) + ")";
  }

// function getMax(data, var){
//   return d3.max(data, function(d) {return d[var];})
// }

function getMax(d,variable = 'PropertyLevel') {
  //max = accumulator, v = cur value
  var maxCallback = ( max, cur ) => Math.max( max, +cur[variable] );
  return +d.reduce( maxCallback, -Infinity );
  //return +data.reduce((max, v) => v[variable] > max ? v[variable] : max, data[0][variable]);
}

// function getMin(data, var){
//   return d3.min(data, function(d) {return d[var];})
// }

function getMin(d,variable = 'PropertyLevel') {
  //min = accumulator, v = cur value
  var minCallback = ( min, cur ) => Math.min( min, +cur[variable] );
  return +d.reduce( minCallback, Infinity );
}


function format_value(v, keep_float = false){
  if ((v / 1000) >= 1) {
    v = Math.ceil(v / 1000) + "K";
  } else {
    if (!keep_float)
        v = Math.ceil(v);
  }
  return v
}
