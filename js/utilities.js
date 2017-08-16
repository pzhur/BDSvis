var BDSVis = BDSVis || {};

BDSVis.util = {
	
	//This is a general use function for whenever the number should be printed in format with fixed significant digits and M and k for millions and thousands
	// NumFormat : function(d,sigdig) {
	// 	//"sigdig" is how many digits to show
	// 	var exp=Math.floor(Math.log(Math.abs(d))/Math.log(10))-sigdig+1;
	// 	var mantissa= Math.floor(d/(Math.pow(10,exp)));
	// 	if (Math.abs(d)>1e+9)
	// 		return d3.format("."+(9-exp)+"f")(mantissa*(Math.pow(10,exp-9)))+"B";
	// 	else if (Math.abs(d)>1e+6)
	// 		return d3.format("."+(6-exp)+"f")(mantissa*(Math.pow(10,exp-6)))+"M";
	// 	else if (Math.abs(d)>1e+3)
	// 		return d3.format("."+(3-exp)+"f")(mantissa*(Math.pow(10,exp-3)))+"k";
	// 	else if (Math.abs(d)>1)
	// 		return d3.format("."+(-exp)+"f")(d);
	// 	else if (Math.abs(d)>5e-2)
	// 		return d3.format(".2f")(d);
	// 	else return d3.format(".f")(d);
	// },

	//Automatic text wrapping function by Mike Bostock, http://bl.ocks.org/mbostock/1846692, corrected
	

	//prepare
	savesvg: function(type) {

		//get svg element.
		var svg = document.getElementById("chartsvg");
		//var llctext=BDSVis.PlotView.lowerrightcornertext.text();
		//BDSVis.PlotView.lowerrightcornertext.text("");

		function getSVGsource() {

	   		var outer = document.createElement('div');

		    outer.appendChild(d3.select("#chartsvg")
		        .attr("title", "test2")
		        .attr("version", 1.1)
		        .attr("xmlns", "http://www.w3.org/2000/svg")
		        .node().cloneNode(true));

		    return outer.innerHTML;
		};

		function CreateAAndClick(type,href) {
		    var a = document.createElement('a');
		    a.id="savetemplink";
		    var fname = BDSVis.PlotView.maintitle.text();
		    a.download = (fname || "BDS")+"."+type;
		    a.href = href;
		    document.body.appendChild(a);
		    a.click();
		    document.getElementById(a.id).remove();
		};

		d3.text('css/style.css',function(data) {
			var style = document.createElement("style");
    		style.appendChild(document.createTextNode(data));
   			svg.appendChild(style);


		    var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(getSVGsource());
		    if (type==="svg")
		        CreateAAndClick("svg",url);
		    else {
		        var image = new Image();
		        image.src = url;
		        image.onload = function() {
		            var canvas = document.createElement('canvas');
		            canvas.width = image.width;
		            canvas.height = image.height;
		            var context = canvas.getContext('2d');
		            context.drawImage(image, 0, 0);
		            if (type==="png")
		                CreateAAndClick("png",canvas.toDataURL('image/png'));
		            else if (type==="jpg")
		                CreateAAndClick("jpg",canvas.toDataURL('image/jpeg'),0.98);
		        };
		    };
		    //BDSVis.PlotView.lowerrightcornertext.text(llctext);
		});
	}
};