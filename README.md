Uncharted
=========

Uncharted is a graphing library built on Prototype ([prototypejs.org](http://prototypejs.org)) and Raphaël ([raphaeljs.com](http://raphaeljs.com)). 
It's intended to combine the features I liked from ProtoChart ([http://www.deensoft.com/lab/protochart/index.php](http://www.deensoft.com/lab/protochart/index.php)) and
gRaphaël ( [http://g.raphaeljs.com/](http://g.raphaeljs.com/)). gRaphaël had a lot of interactive features that I liked but I much prefered the look and style of the 
ProtoChart stuff, so I decided to build my own library as a combination of the two.

Usage
-----

To use uncharted you need to include the Prototype and Raphaël libraries in your code, along with the uncharted library:

	<script type="text/javascript" src="path/to/prototype.js"></script>
	<script type="text/javascript" src="path/to/raphael.js"></script>
	<script type="text/javascript" src="path/to/uncharted.js"></script> 
	
You will also need a div element on the page for uncharted to draw the chart onto.

	<div id="chart"></div>
	
Then all you need to do is call the chart you want to use. So for a pie chart you would call:

	var chart = new Uncharted.pie(element,data[,options]);
	
The calls for each chart type are listed below but the arguments are always the same:

- `element` \- defines the div on page where the chart will be rendered.
- `data` \- the chart data to display.  The format of this can vary from chart to chart but I'll detail that below.
- `options` \- optional argument providing new options to override the inbuilt defaults. Again these can vary from chart to chart so I'll detail those below as well.


Charts
------

###Base###

This isn't actually a chart type but this seemed the most sensible place to detail the default options that all charts have. 

	{
		colors: ["#edc240", "#00A8F0", "#C0D800", "#cb4b4b", "#4da74d", "#9440ed"],
		stroke: "#999",
		strokeOpacity:0,
		fillOpacity:1,
		clickable:true,
		gutter:{
				x:10,
				y:10
			},
		shadow:{
				show:true,
				size:4,
				fill:"#000",
				stroke:"#000",
				strokeOpacity:0,
				fillOpacity:0.1
			},	
		legend: {
				show:true,
				marker:"square",
				align:"right",
				markerHeight:10,
				markerWidth:15,
				textColor: "#666",
				markerBorder: "#ccc"
			},
		grid: {
				show:true,
				horiz:true,
				vert:true,
				stroke:"#ccc"
			}
	}

###Pie###

	var pie = new Uncharted.pie(element,data[,options]);
	
This will create a new interactive pie chart.  The default options are as above, with the following additions/overrides:

	{
	 	center: null,
	 	radius: null,
	 	labels: {
	 			show:true,
	 			textColor:"#666",
	 			accuracy:2
	 	}
	}
	
The center and radius allow you to define the size and position of the chart.  If left as the defaults they will be calculated based on the size of the target div.

The data for a pie chart should be formatted as follows:

	[
		{data:2,label:"Data 1"},
		{data:3,label:"Data 2"},
		{data:3,label:"Data 3"}		
	]

If you want to add a hyperlink to a section you can specify it in the data section like so:

	[
		{data:2,label:"Data 1",link:"http://example.com"},
		{data:3,label:"Data 2",link:"example.html"},
		{data:3,label:"Data 3"}		
	]
	
Notice not all data segments have to have a link.