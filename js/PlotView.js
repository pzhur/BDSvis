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

		this.xvarselector = $("#xvarselector");
		this.cvarselector = $("#cvarselector");
		this.scaleui = $("#logbutton");

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
		this.xvarselector.children().remove();
		this.cvarselector.children().remove();
		this.scaleui.children().remove();
		if (!vm.timelapse) { //Add UI controls if not in Time Lapse regime

			//Logscale Checkbox
			var boxsize=10;
	
			this.scaleui.append("<input type='Checkbox'></input>")

			this.logbutton=this.scaleui.children().last()
				//.attr("type","Checkbox")
				.prop("checked",function() {return vm.logscale;})
			
			
			this.logbutton.on("click",function() { 
				vm.logscale=!vm.logscale;
				if (vm.geomap())
					BDSVis.makeMap(data,request,vm);
				else if ((vm.heatchart) && !(vm.model.IsContinuous(request.xvar)))
					BDSVis.makeHeatChart(data,request,vm);
				else
					BDSVis.makePlot(data,request,vm);
			});

			this.scaleui.append("<span></span>")
			this.scaleui.children().last().text("Log")

			function AddOptionsToVarSelector(selector,varvalues,whichvar,group) { //Create a selector option for each variable value, set which are selected
				varvalues.forEach(function(d) {
					selector.append("<option></option>")
					selector.children().last()
						.prop("selected", d.code===(group?vm.SelectedOpts[vm[whichvar]][0]:vm[whichvar]))
						.text(d.name)
						.attr("value",d.code)
				})
			};

			//X-axis variable selector			
			this.xvarselector.append("<select></select>")
			var selector = this.xvarselector.children().last()
			AddOptionsToVarSelector(selector,vm.model.variables.filter(function(d){return (d.asaxis && d.code!==vm.cvar)}),"xvar",false);
			selector.on("change", function() { vm.setxvar(this.value);} );
			if (vm.model.IsGroup(vm.xvar)) {
				this.xvarselector.append("<select></select>")
				var groupselector = this.xvarselector.children().last();
				AddOptionsToVarSelector(groupselector,vm.model[vm.xvar],"xvar",true);
				groupselector.on("change", function() {vm.SelectedOpts[vm.xvar]=[this.value]; vm.getBDSdata();});
			};

			if (!vm.geomap()) {
				//Legend variable (cvar) selector
				this.cvarselector.html(vm.heatchart?'Y-axis variable:<br><br>':'Legend variable:<br><br>')
				this.cvarselector.append("<select></select>")
				selector = this.cvarselector.children().last()
				AddOptionsToVarSelector(selector,vm.model.variables.filter(function(d){return  (d.aslegend && d.code!==vm.xvar)}),"cvar",false);			
				selector.on("change", function() { vm.setcvar(this.value);} );
				if (vm.model.IsGroup(vm.cvar)) {
					this.cvarselector.append("<select></select>")
					var groupselector = this.cvarselector.children().last();
					AddOptionsToVarSelector(groupselector,vm.model[vm.cvar],"cvar",true);
					groupselector.on("change", function() {vm.SelectedOpts[vm.cvar]=[this.value]; vm.getBDSdata();});
				};
			} else {
				//Regions selector
				this.cvarselector.html('Region:<br><br>')
				this.cvarselector.append("<select></select>")
				selector = this.cvarselector.children().last()
				vm.model.regions.forEach(function(d) {
					selector.append("<option></option>")
					selector.children().last()
						.attr("value",d.name)
						.text(d.name)
						.prop("selected",d.name===vm.region);
				})
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
		
		var chartarea=$(vm.getPlotContainer())[0];
	
		this.xvarselector
			.css("position","absolute")		
			.css("left",chartarea.offsetLeft+.5*(chartarea.offsetWidth-this.xvarselector[0].offsetWidth)+"px")
			.css("top",chartarea.offsetTop+chartarea.offsetHeight+this.margin+"px");
			

		this.cvarselector
			.css("position","absolute")
			.css("left",chartarea.offsetLeft+chartarea.offsetWidth+this.margin+"px")
			.css("top",chartarea.offsetTop+"px");
			

		this.scaleui
			.css("position","absolute")
			.css("left",chartarea.offsetLeft+"px")
			.css("top",chartarea.offsetTop+chartarea.offsetHeight+this.margin+"px")


		/*$('#infoDiv')
			.css("position","absolute")
			.css("left",chartarea.offsetLeft+chartarea.offsetWidth-$("#infoDiv")[0].offsetWidth+"px")
			.css("top",chartarea.offsetTop+chartarea.offsetHeight-$("#infoDiv")[0].offsetHeight+"px")
			//.css("width", this.legendwidth)*/
	},

	TogglePrintWidget: function() {
		if (this.printwidgeton) {
			this.arcgisview.ui.remove(this.printview)
			this.printwidgeton = false;
		}
		else {
			this.printwidgeton = true;
			this.arcgisview.ui.add(this.printview, "top-left");
		}
	}
		
};