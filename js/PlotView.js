var BDSVis = BDSVis || {};

//The visual elements of the plot: SVGs for the graph/map and legend. Also UI elements positioned on top of the SVG
BDSVis.PlotView = {
	
	width : 1000,
	height : 450,
	margin : 5,
	legendwidth : 300,
	
	Init : function() {
		//Define margins and dimensions of the SVG element containing the chart

		
		$("#buttonsundergraph").css("width",this.width + "px");
		$("#plotarea").css("width", this.width +"px");

		this.xvarselector = d3.select("#xvarselector");
		this.cvarselector = d3.select("#cvarselector");
		this.scaleui = d3.select("#logbutton");

		this.scale = 1;
		this.translate = [0,0];

	},

	Refresh : function(data,request,vm) {

		vm.UIView.ToggleMapGraph(vm.geomap());

		var pv = this;

		var margin = this.margin;
		var width=this.width;
		var height=this.height;	
		

		//UI controls on top of the chart refresh
		this.xvarselector.selectAll("select").remove();
		this.cvarselector.selectAll("select").remove();
		this.scaleui.selectAll("*").remove();
		if (!vm.timelapse) { //Add UI controls if not in Time Lapse regime

			//Logscale Checkbox
			var boxsize=10;
	
			this.logbutton=this.scaleui.append("input").attr("type","Checkbox")
				.property("checked",function(d) {return vm.logscale;})
			this.scaleui.append("span").text("Log")
			
			this.logbutton.on("click",function() { 
				vm.logscale=!vm.logscale;
				if (vm.geomap())
					BDSVis.makeMap(data,request,vm);
				else if ((vm.heatchart) && !(vm.model.IsContinuous(request.xvar)))
					BDSVis.makeHeatChart(data,request,vm);
				else
					BDSVis.makePlot(data,request,vm);
			});

			function AddOptionsToVarSelector(selector,varvalues,whichvar,group) { //Create a selector option for each variable value, set which are selected
				selector.selectAll("option")
					.data(varvalues).enter().append("option")
					.attr("value",function(d) {return d.code;})
					.text(function(d) {return d.name;})
					.property("selected",function(d){
							return d.code===(group?vm.SelectedOpts[vm[whichvar]][0]:vm[whichvar]);
					});
			};

			//X-axis variable selector			
			var selector = this.xvarselector.append("select");
			AddOptionsToVarSelector(selector,vm.model.variables.filter(function(d){return (d.asaxis && d.code!==vm.cvar)}),"xvar",false);
			selector.on("change", function() { vm.setxvar(this.value);} );
			if (vm.model.IsGroup(vm.xvar)) {
				var groupselector = this.xvarselector.append("select");
				AddOptionsToVarSelector(groupselector,vm.model[vm.xvar],"xvar",true);
				groupselector.on("change", function() {vm.SelectedOpts[vm.xvar]=[this.value]; vm.getBDSdata();});
			};

			if (!vm.geomap()) {
				//Legend variable (cvar) selector
				this.cvarselector.html(vm.heatchart?'Y-axis variable:<br><br>':'Legend variable:<br><br>')
				selector = this.cvarselector.append("select");
				AddOptionsToVarSelector(selector,vm.model.variables.filter(function(d){return  (d.aslegend && d.code!==vm.xvar)}),"cvar",false);			
				selector.on("change", function() { vm.setcvar(this.value);} );
				if (vm.model.IsGroup(vm.cvar)) {
					var groupselector = this.cvarselector.append("select");
					AddOptionsToVarSelector(groupselector,vm.model[vm.cvar],"cvar",true);
					groupselector.on("change", function() {vm.SelectedOpts[vm.cvar]=[this.value]; vm.getBDSdata();});
				};
			} else {
				this.cvarselector.html('Region:<br><br>')
				selector = this.cvarselector.append("select");
				selector.selectAll("option")
					.data(vm.model.regions).enter().append("option")
					.attr("value",function(d) {return d.name;})
					.text(function(d) {return d.name;})
					.property("selected",function(d){
							return d.name===vm.region;
					});		
				selector.on("change", function() { vm.region = this.value;  vm.getBDSdata();} );
			};
		};
		
		this.AdjustUIElements(vm);
	},

	DisplayNoData : function(request,vm) {
		console.log("No data")
		this.arcgismap.removeAll();
		if (request!==undefined) {
			ptitle="No data for "+vm.model.yvars+"s ";
			//var ptitle=vm.model.NameLookUp(yvar,vm.model.yvars); //If many yvars say "various", otherwise the yvar name
			for (var key in request) {
				//X-var should not be in the title, yvar is taken care of. Also check that the name exists in model.variables (e.g. yvar names don't)
				if ((key!==request.xvar) && (key!==vm.model.yvars) && !((key===vm.model.timevar) && (vm.timelapse)) && (vm.model.VarExists(key))) {
					ptitle+=vm.model.PrintTitle(request[key][0],key);
				}
			};
			$("#hccont").html("<h1 align='center'>"+ptitle+"</h1>");
		}
	},

	AdjustUIElements : function(vm) {
		// Fully compatible according to https://developer.mozilla.org/en-US/docs/Web/API/Window/scrollY?redirectlocale=en-US&redirectslug=DOM%2Fwindow.scrollY
		// var supportPageOffset = window.pageXOffset !== undefined;
		// var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");

		// var wsX = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
		// var wsY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

		// var wsY=window.scrollY || window.pageYOffset;
		// var wsX=window.scrollX || window.pageXOffset;

		// var chartrect=this.svgcont.node().getBoundingClientRect();
		// var xaxlrect=this.xaxislabel.node().getBoundingClientRect();

		var chartarea=$(vm.getPlotContainer())[0];
		//chartarea.offsetTop+chartarea.offsetHeight+chartarea.offsetBottom

		var sellength=this.xvarselector.node().getBoundingClientRect();
		sellength = sellength.right-sellength.left;

		var csellength=this.cvarselector.node().getBoundingClientRect();
		csellength = csellength.right-csellength.left;
		
		this.xvarselector
			.style("position","absolute")
			// .style("left",(this.width)/2.+"px")
			// .style("top",this.height+"px");
			.style("left",chartarea.offsetLeft+.5*(chartarea.offsetWidth-$("#xvarselector")[0].offsetWidth)+"px")
			.style("top",chartarea.offsetTop+chartarea.offsetHeight+this.margin+"px");
			// .style("left",(chartrect.left+wsX+(this.margin.left+this.margin.right+this.width-sellength)/2.)+"px")
			// .style("top",(xaxlrect.top+wsY)+"px");

		this.cvarselector
			.style("position","absolute")
			// .style("left",this.width-csellength+"px")
			// .style("top",this.height+"px")
			.style("left",chartarea.offsetLeft+chartarea.offsetWidth+this.margin+"px")
			.style("top",chartarea.offsetTop+"px");
			// .style("left",(chartrect.left+wsX+this.width+this.margin.left+ this.margin.right)+"px")
			// .style("top",(chartrect.top+wsY+this.margin.top)+"px");

		this.scaleui
			.style("position","absolute")
			.style("left",chartarea.offsetLeft+"px")
			.style("top",chartarea.offsetTop+chartarea.offsetHeight+this.margin+"px")
			// .style("left",(this.yaxislabel.node().getBoundingClientRect().left+wsX)+"px")
			// .style("top",(xaxlrect.top+wsY)+"px");

		$('#infoDiv')
			.css("position","absolute")
			.css("left",chartarea.offsetLeft+chartarea.offsetWidth-$("#infoDiv")[0].offsetWidth+"px")
			.css("top",chartarea.offsetTop+chartarea.offsetHeight-$("#infoDiv")[0].offsetHeight+"px")
			//.css("width", this.legendwidth)
	},
};