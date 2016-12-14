require('../css/styles.scss')
var d3 = require('d3')
var topojson = require('topojson')
var _ = require('underscore')
var $ = require('jquery')

var maps = [
    {
        'name': 'dwarka-barakhamba',
        'text': ''
    }
]

var timedata = [
// {
//     'year': 2011,
//     'time': 62,
//     // 'speed':32,
//     'color':"#FCF1A2"
// },
{
    'year': 2012,
    'time': 65,
    'dist': 25.05,
    // 'speed':32.8,
    'color':"#EE413B"
},
// {
//     'year': 2013,
//     'time': 90,
//     // 'speed':28,
//     'color':"#EF6F2C"
// },
{
    'year': 2014,
    'time': 92,
    'dist': 25.05,
    // 'speed':30.2,
    'color':"#249681"
},
// {
//     'year': 2015,
//     'time': 121,
//     // 'speed':24.08,
//     'color':"#00B99F"
// },
{
    'year': 2016,
    'time': 125,
    'dist': 25.05,
    // 'speed':21.6,
    'color':"#2E4D5D"
}]

var projection = d3.geoMercator();

var pathf = d3.geoPath()
    .projection(projection)
    .pointRadius(2);
var mapwidth = 500
var mapheight = 300
var timefactor = 0.005


d3.json('data/output.json',function(error, data){
    d3.select('.legend')
    .selectAll('.year')
    .data(timedata)
    .enter()
    .append('div')
    .attr('class','year-block')
    .append('h3')
    .attr('class','year')
    .style('color',function(d){return d.color})
    .text(function(d){return d.year})

    d3.selectAll('.year-block')
    .append('p')
    .attr('class','time')
    .html('0 mins')

    d3.selectAll('.year-block')
    .append('p')
    .attr('class','distance')
    .html('<span class = "distance-num">0</span> kms')

    var boundary = centerZoom(data);
    var svg = d3.select('.chart')
    .append('svg')
    .attr('width',"500")
    .attr('height',"300")

    var g = svg.append('g')
    .attr('class','route-c')

    var path = g.append("path")
    .datum(topojson.feature(data, data.objects["dwarka-barakhamba"]))
    .attr("d", pathf)
    .attr("class", "route");

    g.append('g')
        .attr('class','marker-layer')
        .selectAll('.marker')
        .data(timedata)
        .enter()
        .append('circle')
        .attr("r", 5)
        .style('fill',function(d){return d.color})
        .attr('class','marker')

    transition();

    function transition() {

            d3.selectAll('.marker')
                .transition()
                .duration(function(d){return d.time*60*1000*timefactor})
                .attrTween("transform", translateAlong(path.node()))
        
    }
      
  function translateAlong(path) {
    var l = path.getTotalLength();
    return function(i) {
      return function(t) {
        var p = path.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ")";//Move marker
      }
    }
  }

  $('#reset').on('click',function(){
    reset()
  })

  function reset(){
    d3.selectAll('.marker')
            .transition()
            .duration(0)
            .attr('transform','translate(0,0)')

    transition();
  }

})
function centerZoom(data){
    var o = topojson.mesh(data, data.objects["dwarka-barakhamba"], function(a, b) { return a === b; });

    projection
        .scale(1)
        .translate([0, 0]);

    var b = pathf.bounds(o),
        s = 1 / Math.max((b[1][0] - b[0][0]) / mapwidth, (b[1][1] - b[0][1]) / mapheight),
        t = [(mapwidth - s * (b[1][0] + b[0][0])) / 2, (mapheight - s * (b[1][1] + b[0][1])) / 2];

    projection
        .scale(s)
        .translate(t);

    return o;
}