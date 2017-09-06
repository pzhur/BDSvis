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
		//Data as table output via jQuery
		var datashowtable = $("#graphdata");
		datashowtable.children().remove();

		var headers=[].concat.apply([],[[vm.model.NameLookUp(xvar,"var")],cvarvalues.map(function(d){return vm.model.NameLookUp(d,cvar)})]);

		datashowtable.append("<thead></thead>");
		var dsthead = datashowtable.children().last();
		$('#graphdataheaders').children().remove(); //Headers on the bottom
		$('#graphdataheaders').append("<thead></thead>")
		var dstbott = $('#graphdataheaders').children().last();

		headers.forEach(function(d){
			dsthead.append("<th></th>");
			dsthead.children().last().text(d);
			dstbott.append("<th></th>");
			dstbott.children().last().text(d);
		})
		
		datashowtable.append("<tbody></tbody>");
		var dstbody = datashowtable.children().last();

		xvarvalues
			.map(function(xv){return data.filter(function(d) {return d[xvar]===xv;})})
			.forEach(function(dxv) {
				dstbody.append("<tr></tr>")
				var row = dstbody.children().last();
				var table = [].concat.apply([],[ //Merging arrays into one
										[vm.model.NameLookUp(dxv[0][xvar],xvar)], //Add the xvar value as a first element of the row
										cvarvalues.map(function(cv){ //Map a yvar value to each cvar/xvar values pair (or, a column of yvar values to each cvar value)
											return dxv.filter(function(d) {return d[cvar]===cv})
													.map(function(d) {return d.value});
										})])
				table.forEach(function(d){
					row.append("<td></td>")
					row.children().last().text(d)
			})
		})

		$("#graphdata tr").css("background-color",function(i) {return (i%2)?"#fff":"#eee";})
		this.SetLowerHeadersWidth();
	},

	SetLowerHeadersWidth : function() {
		offsetwidths=[]
		$("#graphdata th").each(function() {offsetwidths.push($(this).width())})
		$('#graphdataheaders th').each(function(i){
				$(this).attr("width",offsetwidths[i]+1)
			}
		)
	}
}