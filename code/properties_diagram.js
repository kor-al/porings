class PropsDiagram {

  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;

    this.TotalMaxLvl = 4,
      this.minPropValue = -200,
      this.maxPropValue = 200,
      this.largestR = 100, //radius of the biggest circle
      this.firstR = 50,
      this.level1R = 25,
      this.arc_width = 15,
      this.OriginAngle = -Math.PI / 2,
      this.RightAngleLimit =   this.OriginAngle + Math.PI,
      this.LeftAngleLimit =   this.OriginAngle - Math.PI,
      this.helper_pad = 20,
      this.NumArcs = 3;

    // create the chart
    this.draw();
  }

  draw() {
    // define width, height and margin
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    // set up parent element and SVG
    this.element.innerHTML = '';
    const svg = d3.select(this.element).append('svg')
      .attr("text-anchor", "middle")
      .style("font", "12px sans-serif")
      .attr('width', this.width)
      .attr('height', this.height);

    // we'll actually be appending to a <g> element
    this.plot = svg.append("g")
      .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

    // // create the other stuff
    this.createScales();
    this.createDataGroup();
    this.createAxis();
  }

  createScales() {

    this.level2radius = d3.scaleLinear()
      .domain([1, this.TotalMaxLvl])
      .range([this.firstR, this.largestR]);

    this.scaleProp = d3.scaleLinear()
      .domain([this.minPropValue, this.maxPropValue])
      .range([this.LeftAngleLimit, this.RightAngleLimit]);

    this.startR = this.level2radius(this.TotalMaxLvl),
      this.endR = this.startR + (this.arc_width - 1) * Properties.length;

    this.CurMaxRadius = this.startR;

    this.scaleCircle = d3.scaleLinear()
      .domain([0, this.NumArcs])
      .range([0, 2 * Math.PI]);

    this.name2innerRadius = d3.scaleOrdinal()
      .domain(Properties)
      .range([this.startR, this.endR])

  }

  createDataGroup(){
    var graph = this.plot.append('g').attr('id', 'data_viz')

    this.arcs_graph = graph.append('g').attr('id', 'data_arcs');
    this.flower_graph = graph.append('g').attr('id', 'data_flower');
    this.helper = graph.append('g').attr('id', 'propHelper');

    this.helper.append('text')
      .attr('id', 'helper_text')
      .attr('y', this.largestR + this.helper_pad)
      .attr('x', this.largestR);

    this.helper.append('text')
      .attr('id', 'helper_max_level_text')
      .attr('y', this.largestR)
      .attr('x', this.largestR)
      .style("fill", "transparent")
  }

  createAxis(){
    this.flower_graph.append('g')
      .attr('class', 'r axis')
      .selectAll('circle')
      .data(d3.range(1, this.TotalMaxLvl + 1))
      .enter()
      .append('circle')
      .attr('r', (d, i) =>  this.level2radius(d))
      .attr('fill', "#d9d9d9")
      .attr('opacity', 1 /  this.TotalMaxLvl);
  }

  reset(){
    this.resetArcs();
    this.resetFlower();
  }

  update(data){
  this.reset()

    this.updateArcs(data);
    this.updateFlower(data);
  }


  updateFlower(data){
    var that = this;

  // data manipulation
    var MaxLvl = getMax(data, 'PropertyLevel');

    var tdata = data.map(function(d) {
      return {
        weight: 1,
        monster: d
      };
    })

    // var graph_group = graph.append('g').attr("id", "dia_graph")
    // var helper_group = graph_group.append('g').attr('id', 'propHelper');

    this.CurMaxRadius = this.level2radius(MaxLvl)

    var pie_group = this.flower_graph.append("g").attr('id', 'flower');

    var circle = pie_group.append('circle')
      .attr('r', 0).attr('cy', 0).attr('cx', 0)
      .attr("id", "circle_bkg")
      .style("fill", "transparent") // function(d,i) { return colorProp(d.data.monster.viz_group);})
      .style("stroke", "#ff9999")
      .attr('stroke-width', 2)
      .transition().duration(1000).attr('r', this.CurMaxRadius)

    var pie_arcs = this.layout_eqPie()(tdata);

    var petals = pie_group.selectAll(".petal").data(pie_arcs)
      .enter()
      .append("path")
      .attr("class", "petal")
      .attr("transform", function(d) {
        return rot((d.startAngle + d.endAngle) / 2);
      })
      //.attr("d", function(d,i) {return petalPath(d,-minR);})
      .attr("d", function(d, i) {
        if (data.length > 1) {
          return that.petalPath(d, 0);
        } else {
          return arc_R(10)(d);
        }
      })
      .style("stroke", "white")
      .attr("fill", function(d, i) {
        return colorProp(d.data.monster.PropertyName);
      })
      .on('mouseover', function(d, i) {
        d3.select(this).attr('fill', d3.hsl(colorProp(d.data.monster.PropertyName)).darker());
        that.helper.select('#helper_text')
          .text(d.data.monster.PropertyName)
          .style('fill', d3.hsl(colorProp(d.data.monster.PropertyName)).darker());
      })
      .on('mouseout', function(d, i) {
        d3.select(this).attr('fill',colorProp(d.data.monster.PropertyName));
        that.helper.select('#helper_text')
          .text("");
      });

    pie_group.transition().duration(1000)
      .attr("transform", function(d) {
        return rot(2 * Math.PI / 2);
      })

    petals.transition().duration(1000)
      .attr("d", function(d, i) {
        if (tdata.length > 1) {
          return that.petalPath(d, that.level2radius(d.data.monster.PropertyLevel));
        } else {
          return arc_R(that.level2radius(d.data.monster.PropertyLevel))(d);
        }
      })

    // helper
    this.helper.select('#helper_max_level_text').text("Max: " + MaxLvl + " Level")
      .transition().delay(500).duration(500)
      .style("fill", "#ff9999");

    var xy_maxRad = polarToCartesian(Math.PI * 1 / 4, this.CurMaxRadius);

    this.helper.append('line')
      .attr('id', 'helper_line')
      .attr('x1', xy_maxRad.x)
      .attr('y1', xy_maxRad.y)
      .attr('x2', xy_maxRad.x)
      .attr('y2', xy_maxRad.y)
      .attr('stroke-width', 2)
      .attr('stroke', "#ff9999")
      .transition().delay(500).duration(500)
      .attr('x2', polarToCartesian(Math.PI * 1 / 4, this.largestR + this.helper_pad).x)
      .attr('y2', polarToCartesian(Math.PI * 1 / 4, this.largestR + this.helper_pad).y);

  }

  updateArcs(data) {

    var that = this;
    var property_arcs_groups = this.arcs_graph.append('g').attr("class", "property_arcs")
      .selectAll(".property_arc")
      .data(data)
      .enter()
      .append("g")
      .classed('property_arc', true);
      //.attr("class", "property_arcs");

    var text_arcs_groups = this.arcs_graph.append("g").attr("class", "max_arcs")
      .selectAll(".max_arcs")
      .data(Properties)
      .enter();

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
            return that.arc_property_attr(j);
          })
          .attr('d', d3.arc())
          .attr('fill', function(value, j) {
            return colorProp(Properties[j])
          })
          .attr('opacity', 1 / data.length)
          .attr('stroke', 'white')
          .transition().duration(1000)
          .attrTween("d", function(v, j) {
            var value = this.parentNode.__data__
            var newAngle = that.scaleProp(value)
            return that.arcTween(newAngle)(v, j);
          })

      })

    // add text arc
    // length of the arc is l = PI * r * (opening angle of the arc) / 180 grad
    // as we want text to have the same length
    var text_arcs = text_arcs_groups.append("path")
      .attr('id', function(v, j) {
        return 'maxArc_' + j;
      })
      .attr('d', function(value, j) {
        return d3.arc()(that.arc_property_attr(j,
          max_values[j] >= 0 ? that.scaleProp(max_values[j]) : that.scaleProp(min_values[j]),
          max_values[j] >= 0 ? that.scaleProp(max_values[j]) + Math.PI / 5 : that.scaleProp(min_values[j]) - Math.PI / 5));
      })
      .attr('fill', 'transparent')
      .attr('stroke', 'transparent');


    var text = this.arcs_graph.append('g').attr("class", "PropText")
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
          return that.arc_width - 3;
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
      .transition().delay(1000).duration(500)
      .text(function(v, j) {
        return v
      })
      .attr('fill-opacity', 1)

  }

  resetArcs() {
    var this_arcs_graph = this.arcs_graph;

    var max_arcs = this.arcs_graph.selectAll(".max_arcs");
    var text = this.arcs_graph.selectAll(".PropText");
    var arcs =  this.arcs_graph.selectAll(".arcs");
    var prop_arcs = this.arcs_graph.selectAll(".property_arcs")
    var that = this;

    var count = 0,
    totalArcs = arcs.size();

    text.remove();

    //this_arcs_graph.selectAll("*").remove();


    arcs.each(function(d, i) {
        d3.select(this)
          .attr('d', d3.arc())
          .transition().duration(1000)
          .attrTween("d", that.arcTween(that.OriginAngle))
          .on('end', function() {
            count++;
            if (count == totalArcs) {
              console.log(count, totalArcs)
              max_arcs.remove()
              prop_arcs.remove();
            }
          })
      })
  }

resetFlower() {

    var petals = this.flower_graph.selectAll('.petal');
    var flower = this.flower_graph.selectAll('#flower');
    // const petalsNum = graph.size();

    this.helper.select('#helper_max_level_text')
    .transition().duration(200)
    .style("fill", "transparent");


    this.helper.select('#helper_line')
    .transition().duration(200)
    .attr('x2', polarToCartesian(Math.PI * 1 / 4, this.CurMaxRadius).x)
    .attr('y2', polarToCartesian(Math.PI * 1 / 4, this.CurMaxRadius).y)
    .remove();

    this.helper.select('#helper_text')
    .transition().duration(200)
    .style("fill", "transparent")

    // this.flower_graph.select('#helper_max_level_text').transition().duration(200)
    // .style("fill", "transparent");

    petals.remove();

    this.flower_graph.select('#circle_bkg').transition().duration(1000)
    .attr("r", 0)
    .on('end', function(){
      flower.remove();
    });

  }


  arcTween(newAngle) {
    var that = this;
    return function(d, j) {
      var interpolate = d3.interpolate(d.endAngle, newAngle);
      return function(t) {
        d.endAngle = interpolate(t);
        return d3.arc(that.arc_property_attr(j))(d);
      };
    };
  }


  //http://bl.ocks.org/herrstucki/6199768/23f51b97bd942f6b1b7cf0b9ba76ada4cb6d1cc7
  petalPath(d, r) {
    var angle = (d.endAngle - d.startAngle) / 2,
      s = polarToCartesian(-angle, this.level1R),
      e = polarToCartesian(angle, this.level1R),
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

  arc_property_attr(j, startA = null, endA = null) {
    return {
      cornerRadius: 14,
      innerRadius: this.startR + this.arc_width * j,
      outerRadius: this.startR + this.arc_width * j + this.arc_width,
      startAngle: startA === null ? this.OriginAngle : startA,
      endAngle: endA === null ? this.OriginAngle + 0.01 : endA,
    }
  }

  layout_eqPie() {
    function processEqPie(data) {
      var pie = d3.pie()
        .sort(null)
        .startAngle(0)
        .endAngle(0 + 2 * Math.PI)
        .padAngle(.02)
        .value(function(d) {
          return d.weight;
        })

      return pie(data);
    }
    return processEqPie;
  }

}

//
// function createPropsDiagram(targetSVG) {
//
//   const svg = d3.select(targetSVG)
//     .attr("text-anchor", "middle")
//     .style("font", "12px sans-serif");
//
//   const width = parseInt(svg.style("width")),
//     height = parseInt(svg.style("height"))
//
//   const canvas_g = svg.append("g")
//     .attr("transform", `translate(${width / 2},${height / 2})`);
//
//
//   var arcs_graph = canvas_g.append('g').attr('id', 'propArcs');
//
//   var diagram = canvas_g.append('g').attr('id', 'propDia');
//
//   // AXIS
//
//   var radialAxis = diagram.append('g')
//     .attr('class', 'r axis')
//     .selectAll('circle')
//     .data(d3.range(1, TotalMaxLvl + 1))
//     .enter()
//     .append('circle')
//     .attr('r', (d, i) => level2radius(d))
//     .attr('fill', "#d9d9d9")
//     .attr('opacity', 1 / TotalMaxLvl);
//
//   // var axialAxis = canvas_g.append('g')
//   //   .attr('class', 'a axis')
//   //   .selectAll('g')
//   //     .data(d3.range(NumArcs))
//   //     .enter().append('g')
//   //       .attr('transform', d => 'rotate(' + (toDegrees(scaleCircle(d))-90) + ')');
//
// }

//
// function updatePropDia(targetSVG, data) {
//
//   // data manipulation
//   var MaxLvl = getMax(data, 'PropertyLevel');
//
//   var tdata = data.map(function(d) {
//     return {
//       weight: 1,
//       monster: d
//     };
//   })
//
//   var graph = resetPropDia(targetSVG)
//
//   var graph_group = graph.append('g').attr("id", "dia_graph")
//   var helper_group = graph_group.append('g').attr('id', 'propHelper');
//
//   CurMaxRadius = level2radius(MaxLvl)
//
//   var pie_group = graph_group.append("g").attr('id', 'flower');
//
//   var circle = pie_group.append('circle')
//     .attr('r', 0).attr('cy', 0).attr('cx', 0)
//     .attr("id", "circle_bkg")
//     .style("fill", "transparent") // function(d,i) { return colorProp(d.data.monster.viz_group);})
//     .style("stroke", "#ff9999")
//     .attr('stroke-width', 2)
//     .transition().duration(1000).attr('r', CurMaxRadius)
//
//   var pie_arcs = layout_eqPie()(tdata);
//
//   var petals = pie_group.selectAll(".petal").data(pie_arcs)
//     .enter()
//     .append("path")
//     .attr("class", "petal")
//     .attr("transform", function(d) {
//       return rot((d.startAngle + d.endAngle) / 2);
//     })
//     //.attr("d", function(d,i) {return petalPath(d,-minR);})
//     .attr("d", function(d, i) {
//       if (data.length > 1) {
//         return petalPath(d, 0);
//       } else {
//         return arc_R(10)(d);
//       }
//     })
//     .style("stroke", "white")
//     .attr("fill", function(d, i) {
//       return colorProp(d.data.monster.PropertyName);
//     })
//     .on('mouseover', function(d, i) {
//       d3.select(this).attr('fill', d3.hsl(colorProp(d.data.monster.PropertyName)).darker());
//       d3.select('#helper_text')
//         .text(d.data.monster.PropertyName)
//         .attr('fill', d3.hsl(colorProp(d.data.monster.PropertyName)).darker());
//     })
//     .on('mouseout', function(d, i) {
//       d3.select(this).attr('fill', colorProp(d.data.monster.PropertyName));
//       d3.select('#helper_text')
//         .text("");
//     });
//
//   pie_group.transition().duration(1000)
//     .attr("transform", function(d) {
//       return rot(2 * Math.PI / 2);
//     })
//
//   petals.transition().duration(1000)
//     .attr("d", function(d, i) {
//       if (tdata.length > 1) {
//         return petalPath(d, level2radius(d.data.monster.PropertyLevel));
//       } else {
//         return arc_R(level2radius(d.data.monster.PropertyLevel))(d);
//       }
//     })
//
//   // helper
//
//   helper_group.append('text')
//     .attr('id', 'helper_max_level_text')
//     .attr('y', largestR)
//     .attr('x', largestR)
//     .style("fill", "transparent")
//     .text("Max: " + MaxLvl + " Level")
//     .transition().delay(500).duration(500)
//     .style("fill", "#ff9999");
//
//   helper_group.append('text')
//     .attr('id', 'helper_text')
//     .attr('y', largestR + helper_pad)
//     .attr('x', largestR)
//     .text("")
//
//
//   helper_group.append('line')
//     .attr('id', 'helper_line')
//     .attr('x1', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).x)
//     .attr('y1', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).y)
//     .attr('x2', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).x)
//     .attr('y2', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).y)
//     .attr('stroke-width', 2)
//     .attr('stroke', "#ff9999")
//     .transition().delay(500).duration(500)
//     .attr('x2', polarToCartesian(Math.PI * 1 / 4, largestR + helper_pad).x)
//     .attr('y2', polarToCartesian(Math.PI * 1 / 4, largestR + helper_pad).y);
//
//
// }
//
//
// function updatePropArcs(targetSVG, data) {
//
//   var graph = resetPropArcs(targetSVG)
//
//   var graph_group = graph.append('g').attr("id", "arc_graph")
//
//   var property_arcs_groups = graph_group.selectAll(".property_arcs")
//     .data(data)
//     .enter()
//     .append("g")
//     .attr("class", "property_arcs")
//
//
//
//   var text_arcs_groups = graph_group.append("g").attr("class", "max_arcs")
//     .selectAll(".max_arcs")
//     .data(Properties)
//     .enter()
//
//   //max values of attr
//   var max_values = Properties.map(function(p) {
//     return getMax(data, p);
//   });
//   var min_values = Properties.map(function(p) {
//     return getMin(data, p);
//   });
//
//   var property_arc = property_arcs_groups
//     .each(function(d, i) {
//       var theArcs_group = d3.select(this);
//       var prop_values = Properties.map(function(p) {
//         return +d[p];
//       })
//
//
//       var data_groups = theArcs_group.selectAll('.arcs').data(prop_values).enter().append('g');
//
//       data_groups.append("path")
//         .attr('class', 'arcs')
//         .datum(function(value, j) {
//           return arc_property_attr(j);
//         })
//         .attr('d', d3.arc())
//         .attr('fill', function(value, j) {
//           return colorProp(Properties[j])
//         })
//         .attr('opacity', 1 / data.length)
//         .attr('stroke', 'white')
//         .transition().duration(1000)
//         .attrTween("d", function(v, j) {
//           var value = this.parentNode.__data__
//           var newAngle = scaleProp(value)
//           return arcTween(newAngle)(v, j);
//         })
//
//     })
//
//   //add text arc
//   //length of the arc is l = PI * r * (opening angle of the arc) / 180 grad
//   // as we want text to have the same length
//   var text_arcs = text_arcs_groups.append("path")
//     .attr('id', function(v, j) {
//       return 'maxArc_' + j;
//     })
//     .attr('d', function(value, j) {
//       return d3.arc()(arc_property_attr(j,
//         max_values[j] >= 0 ? scaleProp(max_values[j]) : scaleProp(min_values[j]),
//         max_values[j] >= 0 ? scaleProp(max_values[j]) + Math.PI / 5 : scaleProp(min_values[j]) - Math.PI / 5));
//     })
//     .attr('fill', 'transparent')
//     .attr('stroke', 'transparent');
//
//
//   var text = graph_group.append('g').attr("class", "PropText")
//     .selectAll('text').data(Properties).enter()
//     .append("text")
//     .attr("x", function(v, j) {
//       if (max_values[j] >= 0) {
//         return 10;
//       } else {
//         return 10;
//       }
//     }) //Move the text from the start angle of the arc
//     .attr("dy", function(v, j) {
//       if (max_values[j] >= 0) {
//         return arc_width - 3;
//       } else {
//         return -4;
//       }
//     }) //Move the text from the start angle of the arc
//     .append("textPath") //append a textPath to the text element
//     //.attr("startOffset","50%")
//     .style("text-anchor", "start")
//     .attr("xlink:href", function(v, j) {
//       return "#maxArc_" + j;
//     })
//     .attr('id', function(v, j) {
//       return 'label' + j
//     })
//     .attr('fill-opacity', 0)
//     .transition().delay(1000).duration(500)
//     .text(function(v, j) {
//       return v
//     })
//     .attr('fill-opacity', 1)
//
// }
//
// function arcTween(newAngle) {
//   return function(d, j) {
//     var interpolate = d3.interpolate(d.endAngle, newAngle);
//     return function(t) {
//       d.endAngle = interpolate(t);
//       return d3.arc(arc_property_attr(j))(d);
//     };
//   };
// }
//
//
// //http://bl.ocks.org/herrstucki/6199768/23f51b97bd942f6b1b7cf0b9ba76ada4cb6d1cc7
// function petalPath(d, r) {
//   var angle = (d.endAngle - d.startAngle) / 2,
//     s = polarToCartesian(-angle, level1R),
//     e = polarToCartesian(angle, level1R),
//     //r = minR + r,//size(d.data.size),
//     m = {
//       x: r,
//       y: 0
//     },
//     c1 = {
//       x: r / 2,
//       y: s.y
//     },
//     c2 = {
//       x: r / 2,
//       y: e.y
//     },
//     c3 = {
//       x: (r) / 2,
//       y: 0
//     };
//   return "M0,0L" + s.x + "," + s.y + "Q" + c1.x + "," + c1.y + " " + m.x + "," + m.y + "L" + m.x + "," + m.y + "Q" + c2.x + "," + c2.y + " " + e.x + "," + e.y + "Z";
//
// }
//
//
// function resetPropArcs(targetSVG) {
//
//   var graph = d3.select(targetSVG).select('#propArcs');
//
//   // remove previous lines
//   remove_arcs(graph);
//
//
//   return graph;
// }
//
// function resetPropDia(targetSVG) {
//
//   var graph = d3.select(targetSVG).select('#propDia');
//
//   // remove previous lines
//   removePropDia(graph);
//
//   return graph;
// }
//
//
// function removePropDia(graph_selection) {
//
//   var graph = graph_selection.selectAll("#dia_graph");
//
//   if (!graph.size()){
//     return;
//   }
//
//   var petals = graph.selectAll('.petal');
//   const petalsNum = graph.size();
//
//   var helper_line = graph.select('#helper_line');
//
//
//   helper_line
//   .transition().duration(500)
//   .attr('x2', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).x)
//   .attr('y2', polarToCartesian(Math.PI * 1 / 4, CurMaxRadius).y)
//   .remove();
//
//   graph.select('#helper_max_level_text').transition().duration(200)
//   .style("fill", "transparent");
//
//   petals.remove();
//
//   graph.select('#circle_bkg').transition().duration(1000)
//   .attr("r", 0)
//   .on('end', function(){
//     graph.remove();
//   });
//
// }
//
//
// function remove_arcs(graph_selection) {
//
//   var graph = graph_selection.selectAll("#arc_graph");
//   var max_arcs = graph_selection.selectAll(".max_arcs");
//   var text = graph_selection.selectAll(".PropText");
//
//   var arcs = graph_selection.selectAll(".arcs");
//
//   var count = 0,
//     totalArcs = arcs.size();
//
//   text.remove();
//
//   arcs.each(function(d, i) {
//     d3.select(this)
//       .attr('d', d3.arc())
//       .transition().duration(1000)
//       .attrTween("d", arcTween(OriginAngle))
//       .on('end', function() {
//         count++;
//         if (count == totalArcs) {
//           graph.remove();
//         }
//       })
//   })
//
// }
