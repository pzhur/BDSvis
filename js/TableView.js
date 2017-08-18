var BDSVis = BDSVis || {};

BDSVis.TableView = {

	makeDataTable : function(data,cvar,xvar,vm) {

		//All the values of returned cvars
		var cvarvalues = data.map(function(d) {return d[cvar]}).filter(function(d,i,a) {return i===a.indexOf(d)}); 
		cvarvalues.sort(function(a,b) { //Sorted like in model.js
				var arr=vm.model[cvar].map(function(d) {return d.code});
				return arr.indexOf(a)-arr.indexOf(b);
		});
		
		//All the values of returned xvars
		var xvarvalues = data.map(function(d) {return d[xvar]}).filter(function(d,i,a) {return i===a.indexOf(d)})
		//Data as table output via D3
		var datashowtable = d3.select("#graphdata");
		datashowtable.selectAll("*").remove()

		var headers=d3.merge([[vm.model.NameLookUp(xvar,"var")],cvarvalues.map(function(d){return vm.model.NameLookUp(d,cvar)})]);

		datashowtable.append("thead") //Headers on top
			.selectAll("th").data(headers)
			.enter().append("th").text(function(d){return d});

		d3.select('#graphdataheaders').selectAll('*').remove(); //Headers on the bottom
		d3.select('#graphdataheaders').append("thead")
			.selectAll("th").data(headers)
			.enter().append("th").text(function(d){return d});

		datashowtable.append("tbody")
			.selectAll("tr").data(xvarvalues.map(function(xv){
				return data.filter(function(d) {return d[xvar]===xv;} //Map a row of yvar values to each xvar value
			)}))
			.enter().append("tr")
				.selectAll("td")
				.data(function(dxv) {
					return d3.merge([ [vm.model.NameLookUp(dxv[0][xvar],xvar)], //Add the xvar value as a first element of the row
									cvarvalues.map(function(cv){ //Map a yvar value to each cvar/xvar values pair (or, a column of yvar values to each cvar value)
										return dxv.filter(function(d) {return d[cvar]===cv})
												.map(function(d) {return d.value});
									})])
					}).enter().append("td")
				.text(function(d) {return d});
		
		d3.select('#graphdata').selectAll('tr').style("background-color",function(d,i) {return (i%2)?"#fff":"#eee";});
		this.SetLowerHeadersWidth();
	},

	SetLowerHeadersWidth : function() {
		d3.select('#graphdataheaders').selectAll('th')
			.data(d3.select('#graphdata').selectAll('th')[0].map(function(d) {return d.offsetWidth-1;}))
			.attr("width", function(d) {return d;}).style("padding",0);
	}
}