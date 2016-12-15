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
var mapheight = 300
var timefactor = 0.005


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
        .attr('class','year-block')
        .append('h3')
        .attr('class','year')
        .style('color',function(d){return color[d.year]})
        .text(function(d){return d.year})

    d3.selectAll('.year-block')
    .append('p')
    .attr('class','time')
    .html('0 mins')

    d3.selectAll('.year-block')
    .append('p')
    .attr('class','distance')
    .html('<span class = "distance-num">0</span> kms')

    var svg = d3.selectAll('.chart')
        .append('svg')
        .attr('width',mapwidth)
        .attr('height',mapheight)

  $('.reset').on('click',function(){
    var id = $(this).parent().attr('id')
    reset(id)
  })

  function reset(id){
    d3.selectAll('#'+id+' .marker')
            .transition()
            .duration(0)
            .attr('transform','translate(0,0)')
    
    transition(id,d3.select('#'+id+' .route'));
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
                s = 1 / Math.max((b[1][0] - b[0][0]) / mapwidth, (b[1][1] - b[0][1]) / mapheight),
                t = [(mapwidth - s * (b[1][0] + b[0][0])) / 2, (mapheight - s * (b[1][1] + b[0][1])) / 2];

            projection
                .scale(s)
                .translate(t);

            return o;
        }

            var boundary = centerZoom(data);
            var svg = d3.select('#'+id+' svg')
            var g = svg.append('g')
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
                .attr("r", 5)
                .style('fill',function(d){return color[d.year]})
                .attr('class','marker')

            transition(id,path);
            UpdateDistanceTimeTag(+id.split('id')[1]);
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

var delay=500;
var setIntervalIndex=[];
function UpdateDistanceTimeTag(index){
    var counter=[1,1,1];
    time1=CreateArr(0,maps[index]['data'][0].time,(maps[index]['data'][0].time*60*1000*timefactor)/delay);
    time2=CreateArr(0,maps[index]['data'][1].time,(maps[index]['data'][1].time*60*1000*timefactor)/delay);
    time3=CreateArr(0,maps[index]['data'][2].time,(maps[index]['data'][2].time*60*1000*timefactor)/delay);
    dist1=CreateArr(1,maps[index]['data'][0].dist,(maps[index]['data'][0].time*60*1000*timefactor)/delay);
    dist2=CreateArr(1,maps[index]['data'][1].dist,(maps[index]['data'][1].time*60*1000*timefactor)/delay);
    dist3=CreateArr(1,maps[index]['data'][2].dist,(maps[index]['data'][2].time*60*1000*timefactor)/delay);

    setIntervalIndex[(index*3)+0]=window.setInterval(test0,delay)
    setIntervalIndex[(index*3)+1]=window.setInterval(test1,delay)
    setIntervalIndex[(index*3)+2]=window.setInterval(test2,delay)

    function test0(){
        

        if(counter[0]>=time1.length){
            clearInterval(setIntervalIndex[(index*3)+0]);
        }else{
            $($("#id"+index+" .time")[0]).html(time1[counter[0]] + " mins");
            $($("#id"+index+" .distance")[0]).html(dist1[counter[0]] + " kms");
            counter[0]=counter[0]+1;
        }
    }

    function test1(){     
        if(counter[1]>=time2.length){
            clearInterval(setIntervalIndex[(index*3)+1]);
        }else{
            $($("#id"+index+" .time")[1]).html(time2[counter[1]] + " mins");
            $($("#id"+index+" .distance")[1]).html(dist2[counter[1]] + " kms");
            counter[1]=counter[1]+1;
        }
    }

    function test2(){ 
        if(counter[2]>=time3.length){
            clearInterval(setIntervalIndex[(index*3)+2]);
        }else{
            $($("#id"+index+" .time")[2]).html(time3[counter[2]] + " mins");
            $($("#id"+index+" .distance")[2]).html(dist3[counter[2]] + " kms");
            counter[2]=counter[2]+1;
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
