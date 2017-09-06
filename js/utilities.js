var BDSVis = BDSVis || {};

BDSVis.util = {
	
	

	//prepare
	savesvg: function(type) {
		//get svg element.
		/*var svg = document.getElementById("viewDiv");
		//var llctext=BDSVis.PlotView.lowerrightcornertext.text();
		//BDSVis.PlotView.lowerrightcornertext.text("");


		function getSVGsource() {

	   		var outer = document.createElement('div');

		    outer.appendChild(d3.select("#viewDiv")
		        .attr("title", "test2")
		        .attr("version", 1.1)
		        .attr("xmlns", "http://www.w3.org/2000/svg")
		        .node().cloneNode(true));

		    return outer.innerHTML;
		};

		function CreateAAndClick(type,href) {
		    var a = document.createElement('a');
		    a.id="savetemplink";
		    var fname = BDSVis.PlotView.ptitle;
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
		});*/
	}
};