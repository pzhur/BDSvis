var BDSVis = BDSVis || {};

BDSVis.Model = {
	timevar : "year2", //Variable used in time lapse
	geomapvar : ["state","metropolitan statistical area"], //Variable used in geo map regime
	yvars : "measure", //Variable plotted in y-axis
	timelapsespeeds : [
		{"name":"Slowest","code":"5000"},
		{"name":"Slow","code":"2000"},
		{"name":"Normal","code":"1000"},
		{"name":"Fast","code":"500"},
		{"name":"Fastest","code":"200"}
	],
	variables : [
		//"code" field is used in API request,
		//"name" if for display
		//"type" is "continous", "categorical" or "variablegroup" (for selectors which select variable rather than value of a variable)
		//"default" is the value initially selected
		//"total" is the value correspoing to total of other values (like US for states, "All Ages" for firm age, "All Sizes" for firm size etc.)
		//"APIfiltered" is whether the API will take request like "&sic1=00,07,15" or you have to do "&get=sic1" and then filter yourself. It probably does for numericals and does not for strings
		//"aslegend" is whether the variable can be cvar/legend variable
		//"asaxis" is whether the variable can be used as x-axis
		//"incompatible" is the list of variables for which there is no cross-data, so API will return empty data
		//"printtitle" is how to use the variable in the graph title (look at PrintTitle() function).
		//"customcolor" is whether to use custom color scale specific to that variable (see CreateCustomColorScale() function inside InitModel() )
		{
			"code" : "sic1",
			"name" : "Sector",
			"type" : "categorical",
			"default" : 0,
			"total" : 0,
			"APIfiltered" : true,
			"aslegend" : true,
			"asaxis" : true,
			"incompatible" : ["state","metropolitan statistical area","metro"],
			"printtitle" : {"pref":" in ", "postf":" sector"}
		},
		{
			"code" : "measure",
			"name" : "Measure",
			"type" : "categorical",
			"default" : 7,
			"aslegend" : true,
			"asaxis" : false 
		},
		{
			"code" : "geo",
			"name" : "Geography",
			"type" : "variablegroup",
			"default" : 0,
			"aslegend" : true,
			"asaxis" : true,
			"variables" : [
					{
						"code" : "state",
						"name" : "State",
						"type" : "categorical",
						"default" : 0,
						"total" : 0,
						"APIfiltered" : true,
						"aslegend" : true,
						"asaxis" : true,
						"incompatible" : ["sic1","metro"],
						"printtitle" : {"pref":" in ", "postf":""}
					},
					{
						"code" : "metropolitan statistical area",
						"name" : "MSA",
						"type" : "categorical",
						"default" : 0,
						"total" : 0,
						"APIfiltered" : true,
						"aslegend" : true,
						"asaxis" : true,
						"incompatible" : ["sic1","metro"],
						"printtitle" : {"pref":" in ", "postf":" MSA"}
					},
					]
		},
		{
				"code" : "metro",
				"name" : "Metro/Non-Metro",
				"type" : "categorical",
				"default" : 2,
				"total" : 2,
				"APIfiltered" : false,
				"aslegend" : true,
				"asaxis" : true,
				"incompatible" : ["sic1","state","metropolitan statistical area"],
				"printtitle" : {"pref":" in ", "postf":" areas"}
			},
		{
			"code" : "year2",
			"name" : "Year",
			"type" : "continuous",
			"range" : [1977,2014,1],
			"default" : 36,
			"APIfiltered" : true,
			"aslegend" : true,
			"asaxis" : true,
			"printtitle" : {"pref":" in ", "postf":""}
		},
		{
					"code" : "fage4",
					"name" : "Firm Age",
					"type" : "categorical",
					"default" : 6,
					"total" : 12,
					"APIfiltered" : false,
					"aslegend" : true,
					"asaxis" : true,
					"customcolor" : true,
					"printtitle" : {"pref":" for firms of age ", "postf":" yr"}
				 },
		{
			"code" : "fchar",
			"name" : "Firm Characteristic",
			"type" : "variablegroup",
			"default" : 0,
			"aslegend" : true,
			"asaxis" : true,
			"variables" : [
				 
				 {
					"code" : "fsize",
					"name" : "Firm Size",
					"type" : "categorical",
					"default" : 12,
					"total" : 12,
					"APIfiltered" : false,
					"aslegend" : true,
					"asaxis" : true,
					"customcolor" : true,
					"printtitle" : {"pref":" for firms with ", "postf":" employees"}
				 },
				 {
					"code" : "ifsize",
					"name" : "Initial Firm Size",
					"type" : "categorical",
					"default" : 12,
					"total" : 12,
					"APIfiltered" : false,
					"aslegend" : true,
					"asaxis" : true,
					"customcolor" : true,
					"printtitle" : {"pref":" for firms with ", "postf":" employees"}
				 }

			]}
	],
	state : [
		{"code" : "00", "name" : "United States", "st":"US"},
		{"code" : "01", "name" : "Alabama", "st" : "AL" },
		{"code" : "02", "name" : "Alaska", "st" : "AK" },
		{"code" : "04", "name" : "Arizona", "st" : "AZ" },
		{"code" : "05", "name" : "Arkansas", "st" : "AR" },
		{"code" : "06", "name" : "California", "st" : "CA" },
		{"code" : "08", "name" : "Colorado", "st" : "CO" },
		{"code" : "09", "name" : "Connecticut", "st" : "CT" },
		{"code" : "10", "name" : "Delaware", "st" : "DE" },
		{"code" : "11", "name" : "District of Columbia", "st" : "DC" },
		{"code" : "12", "name" : "Florida", "st" : "FL" },
		{"code" : "13", "name" : "Georgia", "st" : "GA" },
		{"code" : "15", "name" : "Hawaii", "st" : "HI" },
		{"code" : "16", "name" : "Idaho", "st" : "ID" },
		{"code" : "17", "name" : "Illinois", "st" : "IL" },
		{"code" : "18", "name" : "Indiana", "st" : "IN" },
		{"code" : "19", "name" : "Iowa", "st" : "IA" },
		{"code" : "20", "name" : "Kansas", "st" : "KS" },
		{"code" : "21", "name" : "Kentucky", "st" : "KY" },
		{"code" : "22", "name" : "Louisiana", "st" : "LA" },
		{"code" : "23", "name" : "Maine", "st" : "ME" },
		{"code" : "24", "name" : "Maryland", "st" : "MD" },
		{"code" : "25", "name" : "Massachusetts", "st" : "MA" },
		{"code" : "26", "name" : "Michigan", "st" : "MI" },
		{"code" : "27", "name" : "Minnesota", "st" : "MN" },
		{"code" : "28", "name" : "Mississippi", "st" : "MS" },
		{"code" : "29", "name" : "Missouri", "st" : "MO" },
		{"code" : "30", "name" : "Montana", "st" : "MT" },
		{"code" : "31", "name" : "Nebraska", "st" : "NE" },
		{"code" : "32", "name" : "Nevada", "st" : "NV" },
		{"code" : "33", "name" : "New Hampshire", "st" : "NH" },
		{"code" : "34", "name" : "New Jersey", "st" : "NJ" },
		{"code" : "35", "name" : "New Mexico", "st" : "NM" },
		{"code" : "36", "name" : "New York", "st" : "NY" },
		{"code" : "37", "name" : "North Carolina", "st" : "NC" },
		{"code" : "38", "name" : "North Dakota", "st" : "ND" },
		{"code" : "39", "name" : "Ohio", "st" : "OH" },
		{"code" : "40", "name" : "Oklahoma", "st" : "OK" },
		{"code" : "41", "name" : "Oregon", "st" : "OR" },
		{"code" : "42", "name" : "Pennsylvania", "st" : "PA" },
		{"code" : "44", "name" : "Rhode Island", "st" : "RI" },
		{"code" : "45", "name" : "South Carolina", "st" : "SC" },
		{"code" : "46", "name" : "South Dakota", "st" : "SD" },
		{"code" : "47", "name" : "Tennessee", "st" : "TN" },
		{"code" : "48", "name" : "Texas", "st" : "TX" },
		{"code" : "49", "name" : "Utah", "st" : "UT" },
		{"code" : "50", "name" : "Vermont", "st" : "VT" },
		{"code" : "51", "name" : "Virginia", "st" : "VA" },
		{"code" : "53", "name" : "Washington", "st" : "WA" },
		{"code" : "54", "name" : "West Virginia", "st" : "WV" },
		{"code" : "55", "name" : "Wisconsin", "st" : "WI" },
		{"code" : "56", "name" : "Wyoming", "st" : "WY" }],
	
	fage4 : [
		{"code" : "a", "name" : "0" },
		{"code" : "b", "name" : "1" },
		{"code" : "c", "name" : "2" },
		{"code" : "d", "name" : "3" },
		{"code" : "e", "name" : "4" },
		{"code" : "f", "name" : "5" },
		{"code" : "g", "name" : "6-10" },
		{"code" : "h", "name" : "11-15" },
		{"code" : "i", "name" : "16-20" },
		{"code" : "j", "name" : "21-25" },
		{"code" : "k", "name" : "26+" },
		{"code" : "l", "name" : "Born before '76", "pref" : " for firms ", "postf":"" },
		{"code" : "m", "name" : "All Ages" , "pref" : " for firms of ", "postf":""}],

	fsize : [
		{"code" : "a", "name" : "1-4" },
		{"code" : "b", "name" : "5-9" },
		{"code" : "c", "name" : "10-19" },
		{"code" : "d", "name" : "20-49" },
		{"code" : "e", "name" : "50-99" },
		{"code" : "f", "name" : "100-249" },
		{"code" : "g", "name" : "250-499" },
		{"code" : "h", "name" : "500-999" },
		{"code" : "i", "name" : "1000-2499" },
		{"code" : "j", "name" : "2500-4999" },
		{"code" : "k", "name" : "5000-9999" },
		{"code" : "l", "name" : "10000+" },
		{"code" : "m", "name" : "All Sizes","pref" : " for firms of ", "postf":"" }],

	sic1 : [
		{"code" : "0", "acr" : "EW", "name" : "Economy Wide","pref" : " ", "postf":"" },
		{"code" : "7", "acr" : "AGR", "name" : "Agriculture, Forestry, and Fishing" },
		{"code" : "10", "acr" : "MIN", "name" : "Mining" },
		{"code" : "15", "acr" : "CON", "name" : "Construction" },
		{"code" : "20", "acr" : "MAN", "name" : "Manufacturing" },
		{"code" : "40", "acr" : "TCU", "name" : "Transportation, Communication, and Public Utilities" },
		{"code" : "50", "acr" : "WHO", "name" : "Wholesale Trade" },
		{"code" : "52", "acr" : "RET", "name" : "Retail Trade" },
		{"code" : "60", "acr" : "FIRE", "name" : "Finance, Insurance, and Real Estate" },
		{"code" : "70", "acr" : "SRV", "name" : "Services" }],
		
	measure : [
		{"code" : "firms", "name" : "Number of firms" },
		{"code" : "estabs", "name" : "Number of establishments" },
		{"code" : "emp", "name" : "Employment" },
		{"code" : "estabs_entry", "name" : "Establishments born during the last 12 months" },
		{"code" : "estabs_entry_rate", "name" : "Establishment birth rate" },
		{"code" : "estabs_exit", "name" : "Establishments exiting during the last 12 months" },
		{"code" : "estabs_exit_rate", "name" : "Establishment exit rate" },
		{"code" : "job_creation", "name" : "Jobs created over the last 12 months" },
		{"code" : "job_creation_births", "name" : "Jobs created by establishment births over the last 12 months" },
		{"code" : "job_creation_continuers", "name" : "Jobs created by continuing establishments over the last 12 months" },
		{"code" : "job_creation_rate_births", "name" : "Jobs creation rate from establishment births" },
		{"code" : "job_creation_rate", "name" : "Job creation rate" },
		{"code" : "job_destruction", "name" : "Jobs destroyed within the last 12 months" },
		{"code" : "job_destruction_deaths", "name" : "Jobs destroyed by establishment exit over the last 12 months" },
		{"code" : "job_destruction_continuer", "name" : "Jobs destroyed at continuing establishments over the last 12 months" },
		{"code" : "job_destruction_rate_deat", "name" : "Jobs destruction rate from establishment exit" },
		{"code" : "job_destruction_rate", "name" : "Jobs destruction rate" },
		{"code" : "net_job_creation", "name" : "Net job creation" },
		{"code" : "net_job_creation_rate", "name" : "Net job creation rate" },
		{"code" : "reallocation_rate", "name" : "Reallocation rate" },
		{"code" : "firmdeath_firms", "name" : "Number of firm exits" },
		{"code" : "firmdeath_estabs", "name" : "Establishment exit due to firm death" },
		{"code" : "firmdeath_emp", "name" : "Job destruction from firm exit" }],

	metro: [
		{"code" : "M", "name" : "Metropolitan Statistical Area"},
		{"code" : "N", "name" : "Non-metropolitan Statistical Area"},
		{"code" : "o", "name" : "All Areas", "postf" : ""}],

	regions: [
		{"name" : "US", "states" : ["09","23","25","33","44","50","34","36","42","17","18","26","39","55","19","20","27","29","31","38","46","10","11","12","13","24","37","45","51","54","01","21","28","47","05","22","40","48","04","08","16","30","32","35","49","56","02","06","15","41","53"]},
		{"name" : "NORTHEAST", "states" : ["09","23","25","33","44","50","34","36","42"]},
		{"name" : "New England", "states" : ["09","23","25","33","44","50"]},
		{"name" : "Middle Atlantic", "states" : ["34","36","42"]},
		{"name" : "MIDWEST", "states" : ["17","18","26","39","55","19","20","27","29","31","38","46"]},
		{"name" : "East North Central", "states" : ["17","18","26","39","55"]},
		{"name" : "West North Central", "states" : ["19","20","27","29","31","38","46"]},
		{"name" : "SOUTH", "states" : ["10","11","12","13","24","37","45","51","54","01","21","28","47","05","22","40","48"]},
		{"name" : "South Atlantic", "states" : ["10","11","12","13","24","37","45","51","54"]},
		{"name" : "East South Central", "states" : ["01","21","28","47"]},
		{"name" : "West South Central", "states" : ["05","22","40","48"]},
		{"name" : "WEST", "states" : ["04","08","16","30","32","35","49","56","02","06","15","41","53"]},
		{"name" : "Mountain", "states" : ["04","08","16","30","32","35","49","56"]},
		{"name" : "Pacific", "states" : ["02","06","15","41","53"]}
    ],

	InitModel : function() {
		var tmod=this;

/////////////////// THIS ARE THE SHELL COMMANDS THAT DOWNLOAD SHAPE FILES FROM CENSUS WEBSITE AND GENERATE THE TOPOJSON FILE
////////////////// YOU'LL NEED topojson AND ogr2ogr WHICH CAN BE INSTALLED AS PART OF Node.js 
//		
//		curl https://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_cbsa_20m.zip -o msa.zip
// 		unzip msa.zip
// 		ogr2ogr -f GeoJSON -where "LSAD = 'M1'" msa.json cb_2015_us_cbsa_20m.shp
//
//
// 		curl https://www2.census.gov/geo/tiger/GENZ2015/shp/cb_2015_us_state_20m.zip -o states.zip
// 		unzip states.zip
// 		ogr2ogr -f GeoJSON states.json cb_2015_us_state_20m.shp
//
//		topojson -o statesmsa.json --properties name=NAME,geoid=GEOID,landarea=ALAND --simplify=1e-6 -- states.json msa.json
//
///////////////////////////////////////////////////////////////////////////////


		//Get the geographic map from the shape file in TopoJSON format
		
		d3.json("../json/statesmsa.json", function(geodata) {			
			tmod.geo_data={};
			tmod.geo_data.state=topojson.feature(geodata,geodata.objects.states).features;
			tmod.geo_data["metropolitan statistical area"]=topojson.feature(geodata,geodata.objects.msa).features;
			
			tmod.full_geo_data=geodata;
			
			tmod["metropolitan statistical area"] = 
			tmod.geo_data["metropolitan statistical area"]
				.map(function(d) {return {name:d.properties.name,code:d.properties.geoid};})
				.sort(function(a,b) {return a.name.localeCompare(b.name);});


			//Set regions to which the MSA belongs
			tmod["metropolitan statistical area"].forEach(function(msa) {
			
				msa.regions = [];

				tmod.regions.forEach(function(region) {
					
					tmod.state.forEach(function(st) {
						if ((msa.name.indexOf(st.st)>-1) && (region.states.indexOf(st.code)>-1)) msa.regions.push(region.name);
					})
				})

				msa.regions = d3.set(msa.regions).values();	
			})

			tmod.state.forEach(function(st) {
				st.regions = [];
				tmod.regions.forEach(function(region) {
					if (region.states.indexOf(st.code)>-1) st.regions.push(region.name);
				})
			})
			
			tmod["metropolitan statistical area"].unshift({"code" : "00", "name" : "United States", "regions" : []});
			
			tmod.Init();
			
		});
	},

	//Init : function(error, state_geodata, msa_geodata, msa_codes) {
	Init : function() {

		var tmod=this;
		
////////		//Customization of variables: copying of code/name tables, creating colorscales etc
		this.ifsize=this.fsize;
		var CreateCustomColorScale = function (varname) {
			var colorscale={};
			if (varname=="fage4") {
				var scage=d3.scale.pow().exponent(1.).domain([0,26]).range(["#CB2027","#265DAB"]);
				var fages=[0,1,2,3,4,5,10,15,20,25,30];
				for (var ifage in fages) colorscale[tmod[varname][ifage].code]=scage(fages[ifage]);
				colorscale[tmod[varname][tmod[varname].length-2].code]="green";
				colorscale[tmod[varname][tmod[varname].length-1].code]="black";
			};
			
			if ((varname=="fsize") || (varname=="ifsize")) {
				var scsize=d3.scale.log().domain([1,10000]).range(["#CB2027","#265DAB"]);
				var fsizes=[1,5,10,30,50,100,250,500,1000,2500,5000,10000];
				for (var ifsize in fsizes ) colorscale[tmod[varname][ifsize].code]=scsize(fsizes[ifsize]);
				colorscale[tmod[varname][tmod[varname].length-1].code]="black";
			};
			return colorscale;
		};
/////////////////////////

		// // //Create lookup table for variable by name to get index, by which one can access all the properties in this.variables
		// // for (var i in this.variables)
		// // 	this.VarLookUp[this.variables[i].code]=i;

		//Create dictionaries/hashmaps to lookup names of categorical variable values
		this.dicts={};this.revdicts={};
		var CreateDicts = function (varlist) {
			varlist.forEach(function(varr) {
		
				if ((varr.type==='categorical')) {
					tmod.dicts[varr.code]={};
					tmod[varr.code].forEach(function(value){
						tmod.dicts[varr.code][value.code]=value.name;
					});
						
				};

				if (varr.type==='variablegroup')
				{
					tmod[varr.code]=[];
					CreateDicts(varr.variables);
					varr.variables.forEach(function(varrj) {
						tmod[varr.code].push(varrj);
					});		
				};

				if (varr.type==='continuous')
				{
					tmod[varr.code]=[];
					for (var j=varr.range[0]; j<varr.range[1]; j+=varr.range[2]) tmod[varr.code].push(j);
				};

				if (varr.customcolor) varr.colorscale=CreateCustomColorScale(varr.code);
			});
		};

		CreateDicts(tmod.variables);

		//Initialize ViewModel
		BDSVis.ViewModel(tmod);
	},

	GetDomain : function(v) {
		return this[v].map(function(d) { return d.name || d; });
	},

	GetCodes : function(v) {
		return this[v].map(function(d) { return d.code || d; });
	},

	flatlookup : function (varname,arr) {
		return arr[arr.map(function(d) {return d.code}).indexOf(varname)]; //Find object in array arr by field such that object.name==varname
	},

	LookUpVar : function (varname) { //This is not efficient with respect to performance, but is just one line of code
		return this.flatlookup(varname, this.variables) || //If variable is found in the top level of hierarchy, return, otherwise
		//Find all "variablegroup" objects, and pull their variables out, flatten and find the variable by using the "flatlookup" function above
		this.flatlookup(varname,d3.merge(this.variables.filter(function(d) {return d.type==="variablegroup"}).map(function(d) {return d.variables;})));
	},

	IsGroup : function (varr) {
		if (typeof(varr)==="object") return (varr.type==="variablegroup");
		else if (typeof(varr)==="string") return (this.LookUpVar(varr).type==="variablegroup");
		else console.log("Variable is neither string nor object");
	},

	IsContinuous : function (varr) {
		if (typeof(varr)==="object") return (varr.type==="continuous");
		else if (typeof(varr)==="string") return (this.LookUpVar(varr).type==="continuous");
		else console.log("Variable is neither string nor object");
	},

	IsCategorical : function (varr) {
		if (typeof(varr)==="object") return (varr.type==="categorical");
		else if (typeof(varr)==="string") return (this.LookUpVar(varr).type==="categorical");
		else console.log("Variable is neither string nor object");
	},

	IsGeomapvar : function (varr) {
		if (typeof(varr)==="object") return ((this.geomapvar.indexOf(varr.code)!==-1) || (varr.code==="geo"));
		else if (typeof(varr)==="string") return ((this.geomapvar.indexOf(varr)!==-1) || (varr==="geo"));
		else console.log("Variable is neither string nor object");
	},

	NameLookUp : function(d,v) {
		if (v==="var")
			return this.LookUpVar(d).name;	
		else if (this.IsContinuous(v))
			return d; 
		else return this.dicts[v][d];
		//else return this[v].map(function(d1) {return d1.name;})[this[v].map(function(d1) {return d1.code;}).indexOf(d)];
	},

	VarExists : function (varname) {
		if (this.variables.map(function(d) {return d.code}).indexOf(varname)!=-1) return true;
		else 
			return (d3.merge(this.variables.filter(function(d) {return d.type==="variablegroup"}).map(function(d) {return d.variables;})).map(function(d) {return d.code}).indexOf(varname)!=-1);
	},

	PrintTitle : function (value, varname) {
		var varr=this.LookUpVar(varname);
		var pref,postf;
		if (!this.IsContinuous(varr)) {
			var ind = this[varname].map(function(d){return d.code}).indexOf(value);

			pref = this[varname][ind].pref;
			postf = this[varname][ind].postf;
		}
		if (pref===undefined) pref = varr.printtitle.pref;
		if (postf===undefined) postf = varr.printtitle.postf;
		return pref+this.NameLookUp(value,varname)+postf;
	},

	sortasmodel : function(arr,v) {  //Sorted like in model.js
		var marr=this[v].map(function(d) {return d.code});
		return arr.sort(function(a,b) {
				return marr.indexOf(a)-marr.indexOf(b);
			})
	}

};