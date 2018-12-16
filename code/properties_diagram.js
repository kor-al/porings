const TotalMaxLvl = 4,
  minPropValue = -200,
  maxPropValue = 200,
  largestR = 100, //radius of the biggest circle
  firstR = 50,
  arc_width = 15,
  OriginAngle = -Math.PI / 2,
  RightAngleLimit = OriginAngle + Math.PI,
  LeftAngleLimit = OriginAngle - Math.PI;


const Properties = ["Holy", "Fire", "Water", "Ghost", "Earth", "Shadow", "Undead", "Poison", "Neutral"];

var level2radius = d3.scaleLinear()
  .domain([1, TotalMaxLvl])
  .range([firstR, largestR]);

var scaleProp = d3.scaleLinear()
  .domain([minPropValue, maxPropValue])
  .range([LeftAngleLimit, RightAngleLimit]);

const startR = level2radius(TotalMaxLvl),
  endR = startR + (arc_width - 1) * Properties.length;

var name2innerRadius = d3.scaleOrdinal()
  .domain(Properties)
  .range([startR, endR])

var color = d3.scaleOrdinal()
  .domain(Properties)
  .range(["#ff5500", "#b3f0ff", "#9999ff", "#d6d6c2", "#cccccc", "#ccffff", "#adebad", "#ff9999", "#c2d6d6"]);


function arc_R(R, r = 0) {
  return d3.arc()
    .innerRadius(r)
    .outerRadius(R);
}

function arc_property_attr(j, startA = null, endA = null) {
  return {
    cornerRadius: 14,
    innerRadius: startR + arc_width * j,
    outerRadius: startR + arc_width * j + arc_width,
    startAngle: startA === null ? OriginAngle : startA,
    endAngle: endA === null ? OriginAngle + 0.01 : endA,
  }
}
//
// // function createPropsDiagram(targetSVG) {
// //
// //   const svg = d3.select(targetSVG)
// //     .attr("text-anchor", "middle")
// //     .style("font", "12px sans-serif");
// //
// //   const width = parseInt(svg.style("width")),
// //     height = parseInt(svg.style("height"))
// //
// //   const canvas_g = svg.append("g")
// //     .attr("transform", `translate(${width / 2},${height / 2})`);
// // }
//
// function layout_eqPie() {
//   function processEqPie(data) {
//     var pie = d3.pie()
//       .sort(null)
//       .startAngle(0)
//       .endAngle(0 + 2 * Math.PI)
//       .padAngle(.02)
//       .value(function(d) {
//         return d.weight;
//       })
//
//     return pie(data);
//   }
//   return processEqPie;
// }
//


function createPropsArcs(targetSVG, data) {

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);


  var graph = canvas_g.append('g').attr('id', 'propArcs');

}


function updatePropArcs(targetSVG, data) {


  var graph = resetPropArcs(targetSVG)

  var graph_group = graph.append('g').attr("id", "arc_graph")

  var property_arcs_groups = graph_group.selectAll(".property_arcs")
    .data(data)
    .enter()
    .append("g")
    .attr("class", "property_arcs")



  var text_arcs_groups = graph_group.append("g").attr("class", "max_arcs")
    .selectAll(".max_arcs")
    .data(Properties)
    .enter()

  //max values of attr
  var max_values = Properties.map(function(p) {
    return getMax(data, p);
  });
  var min_values = Properties.map(function(p) {
    return getMin(data, p);
  });

  var property_arc = property_arcs_groups
    .each(function(d, i) {
      var theArcs_group = d3.select(this);
      var prop_values = Properties.map(function(p) {
        return +d[p];
      })


      var data_groups = theArcs_group.selectAll('.arcs').data(prop_values).enter().append('g');

      data_groups.append("path")
        .attr('class', 'arcs')
        .datum(function(value, j) {
          return arc_property_attr(j);
        })
        .attr('d', d3.arc())
        .attr('fill', function(value, j) {
          return color(Properties[j])
        })
        .attr('opacity', 1 / data.length)
        .attr('stroke', 'white')
        .transition().duration(500)
        .attrTween("d", function(v, j) {
          var value = this.parentNode.__data__
          var newAngle = scaleProp(value)
          return arcTween(newAngle)(v, j);
        })

    })

  //add text arc
  //length of the arc is l = PI * r * (opening angle of the arc) / 180 grad
  // as we want text to have the same length
  var text_arcs = text_arcs_groups.append("path")
    .attr('id', function(v, j) {
      return 'maxArc_' + j;
    })
    .attr('d', function(value, j) {
      return d3.arc()(arc_property_attr(j,
        max_values[j] >= 0 ? scaleProp(max_values[j]) : scaleProp(min_values[j]),
        max_values[j] >= 0 ? scaleProp(max_values[j]) + Math.PI / 5 : scaleProp(min_values[j]) - Math.PI / 5));
    })
    .attr('fill', 'transparent')
    .attr('stroke', 'transparent');


  var text = graph_group.append('g').attr("class", "PropText")
    .selectAll('text').data(Properties).enter()
    .append("text")
    .attr("x", function(v, j) {
      if (max_values[j] >= 0) {
        return 10;
      } else {
        return 10;
      }
    }) //Move the text from the start angle of the arc
    .attr("dy", function(v, j) {
      if (max_values[j] >= 0) {
        return arc_width - 3;
      } else {
        return -4;
      }
    }) //Move the text from the start angle of the arc
    .append("textPath") //append a textPath to the text element
    //.attr("startOffset","50%")
    .style("text-anchor", "start")
    .attr("xlink:href", function(v, j) {
      return "#maxArc_" + j;
    })
    .attr('id', function(v, j) {
      return 'label' + j
    })
    .attr('fill-opacity', 0)
    .transition().delay(500).duration(500)
    .text(function(v, j) {
      return v
    })
    .attr('fill-opacity', 1)

}

function arcTween(newAngle) {
  return function(d, j) {
    var interpolate = d3.interpolate(d.endAngle, newAngle);
    return function(t) {
      d.endAngle = interpolate(t);
      return d3.arc(arc_property_attr(j))(d);
    };
  };
}


//http://bl.ocks.org/herrstucki/6199768/23f51b97bd942f6b1b7cf0b9ba76ada4cb6d1cc7
function petalPath(d, r) {
  var angle = (d.endAngle - d.startAngle) / 2,
    s = polarToCartesian(-angle, minR),
    e = polarToCartesian(angle, minR),
    //r = minR + r,//size(d.data.size),
    m = {
      x: r,
      y: 0
    },
    c1 = {
      x: r / 2,
      y: s.y
    },
    c2 = {
      x: r / 2,
      y: e.y
    },
    c3 = {
      x: (r) / 2,
      y: 0
    };
  return "M0,0L" + s.x + "," + s.y + "Q" + c1.x + "," + c1.y + " " + m.x + "," + m.y + "L" + m.x + "," + m.y + "Q" + c2.x + "," + c2.y + " " + e.x + "," + e.y + "Z";

}


function resetPropArcs(targetSVG) {

  var graph = d3.select(targetSVG).select('#propArcs');

  // remove previous lines
  remove_arcs(graph);


  return graph;
}


function remove_arcs(graph_selection) {

  var graph = graph_selection.select("#arc_graph");
  var max_arcs = graph_selection.selectAll(".max_arcs");
  var text = graph_selection.selectAll(".PropText");

  var arcs = graph_selection.selectAll(".arcs");

  var count = 0,
    totalArcs = arcs.size();

  text.remove();

  arcs.each(function(d, i) {
    d3.select(this)
      .attr('d', d3.arc())
      .transition().duration(500)
      .attrTween("d", arcTween(OriginAngle))
      .on('end', function() {
        console.log(count, totalArcs);
        count++;
        if (count == totalArcs) {
          graph.remove();
        }
      })
  })

}
