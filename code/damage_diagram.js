class DamageDiagram {

  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;

    this.heartMaxR = 30,
      this.borderMobR = 100,
      this.maxAttackR = 250,
      this.numPoints = 30, //# of random values of attack
      this.atk_padding = 30,
      this.MinDef = 0,
      this.MaxDef = 255,
      this.MaxLogHP = 20;

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
      .style("font", "12px sans-serif")
      .attr('width', this.width)
      .attr('height', this.height);

    // we'll actually be appending to a <g> element
    this.plot = svg.append("g")
      .attr("transform", `translate(${this.width / 2},${this.height / 2})`);

    // // create the other stuff
    this.createScales();
    this.createGrid();
    this.createDataGroup();
  }

  createScales() {
    this.innerScale = d3.scaleLinear()
      .domain([this.MinDef, this.MaxDef])
      .range([this.borderMobR, this.heartMaxR])

    this.xScale = d3.scaleLinear()
      .domain([0, this.MaxLogHP])
      .range([0, this.heartMaxR]);

    this.angleScale = d3.scaleLinear()
      .domain([0, this.numPoints])
      .range([0, 2 * Math.PI]);

    this.attackScale = d3.scaleLinear()
      .range([this.borderMobR, this.maxAttackR - this.atk_padding]);

    this.angleScaleHP = d3.scaleLinear()
      .range([0, 2 * Math.PI]);


    this.radialAreaGenerator = d3.radialArea()
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


    var that = this;
    this.randomPoints0 = d3.range(this.numPoints).map(function(v) {
      return {
        r0: 0,
        r1: 0,
        angle: that.angleScale(v)
      }
    })

    this.pathData0 = this.radialAreaGenerator(this.randomPoints0);
  }

  createGrid() {

    var def_ticks = this.innerScale.nice().ticks(3);
    var that = this;

    var atk_grid = this.plot.append('g').attr('id', 'atk_grid')
    var def_grid = this.plot.append('g').attr('id', 'def_grid')
    var hp_grid = this.plot.append('g').attr('id', 'hp_grid')
    var range_helper = this.plot.append('g').attr('id', 'range_helper')

    atk_grid.append('line')
      .attr("stroke", "#cccccc").attr('y2', 0).attr('x2', this.borderMobR)
      .attr('id', 'atk_line')
      .attr('y1', 0).attr('x1', this.borderMobR) // + 100);

    atk_grid.append('text')
      .attr('fill', "#cccccc") //.attr('y', -5).attr('x', borderMobR+100)
      // .attr('id', 'atk_label')
      .attr('text-anchor', 'end')
      .attr('y', -5).attr('x', this.innerScale(this.MinDef) - 5)
      .text('Def')


    def_grid.append('line')
      .attr("stroke", "#cccccc").attr('y2', 0).attr('x2', 0)
      .attr('y1', 0).attr('x1', this.innerScale(this.MinDef));


    var ticks_enter = def_grid.selectAll('circle')
      .data(def_ticks.concat(this.MaxDef))
      .enter();

    ticks_enter.append('circle')
      .attr('r', (d, i) => this.innerScale(d))
      .attr('fill', "#d9d9d9")
      .attr('opacity', 1 / (def_ticks.length + 1));

    def_grid.append('text')
      .attr('fill', "#cccccc").attr('y', +15).attr('x', this.innerScale(this.MinDef) + 15)
      .text('Atk')

    def_grid.selectAll('.def_ticks').data(def_ticks).enter()
      .append('text').attr('fill', "#cccccc")
      .attr('class', 'def_ticks')
      .attr('x', function(d, i) {
        return that.innerScale(d) - 10
      })
      .attr('y', +15)
      .text(function(d, i) {
        return d
      })

    hp_grid.append('line')
      .attr("stroke", "#cccccc")
      .attr('y2', -this.innerScale(this.MaxDef)).attr('x2', 0)
      .attr('y1', 0).attr('x1', 0);

    hp_grid.append('text').attr('fill', "#cccccc")
      .attr('x', 10)
      .attr('y', -this.xScale(this.MaxLogHP) - 5)
      .attr('id', 'maxTick')
      .attr('text-anchor', 'start')
      .text('Max');


    hp_grid.append('text').attr('fill', "#cccccc")
      .attr('x', -15)
      .attr('y', -this.xScale(this.MaxLogHP) - 5)
      .text("HP")

    range_helper.append('text')
      .attr('id', 'helper_var')
      .attr('x', this.maxAttackR - 80)
      .attr('y', this.maxAttackR - 50)
      .attr('text-anchor', 'start')
      .text("")

    range_helper.append('text')
      .attr('id', 'helper_var_range')
      .attr('x', this.maxAttackR - 80)
      .attr('y', this.maxAttackR - 30)
      .attr('text-anchor', 'start')
      .text("")
  }


  createDataGroup() {
    this.graph = this.plot.append('g').attr('id', 'data_viz')
  }

  update(data) {

    this.reset();
    var that = this;

    var maxAtk = -Infinity,
      minAtk = Infinity;

    var extentDef = d3.extent(data, function(d) {
      return d.Def;
    });
    var extentLogHP = d3.extent(data, function(d) {
      return d.logHP;
    });

    var limAtk = data.map(function(d) {
      var limits = +d.MaxAttack >= +d.MinAttack ? [+d.MinAttack, +d.MaxAttack] : [+d.MaxAttack, +d.MinAttack]
      maxAtk = limits[1] > maxAtk ? limits[1] : maxAtk;
      minAtk = limits[0] < minAtk ? limits[0] : minAtk;
      return {
        upLim: limits[1],
        downLim: limits[0]
      }
    })

    this.attackScale.domain([minAtk, maxAtk]);

    this.angleScaleHP.domain([0, data.length]);

    var atk_ticks = this.attackScale.nice().ticks(3);

    var atk_grid_ingraph = this.graph.append('g').attr('id', 'atk_grid_ingraph');

    function repeat(d, i) {
      if (d.logHP == extentLogHP[1]) {
        var circle = d3.select(this)
        var r = that.xScale(d.logHP)
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

    var helper = d3.select('#range_helper'),
      helper_var = d3.select('#helper_var'),
      helper_var_range = d3.select('#helper_var_range')

    var data_enter = this.graph.selectAll('.def_arc').data(data).enter()

    atk_grid_ingraph.selectAll('text').data(atk_ticks).enter()
      .append('text').attr('fill', "#cccccc")
      .attr('class', 'atk_ticks')
      .attr('x', function(d, i) {
        return that.attackScale(d) + 10
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
      .attr('x1', this.attackScale(maxAtk));



    d3.select('#maxTick').text(function() {
      return format_value(Math.exp(extentLogHP[1]));
    });


    data_enter.append('path')
      .attr('d', function(d) {
        return arc_R(that.borderMobR, that.borderMobR).startAngle(0).endAngle(2 * Math.PI)(d)
      })
      .attr('class', function(d) {
        return 'def_arc'; // + d.viz_group
      })
      .style('fill-opacity', 1 / data.length)
      .on("mouseover", function(d) {
        var theArc = d3.select(this);
        helper.style('fill-opacity', 1)
          .style('fill', function() {
            return theArc.style('fill');
          })
        helper_var.text("Defence")
        helper_var_range.text(extentDef[0] + ' - ' + extentDef[1])
      })
      .on("mouseout", function(d) {
        helper.transition().duration(100).style('fill-opacity', 0)
      })
      .transition().duration(1000)
      .attr('d', function(d) {
        return arc_R(that.borderMobR, that.innerScale(d.Def)).startAngle(0).endAngle(2 * Math.PI)(d)
      })

    data_enter.append('circle')
      .attr('r', 0)
      .on("mouseover", function(d) {
        var theCircle = d3.select(this);
        helper.style('fill-opacity', 1)
          .style('fill', 'darkred')
        helper_var.text("Health")
        helper_var_range.text(format_value(Math.exp(extentLogHP[0])) +
          ' - ' + format_value(Math.exp(extentLogHP[1])))
      })
      .on("mouseout", function(d) {
        helper.transition().duration(100).style('fill-opacity', 0)
      })
      .transition().duration(1000)
      .attr('d', function(d) {
        return arc_R(that.borderMobR, that.innerScale(d.Def)).startAngle(0).endAngle(2 * Math.PI)(d)
      })
      .transition().duration(1000)
      .attr('class', 'HP_circle')
      .attr('stroke', 'darkred')
      .attr('opacity', 1 / data.length)
      .attr('r', function(d) {
        return that.xScale(d.logHP)
      })
      .attr('cx', 0).attr('cy', 0)
      .attr('fill', 'transparent')
      //.attr('stroke', 'red')
      .on('end', repeat);

    limAtk.forEach(function(d, i) {
      var randomPoints = d3.range(that.numPoints).map(function(v) {
        return {
          r0: that.attackScale(d.downLim),
          r1: that.attackScale(d3.randomUniform(d.downLim, d.upLim)()),
          angle: that.angleScale(v)
        }
      })

      var pathData = that.radialAreaGenerator(randomPoints);

      //Create a path element
      that.graph.append('path')
        .attr('d', that.pathData0)
        .classed('attack_path', true)
        .classed(data[i].viz_group, true)
        .attr('opacity', 1 / data.length > 0.5 ? 0.5 : 1 / data.length)
        .on("mouseover", function() {
          var path = d3.select(this);
          helper.style('fill-opacity', 1)
            .style('fill', path.style('fill'))
          helper_var.text("Attack")
          helper_var_range.text(format_value(d.downLim) +
            ' - ' + format_value(d.upLim))
        })
        .on("mouseout", function() {
          helper.transition().duration(100).style('fill-opacity', 0)
        })
        .transition().duration(1000)
        .attr('d', pathData);

    })
  }

  reset() {

    var ticks = this.graph.selectAll('.atk_ticks')
    var that = this;

    ticks.transition().duration(100)
      .attr('fill-opacity', 0).remove();

    this.graph.select('#atk_line')
      .transition().duration(200)
      .attr('x1', this.borderMobR).remove()

    this.graph.select('#maxTick').text('Max');

    this.graph.selectAll('.HP_circle').transition().duration(500)
      .attr('r', 0).remove();

    this.graph.selectAll('.attack_path').transition().duration(1000)
      .attr('d', this.pathData0).remove()
      .on('end', function() {
        that.graph.select('#atk_grid_ingraph').remove();
      })
    //
    //
    //
    this.graph.selectAll('.def_arc').transition().duration(800)
      .attr('d', function(d) {
        return arc_R(that.borderMobR, that.borderMobR).startAngle(0).endAngle(2 * Math.PI)(d)
      }).remove()

  }




}
