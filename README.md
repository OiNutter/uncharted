Uncharted
=========

Uncharted is a graphing library built on Prototype ([prototypejs.org](http://prototypejs.org)) and Raphaël ([raphaeljs.com](http://raphaeljs.com)). 
It's intended to combine the features I liked from ProtoChart ([http://www.deensoft.com/lab/protochart/index.php](http://www.deensoft.com/lab/protochart/index.php)) and
gRaphaël ( [http://g.raphaeljs.com/](http://g.raphaeljs.com/)). gRaphaël had a lot of interactive features that I liked but I much prefered the look and style of the 
ProtoChart stuff, so I decided to build my own library as a combination of the two.

A complete set of demos is available at [oinutter.co.uk/uncharted/](http://oinutter.co.uk/uncharted/)

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
	
The `center` and `radius` allow you to define the size and position of the chart.  If left as the defaults they will be calculated based on the size of the target div.

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
	
Notice that not all data segments have to have a link.

[View Demo](http://oinutter.co.uk/uncharted/#pie)

###Bar###

	var bar = new Uncharted.bar(element,data[,options]);
	
This will create a new interactive bar chart.  At the moment it only creates charts with vertical columns but I will be adding a horizontal option later, along with stacking columns.
The default options are as above, with the following additions/overrides:

	{
		multiColored:false,
		xaxis: {
				max:null,
				min:null,
				increment:1,
				gap:null,
				x:null,
				y:null,
				minSize:20
		},
		yaxis: {
				max:null,
				min:0,
				increment:1,
				gap:null,
				x:null,
				y:null,
				minSize:20
		},
		shadow: {
				size:2
		},
		legend: {
				position:"inside"
		},
		labels: {
				show:true,
				showOn:'rollover'
		}
	}
	
The `multiColored` option will allow you to have different coloured columns on a single data set. This is ignored if you have multiple data sets, or are showing a legend to avoid confusion.

The data for a bar chart show be formatted as follows (expanded for clarity):

	[
		{
			data:[
					['A',2],
					['B',3],
					['C',6],
					['D',19]
				],
			label:"Data 1"
		}
	]
	
To provide multiple sets merely add more data objects like so:

	[
		{
			data:[
					['A',2],
					['B',3],
					['C',6],
					['D',19]
				],
			label:"Data 1"
		},
		{
			data:[
					['A',5],
					['B',7],
					['C',12],
					['D',1]
				],
			label:"Data 2"
		}
	]

[View Demo](http://oinutter.co.uk/uncharted/#bar)
	
###Line###

	var line = new Uncharted.line(element,data[,options]);
	
This will create an interactive line chart. The default options are as above, with the following additions/overrides:

	{
		xaxis: {
				max:null,
				min:null,
				increment:1,
				gap:null,
				x:null,
				y:null,
				minSize:20,
				minIncrement:null
		},
		yaxis: {
				max:null,
				min:null,
				increment:10,
				gap:null,
				x:null,
				y:null,
				minSize:20,
				minIncrement:null
		},
		shadow: {
				size:2
		},
		legend: {
				position:"inside"
		},
		points: {
				show:false,
				marker:'dot',
				markerWidth:4,
				markerHeight:4,
				markerBorder: "#ccc"
		},
		tags: {
				show:true,
				marker:'popup',
				markerWidth:4,
				markerHeight:4,
				format: "x + ',' + y"
		}
	}

The key new additions here are `points` and `tags`. The `points` option defines wether the chart marks each point of data and joins the dots, or just shows it as a continous line.  
The `tags` option controls the little popup markers that appear when you rollover a data point telling you what the data is for that point. The `format` option for the marker 
defines a string that will be eval'ed as javascript to insert the format.

The data for the line chart should be formatted as follows:

	[
		{
			data: [
					[0, 0], [1, 2], [2, 24], [3, 3], [4, 20], [5, 0], [6, 6], [7, 49], [8, 80], [9, 108], [10, 110], [11, 121], [12, 144], [13, 78]
				],
			label: "Data 1"
		}
	]
	
To provide multiple sets merely add more data objects like so:

	[
		{
			data: [
					[0, 0], [1, 2], [2, 24], [3, 3], [4, 20], [5, 0], [6, 6], [7, 49], [8, 80], [9, 108], [10, 110], [11, 121], [12, 144], [13, 78]
				],
			label: "Data 1"
		},
		{
			data: [
					[0, 68], [1, 26], [2, 65], [3, 47], [4, 79], [5, 0], [6, 83], [7, 94], [8, 23], [9, 9], [10, 13], [11, 46], [12, 93], [13, 64]
				],
			label: "Data 2"
		},
		
	]

[View Demo](http://oinutter.co.uk/uncharted/#line)

###Time###

	var time = new Uncharted.time(element,data[,options]);
	
This will create an interactive time chart. Time charts are a subclass of line charts so inherit their options, in addition to the base options.  The additions and overrides are as follows:

	{
		monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
		xaxis: {
				increment:"auto",
				minSize:50,
				minIncrement:'day'
		},
		tags:{
				format:"this.options.monthNames[(new Date(x)).getMonth()] + ' ' + (new Date(x)).getDate() + ',' + y"
		}
	}

The chart will alter the x-axis labelling format to the most appropriate date information based on the calculated incremement.

The data for the time chart should be formatted as follows:

	[
		{
			data: [
					[770421600000, 360.60], [773013600000, 359.20], [775692000000, 357.23], [778370400000, 355.42], [780966000000, 355.89], [783644400000, 357.41], [786236400000, 358.74], [788914800000, 359.73]
				],
			label: "Data 1"
		}
	]
	
The x value should be a javascript timestamp.

[View Demo](http://oinutter.co.uk/uncharted/#time)

Mouse Events
------------

To change the default interactions for the charts you can pass two additional options when creating your chart; `onMouseOver` and `onMouseOut`.  The functions are passed a single argument of chart, 
which is a reference to the entire chart object, with the `this` scope being the segment, data point or legend key that you have interacted with. Check out the code for each chart to see how the 
defaults work.
