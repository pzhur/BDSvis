var BDSVis = BDSVis || {};

BDSVis.getAPIdata = function (vm) {
	//This function puts together the request to the BDS API, does minor data processing (converting into object) and sends it further. 
	//"vm" is the reference to ViewModel
	
	var request={}; //The list of variables to request from API. Based on this, the request URL is formed and then this list is used when plotting.

	request.xvar = vm.ActualVarCode(vm.xvar);
	request.cvar = vm.ActualVarCode(vm.cvar);

	vm.model.variables.forEach(function(varr1) { //Add variables with requested values to the request

		var varr = vm.model.IsGroup(varr1) ? vm.model.LookUpVar(vm.SelectedOpts[varr1.code][0]) : varr1; //If variable is a group variable, put variable that is selected in it instead
		if (varr.code === request.xvar) request[varr.code] = vm.IncludedXvarValues[varr.code]; //For x-var take the included values
		else if (varr.code !== request.cvar) request[varr.code] = [vm.SelectedOpts[varr.code][0]]; //If it's not c- or x-var only take first selected option
		else request[varr.code] = vm.geomap() ? [vm.SelectedOpts[varr.code][0]] : vm.SelectedOpts[varr.code].slice(0); //For the c-var take all selected if not in geo map regime
	
	});
		
    var url = "https://api.census.gov/data/timeseries/bds/firms";
    var geovar = vm.SelectedOpts.geo;//d3.keys(request).filter(function(d) {return vm.model.geomapvar.indexOf(d)!==-1;})[0];
	var geography = geovar+":"+request[geovar]; 
	if ((request[geovar].length===1) && (request[geovar][0]==="00")) geography = "us:*"; //If only "United States" is selected then use us:*
	if (vm.geomap()) geography = geovar+":*"; //In map regime use state:*

	//Whether to request all years or a particular year
	var reqtime;
	var tv = vm.model.LookUpVar(vm.model.timevar); //Variable denoting time (e.g. 'year2')
	if (vm.timelapse || tv.code===vm.xvar) //When time lapse or time variable as axis request data for all times
		reqtime = "&time=from+"+tv.range[0]+"+to+"+tv.range[1]+"";
	else reqtime = "&"+tv.code+"="+(request[tv.code] || tv.default); //Else request for a particular time

	//Put everything together
    var getstring = request[vm.model.yvars];
    var filterstring = "";

	for (var key in request) {

    	if ((key!=="cvar") &&
    		(key!=="xvar") &&
    		(!vm.model.IsGeomapvar(key)) && 
    		(key!==vm.model.timevar) &&  
    		(key!==vm.model.yvars))

	    		if ((!(vm.model.LookUpVar(key).APIfiltered) || (key===request.xvar)) && (request[key].length > 1))
	    			getstring+=","+key; //Get records with all values of variable with name equal to key
	    		else //if ((request[key].length > 1) || (request[key][0]!==vm.model[key][vm.model.LookUpVar(key).total].code))
	    			filterstring+="&"+key+"="+request[key]; //Get records with only those values of variable with name equal to key which are in the request
    };

	var geturl=url+"?get="+getstring+filterstring+"&for="+geography.replace(/ /g,"+")+reqtime+"&key=93beeef146cec68880fccbd72e455fcd7135228f";

    console.log(geturl);
    
    //vm.PlotView.DisplayWaitingMessage();
    d3.json(geturl,function (data) { //Send request to the server and get response
    	if (data===null) {
    		console.log("Server sent empty response to " + geturl);
			vm.PlotView.DisplayNoData(request,vm);
			//return;	
    	} else {
    		//Convert data into array of objects with the keys defined by the first row
			var keys=data[0]; //First row contains keys
			data=data.slice(1).map(function(d) {
				var rec = {};
				for (ikey in keys) { //Find keys, which are contained in the first line of the array returned by API
					var key = (keys[ikey]==="us")?geovar:(keys[ikey]); //Substitute "us" field name to "state"
					key = (key==="time")?vm.model.timevar:key;
					rec[key] = d[ikey]; //Fill the object
				};
				return rec;
			});
    		BDSVis.processAPIdata(data,request,vm); //Continue to data processing and plotting
    	}
    	vm.UIView.DrawUI(vm);
    });
};


//Process data coming as array of objects. Filter the data according to request (sometimes requests ask server for more than user needs to plot)
//Change codes into names, melt data if many yvars are chosen (= the yvar is also the cvar), call functions making table, map or plots.
BDSVis.processAPIdata = function(data,request,vm) {
	//"vm" is the reference to ViewModel



 	//Filter the obtained data, so that only what is requested remains (API does not filter all the variables)
 	vm.dataunfiltered = data.slice(0);
	for (var key in request) {
    	if ((key!==vm.model.yvars) && //(key!==xvar) && 
    		(key!=="cvar") &&
    		(key!=="xvar") && (!vm.model.IsGroup(key)) && !(vm.timelapse && (key===vm.model.timevar))) {
    		data = data.filter(function(d) { return request[key].map(function(d) {return d.toString();}).indexOf(d[key])!==-1;});
    	}
	};

	if (data.length<1) { //Display No Data message is all received data is filtered
		vm.PlotView.DisplayNoData(request,vm);
		return;	
	};

	//Melt the data, with yvars in the same column. Like R function "melt" from the "reshape" package. 
	//(This is needed when several yvars are used, i.e. when yvar is also a cvar)
	data = d3.merge(data.map(function(d) {
		//Split each record into array of records where value equals to one of yvars, and vm.model.yvars(e.g "measure") is equal to the name of that yvar
			return request[vm.model.yvars].map(function(yv){ 
				var rec=JSON.parse(JSON.stringify(d));
                rec[vm.model.yvars]=yv; //Set vm.model.yvars (e.g. "measure") field to which measure it is
                rec.value=d[yv]; //Set value field to the value of variable yv
                return rec;
			}) 
		})); //d3.merge flattens the array

	vm.TableView.makeDataTable(data,request.cvar,request.xvar,vm); //Make the table displaying the data
	
	if (vm.geomap())
		BDSVis.makeMap(data,request,vm);
	// else if ((vm.heatchart) && !(vm.model.IsContinuous(request.xvar)))
	// 	BDSVis.makeHeatChart(data,request,vm);
	else
		BDSVis.makePlot(data,request,vm);
};

