const heartMaxR = 30,
  borderMobR = largestR,
  maxAttackR = maxR,
  numPoints = 30, //# of random values of attack
  atk_padding = 30,
  MinDef = 0,
  MaxDef = 255,
  MaxLogHP = 20;


var innerScale = d3.scaleLinear().domain([MinDef, MaxDef]).range([borderMobR, heartMaxR])
//var bScale = d3.scaleLog().domain([1, 95000000]).range([0, bar_width])
var xScale = d3.scaleLinear().domain([0, MaxLogHP]).range([0, heartMaxR]);

var angleScale = d3.scaleLinear().domain([0, numPoints]).range([0, 2 * Math.PI]);

var radialAreaGenerator = d3.radialArea()
  .angle(function(d) {
    return d.angle;
  })
  .innerRadius(function(d) {
    return d.r0;
  })
  .outerRadius(function(d) {
    return d.r1;
  })
  .curve(d3.curveCatmullRomClosed.alpha(1));

var randomPoints0 = d3.range(numPoints).map(function(v) {
  return {
    r0: 0,
    r1: 0,
    angle: angleScale(v)
  }
})
var pathData0 = radialAreaGenerator(randomPoints0);

function createDamageDiagram(targetSVG) {

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  var diagram = canvas_g.append('g').attr('id', 'damageDia');

  //AXIS

  var def_ticks = innerScale.nice().ticks(3);

  var atk_grid = diagram.append('g').attr('id', 'atk_grid')
  var def_grid = diagram.append('g').attr('id', 'def_grid')
  var hp_grid = diagram.append('g').attr('id', 'hp_grid')

  atk_grid.append('line')
    .attr("stroke", "#cccccc").attr('y2', 0).attr('x2', borderMobR)
    .attr('id', 'atk_line')
    .attr('y1', 0).attr('x1', borderMobR + 100);

  atk_grid.append('text')
    .attr('fill', "#cccccc") //.attr('y', -5).attr('x', borderMobR+100)
    // .attr('id', 'atk_label')
    .attr('text-anchor', 'end')
    .attr('y', -5).attr('x', innerScale(MinDef) - 5)
    .text('Attack')



  def_grid.append('line')
    .attr("stroke", "#cccccc").attr('y2', 0).attr('x2', 0)
    .attr('y1', 0).attr('x1', innerScale(MinDef));

  // def_grid.append('circle')
  //      .attr("stroke", "#cccccc")
  //      .attr('cy', 0).attr('cx', 0)
  //      .attr('r', borderMobR).attr('fill','transparent');


  var ticks_enter = def_grid.selectAll('circle')
    .data(def_ticks.concat(MaxDef))
    .enter();

  ticks_enter.append('circle')
    .attr('r', (d, i) => innerScale(d))
    .attr('fill', "#d9d9d9")
    .attr('opacity', 1 / (def_ticks.length + 1));

  def_grid.append('text')
    .attr('fill', "#cccccc").attr('y', +15).attr('x', innerScale(MinDef) + 15)
    .text('Def')

  def_grid.selectAll('.def_ticks').data(def_ticks).enter()
    .append('text').attr('fill', "#cccccc")
    .attr('class', 'def_ticks')
    .attr('x', function(d, i) {
      return innerScale(d) - 10
    })
    .attr('y', +15)
    .text(function(d, i) {
      return d
    })

  hp_grid.append('line')
    .attr("stroke", "#cccccc")
    .attr('y2', -innerScale(MaxDef)).attr('x2', 0)
    .attr('y1', 0).attr('x1', 0);

  hp_grid.append('text').attr('fill', "#cccccc")
    .attr('x', 10)
    .attr('y', -xScale(MaxLogHP) - 5)
    .attr('id', 'maxTick')
    .attr('text-anchor', 'start')
    .text('Max');


  hp_grid.append('text').attr('fill', "#cccccc")
    .attr('x', -15)
    .attr('y', -xScale(MaxLogHP) - 5)
    .text("HP")

}

//
function updateDamageDia(targetSVG, data) {

  var maxAtk = -Infinity;
  var minAtk = Infinity;

  var limAtk = data.map(function(d) {
    var limits = +d.MaxAttack >= +d.MinAttack ? [+d.MinAttack, +d.MaxAttack] : [+d.MaxAttack, +d.MinAttack]
    maxAtk = limits[1] > maxAtk ? limits[1] : maxAtk;
    minAtk = limits[0] < minAtk ? limits[0] : minAtk;
    return {
      upLim: limits[1],
      downLim: limits[0]
    }
  })

  var maxVal = d3.max(data, function(d) {
    return +d.logHP
  });
  var minVal = d3.min(data, function(d) {
    return +d.logHP
  });

  var attackScale = d3.scaleLinear().domain([minAtk, maxAtk]).range([borderMobR, maxAttackR - atk_padding]);
  var atk_ticks = attackScale.nice().ticks(3);
  var angleScaleHP = d3.scaleLinear().domain([0, data.length]).range([0, 2 * Math.PI]);

  var graph = resetDamageDia(targetSVG)

  var graph_group = graph.append('g').attr('id', 'damage_graph');
  var atk_grid_ingraph = graph_group.append('g').attr('id', 'atk_grid_ingraph');

  function repeat(d, i) {
    if (d.logHP == maxVal) {
      var circle = d3.select(this)
      var r = xScale(d.logHP)
      circle = circle.transition()
        .duration(500)
        .attr("r", r)
        .transition()
        .duration(500)
        .attr("r", r + 3)
        .on("end", repeat);
    }
  }

  var atk_grid = d3.select('#atk_grid')

  atk_grid_ingraph.selectAll('text').data(atk_ticks).enter()
    .append('text').attr('fill', "#cccccc")
    .attr('class', 'atk_ticks')
    .attr('x', function(d, i) {
      return attackScale(d) + 10
    })
    .attr('y', -5)
    .text(function(d, i) {
      if ((d / 1000) >= 1) {
        d = d / 1000 + "K";
      }
      return d;
    });

  atk_grid.select('#atk_line')
    .transition().duration(200)
    .attr('x1', attackScale(maxAtk));

  // atk_grid.select('#atk_label')
  // .transition().duration(200)
  // .attr('x', attackScale(maxAtk+2*atk_padding))


  var HPtick = d3.select('#maxTick').text(function() {
    var v = Math.exp(maxVal)
    if ((v / 1000) >= 1) {
      v = Math.ceil(v / 1000) + "K";
    } else {
      v = Math.ceil(v);
    }
    return v;
  });

  var data_enter = graph_group.selectAll('.arc').data(data).enter()

  data_enter.append('path')
    .attr('d', function(d) {
      return arc_R(borderMobR, borderMobR).startAngle(0).endAngle(2 * Math.PI)(d)
    })
    .attr('class', 'arc')
    .attr('fill', 'darkBlue').attr('opacity', 1 / data.length)
    .transition().duration(1000)
    .attr('d', function(d) {
      return arc_R(borderMobR, innerScale(d.Def)).startAngle(0).endAngle(2 * Math.PI)(d)
    });

  data_enter.append('circle')
    .attr('r', 0)
    .transition().duration(1000)
    .attr('stroke', 'darkred')
    .attr('opacity', 1 / data.length)
    .attr('r', function(d) {
      return xScale(d.logHP)
    })
    .attr('cx', 0).attr('cy', 0)
    .attr('fill', 'transparent')
    //.attr('stroke', 'red')
    .on('end', repeat);

  limAtk.forEach(function(d, i) {
    var randomPoints = d3.range(numPoints).map(function(v) {
      return {
        r0: attackScale(d.downLim),
        r1: attackScale(d3.randomUniform(d.downLim, d.upLim)()),
        angle: angleScale(v)
      }
    })

    var pathData = radialAreaGenerator(randomPoints);

    //Create a path element
    graph_group.append('path')
      .attr('d', pathData0)
      .attr('class', 'attack_path')
      .attr('fill', 'darkred')
      .attr('opacity', function() {
        return 1 / data.length > 0.5 ? 0.5 : 1 / data.length
      })
      .transition().duration(1000)
      .attr('d', pathData);

  })





}
//
//
function resetDamageDia(targetSVG) {

  var graph = d3.select(targetSVG).select('#damageDia');

  // remove previous lines
  removeDamageDia(graph);

  return graph;
}
//
//
function removeDamageDia(graph_selection) {

  var graph = graph_selection.select('#damage_graph')

  var ticks = graph.selectAll('.atk_ticks')


  if (!graph.size()) {
    return;
  } else {

    ticks.transition().duration(100)
            .attr('fill-opacity', 0)
            .remove();


    graph.selectAll('.attack_path').transition().duration(1000)
      .attr('d', pathData0)
      .on('end', function() {
        graph.remove();
      })



    graph.selectAll('.arc')
      .transition().duration(800)
      .attr('d', function(d) {
        return arc_R(borderMobR, borderMobR).startAngle(0).endAngle(2 * Math.PI)(d)
      })
  }

}
