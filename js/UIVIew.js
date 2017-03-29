var BDSVis = BDSVis || {};

BDSVis.UIView = {
	DrawUI : function(vm){

		var bug=d3.select("#buttonsundergraph");
		bug.selectAll('*').remove();

		//UI elements for plotting regime switching: cartograms/map, heatchart/plot
		
		if (vm.geomap()) {
			vm.regimeselector=bug.append("select").on("change", function() {vm.cartogram=+this.value; vm.getBDSdata();});
			vm.regimeselector.append("option").text("Map").attr("value",0).property("selected",function(d) { return vm.cartogram===0;});
			vm.regimeselector.append("option").text("Non-cont Cartogram").attr("value",1).property("selected",function(d) { return vm.cartogram===1;});
		} else if (!vm.model.IsContinuous(vm.ActualVarCode(vm.xvar))) {
			vm.regimeselector=bug.append("select").on("change", function() {vm.heatchart=+this.value; vm.getBDSdata();});
			vm.regimeselector.append("option").text("Barchart").attr("value",0).property("selected",function(d) { return (!vm.heatchart);});
			vm.regimeselector.append("option").text("Spotchart").attr("value",1).property("selected",function(d) { return vm.heatchart;});
		};
		bug.append("h4").text(" ");

		//UI elements for Save and Show Data and
		bug.append("button").text("Show Data").on("click",vm.toggleshowdata);
		if (!vm.timelapse) {
			bug.append("button").text("Save SVG").on("click",function() {BDSVis.util.savesvg('svg');});
			bug.append("button").text("Save PNG").on("click",function() {BDSVis.util.savesvg('png');});
		}
		if ((vm.xvar!==vm.model.timevar) && (vm.cvar!==vm.model.timevar)) 
			bug.append("button").text(vm.timelapse?"Stop":"Time Lapse").on("click",vm.toggletimelapse); 

			
		//UI elements for controlling the Time Lapse
		if (vm.timelapse) {
			bug=bug.append("span")
			var sel=bug.append("h4").text("From: ").append("select");
			sel.selectAll("option").data(vm.model[vm.model.timevar]).enter()
				.append("option").attr("value",function(d) {return d;}).text(function(d) {return d;})
				.property("selected",function(d) { return vm.timelapsefrom===d;});
			sel.on("change", function() {vm.timelapsefrom=this.value;});

			sel=bug.append("h4").text("To: ").append("select"); 
			sel.selectAll("option").data(vm.model[vm.model.timevar]).enter()
				.append("option").attr("value",function(d) {return d;}).text(function(d) {return d;})
				.property("selected",function(d) {return vm.timelapseto===d;});
			sel.on("change", function() {vm.timelapseto=this.value});

			sel=bug.append("h4").text("Speed: ").append("select");
			sel.selectAll("option").data(vm.model.timelapsespeeds).enter()
				.append("option").attr("value",function(d) {return d.code;}).text(function(d) {return d.name;})
				.property("selected",function(d) {return vm.timelapsespeed===d.code;});
			sel.on("change", function() {vm.timelapsespeed=this.value});
			return;
		};

		//UI elements for variable selection
		var selectors = d3.select('.selectors');
		selectors.selectAll('*').remove();

		function AddSelectorWOptions(varr, isundergroupvar) {
			var varr1code = isundergroupvar ? vm.SelectedOpts[varr.code][0] : varr.code;
			var multiple = vm.multiple(varr.code) && (!vm.model.IsGroup(varr) || isundergroupvar);
			selectors.append("select")//Add the selector
				.on("change", function() {
					vm.SelectedOpts[varr1code]=d3.selectAll(this.childNodes)[0].filter(function(d) {return d.selected}).map(function(d) {return d.value});
					vm.getBDSdata();
				})
				.property("multiple", multiple)
				.classed("tallselector", multiple)
				.property("disabled", (vm.xvar===varr.code) && (!vm.model.IsGroup(varr) || isundergroupvar))
				.selectAll("option").data(vm.model[varr1code]).enter()
				.append("option")
				.property("selected", function(d){
					var selind = vm.SelectedOpts[varr1code].indexOf(vm.model.IsContinuous(varr)?d.toString():d.code);
					return vm.multiple(varr.code)?(selind!==-1):(selind===0);
				})
				.text(function(d) {return vm.model.IsContinuous(varr1code)?d:d.name;})
				.attr("value",function(d) {return vm.model.IsContinuous(varr1code)?d:d.code;}); 
		};

		vm.model.variables.forEach(function(varr) { //For each variable create selector and buttons
		
			selectors.append("h4").text(varr.name+":"); //Add the title for selector
			
			AddSelectorWOptions(varr, false); //Add the selector for the variable

			if (vm.model.IsGroup(varr)) { //Add selector for the choice selected in the group variable selector
				selectors.append("br");
				selectors.append("h4");
				AddSelectorWOptions(varr, true);
			};
		
			if (varr.aslegend) { //Add the 'Compare' button
				
				var cbut = selectors.append("button")
						.on("click", function() {vm.setcvar(varr.code);})
						.classed("activebutton", vm.multiple(varr.code))
						.property("disabled", (vm.geomap() || (vm.xvar===varr.code) || (vm.cvar===varr.code)))
						.text("Compare "+varr.name+"s");
				if (vm.model.IsGroup(varr.code))
					cbut.text("Compare "+vm.model.NameLookUp(vm.SelectedOpts[varr.code][0],'var')+"s")
			};

			if (varr.asaxis) //Add the 'Make X' button
				selectors.append("button")
						.on("click", function() {vm.setxvar(varr.code);})
						.classed("activebutton",vm.xvar===varr.code)
						.property("disabled", (!vm.model.IsGeomapvar(varr)) && ((vm.xvar===varr.code) || (vm.cvar===varr.code)))
						.text(vm.model.IsGeomapvar(varr)?"See Map":"Make X-axis");
			selectors.append("br");
		});
	},

	ToggleData : function(ShowData) {
		d3.select("#showdata").style("display",ShowData?"block":"none");
	},

	ToggleMapGraph : function(geomap) {
		d3.select("#hccont").style("display",geomap?"none":"block");
		d3.select("#viewDiv").style("display",geomap?"block":"none");
		d3.select("#infoDiv").style("display",geomap?"block":"none");
	},
}