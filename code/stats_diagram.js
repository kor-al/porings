const maxR = 250, //radius of the biggest circle
  padding = 50,
  NumStats = 6,
  minStatValue = 0,
  maxStatValue = 260;

const sliceAngle = 2 * Math.PI / NumStats;
var rScale = d3.scaleSqrt().range([maxR - padding, 0]).domain([maxStatValue, 0]);

const Stats = ['Vit', 'Agi', 'Str', 'Luk', 'Int', 'Dex'];

function createStatsDiagram(targetSVG) {

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);



  var axisScale = d3.scaleLinear().range([0, maxR - padding]).domain([maxStatValue, 0]);
  //makes the axis go in the right direction

  var ticks = d3.range(10, maxStatValue + 10, 50)

  //circles grid
  //function(d, i){ return polarToCartesian(i*sliceAngle, rScale(d)).x;
  //function(d, i){ return polarToCartesian(i*sliceAngle, rScale(d)).y;

  var grid = canvas_g.append('g')

  var circle_grid = grid.selectAll('.circle_grid').data(ticks).enter().append('g')

  circle_grid.append('circle')
    .attr('class', '.circle_grid')
    .attr('fill', "#cccccc")
    .attr("opacity", 1 / NumStats)
    .attr('r', function(d, i) {
      return rScale(d);
    })
    .attr({
      cx: 0,
      cy: 0
    });

  // //add ticks
  circle_grid.append('text').attr('fill', "#cccccc")
    .attr('class', '.circle_grid')
    .attr('x', function(d, i) {
      return rScale(d) - 10
    })
    .attr('y', 0)
    .text(function(d, i) {
      return i % 2 ? '' : d
    })

  grid.selectAll('line').data(d3.range(0, NumStats)).enter()
    .append('line')
    .attr('class', 'grid')
    .attr("stroke", "#cccccc")
    .attr('x2', function(d, i) {
      return polarToCartesian(i * sliceAngle, maxR - padding).x
    })
    .attr('y2', function(d, i) {
      return polarToCartesian(i * sliceAngle, maxR - padding).y
    })
    .attr({
      x1: 0,
      y1: 0
    });

  grid.selectAll('.label').data(Stats).enter()
    .append('text')
    .attr('class', 'label')
    .attr("fill", "#cccccc")
    .attr('x', function(d, i) {
      return polarToCartesian(i * sliceAngle, maxR - 2 * padding / 3).x
    })
    .attr('y', function(d, i) {
      return polarToCartesian(i * sliceAngle, maxR - 2 * padding / 3).y
    })
    .text(function(d, i) {
      return d;
    });

  //poligons

  var graph = canvas_g.append('g').attr('id', 'statsDiagram')

  // data.forEach(function(d, i) {
  //
  //   var line0 = d3.line().x(0).y(0);
  //
  //   var line = d3.line()
  //     .x(function(s, j) {
  //       return polarToCartesian(j * sliceAngle, rScale(d[s])).x;
  //     })
  //     .y(function(s, j) {
  //       return polarToCartesian(j * sliceAngle, rScale(d[s])).y;
  //     });
  //
  //   graph.append("path")
  //     .datum(Stats.concat(Stats[0]))
  //     .attr("class", "line")
  //     .attr("d", line0)
  //     .attr("fill", color(d.viz_group))
  //     .attr("fill-opacity", fillOpacity)
  //     .on('mouseover', function(s, j) {
  //       var poly = d3.select(this)
  //       poly.raise()
  //       poly.attr('fill', color(d.viz_group))
  //       .attr("fill-opacity", 0.5)
  //       .attr("stroke", d3.hsl(color(d.viz_group)).darker())
  //     })
  //     .on('mouseout', function(s, j) {
  //       d3.select(this).attr('fill', color(d.viz_group))
  //         .attr("stroke", color(d.viz_group))
  //         .attr("fill-opacity", fillOpacity)
  //     })
  //     .transition().delay(100 * i).duration(500)
  //     .attr("d", line)
  //     .attr("stroke", color(d.viz_group))
  //     .attr('stroke-width', 1)
  // })

}


function resetStats(targetSVG) {

  var graph = d3.select(targetSVG).select('#statsDiagram');

  // remove previous lines
  remove_poly(graph);

  return graph;
}

function updateStats(targetSVG, data) {

  const fillOpacity = 1 / (data.length + 1)

  // remove previous lines
  var graph = resetStats(targetSVG);

  // draw new
  data.forEach(function(d, i) {

    var line0 = d3.line().x(0).y(0);

    var line = d3.line()
      .x(function(s, j) {
        return polarToCartesian(j * sliceAngle, rScale(d[s])).x;
      })
      .y(function(s, j) {
        return polarToCartesian(j * sliceAngle, rScale(d[s])).y;
      });

    graph.append("path")
      .datum(Stats.concat(Stats[0]))
      .attr("class", "new_line")
      .attr("d", line0)
      .attr("fill", color(d.viz_group))
      .attr("fill-opacity", fillOpacity)
      .on('mouseover', function(s, j) {
        var poly = d3.select(this)
        poly.raise()
        poly.attr('fill', color(d.viz_group))
        .attr("fill-opacity", 0.5)
        .attr("stroke", d3.hsl(color(d.viz_group)).darker())
      })
      .on('mouseout', function(s, j) {
        d3.select(this).attr('fill', color(d.viz_group))
          .attr("stroke", color(d.viz_group))
          .attr("fill-opacity", fillOpacity)
      })
      .transition().delay(100 * i).duration(500)
      .attr("d", line)
      .attr("stroke", color(d.viz_group))
      .attr('stroke-width', 1)
  })

}

function remove_poly(graph_selection){

  var polys = graph_selection.selectAll(".new_line");

  var line0 = d3.line().x(0).y(0);

  polys.transition().delay(100).duration(500).attr("d", line0);

  polys.remove();

}
