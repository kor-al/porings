const Sizes = ['Small', 'Medium', 'Large']

var xCenter = 0;
var xLimLeft, xLimRight = 0;
// const minAngle, maxAngle =
var rScale = d3.scalePoint().range([3, 10]).domain(Sizes)
const discrete_features = d3.set(["Size", "Race", "WalkSpeed", "DelayAfterHit", "PropertyName",
"PropertyLevel"])
const quant_features = d3.set(["Level", "Def", "AtkDelay", "HP"])


function createDistDiagram(targetSVG, data) {

  const svg = d3.select(targetSVG)
    .attr("text-anchor", "middle")
    .style("font", "12px sans-serif");

  const width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height"))

  const canvas_g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  var diagram = canvas_g.append('g').attr('id', 'distDia');

  xLimLeft = -width / 2;
  xLimRight = width / 2;

  const node = diagram.append("g")
   .selectAll("circle")
   .data(data)
   .enter().append("circle")
     .attr('r', function(d) { return rScale(d.Size)})
     .attr("class", function(d) { return d.viz_group})

}

function updateDistDiagram(data, choice) {


  var graph = d3.select('#distDia');

  var simulation = d3.forceSimulation(data)
    .force('charge', d3.forceManyBody().strength(5));


  if (choice == 'All') {
    simulation.force('x', d3.forceX().x(xCenter));
  } else {
    var unique = d3.set(data.map(function(d) {
      return d[choice];
    })).values()
    var centerScale = d3.scalePoint().padding(1).range([xLimLeft, xLimRight]).domain(unique)
    simulation.force('x', d3.forceX().x(function(d) {
      return centerScale(d[choice]);
    }))
  }


  var node = graph.selectAll('circle');

  simulation.force('collision', d3.forceCollide().radius(function(d) {
   return rScale(d.Size)+1;
  }))
  .on('tick', ticked);


  function ticked() {
     node.attr("cx", d => d.x)
       .attr("cy", d => d.y);
  }

}



function handle_buttons(data) {
  const buttons = d3.selectAll('input');
  updateDistDiagram(data, this.value);

  buttons.on('change', function(d) {
    console.log('button changed to ' + this.value);
    updateDistDiagram(data, this.value);
  });
}


function getScale(data, choice){
  if( discrete_features.has(feature)){
    var unique = d3.set(data.map(function(d) {
      return d[choice];
    })).values()
    var numDifVals = unique.length;
    var step = 2*Math.PI/numDifVals;
    var anchors = []
    for (let i = 0; i<numDifVals;i++)
    {
      anchors.push(i*step);
    }
  }
  return d3.scalePoint().padding(1).range([xLimLeft, xLimRight]).domain(unique)


}
