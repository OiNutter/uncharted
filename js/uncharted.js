/**
 * Class: unCharted
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
	 			stroke: "#000",
 				strokeOpacity:0,
 				fillOpacity:1,
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
	 			}
 			  },
 	 baseInitialize: function(element,data,options){
 				
 				  //check element exists
 				  if(!$(element))
 			 		throw new Error('Element does not exist: '  + element);
 				  
 				  //merge specified options with defaults;
 				  Object.extend(this.options,options || {});
 				 				  
 				  //set remaining options
 				  this.paper = Raphael(element);
 				  this.data = data;
 				  
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
	 		
	 		this.options.center = this.options.center || {x:this.paper.width/2,y:this.paper.height/2};
	 		this.options.radius = this.options.radius || (this.paper.height/3);
	 		
	 		//reset center x based on legend position
	 		if(this.options.legend.show)
	 			this.options.center.x = (function(align){return (align=="left") ? (this.paper.width/3)*2-25 : this.paper.width/3 + 25;}.bind(this))(this.options.legend.align);
	 			
	 		//create details to draw segments
	 		this.sectors = this.generateSlices();
	 		this.drawChart();
	 		this.onMouseOver = this.options.onMouseOver || this.onMouseOver;
	 		this.onMouseOut = this.options.onMouseOut || this.onMouseOut;
	 		
	 		this.slices.each(function(s){
	 				s.mouseover(this.onMouseOver.bind(s,this));
	 				s.mouseout(this.onMouseOut.bind(s,this));
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
 			
 			console.log(this.options);
 			
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
 								marker.push(this.paper.rect(x-1.5,y-1.5,legend.markerWidth+3,legend.markerHeight+3).attr("stroke",legend.markerBorder));
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
				keyx = (legend.align="right") ? (this.paper.width/3 * 2)+50 : 10,
				keyy = this.paper.height/6,
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
 		}
 			
 });
 
 Uncharted.bar = Class.create();
 
 Uncharted.line = Class.create();
 
 Uncharted.time = Class.create();