class PoringSelector {

  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.element = opts.element;
    this.graphs = opts.graphs;

    this.outerR = 210, //180,
      this.small_r2 = 4, //3, //mobs with similar names names
      this.small_r = 12, //10,
      this.pie_innerR = 110, //110,
      this.pie_outerR = 130; //130;
    // originY = height / 2
    // originX = width / 2

    this.curClicked = {
      group: null,
      type: null,
      d: null
    }

    this.createScales();
    // create the chart
    this.draw();
  }

  createScales() {

    this.pie_arc = d3.arc()
      .innerRadius(this.pie_innerR)
      .outerRadius(this.pie_outerR)
      .cornerRadius(10)

    this.outerArc = d3.arc()
      .innerRadius(this.pie_innerR)
      .outerRadius(this.outerR + 20)

    this.pie_group_size = d3.pie()
      .sort(null)
      .startAngle(-Math.PI / 2)
      .endAngle(-Math.PI / 2 + 2 * Math.PI)
      .value(function(d) {
        return d.group_size;
      })

    //contains max values of circles for a fixed base
    //e.g. if base = 2 we can place max 3 circles:
    //  o
    // o o <-- a base level
    this.sum_table = [{
        'base': 1,
        'values': 1
      },
      {
        'base': 2,
        'values': 3
      },
      {
        'base': 3,
        'values': 6
      },
      {
        'base': 4,
        'values': 10
      },
      {
        'base': 4,
        'values': 15
      }
    ]
  }

  draw() {
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
    this.createSelector();

  }

  createSelector() {

    const pie_arcs = this.pie_group_size(this.data);

    //central image - invisible
    var myimage = this.plot.append('image')
      .attr('xlink:href', "") //http://file5.ratemyserver.net/mobs/1388.gif
      .style("opacity", 0.0)
      .attr('class', 'central_img')

    // central text
    var text = this.plot.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('id', 'central_text')
      .text("Poring Family")
      .attr('fill', '#b55758')
      .style("font-size", "16px")
      .style("font-weight", "bold")

    //text helper
    var text_help = this.plot.append('text')
      .attr('y', this.height / 2 - 50)
      .attr('x', this.width / 2 - 50)
      .attr('id', 'helper')
      .text("")
      .attr('fill', '#b55758')
      .style("font-size", "12px")
      .style("font-weight", "bold")

    //name of the mob
    var text_name = this.plot.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style("opacity", 0.0)
      .attr('class', 'name_text')
      .text("")
      .style("font-size", "14px")

    var arcs_group = this.plot.append("g").attr('class', 'graph')

    var groups = arcs_group.selectAll("g")
      .data(pie_arcs)
      .enter()
      .append("g")
      .attr('class', function(d, i) {
        return 'group' + i + ' ' + 'pie_groups';
      })

    this.draw_base(groups);

  }

  draw_base(targetGroups) {

    const that = this;

    var arcs = targetGroups.append("path")
      .attr('class', function(d, i) {
        return 'arc' + i + ' ' + d.data.group;
      })
      .attr("d", this.pie_arc)
      .attr("stroke", "white")


    var invisible_arcs = targetGroups.append("path")
      .attr('class', function(d, i) {
        return 'invisible_arc' + i;
      })
      .attr("d", this.pie_arc)
      .style("fill", "transparent")
      .on("mouseover", function(d, i) {
        that.expand_invisible_arcs(d, i, 500);
      })
      .on("mouseout", function(d, i) {
        that.shrink_invisible_arcs(d, i)
      });

    //draw mob groups
    targetGroups.each(function(d,i) {that.draw_groups(this, d,i)});
  }

  expand_invisible_arcs(d, i, delay_val = 0) {
    var that = this;
    d3.select('.invisible_arc' + i).attr('d', this.outerArc);
    d3.select('.arc' + i).classed('isHovered', true);
    var igroup = d3.selectAll('.group' + i);
    igroup.selectAll(".g_line").transition().duration(500)
      .attr("x2", function(d) {
        return that.p_end(d).x;
      })
      .attr("y2", function(d) {
        return that.p_end(d).y;
      })
    igroup.selectAll(".g_circle").transition().delay(delay_val / 2).duration(500).attr("r", this.small_r)
    igroup.selectAll(".type_circle").transition().delay(delay_val).duration(500).attr("r", this.small_r2)
    d3.select('#central_text').text(d.data.group).classed(d.data.group, true);
    d3.select('#helper').text('Genus').classed(d.data.group, true);
  }

  shrink_invisible_arcs(d, i, ind_clicked = -1) {
    // if hover mode: there is no clicks -
    //shrink the arc with index i if not hovered
    //if click mode: do not shrink the clicked arc

    var that = this;
    if (ind_clicked == -1) {
      ind_clicked = this.curClicked.group
    }
    if (i != ind_clicked) {
      d3.select('.invisible_arc' + i).attr('d', this.pie_arc);
      d3.select('.arc' + i).classed('isHovered', false);
      var igroup = d3.selectAll('.group' + i)
      igroup.selectAll(".g_line").transition().duration(500)
        .attr("x2", function(d) {
          return that.p_start(d).x;
        })
        .attr("y2", function(d) {
          return that.p_start(d).y;
        })
      igroup.selectAll(".g_circle").transition().duration(500).attr("r", 0)
      igroup.selectAll(".type_circle").transition().duration(500).attr("r", 0)
      d3.select('#central_text').text("Poring Family")
        .classed(d.data.group, false).attr('fill', '#b55758');
    }
    d3.select('#helper').text('').classed(d.data.group, false);
  }

  hadle_mouseOver_circle(d, i, j) {
    var that = this;
    d3.select('#helper').classed(d.data.group, true).text('Species');
    if (!d3.select('#g_circle' + j + "_" + i).classed('isClicked')) {
      d3.select('#g_circle' + j + "_" + i).classed('isHovered', true);
      d3.select('#g_line' + j + "_" + i).classed('isHovered', true);
      d3.selectAll('#type_circles' + j + "_" + i).each(function(d,i) {that.repeat(this,d,i);});
      that.show_img(d, j);
    }
    //updateStats("#statsDia_svg", d.data.mob_types[j].value.values);}
  }

  find_type(group, type) {
    var circles = d3.selectAll('.pie_groups')
    var targetGroup, targetType, targetArc;
    circles.each(function(k, i) {
      if (k.data.group == group) {
        targetGroup = i;
        for (let m = 0; m < k.data.group_size; m++) {
          if (k.data.mob_types[m].key == type) {
            targetType = m;
            targetArc = k;
          }
        }
      }
    })
    return [targetArc, targetGroup, targetType];
  }

  show_selected_type(group, type) {
    var target = this.find_type(group, type)
    this.expand_invisible_arcs(target[0], target[1]);
    this.hadle_mouseOver_circle(target[0], target[1], target[2]);
  }

  hide_selected_type(group, type) {
    var target = this.find_type(group, type)
    console.log('hide', target[1], target[2])
    this.hadle_mouseOut_circle(target[1], target[2]);
    this.shrink_invisible_arcs(target[0], target[1])
  }

  hadle_mouseOut_circle(i, j) {
    if (!d3.select('#g_circle' + j + "_" + i).classed('isClicked')) {


      d3.select('#g_circle' + j + "_" + i).classed('isHovered', false);
      d3.selectAll('#type_circles' + j + "_" + i).classed('isHovered', false);
      d3.selectAll('#g_line' + j + "_" + i).classed('isHovered', false);
      this.hide_img();

    }
  }


  draw_groups(thisArcGroup, d, i) {
    // get ahchors for lines on the arc

    const that = this;

    var angles = that.getAnchors(d);

    var theArc = d3.select(thisArcGroup);

    var sub_arc_group = theArc.selectAll("g").data(angles).enter().append("g")

    var positions = angles.map(function(a) {
      return {
        "start": that.p_start(a),
        "end": that.p_end(a)
      };
    })

    var line = sub_arc_group.append("line")
      .attr("x1", function(a, j) {
        return positions[j].start.x;
      })
      .attr("x2", function(a, j) {
        return positions[j].start.x;
      })
      .attr("y1", function(a, j) {
        return positions[j].start.y;
      })
      .attr("y2", function(a, j) {
        return positions[j].start.y;
      })
      .attr('class', 'g_line')
      .classed(d.data.group, true)
      .classed('isHovered', false)
      .style("pointer-events", "none")
      .attr('id', function(angles, j) {
        return 'g_line' + j + "_" + i;
      })

    var circles_g = sub_arc_group.append("g")
      .attr('id', function(angles, j) {
        return 'g_circle' + j + "_" + i;
      })
      .classed(d.data.group, true);

    var circle = circles_g.append("circle")
      .attr("r", 0)
      .attr('cx', function(a, j) {
        return positions[j].end.x;
      })
      .attr('cy', function(a, j) {
        return positions[j].end.y;
      })
      .attr('class', 'g_circle')
    //.classed(d.data.group, true)

    circles_g.on("mouseover", function(dangle, j) {
        //to emulate overlaping mouseover on invisible arc and circles:
        //invisible arc has to be kept activated - similar code to its mouseover but delay removed
        that.expand_invisible_arcs(d, i);

        //finally handle circle mouseover
        that.hadle_mouseOver_circle(d, i, j);

      })
      .on("mouseout", function(dangle, j) {
        d3.select('#helper').text('').classed(d.data.group, false);
        that.hadle_mouseOut_circle(i, j);
      })
      .on("click", function(dangle, j) {
        var active = d3.select(this).classed('isClicked') ? false : true;

        //remove active selection
        d3.selectAll('.isClicked').classed('isClicked', false);

        d3.select(this).classed('isClicked', active).classed('isHovered', !active);
        var iarc = d3.select('.invisible_arc' + i);
        // iarc.classed('isHovered',active);
        if (active) {

          if (that.curClicked.group != i & that.curClicked.group != null) {
            var cur_arc = d3.select('.arc' + that.curClicked.group);
            cur_arc.classed('isHovered', false);
            that.shrink_invisible_arcs(d3.select('.invisible_arc' + that.curClicked.group).datum(), that.curClicked.group, i);
          }

          that.graphs.statsDiagram.update(d.data.mob_types[j].value.values);
          that.graphs.damageDiagram.update(d.data.mob_types[j].value.values);
          // updateStats("#statsDia_svg", d.data.mob_types[j].value.values);
          // updatePropArcs("#propsDia_svg", d.data.mob_types[j].value.values);
          // updatePropDia("#propsDia_svg", d.data.mob_types[j].value.values);
          // updateDamageDia("#damageDia_svg", d.data.mob_types[j].value.values);
          // highlightDistDiagram("#distDia_svg", d.data.mob_types[j].key);

          that.curClicked.group = i;
          that.curClicked.type = j;
          that.curClicked.d = iarc.datum();

        } else {
          that.curClicked.group = null;
          that.curClicked.type = null;
          that.curClicked.d = null;
          //reset stats diagram
          that.graphs.statsDiagram.reset();
          that.graphs.damageDiagram.reset();
          // resetStats("#statsDia_svg");
          // resetPropArcs("#propsDia_svg");
          // resetPropDia("#propsDia_svg");
          // resetDamageDia("#damageDia_svg");
          // removeHighlightDistDiagram("#distDia_svg")
        }

      });
    //
    var circles_small = circles_g.append("g")
      .attr('class', function(dangle, j) {
        return 'g_sm_circles' + j + "_" + i;
      })
      .each(function(dangle, j) {
        var circleij_x = that.p_end(dangle).x; //x2(dangle, i)
        var circleij_y = that.p_end(dangle).y; //y2(dangle, i)
        var num = d.data.mob_types[j].value.length;
        const startAngle = -Math.PI / 4 - Math.PI / 8;
        const endAngle = Math.PI / 8;
        var c_anchors = that.getCirclesAnchors(num, startAngle, endAngle);
        var c_coords = that.getCircleCoords(c_anchors, that.small_r, that.small_r2, startAngle);
        d3.select(this).selectAll('#type_circles' + j + "_" + i).data(c_coords).enter().append("circle")
          .attr('class', 'type_circle')
          .attr('id', 'type_circles' + j + "_" + i)
          .attr('cx', function(coord) {
            return circleij_x + coord['cx'];
          })
          .attr('cy', function(coord) {
            return circleij_y + coord['cy'];
          })
          .attr('r', 0)
          .attr("transform", "rotate(" + toDegrees(dangle) + "," + circleij_x + "," + circleij_y + ")")
          .on("mouseover", function(dangle, j) {
            d3.select('#helper').text('Observed types');
          })
          .on("mouseout", function(dangle, j) {
            d3.select('#helper').text('');
          })
      })

  }

  repeat(thisCircle, d, i) {
    var that = this;
    var circle = d3.select(thisCircle)
    circle = circle.transition()
      .duration(500)
      .attr("r", that.small_r2 - 1)
      .transition()
      .duration(500)
      .attr("r", that.small_r2)
      .on("end", function(d,i){that.repeat(thisCircle,d,i);});
  }

  getAnchors(d) {
    var step = (d.endAngle - d.startAngle) / d.value
    var anchors = []
    for (let i = d.startAngle; i < d.endAngle; i += step) {
      anchors.push(i + step / 2);
    }
    return anchors;
  }

  show_img(d, j) {
    var name_group = d.data.mob_types[j].value.values[0];
    d3.select('#central_text').transition().duration(500).attr('y', this.pie_innerR / 2 + 10);
    d3.select('.name_text').text(name_group['name'])
      .classed('isHovered', true)
      .attr('y', -this.pie_innerR / 2 + 10).transition().duration(500)
      .style("opacity", 1.0);
    var img = d3.select('.central_img')
      .attr('xlink:href', name_group['img_url'])
      .attr('x', -name_group['img_width'] / 2).attr('y', -name_group['img_height'] / 2)
      .attr('height', name_group['img_width']).attr('width', name_group['img_height'])
      .transition().duration(500).style("opacity", 1.0);
  }


  hide_img() {
    if (this.curClicked.type != null) {
      this.show_img(this.curClicked.d, this.curClicked.type);
    } else {
      d3.select('#central_text').transition().duration(500).attr('y', 0)
      d3.select('.name_text').transition().duration(500).style("opacity", 0.0)
      d3.select('.central_img').transition().duration(500).style("opacity", 0.0);
    }
  }


  p_start(angle) {
    return polarToCartesian(-Math.PI / 2 + angle, this.pie_outerR);
  }

  p_end(angle) {
    return polarToCartesian(-Math.PI / 2 + angle, this.outerR);
  }


  getBaseAnchors(num, startAngle, endAngle) {
    //num = points to place between start and end angles
    var anchors = []
    if (num == 1) {
      anchors.push(-endAngle);
    } else {
      var step = (endAngle - startAngle) / (num - 1);
      for (let i = startAngle; i <= endAngle; i += step) {
        anchors.push(i);
      }
    }
    return anchors;
  }


  getMidAnchors(anchors) {
    //to create a pyramide of circles - place anchors between each pair of anchors
    var midAnchors = []
    for (let i = 1; i < anchors.length; i += 1) {
      midAnchors.push(this.getBaseAnchors(3, anchors[i - 1], anchors[i])[1]);
    }
    return midAnchors;
  }

  //place new circles on the level starting from the center
  getcentralvalues(arr, num) {
    //array of values [22,45,66,788,3343]
    //take num of values arund the center of the array e.g. num = 3, then result = [45,66,788]
    var midInd = Math.ceil(arr.length / 2) - 1
    if (num % 2) {
      num -= 1;
      var leftLim = midInd - num / 2;
    } else {
      if (arr.length % 2) {
        var leftLim = midInd;
      } else {
        var leftLim = midInd - num / 2 + 1;
      }
    }
    var rightLim = midInd + num / 2;
    return arr.slice(leftLim, rightLim + 1);
  }

  //calculate all anchors for the pyramide of circles
  getCirclesAnchors(num, startAngle, endAngle) {
    var max1Level = this.sum_table.filter(maxval => maxval['values'] >= num)[0]['base'];
    var circles = [];
    var circlesLeft = num;
    var maxAnchorsCurLevel = max1Level;
    var AnchorsCurLevel = this.getBaseAnchors(max1Level, startAngle, endAngle);
    while (circlesLeft) {
      if (circlesLeft >= maxAnchorsCurLevel) {
        var circlestoplace = maxAnchorsCurLevel;
        circlesLeft = circlesLeft - maxAnchorsCurLevel;
        circles.push(AnchorsCurLevel)
      } else {
        var circlestoplace = circlesLeft;
        circlesLeft = 0;
        //we need to place circlestoplace circles over maxAnchorsCurLevel positions
        var lastLevelAnchors = this.getcentralvalues(AnchorsCurLevel, circlestoplace)
        circles.push(lastLevelAnchors);
        break;
      }
      AnchorsCurLevel = this.getMidAnchors(AnchorsCurLevel);
      maxAnchorsCurLevel--;
    }
    return circles;
  }
  //




  //calculate coordinates for circles based on anchors and radius
  getCircleCoords(anchors, R, r, startAngle) {
    var circles = [];
    R += r;
    for (let level = 0; level < anchors.length; level += 1) {
      for (let al = 0; al < anchors[level].length; al += 1) {
        var cxy = polarToCartesian(startAngle + anchors[level][al], (R - level * r / 2));
        circles.push({
          'cx': cxy.x,
          'cy': cxy.y
        })
      }
      R += 2 * r;
    }
    return circles;
  }


}
