class DistDiagram {

  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;
    this.button_element = opts.button_element;



    this.Sizes = ['Small', 'Medium', 'Large']
    this.Choices = ['All', 'Race', 'WalkSpeed', 'Level', 'Size', 'Def', 'HP', 'PropertyName',
        "PropertyLevel", "AtkDelay"
      ],
      this.curChoice = 'All';

    this.xCenter = 0;
    this.containerH = 0,
      this.containerW = 0;
    // const minAngle, maxAngle =
    this.discrete_features = d3.set(["Size", "Race", "WalkSpeed", "DelayAfterHit", "PropertyName",
      "PropertyLevel"
    ])
    this.quant_features = d3.set(["Level", "Def", "AtkDelay", "HP"]);
    this.circleRadius = 150*0.8,
      this.circleTextPadding = 25,
      this.threshold = 0.01;
    this.grid_pad = 40;

    //create buttons
    this.createButtons();
    // create the chart
    this.draw();
  }

  draw() {
    // define width, height
    this.width = this.element.offsetWidth;
    this.height = this.element.offsetHeight;

    // set up parent element and SVG
    this.element.innerHTML = '';
    const svg = d3.select(this.element).append('svg')
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .attr('width', this.width)
      .attr('height', this.height);

    // we'll actually be appending to a <g> element
    this.plot = svg.append("g")
      .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

    // // create the other stuff
    this.createScales();
    this.createDataGroup();
    this.createGrid();
    this.start();
  }

  createScales() {
    this.rScale = d3.scalePoint().range([3, 10]).domain(this.Sizes);
    this.angleScale = d3.scalePoint().padding(0.5).range([0, 2 * Math.PI]);
    this.centerScale = d3.scalePoint().padding(3).range([-this.width / 2+this.grid_pad, this.width / 2-this.grid_pad]);
  }

  createDataGroup() {
    this.graph = this.plot.append('g').attr('id', 'data_viz')
  }

  createGrid() {
    this.grid = this.graph.append("g").attr('id', 'grid')
  }

  start() {

    this.containerH = this.height-40;
    this.containerW = this.width-40;
    var that = this;

    this.graph.append("g")
      .selectAll(".node")
      .data(this.data)
      .enter().append("circle")
      .attr('r', function(d) {
        return that.rScale(d.Size)
      })
      .attr("class", function(d) {
        return 'node ' + d.viz_group
      })
      .append("svg:title") // TITLE APPENDED HERE
      .classed('tooltip', true)
      .text(function(d) {
        return d.name;
      });

     this.node = this.graph.selectAll('.node');

    this.update('All');
    this.handleButtons();
  }

  update(choice) {

    this.curChoice = choice;

    var labels_shown = false;
    var that = this;

    var simulation = d3.forceSimulation(this.data)
      .force('charge', d3.forceManyBody().strength(5))
      .force('center', d3.forceCenter(0, 0));

    this.reset();

    if (choice == 'All') {
      simulation.force('x', d3.forceX().x(this.xCenter));

    } else {
      if (this.discrete_features.has(choice)) {
        var unique = d3.set(this.data.map(function(d) {
          return d[choice];
        })).values()

        console.log(unique)

        this.isDiscrete = true;
        this.unique = unique;
        this.angleScale.domain(unique);


        var xy_points = this.data.map(function(d) {
          return polarToCartesian(that.angleScale(d[choice]), that.circleRadius);
        })

        simulation.force('x', d3.forceX().x(function(d, i) {
            return xy_points[i].x;
          }))
          .force('y', d3.forceY().y(function(d, i) {
            return xy_points[i].y
          }))
          .force('charge', d3.forceManyBody().strength(5))
      } else {

        var unique = d3.set(this.data.map(function(d) {
          return +d[choice];
        }))
        .values()
        .sort(function(a, b) {
          return +a < +b ? -1 : +a > +b ? 1 : 0;
        }) //}d3.ascending)

        this.unique = unique;
        console.log(unique);
        this.centerScale.domain(unique);

        simulation
        .force('x', d3.forceX().x(function(d) {
          return that.centerScale(+d[choice]);
        }))
        .force('charge', d3.forceManyBody().strength(0))

        //AXIS
        // var axis = this.grid.append('g').classed('group_label', true)
        
        // axis.append('line')
        // .attr('x1', -that.containerW/2 + this.grid_margin).attr('y1', -that.containerH/2+this.grid_margin)
        // .attr('x2', that.containerW/2 - this.grid_margin).attr('y2', -that.containerH/2+this.grid_margin)
        // .style('stroke', '#cccccc')
        // .attr("stroke-width", 2);

        // axis.append("text").attr('y', -that.containerH / 2+ 2*this.grid_margin).attr('x', that.centerScale(unique[0]))
        // .text(format_value(unique[0], true))



        // var rect = this.grid.append('g').classed('group_label', true).append('rect')
        // rect = rect.attr('y', -that.containerH/2+this.grid_margin).attr('x', -that.containerW/2+this.grid_margin)
        // .attr('height', 50).attr('width', that.containerW-2*this.grid_margin)

        // var axis = d3.axisTop(this.centerScale).tickSize([0]);
        // this.grid.append('g').classed('group_label', true)
        // .attr("transform", "translate(0," + (-that.containerH/2 + this.grid_margin) + ")")
        // .call(axis);





        var ticks = unique.filter(function(d, i) {
          if (unique.length > 12)
            return !(i % 5);
          else {
            return !(i % 2)
          }
        });


        // var rects = this.grid.append('g').classed('group_label', true)
        var ticks_text = this.grid.append('g').classed('group_label', true)
        ticks_text.append('line')
        .attr('x1', -that.containerW/2 ).attr('y1', -that.containerH/2+this.grid_pad)
        .attr('x2', that.containerW/2 ).attr('y2', -that.containerH/2+this.grid_pad)
        .style('stroke', '#cccccc')
        .attr("stroke-width", 1);
        ticks.forEach(function(t, i) {
          // labels.append('line')
          // .attr("stroke", "#cccccc").attr('y2', -containerH/2).attr('x2', centerScale(+t))
          // .attr('y1', containerH/2).attr('x1', centerScale(+t));
          // rects.append('rect').attr('fill', "#cccccc").attr('fill-opacity', 1 / ticks.length)
          //   .attr('y', -that.containerH / 2).attr('x', -that.containerW / 2).attr('height', that.containerH)
          //   .attr('width', that.containerW / 2 + that.centerScale(+t))
          // console.log(that.centerScale(+t))
          ticks_text.append('text').attr('y', -that.containerH / 2 + that.grid_pad - 12).attr('x', that.centerScale(+t))
            .text(format_value(t, true))
        })
      }
    }


    simulation.force('collision', d3.forceCollide().radius(function(d) {
        return that.rScale(d.Size) + 1;
      }))
      .on('tick', ticked);
    //.on('end', show_grid);


    function ticked() {
      // without boundaries
      that.node.attr("cx", d => d.x)
      .attr("cy", d => d.y);

      // console.log(this.alpha())
      if (this.alpha() < 0.5 & !labels_shown) {
        labels_shown = true;
        that.showGrid();
      }

      // //now WITH boundaries
      // that.node.attr("cx", function(d) {
      //     var radius = that.rScale(d.Size)
      //     d.x = that.containerW / 2 + d.x
      //     return d.x = Math.max(radius, Math.min(that.containerW - radius, d.x)) - that.containerW / 2;
      //   })
      //   .attr("cy", function(d) {
      //     var radius = that.rScale(d.Size)
      //     d.y = that.containerW / 2 + d.y
      //     return d.y = Math.max(radius, Math.min(that.containerH - radius, d.y)) - that.containerH / 2;
      //   });


    }
  }

  showGrid() {

    var that = this;
    var choice = this.curChoice;

    if (this.isDiscrete) {

      this.labels = this.graph.append('g').classed('group_label', true);
      this.labels.selectAll('.label_text').data(this.unique).enter()
        .append('text')
        .attr('id', function(d, i) {
          return 'label_text' + i
        })

      var positions = []
      this.node.each(function(d, i) {
        //console.log(d,i) //data_enter
        var thisCircle = d3.select(this)
        positions.push({
          cx: +thisCircle.attr('cx'),
          cy: +thisCircle.attr('cy'),
          value: d[choice]
        })
      })
      // console.log(positions)
      // console.log(this.node)

      var nest_pos = d3.nest()
        .key(function(d) {
          return d.value;
        })
        .rollup(function(d) {
          return {
            xRange: d3.extent(d, function(g) {
              return +g.cx;
            }),
            yRange: d3.extent(d, function(g) {
              return +g.cy;
            })
          };
        }).entries(positions);
      //
      // //console.log(nest_pos)
      //
      nest_pos.forEach(function(p, i) {
        // console.log(p, i)
        var groupR = Math.max(p.value.xRange[1] - p.value.xRange[0], p.value.yRange[1] - p.value.yRange[0]) / 2
        var groupC = {
          cx: (p.value.xRange[1] + p.value.xRange[0]) / 2,
          cy: (p.value.yRange[1] + p.value.yRange[0]) / 2
        }
        // console.log(groupR, groupC, circleTextPadding)
        // graph.append('circle').attr('r', groupR).attr('cx', groupC.cx).attr('cy', groupC.cy)
        var label_angle = -Math.PI / 3; //(groupC.cx > 0) ? -Math.PI/3 : Math.PI/3;
        var anchor = polarToCartesian(label_angle, groupR + that.circleTextPadding)
        that.labels.select('#label_text' + i)
          .attr('x', groupC.cx + anchor.x)
          .attr('y', groupC.cy + anchor.y)
          .text(that.unique[i])
          .attr('fill-opacity', 0)
          .classed('label_text', true)
          .transition().duration(500).attr('fill-opacity', 1)
      })


    }
  }


  reset() {

    this.isDiscrete = false;
    this.graph.selectAll('.group_label').remove()

  }


  highlight(selectedVal, isType = true) {
    this.node.each(function(d, i) {
      if (d.name == selectedVal) {
        d3.select(this).classed('isClicked', true)
      } else {
        d3.select(this).classed('isClicked', false)
      }
    })
  }

  removeHighlight() {
    this.node.classed('isClicked', false);
  }

  createButtons() {
    // Create the shape selectors
    var that = this;

    var labelEnter = d3.select(this.button_element)
    .selectAll("span")
    .data(this.Choices)
    .enter().append("span");
      
    labelEnter.append("label")
    .text(function(d) {
      return d == 'All' ? 'Show ' + d : 'By ' + d;
    })

    this.buttons = labelEnter.append("input")
      .attr('type', 'radio')
      .attr('class', 'radioChoice')
      .attr('name', 'sorting_mode')
      .attr('value', function(d, i) {
        return d;
      })
      .property("checked", function(d, i) {
        return d === that.curChoice;
      });

    
  }

  handleButtons() {
    //const buttons = d3.selectAll('input');
    var that = this;
    //update('All');

    that.buttons.on('change', function(d) {
      // console.log('button changed to ' + this.value);
      that.update(this.value);
    });
  }

  resetButtons() {
    //var inp = document.getElementsByTagName('input')
    var inp = this.buttons;
    for (var i = inp.length - 1; i >= 0; i--) {
      if ('radio' === inp[i].type) {
        if (inp[i].value == 'All') inp[i].checked = true;
        else inp[i].checked = false;
      }
    }
  }

  //
  // function removeHighlightDistDiagram(targetSVG){
  //   var graph = d3.select(targetSVG);
  //   var node = graph.selectAll('.node').classed('isHovered', false);
  // }



}
//
// function createDistDiagram(targetSVG, data) {
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
//   var diagram = canvas_g.append('g').attr('id', 'distDia');
//
//   containerH = height;
//   containerW = width;
//
//   var grid = diagram.append("g").attr('id', 'grid')
//
//   const node = diagram.append("g")
//     .selectAll(".node")
//     .data(data)
//     .enter().append("circle")
//     .attr('r', function(d) {
//       return rScaleDist(d.Size)
//     })
//     .attr("class", function(d) {
//       return 'node ' + d.viz_group
//     })
//     .append("svg:title") // TITLE APPENDED HERE
//     .text(function(d) { return d.name; });
//
//   // node.on('mouseover', function(d,i){
//   //   //show_selected_type(d.viz_group, d.name);
//   // })
//   //
//   // node.on('mouseout', function(d,i){
//   //   //hide_selected_type(d.viz_group, d.name);
//   // })
//
// }
//
// function updateDistDiagram(data, choice) {
//
//
//   var labels_shown = false;
//   var graph = d3.select('#distDia');
//   var grid = d3.select('#grid');
//   var node = graph.selectAll('.node');
//   //d3.selectAll('.group_label').transition().duration(200).attr('fill-opacity', 0).remove()
//
//   var simulation = d3.forceSimulation(data)
//     .force('charge', d3.forceManyBody().strength(5))
//     .force('center', d3.forceCenter(0, 0));
//
//
//   var isDiscrete = false;
//   var centerScale;
//
//   d3.selectAll('.group_label').remove()
//   var labels = graph.append('g').classed('group_label', true);
//
//   if (choice == 'All') {
//     simulation.force('x', d3.forceX().x(xCenter));
//   } else {
//     if (discrete_features.has(choice)) {
//       var unique = d3.set(data.map(function(d) {
//         return d[choice];
//       })).values()
//
//       labels.selectAll('.label_text').data(unique).enter()
//       .append('text')
//       .attr('id',function(d,i) { console.log(d,i); return 'label_text' + i})
//
//       console.log(labels)
//
//       isDiscrete = true;
//
//       var angleScale = d3.scalePoint().padding(0.5).range([0, 2 * Math.PI]).domain(unique)
//
//       var xy_points = data.map(function(d) {
//         return polarToCartesian(angleScale(d[choice]), circleRadius);
//       })
//
//       simulation.force('x', d3.forceX().x(function(d, i) {
//           return xy_points[i].x;
//         }))
//         .force('y', d3.forceY().y(function(d, i) {
//           return xy_points[i].y
//         }))
//     } else {
//
//       var unique = d3.set(data.map(function(d) {
//         return +d[choice];
//       })).values().sort(function(a, b) {
//         return +a < +b ? -1 : +a > +b ? 1 : 0;
//       }) //}d3.ascending)
//
//
//
//       centerScale = d3.scalePoint().padding(1).range([-containerW / 2, containerW / 2]).domain(unique)
//
//       // var centerScale = d3.scaleLinear()
//       //   .range([-containerW/2, containerW/2])
//       //   .domain(d3.extent(data, function(d) {
//       //     return +d[choice];
//       //   }))
//
//       simulation.force('x', d3.forceX().x(function(d) {
//         return centerScale(+d[choice]);
//       }))
//
//       //AXIS
//       var ticks = unique.filter(function(d, i) {
//         if (unique.length>12)
//         return !(i % 5);
//         else{return !(i % 2)}
//       });
//       console.log(unique)
//       console.log(ticks)
//       var rects = grid.append('g').classed('group_label', true)
//       var ticks_text = grid.append('g').classed('group_label', true)
//       ticks.forEach(function(t, i) {
//         // labels.append('line')
//         // .attr("stroke", "#cccccc").attr('y2', -containerH/2).attr('x2', centerScale(+t))
//         // .attr('y1', containerH/2).attr('x1', centerScale(+t));
//         rects.append('rect').attr('fill', "#cccccc").attr('fill-opacity', 1/ticks.length)
//           .attr('y', -containerH / 2).attr('x', -containerW / 2).attr('height', containerH)
//           .attr('width', containerW / 2 + centerScale(+t))
//         console.log(centerScale(+t))
//         ticks_text.append('text').attr('y', containerH / 2 - 20).attr('x', centerScale(+t))
//         .text(format_value(t, true))
//       })
//     }
//   }
//
//
//   simulation.force('collision', d3.forceCollide().radius(function(d) {
//       return rScaleDist(d.Size) + 1;
//     }))
//     .on('tick', ticked);
//     //.on('end', show_grid);
//
//
//   function ticked() {
//     // without boundaries
//     // node.attr("cx", d => d.x)
//     //   .attr("cy", d => d.y);
//
//     // console.log(this.alpha())
//     if (this.alpha() < 0.5 & !labels_shown){
//       labels_shown = true;
//       show_grid();
//     }
//
//     //now WITH boundaries
//     node.attr("cx", function(d) {
//         var radius = rScaleDist(d.Size)
//         d.x = containerW / 2 + d.x
//         return d.x = Math.max(radius, Math.min(containerW - radius, d.x)) - containerW / 2;
//       })
//       .attr("cy", function(d) {
//         var radius = rScaleDist(d.Size)
//         d.y = containerW / 2 + d.y
//         return d.y = Math.max(radius, Math.min(containerH - radius, d.y)) - containerH / 2;
//       });
//
//
//   }
//
//   function show_grid() {
//
//     if (isDiscrete) {
//
//       var positions = []
//       node.each(function(d, i) {
//         //console.log(d,i) //data_enter
//         var thisCircle = d3.select(this)
//         positions.push({
//           cx: +thisCircle.attr('cx'),
//           cy: +thisCircle.attr('cy'),
//           value: d[choice]
//         })
//       })
//       console.log(positions)
//       console.log(node)
//
//       var nest_pos = d3.nest()
//         .key(function(d) {
//           return d.value;
//         })
//         .rollup(function(d) {
//           return {
//             xRange: d3.extent(d, function(g) {
//               return +g.cx;
//             }),
//             yRange: d3.extent(d, function(g) {
//               return +g.cy;
//             })
//           };
//         }).entries(positions);
//       //
//       // //console.log(nest_pos)
//       //
//       nest_pos.forEach(function(p, i) {
//         console.log(p, i)
//         var groupR = Math.max(p.value.xRange[1] - p.value.xRange[0], p.value.yRange[1] - p.value.yRange[0]) / 2
//         var groupC = {
//           cx: (p.value.xRange[1] + p.value.xRange[0]) / 2,
//           cy: (p.value.yRange[1] + p.value.yRange[0]) / 2
//         }
//         // console.log(groupR, groupC, circleTextPadding)
//         // graph.append('circle').attr('r', groupR).attr('cx', groupC.cx).attr('cy', groupC.cy)
//         var label_angle = -Math.PI / 3; //(groupC.cx > 0) ? -Math.PI/3 : Math.PI/3;
//         var anchor = polarToCartesian(label_angle, groupR + circleTextPadding)
//         labels.select('#label_text' + i)
//           .attr('x', groupC.cx + anchor.x)
//           .attr('y', groupC.cy + anchor.y)
//           .text(unique[i])
//           .attr('fill-opacity', 0)
//           .classed('label_text', true)
//           .transition().duration(500).attr('fill-opacity', 1)
//       })
//
//
//     }
//   }
// }
//
// function highlightDistDiagram(targetSVG, selectedVal,isType= true){
//   var graph = d3.select(targetSVG);
//   var node = graph.selectAll('.node');
//   console.log(selectedVal)
//   node.each(function(d,i){
//     console.log(d3.select(this))
//     if (d.name ==selectedVal)
//     {d3.select(this).classed('isHovered', true)}
//     else {d3.select(this).classed('isHovered', false)}
//   })
// }
//
// function removeHighlightDistDiagram(targetSVG){
//   var graph = d3.select(targetSVG);
//   var node = graph.selectAll('.node').classed('isHovered', false);
// }
//

// if (isDiscrete)
// {
//   for(let i = 0; i< unique.length; i++){
//         var anchor =  polarToCartesian(angleScale(unique[i]), circleRadius + circleTextPadding);
//         labels.append('text').attr('x', anchor.x).attr('y', anchor.y)
//         .text(unique[i])
//       }
// }
//
// function create_buttons() {
//
//   // Create the shape selectors
//   var form = d3.select("body").append("form");
//
//   labels = form.selectAll("label")
//     .data(Choices)
//     .enter()
//     .append("label")
//     .text(function(d) {
//       return d == 'All' ? 'Show ' + d : 'By ' + d;
//     })
//     .insert("input")
//     .attr('type', 'radio')
//     .attr('class', 'radioChoice')
//     .attr('name', 'sorting_mode')
//     .attr('value', function(d, i) {
//       return d;
//     })
//     .property("checked", function(d, i) {
//       return i === defaultChecked;
//     });
// }
//
// function handle_buttons(data) {
//   const buttons = d3.selectAll('input');
//   updateDistDiagram(data, 'All');
//
//   buttons.on('change', function(d) {
//     console.log('button changed to ' + this.value);
//     updateDistDiagram(data, this.value);
//   });
// }
//
// function reset_buttons() {
//   var inp = document.getElementsByTagName('input')
//   for (var i = inp.length - 1; i >= 0; i--) {
//     if ('radio' === inp[i].type) {
//       if (inp[i].value == 'All') inp[i].checked = true;
//       else inp[i].checked = false;
//     }
//   }
// }
