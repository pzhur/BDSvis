var BDSVis = BDSVis || {};

BDSVis.UIView = {
	DrawUI : function(vm){

		var bug=$("#buttonsundergraph")
		
		bug.children().remove()
		

		//Selector for changing between barplot and heatmap
		if (!(vm.model.IsContinuous(vm.ActualVarCode(vm.xvar)) || vm.geomap())) { //If xvar is categorical and it's not the map regime
			bug.append("<select></select>")
			var sel = bug.children().last()
			sel.on("change", function() {vm.heatchart=+this.value; vm.getBDSdata();});
			sel.append("<option value=0>Barchart</option>")
			sel.children().last().prop("selected", function(){return (!vm.heatchart);})
			sel.append("<option value=1>Heatmap</option>")
			sel.children().last().prop("selected", function(){return vm.heatchart;})

		}
		
		var h4="<h4></h4>"
		bug.append(h4);
		bug.children().last().text(" ");

		//UI elements for Save and Show Data and
		var button = "<button></button>"
		a=bug.append(button)
		bug.children().last().text("Show Data").on("click",vm.toggleshowdata);
		
		
		if ((!vm.timelapse) && (vm.geomap())) {
			bug.append(button)	
			bug.children().last().text("Print/Save map").on("click",function() {
				vm.PlotView.TogglePrintWidget();
			});
		}
		if ((vm.xvar!==vm.model.timevar) && (vm.cvar!==vm.model.timevar)) {
			bug.append(button)
			bug.children().last().text(vm.timelapse?"Stop":"Time Lapse").on("click",vm.toggletimelapse); 
		}

			
		//UI elements for controlling the Time Lapse
		var span="<span></span>", select="<select></select>", option="<option></option>"
		if (vm.timelapse) {
			bug.append(span); bug=bug.children().last()
			bug.append(h4)
			bug.children().last().text("From: ")
			bug.append(select);
			var sel=bug.children().last()
			vm.model[vm.model.timevar].forEach(function(d) {
				sel.append(option)
				sel.children().last().attr("value",d).text(d)
			})
			sel.val(vm.timelapsefrom)
			sel.on("change", function() {vm.timelapsefrom=+this.value;});

			bug.append(h4)
			bug.children().last().text("To: ")
			bug.append(select);
			var sel=bug.children().last()
			vm.model[vm.model.timevar].forEach(function(d) {
				sel.append(option)
				sel.children().last().attr("value",d).text(d)
			})
			sel.val(vm.timelapseto)
			sel.on("change", function() {vm.timelapseto=+this.value;});

			bug.append(h4)
			bug.children().last().text("From: ")
			bug.append(select);
			var sel=bug.children().last()
			vm.model.timelapsespeeds.forEach(function(d) {
				sel.append(option)
				sel.children().last().attr("value",d.code).text(d.name)
			})
			sel.val(vm.timelapsespeed)
			sel.on("change", function() {vm.timelapsespeed=vm.model.timelapsespeeds[vm.model.timelapsespeeds.map(function(d) {return d.code}).indexOf(this.value)].code});

			return;
		};

		//UI elements for variable selection
		var selectors = $('.selectors');
		selectors.children().remove();

		function AddSelectorWOptions(varr, isundergroupvar) {
			var varr1code = isundergroupvar ? vm.SelectedOpts[varr.code][0] : varr.code;
			var multiple = vm.multiple(varr.code) && (!vm.model.IsGroup(varr) || isundergroupvar);
			
			selectors.append(select)//Add the selector
			var sel=selectors.children().last()
				.on("change", function() {
					vm.SelectedOpts[varr1code]=[]
					this.childNodes.forEach( function(d){
						if (d.selected) vm.SelectedOpts[varr1code].push(d.value)
					})
					vm.getBDSdata();
				})
				.prop("multiple", multiple)
				.toggleClass("tallselector", multiple)
				.prop("disabled", (vm.xvar===varr.code) && (!vm.model.IsGroup(varr) || isundergroupvar))

			vm.model[varr1code].forEach(function(d) {
				selind = vm.SelectedOpts[varr1code].indexOf(vm.model.IsContinuous(varr)?d.toString():d.code)
				sel.append(option)
				sel.children().last()
					.prop("selected", vm.multiple(varr.code)?(selind!==-1):(selind===0))
					.text(vm.model.IsContinuous(varr1code)?d:d.name)
					.attr("value",vm.model.IsContinuous(varr1code)?d:d.code);
			})	
		};

		vm.model.variables.forEach(function(varr) { //For each variable create selector and buttons
			
			selectors.append(h4)
			selectors.children().last().text(varr.name+":"); //Add the title for selector
			
			AddSelectorWOptions(varr, false); //Add the selector for the variable

			if (vm.model.IsGroup(varr)) { //Add selector for the choice selected in the group variable selector
				selectors.append("<br>");
				selectors.append(h4);
				AddSelectorWOptions(varr, true);
			};
		
			if (varr.aslegend) { //Add the 'Compare' button

				selectors.append(button)
				var cbut = selectors.children().last()
					cbut.on("click", function() {vm.setcvar(varr.code);})
						.toggleClass("activebutton", vm.multiple(varr.code))
						.prop("disabled", (vm.geomap() || (vm.xvar===varr.code) || (vm.cvar===varr.code)))
						.text("Compare "+varr.name+"s");
				if (vm.model.IsGroup(varr.code))
					cbut.text("Compare "+vm.model.NameLookUp(vm.SelectedOpts[varr.code][0],'var')+"s")
			};

			if (varr.asaxis) {//Add the 'Make X' button
				selectors.append(button)
				selectors.children().last()		
						.on("click", function() {vm.setxvar(varr.code);})
						.toggleClass("activebutton",vm.xvar===varr.code)
						.prop("disabled", (!vm.model.IsGeomapvar(varr)) && ((vm.xvar===varr.code) || (vm.cvar===varr.code)))
						.text(vm.model.IsGeomapvar(varr)?"See Map":"Make X-axis");			
			}
			selectors.append("<br>");
		});
	},

	ToggleData : function(ShowData) {
		$("#showdata").css("display",ShowData?"block":"none");
	},

	ToggleMapGraph : function(geomap) {
		$("#hccont").css("display",geomap?"none":"block");
		// $("#viewDiv").css("display",geomap?"block":"none");
		// $("#infoDiv").css("display",geomap?"block":"none");
		$("#mapcont").css("display",geomap?"block":"none");
	},
}