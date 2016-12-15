require('../css/styles.scss')
var d3 = require('d3')
var topojson = require('topojson')
var _ = require('underscore')
var $ = require('jquery')

var maps = [
    {
        'name': 'dwarka-barakhamba',
        'title':'Western woes',
        'loc':"Dwarka to Barakhamba Road",
        'data': [{
                    'year': 2012,
                    'time': 65,
                    'dist': 25.05
                },

                {
                    'year': 2014,
                    'time': 92,
                    'dist': 25.05
                },
                {
                    'year': 2016,
                    'time': 125,
                    'dist': 25.05
                }
            ]
    },
    {
        'name': 'mayurvihar-mandihouse',
        'title':'Eastern bound',
        'loc':"Mayur Vihar Phase 1 to Pragati Maidan",
        'data': [{
                    'year': 2012,
                    'time': 52,
                    'dist': 8.75
                },

                {
                    'year': 2014,
                    'time': 78,
                    'dist': 8.75
                },
                {
                    'year': 2016,
                    'time': 105,
                    'dist': 8.75
                }
            ]
    },
    {
        'name': 'vasantkunj-csec',
        'title':'The problems of being posh',
        'loc':"Vasant Kunj to Central Secretariat",

        'data': [{
                    'year': 2012,
                    'time': 45,
                    'dist': 15.1
                },

                {
                    'year': 2014,
                    'time': 80,
                    'dist': 15.1
                },
                {
                    'year': 2016,
                    'time': 112,
                    'dist': 15.1
                }
            ]
    },
    {
        'name': 'vasantkunj-cp',
        'title':'Vasant Kunj to Connaught Place',
        'data': [{
                    'year': 2012,
                    'time': 48.4,
                    'dist': 18.2
                },

                {
                    'year': 2014,
                    'time': 55.6,
                    'dist': 18.2
                },
                {
                    'year': 2016,
                    'time': 88,
                    'dist': 18.2
                }
            ]
    },
    {
        'name': 'kailashcolony-cp',
        'title':'Into the den',
        'loc':"Kailash Colony to Connaught Place",

        'data': [{
                    'year': 2012,
                    'time': 15.8,
                    'dist': 10.08
                },

                {
                    'year': 2014,
                    'time': 25,
                    'dist': 10.08
                },
                {
                    'year': 2016,
                    'time': 45,
                    'dist': 10.08
                }
            ]
    }
]

var color = {
    2012: '#EE413B',
    2014: '#249681',
    2016: '#2E4D5D'
}

var projection = d3.geoMercator();
var windowwidth = $(window).width();
var pathf = d3.geoPath()
    .projection(projection)
    .pointRadius(2);
var mapwidth = (windowwidth>450)?500:windowwidth*0.9;
var mapheight = (windowwidth>450)?300:250
var timefactor = 0.005

var margin = {top: 20, bottom: 20, left: 10, right: 80}

d3.json('data/output.json',function(error, data){
    d3.select('.interactive')
        .selectAll('.route-container')
        .data(maps)
        .enter()
        .append('div')
        .attr('class','route-container')
        .attr('id',function(d,i){return 'id'+i})
        .append('div')
        .attr('class','title')
        .text(function(d){return d.title})

    d3.selectAll('.route-container')    
        .append('div')
        .attr('class','route-dist')
        .text(function(d){return d.loc})

    d3.selectAll('.route-container')    
        .append('div')
        .attr('class','legend')

    d3.selectAll('.route-container')    
        .append('div')
        .attr('class','reset')
        .text('Reset')

    d3.selectAll('.route-container')
        .append('div')
        .attr('class','chart')

    d3.selectAll('.legend')
        .selectAll('.year')
        .data(function(d){
            return maps[(($(this).parent().attr('id')).split('id')[1])]['data']
        })
        .enter()
        .append('div')
        .attr('class',function(d){return 'year-block '+'y'+d.year})
        .append('p')
        .append('span')
        .attr('class',function(d){return 'year'})
        .text(function(d){return d.year+": "})

    d3.selectAll('.year-block p')
        .append('span')
        .attr('class','distance')
        .html('0 kms')
    d3.selectAll('.year-block p')
        .append('span')
        .html(' in ')
    d3.selectAll('.year-block p')
        .append('span')
        .attr('class','time')
        .html('0 mins')



    var svg = d3.selectAll('.chart')
        .append('svg')
        .attr('width',mapwidth)
        .attr('height',mapheight)

  $('.reset').on('click',function(){
    var id = $(this).parent().attr('id')
    reset(id)
  })

  function reset(id){
        d3.selectAll('#'+id+' .time')
            .text('0 mins')

     d3.selectAll('#'+id+' .distance')
            .text('0 kms')

    d3.selectAll('#'+id+' .marker')
            .transition()
            .duration(0)
            .attr('transform','translate(0,0)')
    
    transition(id,d3.select('#'+id+' .route'));
    var index = parseInt(id.split('id')[1])
    clearInterval( maps[index]['data'][0]['setInterval']);
    clearInterval( maps[index]['data'][1]['setInterval']);
    clearInterval( maps[index]['data'][2]['setInterval']);
    UpdateDistanceTimeTag(index);


  }

  maps.forEach(function(e,i){
    drawmap('id'+i,e.name)
  })

    function drawmap(id,key){

        function centerZoom(data){
            var o = topojson.mesh(data, data.objects[key], function(a, b) { return a === b; });

            projection
                .scale(1)
                .translate([0, 0]);

            var b = pathf.bounds(o),
                s = 1 / Math.max((b[1][0] - b[0][0]) / (mapwidth-margin.left-margin.right), (b[1][1] - b[0][1]) / (mapheight-margin.top-margin.bottom)),
                t = [((mapwidth-margin.left-margin.right) - s * (b[1][0] + b[0][0])) / 2, ((mapheight-margin.top-margin.bottom) - s * (b[1][1] + b[0][1])) / 2];

            projection
                .scale(s)
                .translate(t);

            return o;
        }

            var boundary = centerZoom(data);
            var svg = d3.select('#'+id+' svg')
            var g = svg.append('g')
            .attr('transform','translate('+margin.left+','+margin.top+')')
            .attr('class','route-c')

            var path = g.append("path")
            .datum(topojson.feature(data, data.objects[key]))
            .attr("d", pathf)
            .attr("class", "route");

            g.append('g')
                .attr('class','marker-layer')
                .selectAll('#'+id+' .marker')
                .data(function(d){
                    return maps[(($(this).parent().parent().parent().parent().attr('id')).split('id')[1])]['data']
                })
                .enter()
                .append('circle')
                .attr("r", 6)
                .style('fill',function(d){return color[d.year]})
                .attr('class','marker')

            transition(id,path);
            UpdateDistanceTimeTag(+id.split('id')[1]);
        g.append("path")
        .datum(topojson.feature(data, data.objects['p'+id.split('id')[1]]))
        .attr("d", pathf);

                g.selectAll(".place-label-bg")
                    .data(topojson.feature(data, data.objects['p'+id.split('id')[1]]).features)
                  .enter()
                    .append("text")
                    .text('')
                    .attr("class", function(d){if (d.properties.description=="optional"){return "place-label optional"}else{return "place-label"}})
                    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
                    .attr("dy", "0.1em")
                    .attr("x", 5)
                    .style("text-anchor", "start")
                    .tspans( function(d){return d3.wordwrap(d.properties['Name'], 10)},"1em") //wrap after 20 char
    }
})

function transition(id,path) {
        d3.selectAll('#'+id+' .marker')
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

var delay=1000;
function UpdateDistanceTimeTag(index){
    maps[index]['counter'] = [1,1,1]
    maps[index].time1=CreateArr(0,maps[index]['data'][0].time,(maps[index]['data'][0].time*60*1000*timefactor)/delay);
    maps[index].time2=CreateArr(0,maps[index]['data'][1].time,(maps[index]['data'][1].time*60*1000*timefactor)/delay);
    maps[index].time3=CreateArr(0,maps[index]['data'][2].time,(maps[index]['data'][2].time*60*1000*timefactor)/delay);
    maps[index].dist1=CreateArr(1,maps[index]['data'][0].dist,(maps[index]['data'][0].time*60*1000*timefactor)/delay);
    maps[index].dist2=CreateArr(1,maps[index]['data'][1].dist,(maps[index]['data'][1].time*60*1000*timefactor)/delay);
    maps[index].dist3=CreateArr(1,maps[index]['data'][2].dist,(maps[index]['data'][2].time*60*1000*timefactor)/delay);

    maps[index]['data'][0]['setInterval']=window.setInterval(test0,delay)
    maps[index]['data'][1]['setInterval']=window.setInterval(test1,delay)
    maps[index]['data'][2]['setInterval']=window.setInterval(test2,delay)

    function test0(){
        if(maps[index]['counter'][0]>=maps[index].time1.length){
            clearInterval( maps[index]['data'][0]['setInterval']);
        }else{
            $($("#id"+index+" .time")[0]).html(maps[index].time1[maps[index]['counter'][0]] + " mins");
            $($("#id"+index+" .distance")[0]).html(maps[index].dist1[maps[index]['counter'][0]] + " kms");
            maps[index]['counter'][0]=maps[index]['counter'][0]+1;
        }
    }

    function test1(){     
        if(maps[index]['counter'][1]>=maps[index].time2.length){
            clearInterval( maps[index]['data'][1]['setInterval']);
        }else{
            $($("#id"+index+" .time")[1]).html(maps[index].time2[maps[index]['counter'][1]] + " mins");
            $($("#id"+index+" .distance")[1]).html(maps[index].dist2[maps[index]['counter'][1]] + " kms");
            maps[index]['counter'][1]=maps[index]['counter'][1]+1;
        }
    }

    function test2(){ 
        if(maps[index]['counter'][2]>=maps[index].time3.length){
            clearInterval( maps[index]['data'][2]['setInterval']);
        }else{
            $($("#id"+index+" .time")[2]).html(maps[index].time3[maps[index]['counter'][2]] + " mins");
            $($("#id"+index+" .distance")[2]).html(maps[index].dist3[maps[index]['counter'][2]] + " kms");
            maps[index]['counter'][2]=maps[index]['counter'][2]+1;
        }
    }

    function CreateArr(type,UpperTime,numElem){
        var arr=[];
        arr[0]=0;
        var diff=UpperTime/parseInt(numElem);
        for(i=1;i<numElem;i++){
            if(type==0){
                arr[i]=parseInt(arr[i-1]+diff);
            }else{
                arr[i]=parseInt((arr[i-1]+diff)*10)/10;
            }
        }
        arr[arr.length-1]=UpperTime;
        return arr;
    }

}

d3.selection.prototype.tspans = function(lines, lh) {
              return this.selectAll('tspan')
                  .data(lines)
                  .enter()
                  .append('tspan')
                  .text(function(d) { return d; })
                  .attr('x', 5)
                  .attr('dy', function(d,i) { return i ? lh || 15 : 0; });
          };



d3.wordwrap = function(line, maxCharactersPerLine) {
              var w = line.split(' '),
                  lines = [],
                  words = [],
                  maxChars = maxCharactersPerLine || 40,
                  l = 0;
              w.forEach(function(d) {
                  if (l+d.length > maxChars) {
                      lines.push(words.join(' '));
                      words.length = 0;
                      l = 0;
                  }
                  l += d.length;
                  words.push(d);
              });
              if (words.length) {
                  lines.push(words.join(' '));
              }
              return lines;
          };