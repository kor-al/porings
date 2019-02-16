// URL: https://beta.observablehq.com/@kor-al/poring-family
// Title: Poring Family
// Author: Alisa (@kor-al)
// Version: 1595
// Runtime version: 1

const m0 = {
  id: "117fdc19dab9f706@1595",
  variables: [
    {
      inputs: ["md"],
      value: (function(md){return(
md`# Poring Family`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`The variety of porings from Ragnarok Online organized.`
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`The data has been scraped from the RO database (http://ratemyserver.net/) and preprocessed with python.`
)})
    },
    {
      name: "data",
      inputs: ["d3"],
      value: (function(d3){return(
d3.csv("https://raw.githubusercontent.com/kor-al/porings/master/poring_family.csv")
)})
    },
    {
      inputs: ["pie","nest","d3","DOM","width","height","arc","color","OuterArc","x2","y2","small_r","small_r2","x1","y1","draw_groups"],
      value: (function(pie,nest,d3,DOM,width,height,arc,color,OuterArc,x2,y2,small_r,small_r2,x1,y1,draw_groups)
{
  const pie_arcs = pie(nest);
  
  const svg = d3.select(DOM.svg(width, height))
      .attr("text-anchor", "middle")
      .style("font", "12px sans-serif");

  const canvas_g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
  
  var myimage = canvas_g.append('image')
      .attr('xlink:href', "") //http://file5.ratemyserver.net/mobs/1388.gif
      .style("opacity", 0.0)
      .attr('class', 'central_img')
  
  var text = canvas_g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .attr('class', 'central_text')
      .text("Poring Family")
      .attr('fill', '#b55758')
      .style("font-size", "16px")
      .style("font-weight", "bold")
  
  var text_help = canvas_g.append('text')
      .attr('y', height/2-50)
      .attr('x', width /2- 50)
      .attr('class', 'helper')
      .text("")
      .attr('fill', '#b55758')
      .style("font-size", "12px")
      .style("font-weight", "bold")
  
  var text_name = canvas_g.append('text')
      .attr('x', 0)
      .attr('y', 0)
      .style("opacity", 0.0)
      .attr('class', 'name_text')
      .text("")
      .style("font-size", "14px")
     
  
  var arcs_group = canvas_g.append("g")
  
  var groups = arcs_group.selectAll("g")
    .data(pie_arcs)
    .enter()
    .append("g")
    .attr('class',function(d,i){return 'group'+i;})

  var arcs = groups.append("path")
    .attr('class', function(d,i){return 'arc'+i;})
    .attr("d", arc)
    .attr("fill", d => color(d.data.group))
    .attr("stroke", "white")
  
  var invisible_arcs = groups.append("path")
    .attr('class', function(d,i){return 'invisible_arc'+i;})
    .attr("d", arc)
    .style("fill", "transparent")
    .on("mouseover", function handleMouseOver(d,i){
      d3.select(this).attr('d', OuterArc);//.append("svg:title").text('poring group');
      d3.select('.arc' + i).attr("fill",  d => d3.color(color(d.data.group)).darker());
      var igroup = d3.selectAll('.group'+ i);
      igroup.selectAll(".g_line").transition().duration(500).attr("x2", x2).attr("y2", y2)
      igroup.selectAll(".g_circle").transition().delay(300).duration(500).attr("r",small_r)
      igroup.selectAll(".type_circle").transition().delay(500).duration(500).attr("r",small_r2)
      d3.select('.helper').text('Genus').attr("fill",  color(d.data.group));
      d3.select('.central_text').text(d.data.group).attr("fill",  color(d.data.group));
    })
    .on("mouseout", function handleMouseOut(d,i){
      d3.select(this).attr('d', arc);
      d3.select('.arc' + i).attr("fill",  d => color(d.data.group));
      var igroup = d3.selectAll('.group'+ i)
      igroup.selectAll(".g_line").transition().duration(500).attr("x2", x1).attr("y2", y1)
      igroup.selectAll(".g_circle").transition().duration(500).attr("r",0)
      igroup.selectAll(".type_circle").transition().duration(500).attr("r",0)
      d3.select('.central_text').text("Poring Family").attr('fill', '#b55758');
      d3.select('.helper').text('');
    })
  
 
     var arcs_circles = groups.each(draw_groups);

  return svg.node();
}
)
    },
    {
      name: "nest_t",
      inputs: ["d3","data"],
      value: (function(d3,data){return(
d3.nest()
  .key(function(d){ return d.viz_group;})
  .key(function(d) { return d.name; })
  .rollup(function(leaves) {
    return {"length": leaves.length, "values":leaves} 
  })
  .entries(data)
  .map(function(d) {return {group: d.key, mob_types : d.values};})
)})
    },
    {
      name: "nest",
      inputs: ["nest_t"],
      value: (function(nest_t)
{
var count = 0;

nest_t.forEach(function(d) {
  d.group_size = d.mob_types.length
});
 return nest_t
}
)
    },
    {
      name: "pie",
      inputs: ["d3"],
      value: (function(d3){return(
d3.pie()
    .sort(null)
    //.startAngle(-90 * Math.PI/180)
   // .endAngle(-90 * Math.PI/180 + 2*Math.PI)
    .startAngle(-Math.PI/2)
    .endAngle(-Math.PI/2 + 2*Math.PI)
    .value(function(d){
    return d.group_size;
    })
)})
    },
    {
      name: "width",
      value: (function(){return(
700
)})
    },
    {
      name: "height",
      value: (function(){return(
500
)})
    },
    {
      inputs: ["md"],
      value: (function(md){return(
md`Demo of circles' placement`
)})
    },
    {
      inputs: ["d3","DOM","width","height","getCirclesAnchors","getCircleCoords"],
      value: (function(d3,DOM,width,height,getCirclesAnchors,getCircleCoords)
{
  
  const svg = d3.select(DOM.svg(width, height))
      .attr("text-anchor", "middle")
      .style("font", "12px sans-serif");

  const canvas_g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);
  
  const R = 50;
  const r = 10;
  const num = 10;
  const startAngle =  -Math.PI/4-Math.PI/8 ;
  const endAngle = Math.PI/8;
  
  var initial_circle = canvas_g.append("circle").attr('r', R).attr('fill',"#c3d7e3").attr('cx', 0).attr('cy', 0);
  
//   var circles_group = initial_circle.append('g')
  
  var c_anchors = getCirclesAnchors(num,startAngle, endAngle);
  
  var c_coords = getCircleCoords(c_anchors,R,r,startAngle);
  
  function repeat(d,i) {
    var circle = d3.select(this)
    circle = circle.transition()
              .duration(500)
              .attr("r", r)
              .transition()
              .duration(500)
              .attr("r", r+3)
              .on("end", repeat);
          }
  
  var circles = canvas_g.selectAll('.circles').data(c_coords).enter().append("circle")
  .attr('fill', '#c3d7e3')
  .attr('class', ".circles")
  .attr('cx', function(d,i){return  d['cx'];})
  .attr('cy', function(d,i){return  d['cy'];})
  .attr('r', 10)
  .each(repeat)
  
  // .attr('class', ".circles")
  // .attr('cx', width / 2).attr('cy', height-R*4);
  //.attr('cx', function(d,i){return 10*i;})
  // .attr('cy', 0)
  
  

  
  return svg.node()
}
)
    },
    {
      name: "originX",
      inputs: ["width"],
      value: (function(width){return(
width / 2
)})
    },
    {
      name: "originY",
      inputs: ["height"],
      value: (function(height){return(
height / 2
)})
    },
    {
      name: "pie_outerR",
      inputs: ["width","height"],
      value: (function(width,height){return(
Math.min(width, height) / 2 - 120
)})
    },
    {
      name: "pie_innerR",
      value: (function(){return(
110
)})
    },
    {
      name: "small_r",
      value: (function(){return(
10
)})
    },
    {
      name: "small_r2",
      value: (function(){return(
3
)})
    },
    {
      name: "outerR",
      inputs: ["width","height"],
      value: (function(width,height){return(
Math.min(width, height) / 2 - 70
)})
    },
    {
      name: "arc",
      inputs: ["d3","pie_innerR","pie_outerR"],
      value: (function(d3,pie_innerR,pie_outerR){return(
d3.arc()
    .innerRadius(pie_innerR)
    .outerRadius(pie_outerR)
    .cornerRadius(10)
)})
    },
    {
      name: "OuterArc",
      inputs: ["d3","pie_innerR","outerR"],
      value: (function(d3,pie_innerR,outerR){return(
d3.arc()
    .innerRadius(pie_innerR)
    .outerRadius(outerR+20)
)})
    },
    {
      name: "color",
      inputs: ["d3"],
      value: (function(d3){return(
d3.scaleOrdinal()
      .domain(["Angeling", "Poring", "Poporing", "Marin", "Magmaring", "Drops","Metaling", "Others"])
      .range(["#d4d8d8", "#fa978e",  "#c8db93", "#b0a7c1", "#f58658", "#eac699", "#ca8e8c", "#c3d7e3"])
)})
    },
    {
      name: "getAnchors",
      value: (function(){return(
function getAnchors(d) {
  var step = (d.endAngle - d.startAngle)/d.value
  var anchors = []
  for (let i = d.startAngle; i < d.endAngle; i += step) {
    anchors.push(i + step/2);
    }
  return anchors;
}
)})
    },
    {
      name: "draw_groups",
      inputs: ["getAnchors","d3","x1","y1","color","x2","y2","OuterArc","small_r","small_r2","repeat","show_img","hide_img","getCirclesAnchors","getCircleCoords","toDegrees"],
      value: (function(getAnchors,d3,x1,y1,color,x2,y2,OuterArc,small_r,small_r2,repeat,show_img,hide_img,getCirclesAnchors,getCircleCoords,toDegrees){return(
function draw_groups(d,i) {
  var angles = getAnchors(d);
  
  var arc = d3.select(this);

  var sub_arc_group = arc.selectAll("g").data(angles).enter().append("g")
 
  var line = sub_arc_group.append("line")
  .attr("x1", x1).attr("y1", y1).attr("x2", x1).attr("y2", y1)
  .attr("stroke-width",1)// 1)
  .attr("stroke",  color(d.data.group))
  .attr('class','g_line')
  .style("pointer-events", "none")
  .attr('id', function(angles, j) {return 'g_line'+j +"_" + i;})
  
  var circles_g = sub_arc_group.append("g")
  
  var circle = circles_g.append("circle")
  .attr("r", 0) //10)
  .attr("cx", x2)
  .attr("cy", y2)
  .attr('class','g_circle')
  .attr("fill",  color(d.data.group))
  .on("mouseover", function (dangle,j){
      d3.select('.helper').text('Species').attr("fill",  color(d.data.group));
    })
  .on("mouseout", function (dangle,j){
      d3.select('.helper').text('');
    })
  
  
  circles_g.on("mouseover", function (dangle,j){
       //to emulate overlaping mouseover on invisible arc and circles:
       //invisible arc has to be kept activated - similar code to its mouseover but delay removed
       d3.select('.invisible_arc' + i).attr('d', OuterArc);
       d3.select('.arc' + i).attr("fill",  d => d3.color(color(d.data.group)).darker());
       var igroup = d3.selectAll('.group'+ i);
       igroup.selectAll(".g_line").transition().duration(500).attr("x2", x2).attr("y2", y2)
       igroup.selectAll(".g_circle").transition().duration(500).attr("r",small_r)
       igroup.selectAll(".type_circle").transition().duration(500).attr("r",small_r2)
       d3.select('.central_text').text(d.data.group).attr("fill",  color(d.data.group));
       //finally handle circle mouseover
       d3.select(this).selectAll('.g_circle').attr("fill", d3.color(color(d.data.group)).darker());
       d3.selectAll('#g_line'+j +"_" + i).attr("stroke", d3.color(color(d.data.group)).darker());
       d3.selectAll('#type_circles' +j +"_" + i).attr("fill",d3.color(color(d.data.group)).darker()).each(repeat);

       show_img(d, j);
     })
  .on("mouseout", function (dangle,j){
       d3.select(this).selectAll('.g_circle').attr("fill",  color(d.data.group));
       d3.selectAll('#type_circles' +j +"_" + i).attr("fill",color(d.data.group));
       d3.selectAll('#g_line'+j +"_" + i).attr("stroke", color(d.data.group));
       hide_img();
     })
  
  
  var circles_small = circles_g.append("g")
  .attr('class', function (dangle,j){return 'g_sm_circles' +j +"_" + i;})
  .each( function(dangle, j){
    var circleij_x = x2(dangle,i)
    var circleij_y = y2(dangle,i)
    var num =  d.data.mob_types[j].value.length;
    const startAngle =  -Math.PI/4-Math.PI/8 ;
    const endAngle = Math.PI/8;
    var c_anchors = getCirclesAnchors(num,startAngle, endAngle);
    var c_coords = getCircleCoords(c_anchors,small_r,small_r2,startAngle);
    d3.select(this).selectAll('.type_circles' +j +"_" + i).data(c_coords).enter().append("circle")
      .attr('fill', color(d.data.group))
      .attr('class', 'type_circle')
      .attr('id', 'type_circles' +j +"_" + i)
      .attr('cx', function(coord){return circleij_x +  coord['cx'];})
      .attr('cy', function(coord){return circleij_y + coord['cy'];})
      .attr('r', 0)
      .attr("transform", "rotate(" + toDegrees(dangle) + "," + circleij_x + "," + circleij_y + ")")
      .on("mouseover", function (dangle,j){
      d3.select('.helper').text('Observed types').attr("fill",  color(d.data.group));
    })
      .on("mouseout", function (dangle,j){
      d3.select('.helper').text('');
    })
  })
}
)})
    },
    {
      name: "repeat",
      inputs: ["d3","small_r2"],
      value: (function(d3,small_r2){return(
function repeat(d,i) {
    var circle = d3.select(this)
    circle = circle.transition()
              .duration(500)
              .attr("r", small_r2-1)
              .transition()
              .duration(500)
              .attr("r", small_r2)
              .on("end", repeat);
          }
)})
    },
    {
      name: "show_img",
      inputs: ["d3","pie_innerR","color"],
      value: (function(d3,pie_innerR,color){return(
function show_img(d, j) {
  var name_group = d.data.mob_types[j].value.values[0];
  d3.select('.central_text').transition().duration(500).attr('y', pie_innerR/2+10);
  d3.select('.name_text').text(name_group['name'])
    .attr("fill",  d3.color(color(d.data.group)).darker())
    .attr('y', -pie_innerR/2+10).transition().duration(500)
    .style("opacity", 1.0);
  var img = d3.select('.central_img')
  .attr('xlink:href', name_group['img_url'])
  .attr('x',-name_group['img_width']/2).attr('y',-name_group['img_height']/2)
  .attr('height',name_group['img_width']).attr('width',name_group['img_height'])
  .transition().duration(500).style("opacity", 1.0);
}
)})
    },
    {
      name: "hide_img",
      inputs: ["d3"],
      value: (function(d3){return(
function hide_img() {
  d3.select('.central_text').transition().duration(500).attr('y',0)
  d3.select('.name_text').transition().duration(500).style("opacity", 0.0)
  d3.select('.central_img').transition().duration(500).style("opacity", 0.0);
}
)})
    },
    {
      name: "x2",
      inputs: ["outerR"],
      value: (function(outerR){return(
function(d,i){return outerR* Math.cos(-Math.PI/2 +d);}
)})
    },
    {
      name: "y2",
      inputs: ["outerR"],
      value: (function(outerR){return(
function(d,i){return outerR* Math.sin(-Math.PI/2 +d);}
)})
    },
    {
      name: "y1",
      inputs: ["pie_outerR"],
      value: (function(pie_outerR){return(
function(d,i){return pie_outerR* Math.sin(-Math.PI/2 +d);}
)})
    },
    {
      name: "x1",
      inputs: ["pie_outerR"],
      value: (function(pie_outerR){return(
function(d,i){return pie_outerR* Math.cos(-Math.PI/2 +d);}
)})
    },
    {
      name: "toDegrees",
      value: (function(){return(
function toDegrees(rad) {
    return rad * (180/Math.PI);
}
)})
    },
    {
      name: "getBaseAnchors",
      value: (function(){return(
function(num, startAngle, endAngle){
  //num = points to place between start and end angles
  var anchors = []
  if (num == 1)
  {
    anchors.push(-endAngle);
  }
  else {
    var step = (endAngle - startAngle)/(num-1);
    for (let i = startAngle; i <= endAngle; i += step) {
           anchors.push(i);
      }
  }
  return anchors; 
}
)})
    },
    {
      name: "getMidAnchors",
      inputs: ["getBaseAnchors"],
      value: (function(getBaseAnchors){return(
function(anchors){
  //place anchors between each pair of anchors
  var midAnchors = []
  for (let i = 1; i < anchors.length; i +=1) {
    midAnchors.push(getBaseAnchors(3, anchors[i-1], anchors[i])[1]);
  }
  return midAnchors;
 }
)})
    },
    {
      name: "getcentralvalues",
      value: (function(){return(
function(arr, num){
  //array of values [22,45,66,788,3343] 
  //take num of values arund the center of the array e.g. num = 3, then result = [45,66,788] 
  var midInd = Math.ceil(arr.length/2)-1
  if (num %2){
      num -=1;
      var leftLim = midInd - num/2;
    }
  else{
    if(arr.length % 2) {
      var leftLim = midInd;
    }
    else{
      var leftLim = midInd - num/2 + 1;
    }
  }
  var rightLim = midInd + num/2;
  return arr.slice(leftLim, rightLim+1);
}
)})
    },
    {
      name: "getCirclesAnchors",
      inputs: ["sum_table","getBaseAnchors","getcentralvalues","getMidAnchors"],
      value: (function(sum_table,getBaseAnchors,getcentralvalues,getMidAnchors){return(
function(num, startAngle, endAngle){
  var max1Level = sum_table.filter(maxval => maxval['values'] >= num)[0]['base'];
  var circles = [];
  var circlesLeft = num;
  var maxAnchorsCurLevel = max1Level;
  var AnchorsCurLevel = getBaseAnchors(max1Level, startAngle, endAngle);
  while(circlesLeft){
    if (circlesLeft>=maxAnchorsCurLevel){
      var circlestoplace = maxAnchorsCurLevel;
      circlesLeft = circlesLeft - maxAnchorsCurLevel;
      circles.push(AnchorsCurLevel)
      }
    else {
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
)})
    },
    {
      name: "sum_table",
      value: (function(){return(
[{'base': 1, 'values': 1},
	{'base': 2, 'values': 3},
	{'base': 3, 'values': 6},
	{'base': 4, 'values': 10},
  {'base': 4, 'values': 15}]
)})
    },
    {
      name: "getCircleCoords",
      value: (function(){return(
function(anchors,R,r,startAngle){
  var circles = [];
  R+=r;
  for (let level = 0; level < anchors.length; level+=1){
    for (let al = 0; al < anchors[level].length; al+=1){
      var cy = (R-level*r/2)*Math.sin(startAngle +anchors[level][al]);
      var cx = (R-level*r/2)*Math.cos(startAngle +anchors[level][al]);
      circles.push({'cx': cx, 'cy': cy})
    }
    R+=2*r;
  }
  return circles;
}
)})
    },
    {
      name: "d3",
      inputs: ["require"],
      value: (function(require){return(
require("d3@5")
)})
    }
  ]
};

const notebook = {
  id: "117fdc19dab9f706@1595",
  modules: [m0]
};

export default notebook;
