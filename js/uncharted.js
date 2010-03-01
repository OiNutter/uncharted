/**
 * Class: Uncharted
 * Version: 0.1
 * 
 * Prototype + Raphael based charting library
 * 
 * Intended as an amalgamation of features in 
 * ProtoChart http://www.deensoft.com/lab/protochart/ and
 * g.Raphael http://g.raphaeljs.com/
 * 
 * @author Will McKenzie
 * @created 26/2/10
 */


 var Uncharted = {};
 Uncharted.base = Class.create({
	 options: {
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
	 				size:2,
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
 			  },
 	 baseInitialize: function(element,data,options){
 				
 				  //check element exists
 				  if(!$(element))
 			 		throw new Error('Element does not exist: '  + element);
 				  
 				  //merge specified options with defaults;
 				  Object.extend(this.options,options || {});
 				 				  
 				  //set remaining options
 				  this.element = element;
 				  this.paper = Raphael(element);
 				  this.data = data;
 				  this.width = parseFloat($(element).getWidth());
 				  this.height = parseFloat($(element).getHeight());
  			  },
 	 parseData: function(){
 				  
 				  var res = [],s,total=0;
 				  this.data.each(function(d){
 					  if(d.data) {
 						s = {};
 						total += d.data;
 						for(var v in d) {
 							s[v] = d[v];
 						}
 					}
 					else {
 						s = {data: d};
 					}
 					res.push(s);
 				}.bind(this));
 				return {total:total,data:res};
 			  },
 	 drawGrid: function(){
 				  var grid = this.options.grid,
 				  	  gutter= this.options.gutter;
  				  
 				  //draw top line of box
 				  var topLine = this.axis.x.clone().translate(0,-this.axis.y.getBBox().height+1);
 				  var rightLine =this.axis.y.clone().translate(this.axis.x.getBBox().width-1,0);
 				   				  
 				  this.ticks.x.each(function(tick){
 					this.paper.path(['M',tick[0],this.axis.x.getBBox().y,'L',tick[0],gutter.x]).attr({'stroke':grid.stroke,'stroke-width':0.5}).toBack();
 				  }.bind(this));
 				  
 				 this.ticks.y.each(function(tick){
  					this.paper.path(['M',tick[0],tick[1],'L',rightLine.getBBox().x,tick[1]]).attr({'stroke':grid.stroke,'stroke-width':0.5}).toBack();
  				  }.bind(this));
 				  
 			  }
 });
 
 Uncharted.pie = Class.create(Uncharted.base,{
	 initialize: function(element,data,options){
	 		//set chart specific default options
	 		options = options || {};
	 		options = Object.extend({
	 			center: null,
	 			radius: null,
	 			labels: {
	 				show:true,
	 				textColor:"#666"
	 			}
	 		},options);
	 		
	 		//call base class
	 		this.baseInitialize(element,data,options);
	 		
	 		this.options.center = this.options.center || {x:this.width/2,y:this.height/2};
	 		this.options.radius = this.options.radius || (this.height/3);
	 		
	 		if(!options.shadow)
	 			this.options.shadow.size = 2;
	 		
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
	 					s.key.mouseover(this.onMouseOver.bind(s,this));
		 				s.key.mouseout(this.onMouseOut.bind(s,this));
		 				if(this.options.clickable)
		 					s.key.click(this.onClick.bind(s,this));
	 				}
	 		}.bind(this));
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
 	 	        	path = ["M", cx, cy, "L", x1, y1, "A", r, r, 0, +(Math.abs(angle) > 180), 1, x2, y2, "z"],
 	 				shadowPath = ["M", cx+shadow.size, cy+shadow.size, "L", x1+shadow.size, y1+shadow.size, "A", r, r, 0, +(Math.abs(angle) > 180), 1, x2+shadow.size, y2+shadow.size, "z"];
 	 				
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
 	 					segments.labels.push(this.paper.text(labelx,labely,d.data/this.graphData.total + "%").attr({'text-color':labels.textColor,'text-anchor':((Math.abs(endAngle)<180) ? "start" : "end")}).toFront());
 	 				
 	 				
 	 			
 	 		}.bind(this));
 	 		return segments;
 		},
 	getMarker: function(x,y,color){
 			var legend = this.options.legend;
 			switch(legend.marker){
 				case 'square' : marker = this.paper.set();
 								marker.push(this.paper.rect(x-2,y-2,legend.markerWidth+4,legend.markerHeight+4).attr("stroke",legend.markerBorder));
 								marker.push(this.paper.rect(x,y,legend.markerWidth,legend.markerHeight).attr({"fill":color,"stroke-opacity":0}));
 								return marker;
 								break;
 				default: break;
 			}
 		},
 	drawChart: function(){
 			var shadow=this.options.shadow,
 				shadows=[],
 				sectors=this.sectors,
 				slices=[],
 				legend = this.options.legend,
				keyx = (legend.align="right") ? (this.width/3 * 2)+50 : 10,
				keyy = this.height/6,
				keys = this.paper.set(),
				labels = this.options.labels;
 			 			
			if(legend.show){
 	 			for(var i=0;i<this.graphData.data.length;i++){
 	 				key = this.paper.set();
 	 				key.push(this.getMarker(keyx,keyy,this.options.colors[i]));
 	 				key.push(this.paper.text(keyx+legend.markerWidth + 10,keyy+legend.markerHeight/2,this.graphData.data[i].label).attr({"fill":legend.textColor,"text-anchor": "start"}));
 	 				keyy += key.getBBox().height+7;
 	 				keys.push(key);
 	 			};
 	 		}
 			
 			for(var i=0;i<sectors.fills.length;i++){
 				segment = this.paper.path(sectors.fills[i]);
 				segment.url = sectors.fills[i].url;
 				segment.target = sectors.fills[i].target;
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
 			}
 			this.slices = slices;
 			
 		},
  	onMouseOver: function(chart){
 			var cx=chart.options.center.x,
 				cy=chart.options.center.y,
 				shadow = chart.options.shadow;
 			 			
 			 this.stop();
 			 
 			 if(this.url)
 				 $(chart.element).style.cursor = "pointer";
 			 
             this.scale(1.1, 1.1, cx, cy);
             if(this.shadow)
            	 this.shadow.scale(1.1,1.1,cx + shadow.size,cy + shadow.size);
             
             if(this.key){
            	 this.key[0].stop();
                 this.key[0].scale(1.3);
                 this.key[1].attr({"font-weight": 800});
             }
             
             if(this.label){
            	 var bb = this.label.getBBox();
            	 xmod = bb.x > cx ? 5: -5;
            	 ymod = bb.y > cy ? 5 :-5;
              	 this.label.translate(xmod,ymod);
             }
             
 		},
 	onMouseOut: function(chart){
 			var cx=chart.options.center.x,
				cy=chart.options.center.y,
				shadow = chart.options.shadow;
 			
 			if($(chart.element).style.cursor == "pointer")
 				$(chart.element).style.cursor = "default";
 			
 			this.animate({scale: [1, 1, cx, cy]}, 500, "bounce");
 			 if(this.shadow)
 				this.shadow.animateWith(this,{scale: [1, 1, cx+shadow.size, cy+shadow.size]}, 500, "bounce");
 			 
 			if(this.key){
 				this.key[0].stop();
                this.key[0].animateWith(this,{scale: 1}, 500, "bounce");
                this.key[1].attr({"font-weight": 400});
            }
 			
 			 if(this.label){
 				 var bb = this.label.getBBox();
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
	 initialize: function(element,data,options){
			//set chart specific default options
	 	options = options || {};
		options = Object.extend({
				xaxis: {
					max:null,
					min:null,
					increment:1,
					gap:null,
					x:null,
					y:null
					},
				yaxis: {
					max:null,
					min:null,
					increment:10,
					gap:null,
					x:null,
					y:null
					}
			},options);
				
			//call base class
			this.baseInitialize(element,data,options);
			
			this.graphData = this.parseData();
						
			//set up axis ranges
			this.options.xaxis.max = this.options.xaxis.max || this.getMaxVal('x') + this.options.xaxis.increment;
			this.options.xaxis.min = this.options.xaxis.min || this.getMinVal('x');
			this.options.yaxis.max = this.options.yaxis.max || this.getMaxVal('y');
			this.options.yaxis.min = this.options.yaxis.min || this.getMinVal('y');
				
			if((this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment > 0)
					this.options.xaxis.max += this.options.xaxis.increment - ((this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment);
			
			if((this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment > 0)
				this.options.yaxis.max += this.options.yaxis.increment - ((this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment);
			
			this.options.xaxis.gap = (this.width - 40 - this.options.gutter.y*2) / ((this.options.xaxis.max - this.options.xaxis.min)/this.options.xaxis.increment),
			this.options.yaxis.gap = (this.height - 30 - this.options.gutter.x*2) / ((this.options.yaxis.max - this.options.yaxis.min)/this.options.yaxis.increment);
			
			this.drawAxis();
			this.drawGrid();
			this.series = this.generatePaths();
			this.drawChart();
 		},
 	generatePaths: function(){
  			var startx,
 				starty,
 				paths=[],
 				series,
 				shadow = this.options.shadow,
 				gapx = this.options.xaxis.gap,
 				gapy = this.options.yaxis.gap,
 				incx = this.options.xaxis.increment,
 				incy = this.options.yaxis.increment;
 				 			 			
 			this.graphData.data.each(function(s){
 				series={lines:[],shadows:[],labels:[]};
 				s.data.each(function(d){
 					var newx = (d[0]/incx) *gapx + this.axis.x.getBBox().x,
 						newy = this.axis.x.getBBox().y - (d[1]/incy)*gapy;
 					
 					startx = startx || newx;
 					starty = starty || newy;
 					 					
  					path = ['M',startx,starty,"L",newx,newy];
  					shadowPath = ['M',startx+shadow.size,starty+shadow.size,"L",newx+shadow.size,newy+shadow.size];
  					series.lines.push(path);
  					  					
  					if(shadow.show)
  						series.shadows.push(shadowPath);
  					
  					startx = newx;
  					starty = newy;
  					
 				}.bind(this));
 				startx = null;
 				starty = null;
 				paths.push(series);
 			}.bind(this));
 			return paths;
 		},
 	drawAxis:function(){
 			
 			var n = 0,
 				ylabels = this.paper.set(),
 				xlabels = this.paper.set(),
 				gutter = this.options.gutter,
 				grid = this.options.grid,
 				gridLines = this.paper.set(),
 				ticks = {x:[],y:[]};
 				
 			
 			//draw y axis
 			//draw labels
 			
 			for(var i = this.options.yaxis.max;i>=this.options.yaxis.min;i-=this.options.yaxis.increment){
 				if(i!=this.options.yaxis.min)
 					ticks.y.push([25,(n*this.options.yaxis.gap)+10+gutter.x]);
 				ylabels.push(this.paper.text(25,(n*this.options.yaxis.gap)+10+gutter.y,String.interpret(i)).attr({'text-anchor':'end'}));
 				n++;
 			}
 			//reset labels to be level all on page
 			yb = ylabels.getBBox();
 			ylabels.attr('x',yb.width + gutter.y);
 			
 			//draw line
 			var yaxis = this.paper.path('M' + (yb.width+gutter.y+5) + ' ' + gutter.y + 'L'  + (yb.width+gutter.y+5) + ' ' + yb.height).attr({'stroke':this.options.stroke,'stroke-width':2});
 				yaxis.labels = ylabels;
 				
 			
 				
 			//draw x axis
 			//draw labels
 			n = 0;
 			for(var i = this.options.xaxis.min;i<=this.options.xaxis.max;i+=this.options.xaxis.increment){
 	 			if(i!=this.options.xaxis.min)
 	 				ticks.x.push([(yb.width+gutter.y+5) + ((n*this.options.xaxis.gap)),(this.height-20)]);
 	 			xlabels.push(this.paper.text((yb.width+gutter.y+5) + ((n*this.options.xaxis.gap)),(this.height-20),i).attr({'text-anchor':'middle'}));
 	 			n++;
 	 		}
 			xb = xlabels.getBBox();
 	 		//draw line
 	 		var xaxis = this.paper.path('M' + (yb.width + gutter.y+5) + ' '+ (yb.height) + 'L' + (xb.width + yb.x+6-gutter.x) + ' ' + (ylabels.getBBox().height)).attr({'stroke':this.options.stroke,'stroke-width':2});
 	 			xaxis.labels = xlabels;
 	 		
 	 		this.axis = {
 	 					x: xaxis,
 	 					y: yaxis
 	 					};
 	 		 	 		
 	 		this.ticks = ticks;
 	 		 			
 		},
  	drawChart: function(){
 			
 			var lines=[],
 				shadow = this.options.shadow;
 			
 			console.log('Series',this.series);
 			
 		
 			for(var i=0;i<this.series.length;i++){
 			
 				for(var n=0;n<this.series[i].lines.length;n++){
 					
 					line = this.paper.path(this.series[i].lines[n]).attr({'stroke':this.options.colors[i],'stroke-width':3});
 					
 					if(shadow.show)
 						line.shadow = this.paper.path(this.series[i].shadows[n]).attr({'stroke':shadow.fill,'stroke-width':3,'stroke-opacity':shadow.fillOpacity});
 					
 					lines.push(line);
 					
 				}
 				
 			}
 			
 		},
 	getMaxVal: function(axis){
 			
 			var maxVal,currentMax;
 			
 			this.graphData.data.each(function(s){
 				index = (axis=="x") ? 0 : 1;
 				currentMax = s.data.max(function(item){return item[index];});
 				maxVal = (currentMax>maxVal || Object.isUndefined(maxVal)) ? currentMax : maxVal;
 			}.bind(this));
 			
 			return maxVal;
 		},
 	getMinVal: function(axis){
 			
 			var minVal,currentMin;
 			
 			this.graphData.data.each(function(s){
 				index = (axis=="x") ? 0 : 1;
 				currentMin = s.data.min(function(item){return item[index];});
 				minVal = (currentMin<minVal || Object.isUndefined(minVal)) ? currentMin : minVal;
 			}.bind(this));
 			
 			return minVal;
 		}
 });
 
 Uncharted.time = Class.create();