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




}