 Uncharted.bar = Class.create(Uncharted.base,{
	 initialize: function($super,element,data,options){
	 		options = options || {};
	 		options = this.extendOptions({
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
					},
				labels: {
					show:true,
					showOn:'rollover'
					}
			},options);
	 		
	 		//call base class
			if(!$super(element,data,options))
				return false;
	 		
			this.generateAxisRanges();
			this.generateAxisLabels();
			this.drawAxis();
			this.drawGrid();
			this.sets = this.generateBars();
			this.drawChart();
			this.axis.x.toFront();
			if(this.options.legend.show)
				this.legend.toFront();
	 
 		},
 	generateAxisRanges : function(){
 			
 			var rightMargin,
 				delta;
 			
 			this.options.xaxis.max = this.getMaxBars()+1; //(Object.isNumber(this.options.xaxis.max)) ? this.options.xaxis.max : this.getMaxVal('x');
 			this.options.xaxis.min = 0;//(Object.isNumber(this.options.xaxis.min)) ? this.options.xaxis.min : this.getMinVal('x');
 			this.options.yaxis.max = (Object.isNumber(this.options.yaxis.max)) ? this.options.yaxis.max : this.getMaxVal('y');
 			this.options.yaxis.min = (Object.isNumber(this.options.yaxis.min)) ? this.options.yaxis.min : this.getMinVal('y');
  			/*if(this.options.xaxis.increment != "auto" && (this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment > 0)
 					this.options.xaxis.max += this.options.xaxis.increment - ((this.options.xaxis.max-this.options.xaxis.min) % this.options.xaxis.increment);*/		
 					
 			if(this.options.yaxis.increment != "auto" && (this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment > 0)
 				this.options.yaxis.max += this.options.yaxis.increment - ((this.options.yaxis.max-this.options.yaxis.min) % this.options.yaxis.increment);
 			
 			rightMargin = 0;
 			if(this.options.legend.show){
 				this.legend = this.drawLegend();
 				rightMargin = this.legend.getBBox().width +10;
 			}
 			
 			if(this.options.labels.show && this.options.yaxis.increment != "auto")
 				this.options.yaxis.max+=this.options.yaxis.increment;
 
 			
 			if(this.options.xaxis.increment == "auto"){
  				delta = (this.options.xaxis.minSize*(this.options.xaxis.max-this.options.xaxis.min))/(this.width - 30 - this.options.gutter.x*2 - rightMargin);
 				this.options.xaxis.increment = this.roundNum(delta);
  			 				
 				if(this.options.xaxis.max%this.options.xaxis.increment > this.options.xaxis.min)
 					this.options.xaxis.max += this.options.xaxis.increment-(this.options.xaxis.max%this.options.xaxis.increment);
  			}
 	 			
 			if(this.options.yaxis.increment=="auto"){
 				delta = (this.options.yaxis.minSize*(this.options.yaxis.max-this.options.yaxis.min))/(this.height - 30 - this.options.gutter.y*2);
 				this.options.yaxis.increment = this.roundNum(delta);
  			 				
 				if(this.options.yaxis.max%this.options.yaxis.increment > this.options.yaxis.min)
 					this.options.yaxis.max += this.options.yaxis.increment-(this.options.yaxis.max%this.options.yaxis.increment);
 			 			
 			}

 			this.options.xaxis.gap = ((this.width - 30 - this.options.gutter.x*2 - rightMargin) / ((this.options.xaxis.max - this.options.xaxis.min)/this.options.xaxis.increment));
 			this.options.yaxis.gap = ((this.height - 30 - this.options.gutter.y*2) / ((this.options.yaxis.max - this.options.yaxis.min)/this.options.yaxis.increment));
 		  				 			
 			
 		},
 	generateAxisLabels: function(){
 			this.labels ={x:[""],y:[0]}; 
 			this.graphData.data.each(function(s){
 				s.data.each(function(d){
 					if(this.labels.x.indexOf(d[0])==-1)
 						this.labels.x.push(d[0]);
 					if(this.labels.y.indexOf(d[1])==-1)
 						this.labels.y.push(d[1]);
 				}.bind(this));
 			}.bind(this));
 		},
 	generateBars: function(){
  			var sets = [],
 				bar,
 				series,
 				gapx = this.options.xaxis.gap,
 				gapy = this.options.yaxis.gap,
 				incx = this.options.xaxis.increment,
 				incy = this.options.yaxis.increment,
 				labels = this.options.labels;
 				 			 			
 			this.graphData.data.each(function(s,n){
 				series = {bars:[],labels:[]};
 				s.data.each(function(d,i){
  					var width = gapx/(1.5*this.graphData.data.length),
						height = ((parseFloat(d[1])-this.options.yaxis.min)/incy)*gapy+ ((parseFloat(d[1])>0) ? 3 : 0),
 						newx = 2+((this.labels.x.indexOf(d[0]))/incx) *gapx + this.axis.x.getBBox().x - (((gapx/1.5)/2) - (width*n)),
 						newy = this.axis.x.getBBox().y - ((parseFloat(d[1])-this.options.yaxis.min)/incy)*gapy-3;
 						;
  					bar = [newx,newy,width,height];
  					series.bars.push(bar);
  					
  					if(labels.show)
  						series.labels.push(this.paper.text(newx+(width/2),newy-10,d[1]));
  					
 				}.bind(this));
 				
	 			sets.push(series);
 			}.bind(this));
 			return sets;
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
 				labels = this.labels.x,
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
 				ylabels.push(this.paper.text(25,(n*this.options.yaxis.gap)+10+gutter.y,String.interpret(this.setDecimals(i,2))).attr({'text-anchor':'end'}));
 				n++;
 			}
 			
 			//reset labels to be level all on page
 			yb = ylabels.getBBox();
 			ylabels.attr('x',yb.width + gutter.x);
 			yb = ylabels.getBBox();
 			
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
 	 				ticks.x.push([(yb.width+gutter.x+7) + ((n*this.options.xaxis.gap)),(this.height-20)]);
 	 			if(!Object.isUndefined(labels[i]))
 	 				xlabels.push(this.paper.text((yb.width+gutter.x+7) + ((n*this.options.xaxis.gap)),(yb.height+gutter.y+10),labels[i]).attr({'text-anchor':'middle'}));
 	 			n++;
 	 		}
 			xb = xlabels.getBBox();
 			extraWidth = 0;
 			//extraWidth = this.options.xaxis.gap;
 	
 			if(this.options.legend.show && this.options.legend.position=="inside")
				extraWidth = (this.width - (gutter.x*2) - 5 - yb.width - yb.x) - ((n-1)*this.options.xaxis.gap); 
 	 		//draw line
 	 		xaxis = this.paper.path('M' + (yb.width + gutter.x+5) + ' '+ (yb.height+gutter.y) + 'L' + ((n-1)*this.options.xaxis.gap + yb.width+6 + yb.x + extraWidth) + ' ' + (yb.height+gutter.y)).attr({'stroke':this.options.stroke,'stroke-width':2});
 	 		xaxis.labels = xlabels;
 	 		
 	 		this.axis = {
 	 					x: xaxis,
 	 					y: yaxis
 	 					};
 	 		 	 		
 	 		this.ticks = ticks;
 	 		
 	 		 			
 		},
 	drawChart: function(){
 			
 			var series = [],
 				bars,
 				bar;	
 			 		
  			this.sets.each(function(s,i){
  				bars = this.paper.set();
  				s.bars.each(function(b,n){
  					bar = this.paper.rect(b[0],b[1],b[2],b[3]).attr({'fill':((this.sets.length==1 && this.options.multiColored==true) ? this.options.colors[n] : this.options.colors[i]),'stroke-opacity':this.options.strokeOpacity});
  					bars.push(bar);
  					
  				}.bind(this));
 				  				
  				series.push(bars);
  				if(this.options.legend.show)
  					this.keys[i].bars = bars;
 			}.bind(this));
 			
 			this.bars = series;
 			 			
 		},
 	getMaxBars: function(){
 			return this.graphData.data.max(function(item){return item.data.length;});
 		},
 	onMouseOverLegend: function(chart){
 			 this[0].stop();
             this[0].scale(1.2);
             this[1].attr({"font-weight": 800});
             
             chart.bars.each(function(b){
            	 if(b!= this.bars)
               		 b.attr('fill-opacity',chart.options.fillOpacity/3);
             }.bind(this));  
             
 		},	
 	onMouseOutLegend: function(chart){
 	 			
 			this[0].stop();
 			this[0].animate({scale: 1}, 500, "bounce");
            this[1].attr({"font-weight": 400});
            
            chart.bars.each(function(b){
           	 if(b!= this.bars)
           		 b.attr('fill-opacity',chart.options.fillOpacity);
           	 	
            }.bind(this));
            
 		},
 	onClickLegend: function(chart){
 			var	f;
 			
 			if(this.visible){
 				this.visible = false;
 				this[0][1].attr('fill-opacity',0);
 				this.bars.hide();
 				 									
 				Event.stopObserving(this[0][1].node,'mouseover');
 				Event.stopObserving(this[0][1].node,'mouseout');
 				
 				Event.stopObserving(this[1].node,'mouseover');
 				Event.stopObserving(this[1].node,'mouseout');
 				f = chart.onMouseOutLegend.bind(this,chart);
 				f();
 				
 			} else {
 				this.visible = true;
 				this[0][1].attr('fill-opacity',1);
 				this.bars.show();
 			
 				Event.observe(this[0][1].node,'mouseover',chart.onMouseOverLegend.bind(this,chart));
 				Event.observe(this[0][1].node,'mouseout',chart.onMouseOutLegend.bind(this,chart));
 				Event.observe(this[1].node,'mouseover',chart.onMouseOverLegend.bind(this,chart));
 				Event.observe(this[1].node,'mouseout',chart.onMouseOutLegend.bind(this,chart));
 			}
 			
 		},
 	onMouseOver: function (chart){
 			
 			
 			
 		}
 });
