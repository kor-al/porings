const Sizes = ['Small', 'Medium', 'Large']
const Choices = ['All', 'Race', 'WalkSpeed', 'Level', 'Size', 'Def', 'HP', 'PropertyName',
    "PropertyLevel", "AtkDelay"
  ],
  defaultChecked = 'All';

var xCenter = 0;
var containerH = 0,
  containerW = 0;
// const minAngle, maxAngle =
var rScale = d3.scalePoint().range([3, 10]).domain(Sizes)
const discrete_features = d3.set(["Size", "Race", "WalkSpeed", "DelayAfterHit", "PropertyName",
  "PropertyLevel"
])
const quant_features = d3.set(["Level", "Def", "AtkDelay", "HP"]);
const circleRadius = 150,
  circleTextPadding = 25,
  threshold = 0.01;



function createDistDiagram(targetSVG, data) {

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  var diagram = canvas_g.append('g').attr('id', 'distDia');

  containerH = height;
  containerW = width;

  var grid = diagram.append("g").attr('id', 'grid')

  const node = diagram.append("g")
    .selectAll(".node")
    .data(data)
    .enter().append("circle")
    .attr('r', function(d) {
      return rScale(d.Size)
    })
    .attr("class", function(d) {
      return 'node ' + d.viz_group
    })

}

function updateDistDiagram(data, choice) {


  var labels_shown = false;
  var graph = d3.select('#distDia');
  var grid = d3.select('#grid');
  var node = graph.selectAll('.node');
  //d3.selectAll('.group_label').transition().duration(200).attr('fill-opacity', 0).remove()

  var simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(5))
    .force('center', d3.forceCenter(0, 0));


  var isDiscrete = false;
  var centerScale;

  d3.selectAll('.group_label').remove()
  var labels = graph.append('g').classed('group_label', true);

  if (choice == 'All') {
    simulation.force('x', d3.forceX().x(xCenter));
  } else {
    if (discrete_features.has(choice)) {
      var unique = d3.set(data.map(function(d) {
        return d[choice];
      })).values()

      labels.selectAll('.label_text').data(unique).enter()
      .append('text')
      .attr('id',function(d,i) { console.log(d,i); return 'label_text' + i})

      console.log(labels)

      isDiscrete = true;

      var angleScale = d3.scalePoint().padding(0.5).range([0, 2 * Math.PI]).domain(unique)

      var xy_points = data.map(function(d) {
        return polarToCartesian(angleScale(d[choice]), circleRadius);
      })

      simulation.force('x', d3.forceX().x(function(d, i) {
          return xy_points[i].x;
        }))
        .force('y', d3.forceY().y(function(d, i) {
          return xy_points[i].y
        }))
    } else {

      var unique = d3.set(data.map(function(d) {
        return +d[choice];
      })).values().sort(function(a, b) {
        return +a < +b ? -1 : +a > +b ? 1 : 0;
      }) //}d3.ascending)



      centerScale = d3.scalePoint().padding(1).range([-containerW / 2, containerW / 2]).domain(unique)

      // var centerScale = d3.scaleLinear()
      //   .range([-containerW/2, containerW/2])
      //   .domain(d3.extent(data, function(d) {
      //     return +d[choice];
      //   }))

      simulation.force('x', d3.forceX().x(function(d) {
        return centerScale(+d[choice]);
      }))

      //AXIS
      var ticks = unique.filter(function(d, i) {
        return !(i % 5);
      });
      console.log(unique)
      console.log(ticks)
      var rects = grid.append('g').classed('group_label', true)
      var ticks_text = grid.append('g').classed('group_label', true)
      ticks.forEach(function(t, i) {
        // labels.append('line')
        // .attr("stroke", "#cccccc").attr('y2', -containerH/2).attr('x2', centerScale(+t))
        // .attr('y1', containerH/2).attr('x1', centerScale(+t));
        rects.append('rect').attr('fill', "#cccccc").attr('fill-opacity', 1/ticks.length)
          .attr('y', -containerH / 2).attr('x', -containerW / 2).attr('height', containerH)
          .attr('width', containerW / 2 + centerScale(+t))
        console.log(centerScale(+t))
        ticks_text.append('text').attr('y', containerH / 2 - 20).attr('x', centerScale(+t))
        .text(format_value(Math.ceil(t)))
      })
    }
  }


  simulation.force('collision', d3.forceCollide().radius(function(d) {
      return rScale(d.Size) + 1;
    }))
    .on('tick', ticked);
    //.on('end', show_grid);


  function ticked() {
    // without boundaries
    // node.attr("cx", d => d.x)
    //   .attr("cy", d => d.y);

    // console.log(this.alpha())
    if (this.alpha() < 0.5 & !labels_shown){
      labels_shown = true;
      show_grid();
    }

    //now WITH boundaries
    node.attr("cx", function(d) {
        var radius = rScale(d.Size)
        d.x = containerW / 2 + d.x
        return d.x = Math.max(radius, Math.min(containerW - radius, d.x)) - containerW / 2;
      })
      .attr("cy", function(d) {
        var radius = rScale(d.Size)
        d.y = containerW / 2 + d.y
        return d.y = Math.max(radius, Math.min(containerH - radius, d.y)) - containerH / 2;
      });
  }

  function show_grid() {

    if (isDiscrete) {

      var positions = []
      node.each(function(d, i) {
        //console.log(d,i) //data_enter
        var thisCircle = d3.select(this)
        positions.push({
          cx: +thisCircle.attr('cx'),
          cy: +thisCircle.attr('cy'),
          value: d[choice]
        })
      })
      console.log(positions)
      console.log(node)

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
        console.log(p, i)
        var groupR = Math.max(p.value.xRange[1] - p.value.xRange[0], p.value.yRange[1] - p.value.yRange[0]) / 2
        var groupC = {
          cx: (p.value.xRange[1] + p.value.xRange[0]) / 2,
          cy: (p.value.yRange[1] + p.value.yRange[0]) / 2
        }
        // console.log(groupR, groupC, circleTextPadding)
        // graph.append('circle').attr('r', groupR).attr('cx', groupC.cx).attr('cy', groupC.cy)
        var label_angle = -Math.PI / 3; //(groupC.cx > 0) ? -Math.PI/3 : Math.PI/3;
        var anchor = polarToCartesian(label_angle, groupR + circleTextPadding)
        labels.select('#label_text' + i)
          .attr('x', groupC.cx + anchor.x)
          .attr('y', groupC.cy + anchor.y)
          .text(unique[i])
          .attr('fill-opacity', 0)
          .classed('label_text', true)
          .transition().duration(500).attr('fill-opacity', 1)
      })


    }
  }
}

function highlightDistDiagram(targetSVG, selectedVal,isType= true){
  var graph = d3.select(targetSVG);
  var node = graph.selectAll('.node');
  console.log(selectedVal)
  node.each(function(d,i){
    console.log(d3.select(this))
    if (d.name ==selectedVal)
    {d3.select(this).classed('isHovered', true)}
    else {d3.select(this).classed('isHovered', false)}
  })
}

function removeHighlightDistDiagram(targetSVG){
  var graph = d3.select(targetSVG);
  var node = graph.selectAll('.node').classed('isHovered', false);
}


  // if (isDiscrete)
  // {
  //   for(let i = 0; i< unique.length; i++){
  //         var anchor =  polarToCartesian(angleScale(unique[i]), circleRadius + circleTextPadding);
  //         labels.append('text').attr('x', anchor.x).attr('y', anchor.y)
  //         .text(unique[i])
  //       }
  // }

  function create_buttons() {

    // Create the shape selectors
    var form = d3.select("body").append("form");

    labels = form.selectAll("label")
      .data(Choices)
      .enter()
      .append("label")
      .text(function(d) {
        return d == 'All' ? 'Show ' + d : 'By ' + d;
      })
      .insert("input")
      .attr('type', 'radio')
      .attr('class', 'radioChoice')
      .attr('name', 'sorting_mode')
      .attr('value', function(d, i) {
        return d;
      })
      .property("checked", function(d, i) {
        return i === defaultChecked;
      });
  }

  function handle_buttons(data) {
    const buttons = d3.selectAll('input');
    updateDistDiagram(data, 'All');

    buttons.on('change', function(d) {
      console.log('button changed to ' + this.value);
      updateDistDiagram(data, this.value);
    });
  }

  function reset_buttons() {
    var inp = document.getElementsByTagName('input')
    for (var i = inp.length - 1; i >= 0; i--) {
      if ('radio' === inp[i].type) {
        if (inp[i].value == 'All') inp[i].checked = true;
        else inp[i].checked = false;
      }
    }
  }


  // function show_grid(data, choice) {
  //   if (discrete_features.has(feature)) {
  //     var unique = d3.set(data.map(function(d) {
  //       return d[choice];
  //     })).values()
  //     var numDifVals = unique.length;
  //     var step = 2 * Math.PI / numDifVals;
  //     var anchors = []
  //     for (let i = 0; i < numDifVals; i++) {
  //       anchors.push(i * step);
  //     }
  //   }
  //   return d3.scalePoint().padding(1).range([xLimLeft, xLimRight]).domain(unique)
  //
  //
  // }
