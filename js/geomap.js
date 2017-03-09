var BDSVis = BDSVis || {};

//This function makes the geographical map
BDSVis.makeMap = function (data,request,vm,dataunfiltered) {
	//"vm" is the reference to ViewModel

	//Initialize the SVG elements and get width and length for scales
	var pv=vm.PlotView;
	pv.Refresh(data,request,vm);
	svg=pv.svg;
	width=pv.width;
	height=pv.height;

	$("#viewDiv").css({"width":pv.width, "height":pv.height});

	

	var yvar=request[vm.model.yvars];
	var xvar=request.xvar;
	var xvarr= vm.model.LookUpVar(xvar);

	var LUName = function(d) {return vm.model.NameLookUp(d[xvar],xvar);} //Returns full name of the variable value by its value returned by IP (aka code), and varname

	


	//Filter by region
	data = data.filter(function(d1){
		return vm.model[xvar][vm.model[xvar].map(function(d) {return d.code}).indexOf(d1[xvar])].regions.indexOf(vm.region)>-1;
	})

	vm.TableView.makeDataTable(data,request.cvar,request.xvar,vm);


	
    var arraymin = function(a,b){return Math.min(a,b)};
    var arraymax = function(a,b){return Math.max(a,b)};


	var ymin=data.map(function(d){return +d[yvar]}).reduce(arraymin)
	var ymax=data.map(function(d){return +d[yvar]}).reduce(arraymax)
	var maxabs=Math.max([Math.abs(ymin),Math.abs(ymax)]);
	
	//Define which scale to use, for the map and the colorbar. Note that log scale can be replaced by any other here (like sqrt), the colormap will adjust accordingly.
	var scaletype = (vm.logscale && (ymin>0))?d3.scale.log():d3.scale.linear();
	//Midpoint of the colorscale
	var ymid= function(ymin,ymax) {
		return (vm.logscale && (ymin>0))?Math.sqrt(ymin*ymax):.5*(ymin+ymax)
		//return scaletype.invert(.5*(scaletype(ymax)+scaletype(ymin)));
	};

	var yScale = scaletype.copy(); //Color scale for the map
	
	var purple="rgb(112,79,161)",
		golden="rgb(194,85,12)",
		teal="rgb(22,136,51)";

	//If there are negative values use blue to red scale with white(ish) for 0 and strength of color corresponding to absolute value
	var colorstopsarray=(ymin<0)?["#CB2027","#eeeeee","#265DAB"]:[purple,"#bbbbbb",golden];

	var geo_data1=vm.model.geo_data[xvar].slice(0), //Data with geographical contours of states/MSA
		emptystates=0,
		timerange = d3.extent(data, function(d) { return +d[vm.model.timevar] }); //Time range of the time lapse

			
	if (vm.timelapse) { //In time lapse regime, select only the data corresponding to the current year
		var datafull=data;
		data=data.filter(function(d) {return +d[vm.model.timevar]===timerange[0];});
	};


	//Put the states/MSAs in geo_data in the same order as they are in data

	var xir = data.map(LUName);
	//var xir = data.map(function(d) {return d[xvar]});
	for (var i in vm.model.geo_data[xvar]) {
		var iir = xir.indexOf(vm.model.geo_data[xvar][i].properties.name);
		if (iir === -1) { //If the state/MSA is not in data (e.g. Puerto Rico is never there), put it to the end of the array
			geo_data1[data.length+emptystates]=vm.model.geo_data[xvar][i];
			emptystates++;
		} else {
			geo_data1[iir]=vm.model.geo_data[xvar][i];
			for (var key in data[0])
				geo_data1[iir].properties[key]=data[iir][key]

			geo_data1[iir].properties.value=+data[iir].value
		}
	};

	geo_data1=geo_data1.slice(0,data.length);
	geo_data1continental=geo_data1.filter(function(d) {return((d.properties.name!=="Alaska")&&(d.properties.name!=="Hawaii"))});


	// //Calculates geometric center of 2D points, flat geometry
	// function geocenter(arr) {
	// 	return arr.reduce(function(a,b) {return [a[0]+b[0],a[1]+b[1]]})
	// 			.map(function(d) {return d/arr.length});
	// }

	//Calculates xmin,ymin of 2D points
	function xymin(arr) {return arr.reduce(function(a,b){return [Math.min(a[0],b[0]),Math.min(a[1],b[1])]});}

	//Calculates xmax,ymax of 2D points
	function xymax(arr) {return arr.reduce(function(a,b){return [Math.max(a[0],b[0]),Math.max(a[1],b[1])]});}
	
	//Applies function func to nodes of the Polygon if the geometry of GeoJSON element is Polygon, or to each polygon of MultiPolygon
	var PolyOrMultipoly = function(d, func) {
		if (d.geometry.type==="Polygon") return func(d.geometry.coordinates[0])
			else return xymin(d.geometry.coordinates.map(function(d1){ return func(d1[0]); }))
	}

	//var mapcenter = geocenter(geo_data1continental.map(function(d) {return PolyOrMultipoly(d, geocenter)}));

	var maplowboundary = xymin(geo_data1continental.map(function(d) {return PolyOrMultipoly(d, xymin)}));

	var maphighboundary = xymax(geo_data1continental.map(function(d) {return PolyOrMultipoly(d, xymax)}));

	var wkid=102100;

	

	require([
		"esri/Map",
		"esri/views/MapView",
		"esri/geometry/Extent",
		"esri/geometry/Polygon",
		"esri/layers/FeatureLayer",
		"esri/renderers/SimpleRenderer",
		"esri/symbols/SimpleFillSymbol",
		"esri/widgets/Legend",
		"esri/geometry/support/webMercatorUtils",
		"dojo/domReady!"
    ], function(Map, MapView, Extent, Polygon,FeatureLayer,SimpleRenderer, SimpleFillSymbol,Legend,webMercatorUtils){

    	var legend

     	var fields = [
			{
				name: "geoid",
				alias: "geoid",
				type: "oid"
			}, {
				name: "landarea",
				alias: "landarea",
				type: "int"
			}, {
				name: "name",
				alias: "name",
				type: "string"
			}, {
				name: "value",
				alias: "value",
				type: "int"
			}
     	];

		var pTemplate = {
			title: "{name}",
			content: [{
				type: "fields",
				fieldInfos: [ {
					fieldName: "value",
					label: vm.model.NameLookUp(yvar,vm.model.yvars),
				}
				]
			}]
		};
		
		//Set the title of the plot and fill the popup template
		var ptitle=vm.model.NameLookUp(yvar,vm.model.yvars); //If many yvars say "various", otherwise the yvar name
		for (var key in data[0]) {
			//X-var should not be in the title, yvar is taken care of. Also check that the name exists in model.variables (e.g. yvar names don't)
			if ((key!==xvar) && (key!==vm.model.yvars) && !((key===vm.model.timevar) && (vm.timelapse)) && (vm.model.VarExists(key))) {
				pTemplate.content[0].fieldInfos.push(
						{
							fieldName: key,
							label: vm.model.NameLookUp(key,"var"),
							visible: true
						}
					)
				ptitle+=vm.model.PrintTitle(data[0][key],key);
			}
		};

		var renderer = new SimpleRenderer({
			symbol: new SimpleFillSymbol({
						color: [227, 139, 79, 0.8],//yScale(g.attributes.value),//[227, 139, 79, 0.8],
						outline: { // autocasts as new SimpleLineSymbol()
							color: [255, 255, 255],
							width: .3
	        			}
        			}),
	         visualVariables: [{
				type: "color",
				field: "value",
				stops: [
					{
						value: ymin,
						color: colorstopsarray[0],
						label: ymin
					},
					{
						value: ymid(ymin,ymax),
						color: colorstopsarray[1],
						label: ymid(ymin,ymax)
					},
					{
						value: ymax,
						color: colorstopsarray[2],
						label: ymax
				}]
        	}]
		});

		//$('body').append(JSON.stringify(geo_data1))

		var map = new Map({
			basemap: "gray",
			//layers: [lr]
		});

		var view = new MapView({
			container: "viewDiv",  // Reference to the scene div created in step 5
			map: map,  // Reference to the map object created before the scene
			//zoom: 4,  // Sets the zoom level based on level of detail (LOD)
			//center: mapcenter,  // Sets the center point of view in lon/lat
			 ui: {
          padding: {
            bottom: 15,
            right: 0
          }}
			
		});


		createLegend(createLayer(createGraphics(geo_data1)))
		
		
		var xyminmerc = webMercatorUtils.lngLatToXY(maplowboundary[0],maplowboundary[1]),
			xymaxmerc = webMercatorUtils.lngLatToXY(maphighboundary[0],maphighboundary[1])


		view.extent = new Extent({
	            xmin: xyminmerc[0],
	            ymin: xyminmerc[1],
	            xmax: xymaxmerc[0],
	            ymax: xymaxmerc[1],
	            spatialReference: wkid
        });

        function createLayer(graphics) {
			lyrf = new FeatureLayer({
				source: graphics, // autocast as an array of esri/Graphic
				objectIdField: "geoid",
				geometryType: "polygon",
				fields: fields,
				renderer: renderer, 
				popupTemplate: pTemplate,
				spatialReference: { wkid: wkid }
				
			});
			map.add(lyrf)
			return lyrf;
		}

		function createGraphics(geoJson) {
	        // Create an array of Graphics from each GeoJSON feature
			return geoJson.map(function(feature) {

				var attributes = {}
				for (var key in feature.properties)
					attributes[key]=vm.model.VarExists(key)?vm.model.NameLookUp(feature.properties[key],key):feature.properties[key]			

				return { 
					geometry: new Polygon({
						rings: (feature.geometry.type==="Polygon")?
								feature.geometry.coordinates[0]: //If the contour is a single polygon, return the coordinates of its nodes
								feature.geometry.coordinates.map(function(d1) {return d1[0]}), //Else (MultiPolygon) return array for each polygon
						}),
					attributes: attributes
			  	};
			});
	    }

	    function createLegend(layer) {
	    	console.log(legend)
        // if the legend already exists, then update it with the new layer
        if (legend) {
          legend.layerInfos = [{
            layer: layer,
            title: "Magnitude"
          }];
        } else {
          legend = new Legend({
            view: view,
            layerInfos: [
            {
              layer: layer,
              title: ptitle
            }]
          }, "infoDiv");
        }
      }
    });
};