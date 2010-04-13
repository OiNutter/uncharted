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
  	onMouseOver: function(chart){
 			var bb = this.getBBox(),txb;
 			if(!chart.toolTip || chart.toolTip==null){
 				chart.toolTip = chart.showTooltip(bb.x+bb.width/2,bb.y+bb.height/2,this.label);
 				chart.toolTip[0].attr('fill',this[1].attr('fill'));
 			} else {
 				clearTimeout(chart.toolTimer);
 				chart.toolTip[1].attr('text',this.label);
 				txb = chart.toolTip[1].getBBox();
 				chart.toolTip[0].animate({width:txb.width+10,height:txb.height+10,x:(bb.x+bb.width/2)-(txb.width/2)-5,y:((bb.y - txb.height-10)>=chart.options.gutter.y) ? bb.y - txb.height-10 : bb.y +10,fill:this[1].attr('fill') },200);
 				chart.toolTip[1].animateWith(chart.toolTip[0],{x:(bb.x+bb.width/2),y:((bb.y - txb.height-10)>=chart.options.gutter.y) ? (bb.y-bb.height/2)-txb.height+7.5 : bb.y+txb.height+7.5},200);
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