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
  				
  			if(!Object.isUndefined(d.data)) {
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
 			pb;
 						
 		res.push(this.paper.rect(x-w-5,y-h*2-15,bb.width+10,bb.height+10,5).attr({"fill": "#000", "stroke-width": 0}));
 		res.push(textBox.toFront());
 		pb = res.getBBox();
 		res[1].attr({"x":pb.x+pb.width/2,"y":pb.y+12.5,"text-anchor":"middle"}); 		 				
 		
 		return res;
 	}
});
 
Uncharted.pie = Class.create(Uncharted.base,{
	initialize: function($super,element,data,options){
	
		//set chart specific default options
	 	options = options || {};
	 	options = this.extendOptions({
	 						center: null,
	 						radius: null,
	 						labels: {
	 							show:true,
	 							textColor:"#666",
	 							accuracy:2
	 						}
	 				},options);
	 		
	 		//call base class initialize
	 		$super(element,data,options);
	 		
	 		this.options.center = this.options.center || {x:this.width/2,y:this.height/2};
	 		this.options.radius = this.options.radius || (this.height/3);
	 			 		
	 		//reset center x based on legend position
	 		if(this.options.legend.show)
	 			this.options.center.x = (function(align){return (align=="left") ? (this.width/3)*2-25 : this.width/3 + 25;}.bind(this))(this.options.legend.align);
	 			
	 		//create details to draw segments
	 		this.sectors = this.generateSlices();
	 		this.drawChart();
	 		this.onMouseOver = this.options.onMouseOver || this.onMouseOver;
	 		this.onMouseOut = this.options.onMouseOut || this.onMouseOut;
	 		
	 		//set up mouse events
	 		this.slices.each(function(s){
	 				s.mouseover(this.onMouseOver.bind(s,this));
	 				s.mouseout(this.onMouseOut.bind(s,this));
	 				if(this.options.clickable)
	 					s.click(this.onClick.bind(s,this));
	 				
	 				if(this.options.legend.show){
	 					s.key[0][1].mouseover(this.onMouseOver.bind(s,this));
		 				s.key[0][1].mouseout(this.onMouseOut.bind(s,this));
		 				s.key[1].mouseover(this.onMouseOver.bind(s,this));
		 				s.key[1].mouseout(this.onMouseOut.bind(s,this));
		 				if(this.options.clickable)
		 					s.key.click(this.onClick.bind(s,this));
	 				}
	 		},this);
 		},
	 generateSlices: function(){
	 		
 			var segments = {fills:[],shadows:[],labels:[]},
 				currentAngle = 90,
 				rad = Math.PI/180,
 				r = this.options.radius,
 				cx = this.options.center.x,
 				cy = this.options.center.y,
 				shadow = this.options.shadow,
 				labels = this.options.labels;
 			 			
 	 		this.graphData = this.parseData();
 	 	 	 		
 	 		this.graphData.data.each(function(d){
 	 			if(d.data==0)
 	 				return false;
 	 			var angle = d.data/this.graphData.total * 360,
 	 				x1 = cx + r * Math.cos(-currentAngle * rad),
 	 				y1 = cy + r * Math.sin(-currentAngle * rad),
 	 				xm = cx + r / 2 * Math.cos(-(currentAngle + angle / 2) * rad),
 	 				ym = cy + r / 2 * Math.sin(-(currentAngle + angle / 2) * rad),
 	 				endAngle = currentAngle-=angle,
 	 	        	x2 = cx + r * Math.cos(-endAngle * rad),
 	 	        	y2 = cy + r * Math.sin(-endAngle * rad),
 	 	        	labelx = cx + r * Math.cos((-endAngle-(angle/2)) * rad),
 	 	        	labely = cy + r * Math.sin((-endAngle-(angle/2)) * rad),
 	 	        	path,
 	 	        	shadowPath;
 	 			
 	 			if(angle != 360){
 	 				path = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(Math.abs(angle) > 180), 1, x2, y2, "z"],
 	 				shadowPath = ["M", cx+shadow.size, cy+shadow.size, "L", x1+shadow.size, y1+shadow.size, "A", r, r, 0, +(Math.abs(angle) > 180), 1, x2+shadow.size, y2+shadow.size, "z"];
 	 			} else {
 	 				path = ["M",cx-r,cy,"A",r,r,0,0,1,cx+r,cy,"A",r,r,0,0,1,cx-r,cy,"z"],
 	 				shadowPath = ["M",cx-r+shadow.size,cy+shadow.size,"A",r,r,0,0,1,cx+r+shadow.size,cy+shadow.size,"A",r,r,0,0,1,cx-r+shadow.size,cy+shadow.size,"z"];
 	 			}
 	 				
 	 			path.middle = {x: xm, y: ym};
 	 			shadowPath.middle = {x: xm+shadow.size, y: ym+shadow.size};
 	 				
 	 				
 	 				if(d.link){
 	 					path.url = (d.link.url) ? d.link.url : d.link;
 	 					path.target = d.link.target || "_self";
 	 				}
 	 				
 	 				segments.fills.push(path);
 	 				
 	 				labelx+=(labelx>cx) ? 10 : -10;
 	 				labely+=(labely>cy) ? 10 : -10;
 	 				
 	 				if(shadow.show)
 	 					segments.shadows.push(shadowPath);
 	 				
 	 				if(labels.show)
 	 					segments.labels.push(this.paper.text(labelx,labely,((d.data/this.graphData.total) * 100).toFixed(labels.accuracy) + "%").attr({'text-color':labels.textColor,'text-anchor':((Math.abs(endAngle)<180) ? "start" : "end")}).toFront());
 	 				
 	 				
 	 			
 	 		},this);
 	 		return segments;
 		},
 	drawChart: function(){
 			var shadow=this.options.shadow,
 				sectors=this.sectors,
 				slices=[],
 				legend = this.options.legend,
				keyx = (legend.align="right") ? (this.width/3 * 2)+50 : 10,
				keyy = this.height/6,
				keys = this.paper.set(),
				labels = this.options.labels,
				key;
 			 			
			if(legend.show){
 	 			this.graphData.data.each(function(d,i){
 	 				key = this.paper.set();
 	 				key.push(this.getMarker(keyx,keyy,legend,this.options.colors[i]));
 	 				key.push(this.paper.text(keyx+legend.markerWidth + 10,keyy+legend.markerHeight/2,d.label).attr({"fill":legend.textColor,"text-anchor": "start"}));
 	 				keyy += key.getBBox().height+7;
 	 				keys.push(key);
 	 			},this);
 	 		}
 			
 			sectors.fills.each(function(s,i){
 				segment = this.paper.path(s);
 				segment.url = s.url;
 				segment.target = s.target;
 				segment.attr('fill',this.options.colors[i]);
 				segment.attr('stroke',this.options.stroke);
 				segment.attr('stroke-opacity',this.options.strokeOpacity);
 				segment.attr('fill-opacity',this.options.fillOpacity);
 			 				
 				if(shadow.show){
 					segment.shadow = this.paper.path(sectors.shadows[i]);
 					segment.shadow.attr('fill',shadow.fill);
 					segment.shadow.attr('stroke',shadow.stroke);
 					segment.shadow.attr('stroke-opacity',shadow.strokeOpacity);
 					segment.shadow.attr('fill-opacity',shadow.fillOpacity);
 					segment.shadow.toBack();
 	 			};
 	 			
 	 			if(labels.show)
 	 				segment.label = sectors.labels[i];
 	 			
 	 			if(legend.show)
 	 				segment.key = keys[i];
 				
 				slices.push(segment);
 			}.bind(this));
 			this.slices = slices;
 			
 		},
  	onMouseOver: function(chart){
 			var cx=chart.options.center.x,
 				cy=chart.options.center.y,
 				shadow = chart.options.shadow,
 				bb;
 			 			
 			 this.stop();
 			 
 			 if(this.url)
 				 $(chart.element).style.cursor = "pointer";
 			 
             this.scale(1.1, 1.1, cx, cy);
             if(this.shadow)
            	 this.shadow.scale(1.1,1.1,cx + shadow.size,cy + shadow.size);
             
             if(this.key){
               	 this.key[0].stop();
                 this.key[0].scale(1.2);
                 this.key[1].attr({"font-weight": 800});
             }
             
             if(this.label){
            	 this.label.stop();
            	 bb = this.label.getBBox();
            	 xmod = bb.x > cx ? 5: -5;
            	 ymod = bb.y > cy ? 5 :-5;
              	 this.label.translate(xmod,ymod);
             }
             
 		},
 	onMouseOut: function(chart){
 			var cx=chart.options.center.x,
				cy=chart.options.center.y,
				shadow = chart.options.shadow,
				bb;
 			
 			if($(chart.element).style.cursor == "pointer")
 				$(chart.element).style.cursor = "default";
 			
 			this.animate({scale: [1, 1, cx, cy]}, 500, "bounce");
 			 if(this.shadow)
 				this.shadow.animateWith(this,{scale: [1, 1, cx+shadow.size, cy+shadow.size]}, 500, "bounce");
 			 
 			if(this.key){
 				
 				this.key[0].animateWith(this,{scale: 1}, 500, "bounce");
                this.key[1].attr({"font-weight": 400});

            }
 			
 			 if(this.label){
 				bb = this.label.getBBox();
            	xmod = bb.x < cx ? 5: -5;
            	ymod = bb.y < cy ? 5 :-5;
 				this.label.animateWith(this,{translation:[xmod,ymod]},100,"bounce");
 			 }
 		},
 	onClick: function(chart){
 		
 			switch(this.target){
 				case "_self" : window.location.href = this.url; break;
 				case "_blank" : window.open(this.url);break;
 				default:break;
 			}
 		}
 			
 });
 
 Uncharted.bar = Class.create();
 
 Uncharted.line = Class.create(Uncharted.base,{
	 initialize: function($super,element,data,options){
			//set chart specific default options
	 	options = options || {};
		options = this.extendOptions({
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
					min:null,
					increment:10,
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
			},options);
				
			//call base class
			$super(element,data,options);
			
			this.onMouseOver = this.options.onMouseOver || this.onMouseOver;
	 		this.onMouseOut = this.options.onMouseOut || this.onMouseOut;
	 		this.onMouseOverLegend = this.options.legend.onMouseOver || this.onMouseOverLegend;
	 		this.onMouseOutLegend = this.options.legend.onMouseOut || this.onMouseOutLegend;
	 		this.onClickLegend = this.options.legend.onClick || this.onClickLegend;
			
			this.graphData = this.parseData();
						
			//set up axis ranges
			this.generateAxisRanges();
			this.drawAxis();
			this.drawGrid();
			this.series = this.generatePaths();
			this.drawChart();
			if(this.options.legend.show)
				this.legend.toFront();
	
 		},
 	generateAxisRanges : function(){

 			this.options.xaxis.max = (Object.isNumber(this.options.xaxis.max)) ? this.options.xaxis.max : this.getMaxVal('x');
 			this.options.xaxis.min = (Object.isNumber(this.options.xaxis.min)) ? this.options.xaxis.min : this.getMinVal('x');
 			this.options.yaxis.max = (Object.isNumber(this.options.yaxis.max)) ? this.options.yaxis.max : this.getMaxVal('y');
 			this.options.yaxis.min = (Object.isNumber(this.options.yaxis.min)) ? this.options.yaxis.min : this.getMinVal('y');

 			if(this.options.xaxis.increment != "auto" && (this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment > 0)
 					this.options.xaxis.max += this.options.xaxis.increment - ((this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment);		
 					
 			if(this.options.yaxis.increment != "auto" && (this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment > 0)
 				this.options.yaxis.max += this.options.yaxis.increment - ((this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment);
 			
 			rightMargin = 0;
 			if(this.options.legend.show){
 				this.legend = this.drawLegend();
 				rightMargin = this.legend.getBBox().width +10;
 			}
 					
 			this.options.xaxis.gap = (this.options.xaxis.increment != "auto") ? ((this.width - 30 - this.options.gutter.x*2 - rightMargin) / ((this.options.xaxis.max - this.options.xaxis.min)/this.options.xaxis.increment)) : this.options.xaxis.minSize;
 			this.options.yaxis.gap = (this.options.yaxis.increment != "auto") ? ((this.height - 30 - this.options.gutter.y*2) / ((this.options.yaxis.max - this.options.yaxis.min)/this.options.yaxis.increment)) : this.options.yaxis.minSize;
 			
 			if(this.options.xaxis.increment == "auto")
 				this.options.xaxis.increment = (this.options.xaxis.gap*(this.options.xaxis.max - this.options.xaxis.min))/(this.width - 30 - this.options.gutter.x*2 - rightMargin);
 			
 			if(this.options.yaxis.increment == "auto")
 				this.options.yaxis.increment = (this.options.yaxis.gap*(this.options.yaxis.max - this.options.yaxis.min))/(this.height - 30 - this.options.gutter.y*2);
 		},
 	generatePaths: function(){
  			var startx,
 				starty,
 				paths=[],
 				series,
 				markers,
 				shadow = this.options.shadow,
 				points = this.options.points,
 				gapx = this.options.xaxis.gap,
 				gapy = this.options.yaxis.gap,
 				incx = this.options.xaxis.increment,
 				incy = this.options.yaxis.increment;
 				 			 			
 			this.graphData.data.each(function(s){
 				series={line:null,shadow:null,points:null};
 				markers = [];
 				path = null,
 				shadowPath = null;
 				s.data.each(function(d){
 					var newx = ((parseFloat(d[0])- this.options.xaxis.min)/incx) *gapx + this.axis.x.getBBox().x,
 						newy = this.axis.x.getBBox().y - ((parseFloat(d[1])-this.options.yaxis.min)/incy)*gapy - 2;
  					
 					if(path==null)
 						path = ['M',newx,newy];
 					
 					if(shadowPath==null)
 						shadowPath = ['M',newx+shadow.size,newy+shadow.size];
 					
  					path = path.concat(["L",newx,newy]);
  					shadowPath = shadowPath.concat(["L",newx+shadow.size,newy+shadow.size]);
  					 
  					markers.push(this.getMarker(newx,newy,points,'#000'));
  				  	  					
 				}.bind(this));
 				series.line = path;
 				series.shadow = shadowPath;
 				series.points = markers;
 				startx = null;
 				starty = null;
 				paths.push(series);
 			}.bind(this));
 			return paths;
 		},
 	drawLegend:function(){
 			var keys = this.paper.set(),
 				keyBox = this.paper.set(),
 				key,
 				legend = this.options.legend,
 				gutter = this.options.gutter,
 				keyx = gutter.x + 20,
 				keyy = gutter.y + 10,
 				bb,
 				kb;
 	 				
 				this.graphData.data.each(function(d,i){
 	 				key = this.paper.set();
 	 				key.push(this.getMarker(keyx,keyy,legend,this.options.colors[i]));
 	 				key.push(this.paper.text(keyx+legend.markerWidth + 10,keyy+legend.markerHeight/2,d.label).attr({"fill":legend.textColor,"text-anchor": "start"}));
 	 				Event.observe(key[0][1].node,'mouseover',this.onMouseOverLegend.bind(key,this));
 	 				Event.observe(key[0][1].node,'mouseout',this.onMouseOutLegend.bind(key,this));
 	 				Event.observe(key[0][1].node,'click',this.onClickLegend.bind(key,this));
 	 				Event.observe(key[1].node,'mouseover',this.onMouseOverLegend.bind(key,this));
 	 				Event.observe(key[1].node,'mouseout',this.onMouseOutLegend.bind(key,this));
 	 				key.visible = true;
 	 				keyy += key.getBBox().height+7;
 	 				keys.push(key);
 	 			}.bind(this));
 	 			
 	 			bb = keys.getBBox();
 	 			
 	 			if(legend.position && legend.position=="inside"){
 	 				
 	 				keyBox.push(this.paper.rect(this.width - gutter.x - 25 - bb.width,gutter.y+10,bb.width+10,bb.height+10).attr({'stroke':this.options.stroke,'fill':'#fff'}));
 	 				kb=keyBox.getBBox();
 	 				keys.translate(kb.x-bb.x+5,kb.y-bb.y+5);
 	 			} else {
 	 				keys.translate((this.width-bb.width-5)-bb.x-gutter.x,0);
 	 			}
 	 			 	 			
 	 			keyBox.push(keys);
 	 			
 	 			this.keys = keys;
 	 			return keyBox;
 
 		},
 	drawAxis:function(){
 			
 			var n = 0,
 				ylabels = this.paper.set(),
 				xlabels = this.paper.set(),
 				gutter = this.options.gutter,
 				ticks = {x:[],y:[]},
 				i,
 				yaxis,
 				xaxis,
 				yb,
 				xb;
 				
 			
 			//draw y axis
 			//draw labels
 			
 			for(i = this.options.yaxis.max;i>=this.options.yaxis.min;i-=this.options.yaxis.increment){
 				if(i!=this.options.yaxis.min)
 					ticks.y.push([25,(n*this.options.yaxis.gap)+10+gutter.y]);
 				ylabels.push(this.paper.text(25,(n*this.options.yaxis.gap)+10+gutter.y,String.interpret(i)).attr({'text-anchor':'end'}));
 				n++;
 			}
 			//reset labels to be level all on page
 			yb = ylabels.getBBox();
 			ylabels.attr('x',yb.width + gutter.x);
 			
 			//draw line
 			yaxis = this.paper.path('M' + (yb.width+gutter.x+5) + ' ' + gutter.y + 'L'  + (yb.width+gutter.x+5) + ' ' + (yb.height + gutter.y)).attr({'stroke':this.options.stroke,'stroke-width':2});
 			yaxis.labels = ylabels;
 				
 			
 				
 			//draw x axis
 			//draw labels
 			n = 0;
 			if(this.options.legend.show && this.options.legend.position=="inside")
				this.options.xaxis.max += ((this.legend.getBBox().width+gutter.x)/this.options.xaxis.gap)*this.options.xaxis.increment;
 			for(i = this.options.xaxis.min;i<=this.options.xaxis.max;i+=this.options.xaxis.increment){
 	 			if(i!=this.options.xaxis.min)
 	 				ticks.x.push([(yb.width+gutter.x+5) + ((n*this.options.xaxis.gap)),(this.height-20)]);
 	 			xlabels.push(this.paper.text((yb.width+gutter.x+5) + ((n*this.options.xaxis.gap)),(yb.height+gutter.y+10),String.interpret(i)).attr({'text-anchor':'middle'}));
 	 			n++;
 	 		}
 			xb = xlabels.getBBox();
 			extraWidth = 0;
			if(this.options.legend.show && this.options.legend.position=="inside")
				extraWidth = (this.width - (gutter.x*2) - 5 - yb.width) - xb.width; 
 	 		//draw line
 	 		xaxis = this.paper.path('M' + (yb.width + gutter.x+5) + ' '+ (yb.height+gutter.y) + 'L' + (xb.width + yb.width+6 + extraWidth) + ' ' + (yb.height+gutter.y)).attr({'stroke':this.options.stroke,'stroke-width':2});
 	 		xaxis.labels = xlabels;
 	 		
 	 		this.axis = {
 	 					x: xaxis,
 	 					y: yaxis
 	 					};
 	 		 	 		
 	 		this.ticks = ticks;
 	 		 			
 		},
  	drawChart: function(){
 			
 			var lines=[],
 				shadow = this.options.shadow,
 				points = this.options.points,
 				x,
 				y;
 			 		
  			this.series.each(function(s,i){
 				seriesLine = this.paper.path(s.line).attr({'stroke':this.options.colors[i],'stroke-width':3});
 					
 				if(shadow.show)
 					seriesLine.shadow = this.paper.path(s.shadow).attr({'stroke':shadow.fill,'stroke-width':3,'stroke-opacity':shadow.fillOpacity});
 				
 				seriesLine.points = this.paper.set();
					
 					s.points.each(function(p,n){
						p[1].attr('fill',this.options.colors[i]).toFront();
						
						if(!points.show)
							p.attr({'fill-opacity':0,'stroke-opacity':0});
						
						Event.observe(p[1].node,'mouseover',this.onMouseOver.bind(p,this));
						Event.observe(p[1].node,'mouseout',this.onMouseOut.bind(p,this));
						
						x = parseFloat(this.graphData.data[i].data[n][0]);
						y = this.graphData.data[i].data[n][1];
						p.label = eval(this.options.tags.format);
						seriesLine.points.push(p);
						
					}.bind(this));
 				
 				
 				
  				lines.push(seriesLine);
  				
  				if(this.options.legend.show)
  					this.keys[i].line = seriesLine;
 			}.bind(this));
 			
 			this.lines = lines;
 			 			
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
 		},
 	onMouseOver: function(chart){
 			var bb = this.getBBox(),txb;
 			if(!chart.toolTip || chart.toolTip==null){
 				chart.toolTip = chart.showTooltip(bb.x+bb.width/2,bb.y+bb.height/2,this.label);
 				chart.toolTip[0].attr('fill',this[1].attr('fill'));
 			} else {
 				clearTimeout(chart.toolTimer);
 				chart.toolTip[1].attr('text',this.label);
 				txb = chart.toolTip[1].getBBox();
 				chart.toolTip[0].animate({width:txb.width+10,height:txb.height+10,x:(bb.x+bb.width/2)-(txb.width/2)-5,y:bb.y - txb.height-10,fill:this[1].attr('fill') },200);
 				chart.toolTip[1].animateWith(chart.toolTip[0],{x:(bb.x+bb.width/2),y:(bb.y-bb.height/2)-txb.height+7.5},200);
 			}
 		},
 	onMouseOut: function(chart){
 			chart.toolTimer = setTimeout(function(){
 				chart.toolTip.remove();
 				chart.toolTip = null;
 			},2000);
 		},
 	onMouseOverLegend: function(chart){
 			
 			var shadow = chart.options.shadow,
 				points = chart.options.points;
 			
			 this[0].stop();
             this[0].scale(1.2);
             this[1].attr({"font-weight": 800});
             
             chart.lines.each(function(l){
            	 if(l!= this.line){
               		 l.attr('stroke-opacity',chart.options.fillOpacity/3);
               		 if(shadow.show)
               			 l.shadow.attr('',shadow.fillOpacity/3);
            	 	 if(points.show)
            	 		 l.points.attr('fill-opacity',chart.options.fillOpacity/3);
             	}
             }.bind(this));
             
           	this.line.toFront();       
             
 		},
 	onMouseOutLegend: function(chart){
 			var shadow = chart.options.shadow,
 				points = chart.options.points;
 			
 			this[0].stop();
 			this[0].animate({scale: 1}, 500, "bounce");
            this[1].attr({"font-weight": 400});
            
            chart.lines.each(function(l){
           	 if(l!= this.line){
           		 l.attr('stroke-opacity',chart.options.fillOpacity);
           	 	if(shadow.show)
           	 		l.shadow.attr('stroke-opacity',shadow.fillOpacity);
           	 	if(points.show)
           	 		l.points.attr('fill-opacity',chart.options.fillOpacity);
            	}
            }.bind(this));
            
 		},
 	onClickLegend: function(chart){
 			var shadow = chart.options.shadow,
 				points = chart.options.points,
 				f;
 			
 			if(this.visible){
 				this.visible = false;
 				this[0][1].attr('fill-opacity',0);
 				this.line.hide();
 				
 				if(shadow.show)
 					this.line.shadow.hide();
 			
 				if(points.show)
 					this.line.points.hide();
 					
 				$A(this.line.points).each(function(p){
 					Event.stopObserving(p[1].node,'mouseover');
 					Event.stopObserving(p[1].node,'mouseout');
 				});
 					 				
 				
 				Event.stopObserving(this[0][1].node,'mouseover');
 				Event.stopObserving(this[0][1].node,'mouseout');
 				
 				Event.stopObserving(this[1].node,'mouseover');
 				Event.stopObserving(this[1].node,'mouseout');
 				f = chart.onMouseOutLegend.bind(this,chart);
 				f();
 				
 			} else {
 				this.visible = true;
 				this[0][1].attr('fill-opacity',1);
 				this.line.show();
 				
 				if(shadow.show)
 					this.line.shadow.show();
 			
 				if(points.show)
 					this.line.points.show();
 				
 				$A(this.line.points).each(function(p){
 					Event.observe(p[1].node,'mouseover',chart.onMouseOver.bind(p,chart));
 					Event.observe(p[1].node,'mouseover',chart.onMouseOver.bind(p,chart));
 				});
 				
 			
 				Event.observe(this[0][1].node,'mouseover',chart.onMouseOverLegend.bind(this,chart));
 				Event.observe(this[0][1].node,'mouseout',chart.onMouseOutLegend.bind(this,chart));
 				Event.observe(this[1].node,'mouseover',chart.onMouseOverLegend.bind(this,chart));
 				Event.observe(this[1].node,'mouseout',chart.onMouseOutLegend.bind(this,chart));
 			}
 			
 		}
 	//TODO select and zoom
 
 });
 
//TODO fix marker shift on rollover
Uncharted.time = Class.create(Uncharted.line,{
	initialize: function($super,element,data,options){
		
		//extend options with time specific options
		options = options || {};
		options = this.extendOptions({
			monthNames: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
			xaxis: {
				increment:"auto",
				minSize:50
				},
			tags:{
				format:"this.options.monthNames[(new Date(x)).getMonth()] + ' ' + (new Date(x)).getDate() + ',' + y"
				}
		},options);
		if(Object.isString(options.xaxis.increment)){
			options.xaxis.increment = this.getTimeForPeriod(options.xaxis.increment);
		}
			
		//call base class initialize
		$super(element,data,options);
		console.log(this.options);
	},
	getTimeForPeriod: function(period){
		switch(period){
			case 'millisecond': return 1;break;
			case 'second': return 1000;break;
			case 'minute': return 60000;break;
			case 'hour' : return 3600000; break;
			case 'day': return 86400000;break;
			case 'week': return 604800000;break;
			case 'auto': return period; break;
			default: return 2419200000; break;
		}
	},
	
	drawAxis:function(){
			
			var n = 0,
				ylabels = this.paper.set(),
				xlabels = this.paper.set(),
				gutter = this.options.gutter,
				ticks = {x:[],y:[]},
				monthNames = this.options.monthNames,
				i,
				d,
				xaxis,
				yaxis,
				yb,
 				xb;
				
			
			//draw y axis
			//draw labels
			
			for(i = this.options.yaxis.max;i>=this.options.yaxis.min;i-=this.options.yaxis.increment){
				if(i!=this.options.yaxis.min)
					ticks.y.push([25,(n*this.options.yaxis.gap)+10+gutter.y]);
				ylabels.push(this.paper.text(25,(n*this.options.yaxis.gap)+10+gutter.y,String.interpret(i)).attr({'text-anchor':'end'}));
				n++;
			}
			//reset labels to be level all on page
			yb = ylabels.getBBox();
			ylabels.attr('x',yb.width + gutter.x);
			
			//draw line
			yaxis = this.paper.path('M' + (yb.width+gutter.x+5) + ' ' + gutter.y + 'L'  + (yb.width+gutter.x+5) + ' ' + (yb.height + gutter.y)).attr({'stroke':this.options.stroke,'stroke-width':2});
			yaxis.labels = ylabels;
				
			
				
			//draw x axis
			//draw labels
			n = 0;
			if(this.options.legend.show && this.options.legend.position=="inside")
				this.options.xaxis.max += ((this.legend.getBBox().width+gutter.x)/this.options.xaxis.gap)*this.options.xaxis.increment;		

			for(i = this.options.xaxis.min;i<=this.options.xaxis.max;i+=this.options.xaxis.increment){
	 			d = new Date(i);
				if(i!=this.options.xaxis.min)
	 				ticks.x.push([(yb.width+gutter.x+5) + ((n*this.options.xaxis.gap)),(this.height-20)]);
	 			xlabels.push(this.paper.text((yb.width+gutter.x+5) + ((n*this.options.xaxis.gap)),(yb.height+gutter.y+10),monthNames[d.getMonth()] + " " + d.getDate()).attr({'text-anchor':'middle'}));
	 			n++;
	 		}
			xb = xlabels.getBBox();
			extraWidth = -gutter.x;
			if(this.options.legend.show){
				if(this.options.legend.position=="inside")
					extraWidth = (this.width - (gutter.x*2) - 5 - yb.width) - xb.width;
				else
					extraWidth = (this.legend.getBBox().x - gutter.x - yb.width) - xb.width;
			}
					
	 		//draw line
	 		xaxis = this.paper.path('M' + (yb.width + gutter.x+5) + ' '+ (yb.height+gutter.y) + 'L' + (xb.width + yb.width+6 + extraWidth) + ' ' + (yb.height+gutter.y)).attr({'stroke':this.options.stroke,'stroke-width':2});
	 		xaxis.labels = xlabels;
	 		
	 		this.axis = {
	 					x: xaxis,
	 					y: yaxis
	 					};
	 		 	 		
	 		this.ticks = ticks;
	 					
		}
});