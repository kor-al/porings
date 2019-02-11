class StatsDiagram{

    constructor(opts) {
        // load in arguments from config object
        this.data = opts.data;
        this.element = opts.element;

        this.maxR = 225, //radius of the biggest circle
        this.padding = 50,
        this.Stats = ['Vit', 'Agi', 'Str', 'Luk', 'Int', 'Dex'],
        this.minStatValue = 0,
        this.maxStatValue = 260;

        this.NumStats = this.Stats.length;
        this.sliceAngle = 2 * Math.PI / this.NumStats;

        // create the chart
        this.draw();
    }

    draw() {
        // define width, height and margin
        this.width = this.element.offsetWidth;
        this.height =this.element.offsetHeight;
        // this.margin = {
        //     top: 20,
        //     right: 75,
        //     bottom: 45,
        //     left: 50
        // };

        // set up parent element and SVG
        this.element.innerHTML = '';
        const svg = d3.select(this.element).append('svg')
        .attr("text-anchor", "middle")
        .style("font", "12px sans-serif")
        .attr('width',  this.width)
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
      this.rScale = d3.scaleSqrt().range([this.maxR - this.padding, 0]).domain([this.maxStatValue, 0]);
      //makes the axis go in the right direction
      this.axisScale = d3.scaleLinear().range([0, this.maxR - this.padding]).domain([this.maxStatValue, 0]);
   }

   createGrid(){

     var ticks = d3.range(10, this.maxStatValue + 10, 50);

     var grid = this.plot.append('g').attr('id', 'grid')
     var circle_grid = grid.selectAll('.circle_grid').data(ticks).enter().append('g')

     const that = this;

     circle_grid.append('circle')
         .attr('class', 'circle_grid')
         .attr('fill', "#cccccc")
         .attr("opacity", 1 / this.NumStats)
         .attr('r', function(d, i) {
           return that.rScale(d);
         })
         .attr({
           cx: 0,
           cy: 0
         });

       // //add ticks
       circle_grid.append('text').attr('fill', "#cccccc")
         .attr('class', 'circle_tick')
         .attr('x', function(d, i) {
           return that.rScale(d) - 10
         })
         .attr('y', -5)
         .text(function(d, i) {
           return i % 2 ? '' : d
         })

       grid.selectAll('.axis').data(d3.range(0, this.NumStats)).enter()
         .append('line')
         .attr('class', 'axis')
         .attr("stroke", "#cccccc")
         .attr('x2', function(d, i) {
           return polarToCartesian(i * that.sliceAngle, that.maxR - that.padding).x
         })
         .attr('y2', function(d, i) {
           return polarToCartesian(i * that.sliceAngle, that.maxR - that.padding).y
         })
         .attr({
           x1: 0,
           y1: 0
         });

       grid.selectAll('.axis_label').data(this.Stats).enter()
         .append('text')
         .attr('class', 'axis_label')
         .attr("fill", "#cccccc")
         .attr('x', function(d, i) {
           return polarToCartesian(i * that.sliceAngle, that.maxR - 2 * that.padding / 3).x
         })
         .attr('y', function(d, i) {
           return polarToCartesian(i * that.sliceAngle, that.maxR - 2 * that.padding / 3).y
         })
         .text(function(d, i) {
           return d;
         });

   }

   createDataGroup(){
     this.graph = this.plot.append('g').attr('id', 'data_viz')
   }

   reset(){

     var polys = this.graph.selectAll(".poly");

     var line0 = d3.line().x(0).y(0);

     polys.transition().delay(100).duration(500)
     .attr("d", line0).remove();

   }

   update(data) {

     const fillOpacity = 1 / (data.length + 1);
     const that = this;

    // remove previous lines
     this.reset();

     data.forEach(function(d, i) {

         var line0 = d3.line().x(0).y(0);

         var line = d3.line()
           .x(function(s, j) {
             return polarToCartesian(j * that.sliceAngle, that.rScale(d[s])).x;
           })
           .y(function(s, j) {
             return polarToCartesian(j * that.sliceAngle, that.rScale(d[s])).y;
           });

         that.graph.append("path")
           .datum(that.Stats.concat(that.Stats[0]))
           .attr("d", line0)
           .classed(d.viz_group, true)
           .classed('poly', true)
           //.attr("fill", color(d.viz_group))
           .attr("fill-opacity", fillOpacity)
           .on('mouseover', function(s, j) {
             var poly = d3.select(this)
             poly.raise()//.attr("fill-opacity", 0.5)
             .classed('isHovered', true)
           })
           .on('mouseout', function(s, j) {
             d3.select(this)//.attr("fill-opacity", fillOpacity)
             .classed('isHovered', false)
           })
           .transition().delay(100 * i).duration(500)
           .attr("d", line)
           .attr("stroke", group2color(d.viz_group))
           .attr('stroke-width', 1)
       })

     }

}
