const Sizes = ['Small', 'Medium', 'Large']
const Choices = ['All', 'Race', 'WalkSpeed', 'Level' , 'Size', 'Def', 'logHP', 'PropertyName',
"PropertyLevel","AtkDelay" ],
defaultChecked = 'All';

var xCenter = 0;
var containerH = 0,
containerW = 0;
// const minAngle, maxAngle =
var rScale = d3.scalePoint().range([3, 10]).domain(Sizes)
const discrete_features = d3.set(["Size", "Race", "WalkSpeed", "DelayAfterHit", "PropertyName",
  "PropertyLevel"
])
const quant_features = d3.set(["Level", "Def", "AtkDelay", "logHP"]);
const circleRadius = 150,
      xPadding = 50;



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

  const node = diagram.append("g")
    .selectAll("circle")
    .data(data)
    .enter().append("circle")
    .attr('r', function(d) {
      return rScale(d.Size)
    })
    .attr("class", function(d) {
      return d.viz_group
    })

}

function updateDistDiagram(data, choice) {


  var graph = d3.select('#distDia');

  var simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(10))
    .force('center', d3.forceCenter(0, 0));


  if (choice == 'All') {
    simulation.force('x', d3.forceX().x(xCenter));
  } else {
    console.log(choice)
    if (discrete_features.has(choice)) {
      var unique = d3.set(data.map(function(d) {
        return d[choice];
      })).values()

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

      // var unique = d3.set(data.map(function(d) {
      //   return d[choice];
      // })).values()
      // var centerScale = d3.scalePoint().padding(1).range([xLimLeft, xLimRight]).domain(unique)
      console.log(d3.extent(data, function(d) {
        return +d[choice];
      }))


      var centerScale = d3.scaleLinear()
        .range([-containerW/2, containerW/2])
        .domain(d3.extent(data, function(d) {
          return +d[choice];
        }))

      simulation.force('x', d3.forceX().x(function(d) {
        return centerScale(+d[choice]);
      }))
    }
  }


  var node = graph.selectAll('circle');

  simulation.force('collision', d3.forceCollide().radius(function(d) {
      return rScale(d.Size) + 1;
    }))
    .on('tick', ticked);


  function ticked() {

    // node.attr("cx", d => d.x)
    //   .attr("cy", d => d.y);

    node.attr("cx", function(d) {
       var radius = rScale(d.Size)
       d.x = containerW/2 + d.x
       return d.x = Math.max(radius, Math.min(containerW - radius, d.x)) - containerW/2;
     })
       .attr("cy", function(d) {
         var radius = rScale(d.Size)
         d.y = containerW/2 + d.y
          return d.y = Math.max(radius, Math.min(containerH - radius, d.y)) - containerH/2;
        });


  }

}

function create_buttons(){

// Create the shape selectors
var form = d3.select("body").append("form");

labels = form.selectAll("label")
    .data(Choices)
    .enter()
    .append("label")
    .text(function(d) {return d == 'All'? 'Show ' + d : 'By ' + d;})
    .insert("input")
    .attr('type', 'radio')
    .attr('class', 'radioChoice')
    .attr('name', 'sorting_mode')
    .attr('value', function(d, i) {return d;})
    .property("checked", function(d, i) {return i===defaultChecked ;});
}

function handle_buttons(data) {
  const buttons = d3.selectAll('input');
  updateDistDiagram(data, 'All');

  buttons.on('change', function(d) {
    console.log('button changed to ' + this.value);
    updateDistDiagram(data, this.value);
  });
}

function reset_buttons(){
  var inp = document.getElementsByTagName('input')
  for (var i = inp.length-1; i>=0; i--) {
    if ('radio'===inp[i].type) {
      if (inp[i].value == 'All') inp[i].checked = true;
      else inp[i].checked = false;
    }
  }
}


function getScale(data, choice) {
  if (discrete_features.has(feature)) {
    var unique = d3.set(data.map(function(d) {
      return d[choice];
    })).values()
    var numDifVals = unique.length;
    var step = 2 * Math.PI / numDifVals;
    var anchors = []
    for (let i = 0; i < numDifVals; i++) {
      anchors.push(i * step);
    }
  }
  return d3.scalePoint().padding(1).range([xLimLeft, xLimRight]).domain(unique)


}
