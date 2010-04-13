var Uncharted = {};

Uncharted.base = Class.create({
	extendOptions: function(destination,source){
		var property,prop;
		for (property in source){
			if(Object.values(destination[property]).length>0 && Object.values(source[property]).length>0){
				for(prop in source[property])
 			 		destination[property][prop] = source[property][prop];
 			 } else {
 			 	destination[property] = source[property];
 			 }
 		}
		return destination;
 	},
 	initialize: function(element,data,options){
 			
 		//check element exists
 		if(!$(element))
 			throw new Error('Element does not exist: '  + element);
 		
 		this.options = {
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
 		};
 		
 		//merge specified options with defaults;
 		this.extendOptions(this.options,options || {});
 				 
  		//set remaining options
 		this.element = element;
 		this.paper = Raphael(element);
 		this.data = data;
 		this.width = parseFloat($(element).getWidth());
 		this.height = parseFloat($(element).getHeight());
  	},
 	parseData: function(){
 				  
  		var res = [],s,total=0,v;
  			
  		this.data.each(function(d){
   			if((d.data == 0 || d.data || !d.data || d.data != null)) {
  				s = {};
  				total += d.data;
  				for(v in d)
  					s[v] = d[v];
  					
  			} else {
  				s = {data: ((parseFloat(d)) ? parseFloat(d) : d)};
  			}
  			res.push(s);
 		}.bind(this));
 		
  		return {total:total,data:res};
  	},
 	drawGrid: function(){
  		
  		var grid = this.options.grid,
  			gutter= this.options.gutter,
 			gridBox = this.paper.set(),
 			rightLine;
  				  
 		//draw top line of box
 		this.axis.x.clone().translate(0,-this.axis.y.getBBox().height+1);
 		rightLine = this.axis.y.clone().translate(this.axis.x.getBBox().width-1,0);
 				   				  
 		this.ticks.x.each(function(tick){
 			gridBox.push(this.paper.path(['M',tick[0],this.axis.x.getBBox().y,'L',tick[0],gutter.y]).attr({'stroke':grid.stroke,'stroke-width':0.5}).toBack());
 		}.bind(this));
 				  
 		this.ticks.y.each(function(tick){
  			gridBox.push(this.paper.path(['M',this.axis.y.getBBox().x,tick[1],'L',rightLine.getBBox().x,tick[1]]).attr({'stroke':grid.stroke,'stroke-width':0.5}).toBack());
  		}.bind(this));
 				 
 		this.grid = gridBox;
 				  
 	},
 	getMarker: function(x,y,options,color){
 		
 		var marker = this.paper.set();
 	
 		switch(options.marker){
 			case 'square' :	marker.push(this.paper.rect(x-2,y-2,options.markerWidth+4,options.markerHeight+4).attr({"stroke":options.markerBorder,"fill":'#fff'}));
 		 					marker.push(this.paper.rect(x,y,options.markerWidth,options.markerHeight).attr({"fill":color,"stroke-opacity":0}));
 		 					return marker;
 		 					break;
 		 	case 'dot'	  : marker.push(this.paper.circle(x,y,options.markerWidth+2,options.markerHeight+2).attr({"stroke":options.markerBorder,"fill":'#fff'}));
							marker.push(this.paper.circle(x,y,options.markerWidth,options.markerHeight).attr({"fill":color,"stroke-opacity":0}));
							return marker;
							break;
 		 	default: break;
 		 }
 	},
 	showTooltip: function (x, y, text, dir, size) {
 	
 		dir = dir == null ? 2 : dir;
 		size = size || 5;
 		text = text || x + "," + y;
 		var res = this.paper.set(),
 			textBox = this.paper.text(x, y,text).attr({"fill": "#fff","text-anchor":"middle"}),
 		 	bb = textBox.getBBox(),
 			w = bb.width / 2,
 			h = bb.height / 2,
 			pb,
 			newy;
 						
 		res.push(this.paper.rect(x-w-5,y-h*2-15,bb.width+10,bb.height+10,5).attr({"fill": "#000", "stroke-width": 0}));
 		res.push(textBox.toFront());
 		pb = res.getBBox();
 		newy = pb.y + 12.5;
 		if(pb.y<this.options.gutter.y){
 			newy+=pb.height;
 			res.attr({"y":pb.y+pb.height});
 		}
 		res[1].attr({"x":pb.x+pb.width/2,"y":newy,"text-anchor":"middle"});
 		
 		
 		return res;
 	},
 	getMaxVal: function(axis){
			
			var maxVal,currentMax;
			
			this.graphData.data.each(function(s){
				index = (axis=="x") ? 0 : 1;
				currentMax = s.data.max(function(item){return parseFloat(item[index]);});
				maxVal = (currentMax>maxVal || Object.isUndefined(maxVal)) ? currentMax : maxVal;
			}.bind(this));
			
			return maxVal;
		},
	getMinVal: function(axis){
			
			var minVal,currentMin;
			
			this.graphData.data.each(function(s){
				index = (axis=="x") ? 0 : 1;
				currentMin = s.data.min(function(item){return parseFloat(item[index]);});
				minVal = (currentMin<minVal || Object.isUndefined(minVal)) ? currentMin : minVal;
			}.bind(this));
			
			return minVal;
		}
});

//TODO fix marker shift on rollover