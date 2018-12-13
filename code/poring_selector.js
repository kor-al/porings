function createSelector(data, targetSVG) {
  // d3.select(targetSVG).append('circle').attr('fill', 'red').attr('r', '100').attr('cx', 10).attr('cy', 10);

  const pie_arcs = pie_group_size(data);

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  //central image - invisible
  var myimage = canvas_g.append('image')
    .attr('xlink:href', "") //http://file5.ratemyserver.net/mobs/1388.gif
    .style("opacity", 0.0)
    .attr('class', 'central_img')

  // central text
  var text = canvas_g.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .attr('class', 'central_text')
    .text("Poring Family")
    .attr('fill', '#b55758')
    .style("font-size", "16px")
    .style("font-weight", "bold")

  //text helper
  var text_help = canvas_g.append('text')
    .attr('y', height / 2 - 50)
    .attr('x', width / 2 - 50)
    .attr('class', 'helper')
    .text("")
    .attr('fill', '#b55758')
    .style("font-size", "12px")
    .style("font-weight", "bold")

  //name of the mob
  var text_name = canvas_g.append('text')
    .attr('x', 0)
    .attr('y', 0)
    .style("opacity", 0.0)
    .attr('class', 'name_text')
    .text("")
    .style("font-size", "14px")

  var arcs_group = canvas_g.append("g").attr('class', 'graph').classed('isClicked', false)

  var groups = arcs_group.selectAll("g")
    .data(pie_arcs)
    .enter()
    .append("g")
    .attr('class', function(d, i) {
      return 'group' + i;
    })

  draw_base(groups);

}

function draw_base(targetGroups) {
  var arcs = targetGroups.append("path")
    .attr('class', function(d, i) {
      return 'arc' + i;
    })
    .attr("d", pie_arc)
    .attr("fill", d => color(d.data.group))
    .attr("stroke", "white")


  var invisible_arcs = targetGroups.append("path")
    .attr('class', function(d, i) {
      return 'invisible_arc' + i;
    })
    .classed('isClicked', false)
    .attr("d", pie_arc)
    .style("fill", "transparent")
    .on("mouseover", function(d, i) { expand_invisible_arcs(d, i, delay_val = 500);})
    .on("mouseout", shrink_invisible_arcs);

  //draw mob groups
  var arcs_circles = targetGroups.each(draw_groups);

}

function expand_invisible_arcs(d, i, delay_val = 0) {
    d3.select('.invisible_arc' + i).attr('d', outerArc).classed('isHovered', true); //.append("svg:title").text('poring group');
    d3.select('.arc' + i).classed('isHovered', true);//.attr("fill", d => d3.color(color(d.data.group)).darker());
    var igroup = d3.selectAll('.group' + i);
    igroup.selectAll(".g_line").transition().duration(500)
      .attr("x2", function(d) {
        return p_end(d).x;
      })
      .attr("y2", function(d) {
        return p_end(d).y;
      })
    igroup.selectAll(".g_circle").transition().delay(delay_val / 2).duration(500).attr("r", small_r)
    igroup.selectAll(".type_circle").transition().delay(delay_val).duration(500).attr("r", small_r2)
    d3.select('.helper').text('Genus').attr("fill", color(d.data.group));
    d3.select('.central_text').text(d.data.group).attr("fill", color(d.data.group));
}

function shrink_invisible_arcs(d, i) {
  if (!d3.select('.invisible_arc' + i).classed('isClicked')) {
    d3.select('.invisible_arc' + i).attr('d', pie_arc);
    d3.select('.arc' + i).classed('isHovered', false);
    var igroup = d3.selectAll('.group' + i)
    igroup.selectAll(".g_line").transition().duration(500)
      .attr("x2", function(d) {
        return p_start(d).x;
      })
      .attr("y2", function(d) {
        return p_start(d).y;
      })
    igroup.selectAll(".g_circle").transition().duration(500).attr("r", 0)
    igroup.selectAll(".type_circle").transition().duration(500).attr("r", 0)
    d3.select('.central_text').text("Poring Family").attr('fill', '#b55758');
    d3.select('.helper').text('');
  }
}

function hadle_mouseOver_circle(d,i,j){
  if (!d3.select('#g_circle' + j + "_" + i).classed('isClicked')){
    d3.select('#g_circle' + j + "_" + i).classed('isHovered', true);
    d3.select('#g_line' + j + "_" + i).classed('isHovered', true);
    d3.selectAll('#type_circles' + j + "_" + i).each(repeat);
    show_img(d, j);
  }
    //updateStats("#statsDia_svg", d.data.mob_types[j].value.values);}
}

function hadle_mouseOut_circle(i,j){
  if (!d3.select('#g_circle' + j + "_" + i).classed('isClicked'))
  {        //d3.select(this).selectAll('.g_circle').attr("fill", color(d.data.group));
    d3.select('#g_circle' + j + "_" + i).classed('isHovered', false);
    //d3.selectAll('#type_circles' + j + "_" + i).attr("fill", color(d.data.group));
    d3.selectAll('#type_circles' + j + "_" + i).classed('isHovered', false);
    d3.selectAll('#g_line' + j + "_" + i).classed('isHovered', false);
    hide_img();
  }
}


function draw_groups(d, i) {
  // get ahcnorls for lines on the arc

  var angles = getAnchors(d);

  var theArc = d3.select(this);

  var sub_arc_group = theArc.selectAll("g").data(angles).enter().append("g")

  var positions = angles.map(function(a) {
    return {
      "start": p_start(a),
      "end": p_end(a)
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
    .attr("stroke", color(d.data.group))
    .attr('class', 'g_line')
    .style("pointer-events", "none")
    .attr('id', function(angles, j) {
      return 'g_line' + j + "_" + i;
    })

  var circles_g = sub_arc_group.append("g")
  .attr('id', function(angles, j) {
    return 'g_circle' + j + "_" + i;
  })

  var circle = circles_g.append("circle")
    .attr("r", 0)
    .attr('cx', function(a, j) {
      return positions[j].end.x;
    })
    .attr('cy', function(a, j) {
      return positions[j].end.y;
    })
    .attr('class', 'g_circle')
    .classed('isClicked', false)
    .classed('isHovered', false)
    .attr("fill", color(d.data.group))
    .on("mouseover", function(dangle, j) {
      d3.select('.helper').text('Species').attr("fill", color(d.data.group));
    })
    .on("mouseout", function(dangle, j) {
      d3.select('.helper').text('');
    })

  circles_g.on("mouseover", function(dangle, j) {
      //to emulate overlaping mouseover on invisible arc and circles:
      //invisible arc has to be kept activated - similar code to its mouseover but delay removed
      expand_invisible_arcs(d,i);
    //   if (!d3.select('.invisible_arc' + i).classed('isClicked')) {
    //     d3.select('.invisible_arc' + i).attr('d', outerArc);
    //     d3.select('.arc' + i).attr("fill", d => d3.color(color(d.data.group)).darker());
    //     var igroup = d3.selectAll('.group' + i);
    //     igroup.selectAll(".g_line").transition().duration(500)
    //       .attr('x2', function(a, j) {
    //         return positions[j].end.x;
    //       })
    //       .attr('y2', function(a, j) {
    //         return positions[j].end.y;
    //       })
    //     igroup.selectAll(".g_circle").transition().duration(500).attr("r", small_r)
    //     igroup.selectAll(".type_circle").transition().duration(500).attr("r", small_r2)
    //     d3.select('.central_text').text(d.data.group).attr("fill", color(d.data.group));
    // }

      //finally handle circle mouseover
      hadle_mouseOver_circle(d,i,j);

    })
    .on("mouseout", function(dangle, j) {hadle_mouseOut_circle(i,j);})
    .on("click", function(dangle, j) {
      console.log('clicked');
      console.log(i,j);

      // if already active - deactivate
      var active = d3.select(this).classed('isClicked') ? false : true;
      d3.select(this).classed('isClicked',active);
      var inviz_arc = d3.select('.invisible_arc' + i);
      inviz_arc.classed('isClicked',active);

      if (curClicked.group != i & curClicked.group!=null){
        var cur_inviz_arc = d3.select('.invisible_arc' + curClicked.group);
        cur_inviz_arc.classed('isClicked',false).classed('isHovered',false);
        shrink_invisible_arcs(cur_inviz_arc.datum(), curClicked.group)
        active = true;
      }

      if (curClicked.type != j  & curClicked.type!=null){
        console.log('deselect prev circle');
        d3.select('#g_circle' + curClicked.type + "_" + curClicked.group)
        .classed('isClicked',false).classed('isHovered',false);
        d3.select('#g_line' + curClicked.type + "_" + curClicked.group)
        .classed('isHovered',false);
        active = true;
        //d3.selectAll('#type_circles' + j + "_" + i).classed('isHovered', false);
      }

      //save new click
      if (active){
      curClicked.group = i;curClicked.type = j;curClicked.d = inviz_arc.datum();
      updateStats("#statsDia_svg", d.data.mob_types[j].value.values);

    }
    else {
      curClicked.group = null ;curClicked.type = null ;curClicked.d = null;
    }

    });
  //
  var circles_small = circles_g.append("g")
    .attr('class', function(dangle, j) {
      return 'g_sm_circles' + j + "_" + i;
    })
    .each(function(dangle, j) {
      var circleij_x = p_end(dangle).x; //x2(dangle, i)
      var circleij_y = p_end(dangle).y; //y2(dangle, i)
      var num = d.data.mob_types[j].value.length;
      const startAngle = -Math.PI / 4 - Math.PI / 8;
      const endAngle = Math.PI / 8;
      var c_anchors = getCirclesAnchors(num, startAngle, endAngle);
      var c_coords = getCircleCoords(c_anchors, small_r, small_r2, startAngle);
      d3.select(this).selectAll('#type_circles' + j + "_" + i).data(c_coords).enter().append("circle")
        .attr('fill', color(d.data.group))
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
          d3.select('.helper').text('Observed types').attr("fill", color(d.data.group));

        })
        .on("mouseout", function(dangle, j) {
          d3.select('.helper').text('');
        })
    })

}

function repeat(d, i) {
  var circle = d3.select(this)
  circle = circle.transition()
    .duration(500)
    .attr("r", small_r2 - 1)
    .transition()
    .duration(500)
    .attr("r", small_r2)
    .on("end", repeat);
}



function getAnchors(d) {
  var step = (d.endAngle - d.startAngle) / d.value
  var anchors = []
  for (let i = d.startAngle; i < d.endAngle; i += step) {
    anchors.push(i + step / 2);
  }
  return anchors;
}

function show_img(d, j) {
  var name_group = d.data.mob_types[j].value.values[0];
  d3.select('.central_text').transition().duration(500).attr('y', pie_innerR / 2 + 10);
  d3.select('.name_text').text(name_group['name'])
    .classed('isHovered', true)
    .attr('y', -pie_innerR / 2 + 10).transition().duration(500)
    .style("opacity", 1.0);
  var img = d3.select('.central_img')
    .attr('xlink:href', name_group['img_url'])
    .attr('x', -name_group['img_width'] / 2).attr('y', -name_group['img_height'] / 2)
    .attr('height', name_group['img_width']).attr('width', name_group['img_height'])
    .transition().duration(500).style("opacity", 1.0);
}


function hide_img() {
  if (curClicked.type!=null){
    show_img(curClicked.d, curClicked.type);
  }
  else{
  d3.select('.central_text').transition().duration(500).attr('y', 0)
  d3.select('.name_text').transition().duration(500).style("opacity", 0.0)
  d3.select('.central_img').transition().duration(500).style("opacity", 0.0);
}
}


function p_start(angle) {
  return polarToCartesian(-Math.PI / 2 + angle, pie_outerR);
}

function p_end(angle) {
  return polarToCartesian(-Math.PI / 2 + angle, outerR);
}


function getBaseAnchors(num, startAngle, endAngle) {
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


function getMidAnchors(anchors) {
  //to create a pyramide of circles - place anchors between each pair of anchors
  var midAnchors = []
  for (let i = 1; i < anchors.length; i += 1) {
    midAnchors.push(getBaseAnchors(3, anchors[i - 1], anchors[i])[1]);
  }
  return midAnchors;
}

//place new circles on the level starting from the center
function getcentralvalues(arr, num) {
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
function getCirclesAnchors(num, startAngle, endAngle) {
  var max1Level = sum_table.filter(maxval => maxval['values'] >= num)[0]['base'];
  var circles = [];
  var circlesLeft = num;
  var maxAnchorsCurLevel = max1Level;
  var AnchorsCurLevel = getBaseAnchors(max1Level, startAngle, endAngle);
  while (circlesLeft) {
    if (circlesLeft >= maxAnchorsCurLevel) {
      var circlestoplace = maxAnchorsCurLevel;
      circlesLeft = circlesLeft - maxAnchorsCurLevel;
      circles.push(AnchorsCurLevel)
    } else {
      var circlestoplace = circlesLeft;
      circlesLeft = 0;
      //we need to place circlestoplace circles over maxAnchorsCurLevel positions
      var lastLevelAnchors = getcentralvalues(AnchorsCurLevel, circlestoplace)
      circles.push(lastLevelAnchors);
      break;
    }
    AnchorsCurLevel = getMidAnchors(AnchorsCurLevel);
    maxAnchorsCurLevel--;
  }
  return circles;
}
//
//contains max values of circles for a fixed base
//e.g. if base = 2 we can place max 3 circles:
//  o
// o o <-- a base level
const sum_table = [{
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

//calculate coordinates for circles based on anchors and radius
function getCircleCoords(anchors, R, r, startAngle) {
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



var outerR = 200, //180,
  small_r2 = 4, //3, //mobs with similar names names
  small_r = 12, //10,
  pie_innerR = 110, //110,
  pie_outerR = 130; //130;
// originY = height / 2
// originX = width / 2

var curClicked = {group: null, type:null, d: null}

var pie_arc = d3.arc()
  .innerRadius(pie_innerR)
  .outerRadius(pie_outerR)
  .cornerRadius(10)

var outerArc = d3.arc()
  .innerRadius(pie_innerR)
  .outerRadius(outerR + 20)

var pie_group_size = d3.pie()
  .sort(null)
  .startAngle(-Math.PI / 2)
  .endAngle(-Math.PI / 2 + 2 * Math.PI)
  .value(function(d) {
    return d.group_size;
  })
