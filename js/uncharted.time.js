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
			
		//call base class
		if(!$super(element,data,options))
			return false;
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
			
			var n = this.options.yaxis.max/this.options.yaxis.increment,
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
 				xb,
 				extraWidth=-gutter.x,
 				extraHeight=0;
				
			
			//draw y axis
			//draw labels
			
			//if(this.options.yaxis.gap*((this.options.yaxis.max - this.options.yaxis.min)/this.options.yaxis.increment) < (this.height - 30 - this.options.gutter.y*2))
				//extraHeight=((this.height-30-this.options.gutter.y*2) - (this.options.yaxis.gap*((this.options.yaxis.max - this.options.yaxis.min)/this.options.yaxis.increment)));
			
			for(i = this.options.yaxis.min;i<=this.options.yaxis.max;i+=this.options.yaxis.increment){
				if(i!=this.options.yaxis.min)
					ticks.y.push([25,(n*this.options.yaxis.gap)+10+gutter.y + extraHeight]);
				ylabels.push(this.paper.text(25,(n*this.options.yaxis.gap)+10+gutter.y+extraHeight,String.interpret(this.setDecimals(i,2))).attr({'text-anchor':'end'}));
				n--;
			}
			//reset labels to be level all on page
			yb = ylabels.getBBox();
			ylabels.attr('x',yb.width + gutter.x);
								
			
			//draw line
			yaxis = this.paper.path('M' + (yb.width+gutter.x+5) + ' ' + gutter.y + 'L'  + (yb.width+gutter.x+5) + ' ' + (yb.height + gutter.y + extraHeight)).attr({'stroke':this.options.stroke,'stroke-width':2});
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
	 			xlabels.push(this.paper.text((yb.width+gutter.x+5) + ((n*this.options.xaxis.gap)),(yb.height+gutter.y+10+extraHeight),monthNames[d.getMonth()] + " " + d.getDate()).attr({'text-anchor':'middle'}));
	 			n++;
	 		}
			xb = xlabels.getBBox();
			if(this.options.legend.show){
				if(this.options.legend.position=="inside")
					extraWidth = (this.width - (gutter.x*2) - 5 - yb.width) - xb.width;
				else
					extraWidth = (this.legend.getBBox().x - gutter.x - yb.width) - xb.width;
			}
					
	 		//draw line
	 		xaxis = this.paper.path('M' + (yb.width + gutter.x+5) + ' '+ (yb.height+gutter.y+extraHeight) + 'L' + (xb.width + yb.width+6 + extraWidth) + ' ' + (yb.height+gutter.y+extraHeight)).attr({'stroke':this.options.stroke,'stroke-width':2});
	 		xaxis.labels = xlabels;
	 		
	 		this.axis = {
	 					x: xaxis,
	 					y: yaxis
	 					};
	 		 	 		
	 		this.ticks = ticks;
	 					
		}
});