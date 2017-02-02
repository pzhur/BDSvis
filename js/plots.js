var BDSVis = BDSVis || {};

//This function makes d3js plot, either a bar chart or scatterplot
BDSVis.makePlot = function (data,request,vm,limits) {
	//"vm" is the reference to ViewModel

	var pv=vm.PlotView;

	pv.Refresh(data,request,vm);
	
	// var svg=pv.svg;
	// var width=pv.width;
	// var height=pv.height;

	var cvar = request.cvar;
	var cvarr= vm.model.LookUpVar(cvar);
	var xvar = request.xvar;
	var xvarr= vm.model.LookUpVar(xvar);


	var YvarsAsLegend = (cvar === vm.model.yvars);

	//If yvars is also a c-variable, then we got melted data from updateBDSdata function, with all yvars contained in the "value" column
	var yvar = YvarsAsLegend?"value":request[vm.model.yvars][0];

	var cvarvalues = Array.from(new Set(data.map(function(d) {return d[cvar]}))) //All the unique values of returned cvars
	cvarvalues = vm.model.sortasmodel(cvarvalues, cvar); //Sort them as in model.js
	
	var xvarvalues = Array.from(new Set(data.map(function(d) {return d[xvar]}))) //All the unique values of returned xvars
	xvarvalues = vm.model.IsContinuous(xvarr)?xvarvalues.sort():vm.model.sortasmodel(xvarvalues, xvar); //Sort them by quantity (if continuous) or like in model.js

	if (vm.timelapse) {
		var timerange = d3.extent(data, function(d) { return +d[vm.model.timevar] });
		var step=vm.model.LookUpVar(vm.model.timevar).range[2];
		var iy=Math.max(timerange[0], vm.timelapsefrom);
	};


	//Set the title of the plot
	function Title(curyear) {
		var ptitle=(YvarsAsLegend && request[vm.model.yvars].length>1)?("Various "+vm.model.NameLookUp(vm.model.yvars,"var")+"s"):(vm.model.NameLookUp(request[vm.model.yvars],vm.model.yvars)); //If many yvars say "various", otherwise the yvar name
		
		//Continue forming title
		for (var key in data[0]) {
			//X-var should not be in the title, yvar is taken care of. Also check that the name exists in model.variables (e.g. yvar names don't)
			if ((key!==xvar) && (key!==yvar) && (key!==vm.model.yvars) && !((key===vm.model.timevar) && (vm.timelapse)) && (vm.model.VarExists(key))) {
			
				if (key!==cvar) ptitle+=vm.model.PrintTitle(data[0][key],key);
				else if (cvarvalues.length === 1) ptitle+=vm.model.PrintTitle(data[0][key],key);
				else if (key!==vm.model.yvars) ptitle+=" by " + vm.model.NameLookUp(key,"var");
			} 		
		};

		if (vm.timelapse && (curyear!==undefined)) {
			ptitle+= vm.model.PrintTitle(curyear,vm.model.timevar)
		}
		return ptitle;
	};

	//Y-axis label
    var yaxislabel=vm.model.NameLookUp(request[vm.model.yvars][0],vm.model.yvars);
    if ((YvarsAsLegend) && request[vm.model.yvars].length>1) yaxislabel = vm.model.NameLookUp(vm.model.yvars,"var")+"s";
    if (yaxislabel.indexOf("rate")!==-1) yaxislabel = yaxislabel+", % change";

    var ally = data.map(function(d) {return +d[yvar];});

    //X-axis label
    var xvarunits = xvarr.units || "";
    var xaxislabel = xvarr.name;
    if (xvarunits.length>0) xaxislabel = xaxislabel + ", "+xvarunits;

    //Legen (C-"axis") label
    var cvarunits = cvarr.units || "";
    var caxislabel = cvarr.name;
    if (cvarunits.length>0) caxislabel = caxislabel + ", "+cvarunits;

    //Make the HighCharts graph
    $('#hccont').html("");
	var hcc = Highcharts.chart('hccont', {

	    chart: {
	        type: vm.model.IsContinuous(xvarr)?'line':'column',

	        zoomType: 'xy',
	        width: pv.width,
	        height: pv.height,
	        events: {
                load: function() {
                		if (vm.timelapse)
            				vm.tlint=setInterval(intervalfunction, vm.timelapsespeed);
            		}
            }
	    },

	    legend: {
	    		title: {text: caxislabel+':'},
	        	layout: 'vertical',
	        	verticalAlign: 'middle',
	        	align: 'right',
	        	//	width: pv.legendwidth
	    },


	    title: {
	        text: Title()
	    },

	    xAxis: {
	    	title: {text: xaxislabel},
	       	categories: vm.model.IsContinuous(xvarr)?"":xvarvalues.map(function(d) {return vm.model.NameLookUp(d,xvar)})
	       //categories: xvarvalues.map(function(d) {return vm.model.NameLookUp(d,xvar)})	
	    },

	    yAxis: {
	        // allowDecimals: false,
	        min: Math.min.apply(null, data.map(function(d) {return +d[yvar];})),
	        max: Math.max.apply(null, data.map(function(d) {return +d[yvar];})),
	        type: vm.logscale?'logarithmic':'linear',
	        title: {
	            text: yaxislabel
	        }
	    },

	    tooltip: {
	        formatter: function () {
	            return '<b>' + this.x + '</b><br/>' +
	                this.series.name + ': ' + this.y + '<br/>'
	        }
	    },

	    plotOptions: {
	        column: {
	            stacking: 'normal'
	        }
	    },

	    series: cvarvalues.map(function(cv) { //Make a series for each value of cvar
			return {
					name:vm.model.NameLookUp(cv,cvar), 
					stack:cv, 
					data:
						vm.model.IsContinuous(xvarr)
							?
							//continuous
							data.filter(function(d) {return d[cvar]===cv;}) //Select only data with cvar==cv
								.map(function(d) {return [+d[xvar],+d[yvar]]}) //return x and y
							:
							//categorical		
							xvarvalues.map(function(xv) { //Get a data point for each of the returned xvar values, even if there isn't one for cv
								var dxc =  data.filter(function(d) {return (d[cvar]===cv) && (d[xvar]===xv);}) //Select only data with cvar==cv,xvar==xv
								return [xv,(dxc.length>0)?(+dxc[0][yvar]):0] //return [x,y] or [x,0] if there was not data for xv
						})
				
					}
		})
	});

	// hmdata=[]
	// for (ic=0; ic<cvarvalues.length; ic++) {
	// 	for (ix=0; ix<xvarvalues.length; ix++) {
	// 		hmdata.push([ix,ic,data.filter(function(d) {return (d[cvar]===cvarvalues[ic]) && (d[xvar]===xvarvalues[ix]);}).map(function(d){return +d[yvar]})[0]])
	// 	}
	// }
	// console.log(hmdata)

	// var hcc = Highcharts.chart('hccont', {

	//     chart: {
	//         type: 'heatmap'
	//     },

	//     title: {
	//         text: Title()
	//     },

	//     xAxis: {
	//     	title: {text: xaxislabel},
	//        	categories: vm.model.IsContinuous(xvarr)?"":xvarvalues.map(function(d) {return vm.model.NameLookUp(d,xvar)})
	//        //categories: xvarvalues.map(function(d) {return vm.model.NameLookUp(d,xvar)})	
	//     },

 //        yAxis: {
 //            title: {text: caxislabel},
	//        	categories: vm.model.IsContinuous(cvarr)?"":cvarvalues.map(function(d) {return vm.model.NameLookUp(d,cvar)})
 //        },

 //        colorAxis: {
 //            min: 0,
 //            minColor: '#FFFFFF',
 //            maxColor: Highcharts.getOptions().colors[0]
 //        },

 //        legend: {
 //            align: 'right',
 //            layout: 'vertical',
 //            margin: 0,
 //            verticalAlign: 'top',
 //            y: 25,
 //            symbolHeight: 320
 //        },

 //        tooltip: {
 //            formatter: function () {
 //                return '<b>' + this.series.xAxis.categories[this.point.x] + '</b> sold <br><b>' +
 //                    this.point.value + '</b> items on <br><b>' + this.series.yAxis.categories[this.point.y] + '</b>';
 //            }
 //        },

 //         series: [{
 //            name: 'Sales per employee',
 //            borderWidth: 1,
 //            data:hmdata,
 //            //data: [[0,0,10],[0,1,19],[0,2,8],[0,3,24],[0,4,67],[1,0,92],[1,1,58],[1,2,78],[1,3,117],[1,4,48],[2,0,35],[2,1,15],[2,2,123],[2,3,64],[2,4,52],[3,0,72],[3,1,132],[3,2,114],[3,3,19],[3,4,16],[4,0,38],[4,1,5],[4,2,8],[4,3,117],[4,4,115],[5,0,88],[5,1,32],[5,2,12],[5,3,6],[5,4,120],[6,0,13],[6,1,44],[6,2,88],[6,3,98],[6,4,96],[7,0,31],[7,1,1],[7,2,82],[7,3,32],[7,4,30],[8,0,85],[8,1,97],[8,2,123],[8,3,64],[8,4,84],[9,0,47],[9,1,114],[9,2,31],[9,3,48],[9,4,91]],
 //            dataLabels: {
 //                enabled: true,
 //                color: 'black',
 //                style: {
 //                    textShadow: 'none'
 //                }
 //            }
 //        }]

	    
	// });
	

    function intervalfunction() {
    	hcc.setTitle({text:Title(iy)}); //Change title to the current year
    	cvarvalues.forEach(function(cv,icv) { //Change series for each value of cvar
			hcc.series[icv].setData(	
				xvarvalues.map(function(xv) { //Get a data point for each of the returned xvar values, even if there isn't one for cv
					var dxc =  data.filter(function(d) {return (d[cvar]===cv) && (d[xvar]===xv) && (+d[vm.model.timevar]===iy);}) //Select only data with cvar==cv,xvar==xv and the corresponding year
					return [xv,(dxc.length>0)?(+dxc[0][yvar]):0] //return [x,y] or [x,0] if there was not data for xv
				})
			);
		});
		if (iy<Math.min(timerange[1],vm.timelapseto)) iy+=step; else iy=Math.max(timerange[0], vm.timelapsefrom);
		vm.TimeLapseCurrYear=iy;
		clearInterval(vm.tlint);
		vm.tlint=setInterval(intervalfunction, vm.timelapsespeed);
    };
	
	
};