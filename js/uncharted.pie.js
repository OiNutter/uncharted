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
 	 			if(d.data==0){
 	 				segments.fills.push(null);
 	 				segments.shadows.push(null);
 	 				segments.labels.push(null);
 	 				return false;
 	 			}
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
 	 					segments.labels.push(this.paper.text(labelx,labely,((d.data/this.graphData.total) * 100).toFixed(labels.accuracy) + "%").attr({'text-color':labels.textColor,'text-anchor':((labelx>cx) ? "start" : "end")}).toFront());
 	 				
 	 				
 	 			
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
 				if(s==null)
 					return false ;
 				
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