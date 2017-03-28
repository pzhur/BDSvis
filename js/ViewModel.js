var BDSVis = BDSVis || {};

BDSVis.ViewModel = function(model) {
	var vm = this;

	//Reference to the model, which contains variable names and name look up tables/functions (in model.js file)
	this.model = model;

	//Reference to the visual elements of the plot: SVGs for the graph/map and legend
	this.PlotView = BDSVis.PlotView;

	//Reference to the table showing the data;
	this.TableView = BDSVis.TableView;

	//Reference to the UI elements selecting variables;
	this.UIView = BDSVis.UIView;

	this.ActualVarCode = function(varcode) {
		//Checks if the varname is group variable, then returns code of the variable selected. 
		//If not group variable just returns the input (supposedly the variable code)
		return vm.model.IsGroup(varcode)?vm.SelectedOpts[varcode][0]:varcode;
	};

	// The reference to function that forms and sends API request and gets data (apirequest.js)
	this.getBDSdata = function () {
		d3.select(".selectors").selectAll('*').property("disabled",true);//remove();// Disable all selectors and buttons while data is loading
		BDSVis.getAPIdata(vm);
		//DrawUI();
	};

	//SHOW DATA BUTTON
	
	//The boolean flag for whether the data table is shown
	this.ShowData = false; //Initial value
	this.toggleshowdata = function () {
		//This function executes in click to 'Show Data' button.
		vm.ShowData = !vm.ShowData;
		vm.UIView.ToggleData(vm.ShowData);
		vm.TableView.SetLowerHeadersWidth();
	};

	//TIME LAPSE BUTTON
	//Whether time lapse regime is on	
	this.timelapse = false;//ko.observable(false); //Initial value
	//this.tlbuttontext = ko.computed (function() {return vm.timelapse?"Stop":"Time Lapse"}); //Text on the button
	this.toggletimelapse = function () {
		//This function executes in click to 'Stop'/'Time Lapse' button and stops time lapse animation or starts it.
		if (vm.timelapse) {
			vm.timelapse = false;
			clearInterval(vm.tlint); //Stop the animation
			vm.SelectedOpts[vm.model.timevar]=[vm.TimeLapseCurrYear-1]; //Set the year to the year currently shown in animation
			
		} else {
			vm.timelapse = true;

		}
		vm.getBDSdata();
	};

	this.timelapsefrom = vm.model.LookUpVar(vm.model.timevar).range[0];
	this.timelapseto = vm.model.LookUpVar(vm.model.timevar).range[1]-1;
	this.timelapsespeed = vm.model.timelapsespeeds[Math.floor(vm.model.timelapsespeeds.length / 2)].code;

	//LOG SCALE BUTTON
	//Whether the scale of y-axis is Log or Linear
	this.logscale = false; //Initial value

	//Zoom by rectangle checkbox
	this.zoombyrect =true;

	//Geo Map regime
	this.geomap = function() {
		return vm.model.IsGeomapvar(vm.xvar);
	};

	this.region = "US";
	this.cartogram = 0;
	this.heatchart = 0;

	//Set the incompatible variables to values corresponding totals
	function SetToTotals(varname) {
		if (vm.model.LookUpVar(vm.ActualVarCode(varname)).incompatible !== undefined)
			vm.model.LookUpVar(vm.ActualVarCode(varname)).incompatible.forEach(function(incvar){	
				vm.SelectedOpts[incvar]=[vm.model[incvar][vm.model.LookUpVar(incvar).total].code];
			});
	};
	
	//The following functions set cvar (Legend/Comparison/Color variable) and xvar (X-axis variable)
	this.setcvar = function (varname) {
		vm.cvar=varname;
		
		SetToTotals(varname);

		vm.getBDSdata();
	};

	this.setxvar = function (varname) {

		vm.xvar=varname;

		if (vm.geomap()) vm.cvar=vm.model.yvars;

		vm.UIView.ToggleMapGraph(vm.geomap());

		var varname1=vm.ActualVarCode(varname);
		vm.IncludedXvarValues[varname1]=vm.model.GetCodes(varname1);
		
		SetToTotals(varname);
		
		vm.getBDSdata();
	};
		

	this.multiple = function (varname) {
		return vm.geomap()?false:(varname===vm.cvar); 
	}
    
	//Arrays storing values selected in input selectors and exclusion/inclusion of specific values of x-variable
	this.SelectedOpts = {};
	this.IncludedXvarValues = {};
	function AddVarToArrays(varr) {
		var initial = (vm.model.IsContinuous(varr))?[vm.model[varr.code][varr.default].toString()]:[vm.model[varr.code][varr.default].code];
		vm.SelectedOpts[varr.code]=initial;
		vm.IncludedXvarValues[varr.code]=vm.model.GetCodes(varr.code);
	};
	this.model.variables.forEach(function(varr) {
		AddVarToArrays(varr);
		if (vm.model.IsGroup(varr))
			varr.variables.forEach(function(varrj){
				AddVarToArrays(varrj);
			});
	});

	//Initial values of X-axis variable and C- variable
	this.xvar = "sic1";
	this.cvar = "fage4";

	this.PlotView.Init();
	//this.PlotView.DisplayWaitingMessage();
	//this.DrawUI();

	//Call initial plot
	vm.getBDSdata();
};