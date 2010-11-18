/*
 * g.Raphael 0.4 - Charting library, based on Raphaël
 *
 * Copyright (c) 2009 Dmitry Baranovskiy (http://g.raphaeljs.com)
 * Licensed under the MIT (http://www.opensource.org/licenses/mit-license.php) license.
 */
Raphael.fn.g.timechart = function (x, y, width, height, valuesx, valuesy, opts) {
    function shrink(values, dim) {
        var k = values.length / dim,
            j = 0,
            l = k,
            sum = 0,
            res = [];
        while (j < values.length) {
            l--;
            if (l < 0) {
                sum += values[j] * (1 + l);
                res.push(sum / k);
                sum = values[j++] * -l;
                l += k;
            } else {
                sum += values[j++];
            }
        }
        return res;
    }
    opts = opts || {};
    if (!this.raphael.is(valuesx[0], "array")) {
        valuesx = [valuesx];
    }
    if (!this.raphael.is(valuesy[0], "array")) {
        valuesy = [valuesy];
    }
    var labels = getLabels();
    var allx = Array.prototype.concat.apply([], valuesx),
        ally = Array.prototype.concat.apply([], valuesy),
        xdim = this.g.snapEnds(Math.min.apply(Math, allx), Math.max.apply(Math, allx), valuesx[0].length - 1),
        minx = xdim.from,
        maxx = xdim.to,
        gutter = opts.gutter || 10,
        kx = (width - gutter * 2) / labels.length,
        ydim = this.g.snapEnds(Math.min.apply(Math, ally), Math.max.apply(Math, ally), valuesy[0].length - 1),
        miny = (opts.miny!=undefined) ? opts.miny : ydim.from,
        maxy = ydim.to,
        ky = (height - gutter * 2) / (maxy - miny),
        len = Math.max(valuesx[0].length, valuesy[0].length),
        symbol = opts.symbol || "",
        colors = opts.colors || Raphael.fn.g.colors,
        that = this,
        columns = null,
        dots = null,
        chart = this.set(),
        path = [];
 
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        len = Math.max(len, valuesy[i].length);
    }
    var shades = this.set();
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (opts.shade) {
            shades.push(this.path().attr({stroke: "none", fill: colors[i], opacity: opts.nostroke ? 1 : .3}));
        }
        if (valuesy[i].length > width - 2 * gutter) {
            valuesy[i] = shrink(valuesy[i], width - 2 * gutter);
            len = width - 2 * gutter;
        }
        if (valuesx[i] && valuesx[i].length > width - 2 * gutter) {
            valuesx[i] = shrink(valuesx[i], width - 2 * gutter);
        }
    }
    var axis = this.set();

    if (opts.axis) {
        var ax = (opts.axis + "").split(/[,\s]+/);
        +ax[0] && axis.push(this.g.axis(x + gutter, y + gutter, width - 2 * gutter, minx, maxx, opts.axisxstep || Math.floor((width - 2 * gutter) / 20), 2));
        +ax[1] && axis.push(this.g.axis(x + width - gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 3));
        +ax[2] && axis.push(this.g.axis(x + gutter, y + height - gutter, width - 2 * gutter, minx, maxx, labels.length || Math.floor((width - 2 * gutter) / 20), 0,labels,"",null,true));
        +ax[3] && axis.push(this.g.axis(x + gutter, y + height - gutter, height - 2 * gutter, miny, maxy, opts.axisystep || Math.floor((height - 2 * gutter) / 20), 1,null,"",null,true));
    }
    var lines = this.set(),
        symbols = this.set(),
        line;
    for (var i = 0, ii = valuesy.length; i < ii; i++) {
        if (!opts.nostroke) {
            lines.push(line = this.path().attr({
                stroke: colors[i],
                "stroke-width": opts.width || 2,
                "stroke-linejoin": "round",
                "stroke-linecap": "round",
                "stroke-dasharray": opts.dash || ""
            }));
        }
        var sym = this.raphael.is(symbol, "array") ? symbol[i] : symbol,
            symset = this.set(),
            end=(opts.enddate!=undefined) ? opts.enddate : new Date(),
            start = (opts.startdate!=undefined) ? opts.startdate : new Date(enddate-(30*86400000)),
            increment = (opts.increment!=undefined) ? opts.increment : 'day';
        switch(increment){
				case 'day' : inc=86400000;cols = Math.ceil((end-start)/inc);break;
				//TODO add other increment seperators
        }
        path = [];
        for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
            var X = x + gutter + (((valuesx[i] || valuesx[0])[j] - start.getTime())/inc) * kx;
            var Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
            (Raphael.is(sym, "array") ? sym[j] : sym) && symset.push(this.g[Raphael.fn.g.markers[this.raphael.is(sym, "array") ? sym[j] : sym]](X, Y, (opts.width || 2) * 3).attr({fill: colors[i], stroke: "none"}));
            path = path.concat([j ? "L" : "M", X, Y]);
        }
        symbols.push(symset);
        if (opts.shade) {
            shades[i].attr({path: path.concat(["L", X, y + height - gutter, "L",  x + gutter + ((valuesx[i] || valuesx[0])[0] - minx) * kx, y + height - gutter, "z"]).join(",")});
        }
        !opts.nostroke && line.attr({path: path.join(",")});
    }
    function createColumns(f) {
    	
    	var end=(opts.enddate!=undefined) ? opts.enddate : new Date();
    	var start = (opts.startdate!=undefined) ? opts.startdate : new Date(enddate-(30*86400000));
    	var increment = (opts.increment!=undefined) ? opts.increment : 'day';
    	var cols,inc,date;
    	

    	switch(increment){
    		case 'day' : inc=86400000;cols = Math.ceil((end-start)/inc);break;
    		//TODO add other increment seperators
    	}
    	
        // unite Xs together
        var Xs = [];
        for (var i = 0, ii = valuesx.length; i < ii; i++) {
            Xs = Xs.concat(valuesx[i]);
        }
        Xs.sort();
        // remove duplicates
        var Xs2 = [],
            xs = [];
        for (var i = 0, ii = cols; i < ii; i++) {
           xs.push((x + gutter + (i * kx)));
        }

        Xs = Xs2;
        ii = cols;
        var cvrs = f || that.set();
        for (var i = 0; i < ii; i++) {
            var X = xs[i] - (xs[i] - (xs[i - 1] || x)) / 2,
                w = ((xs[i + 1] || x + width) - xs[i]) / 2 + (xs[i] - (xs[i - 1] || x)) / 2,
                C;
            f ? (C = {}) : cvrs.push(C = that.rect(X - 1, y, Math.max(w + 1, 1), height).attr({stroke: "none", fill: "#000", opacity: 0}));
            C.values = [];
            C.symbols = that.set();
            C.y = [];
            C.x = xs[i];
            C.axis = Xs[i];
            for (var j = 0, jj = valuesy.length; j < jj; j++) {
                Xs2 = valuesx[j] || valuesx[0];
                for (var k = 0, kk = Xs2.length; k < kk; k++) {
                    if (Xs2[k]-start.getTime() == Math.ceil(((xs[i]-gutter)/kx)*inc)) {
                        C.values.push(valuesy[j][k]);
                       // console.log(Xs2[k] + ":",C.values);
                        C.y.push(y + height - gutter - (valuesy[j][k] - miny) * ky);
                        C.symbols.push(chart.symbols[j][k]);
                     }
                 }
            }
            f && f.call(C);
        }
        !f && (columns = cvrs);
        
    }
    
    function createDots(f) {
    	console.log('bob');
       	var end=(opts.enddate!=undefined) ? opts.enddate : new Date();
    	var start = (opts.startdate!=undefined) ? opts.startdate : new Date(enddate-(30*86400000));
    	var increment = (opts.increment!=undefined) ? opts.increment : 'day';
    	var cols,inc,date;
    	

    	switch(increment){
    		case 'day' : inc=86400000;cols = Math.ceil((end-start)/inc);break;
    		//TODO add other increment seperators
    	}
    	console.log(cols);
        var cvrs = f || that.set(),
            C;
        for (var i = 0, ii = valuesy.length; i < ii; i++) {
            for (var j = 0, jj = valuesy[i].length; j < jj; j++) {
                var X = x + gutter + ((valuesx[i] || valuesx[0])[j] - minx) * kx,
                    nearX = x + gutter + ((valuesx[i] || valuesx[0])[j ? j - 1 : 1] - minx) * kx,
                    Y = y + height - gutter - (valuesy[i][j] - miny) * ky;
                f ? (C = {}) : cvrs.push(C = that.circle(X, Y, Math.abs(nearX - X) / 2).attr({stroke: "none", fill: "#000", opacity: 0}));
                C.x = X;
                C.y = Y;
                C.value = valuesy[i][j];
                C.line = chart.lines[i];
                C.shade = chart.shades[i];
                C.symbol = chart.symbols[i][j];
                C.symbols = chart.symbols[i];
                C.axis = (valuesx[i] || valuesx[0])[j];
                f && f.call(C);
            }
        }
        !f && (dots = cvrs);
    }
    
    function getLabels(axis){
    	var end=(opts.enddate!=undefined) ? opts.enddate : new Date();
    	var start = (opts.startdate!=undefined) ? opts.startdate : new Date(enddate-(30*86400000));
    	var increment = (opts.increment!=undefined) ? opts.increment : 'day';
    	var cols,inc,date;
    	
    	var monthnames = (opts.monthnames!=undefined) ? opts.monthnames : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    	
    	switch(increment){
    		case 'day' : inc=86400000;cols = Math.ceil(end-start)/inc;break;
    		//TODO add other increment seperators
    	}
    	
    	var labels = [];
    	for(var i=0;i<cols;i++){
    	    date = new Date(start.getTime()+(inc*i));
    		labels.push(monthnames[date.getMonth()] + " " + date.getDate());
    	}
    	
    	return labels;
    }
    chart.push(lines, shades, symbols, axis, columns, dots);
    chart.lines = lines;
    chart.shades = shades;
    chart.symbols = symbols;
    chart.axis = axis;
    chart.hoverColumn = function (fin, fout) {
        !columns && createColumns();
        columns.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.clickColumn = function (f) {
        !columns && createColumns();
        columns.click(f);
        return this;
    };
    chart.hrefColumn = function (cols) {
        var hrefs = that.raphael.is(arguments[0], "array") ? arguments[0] : arguments;
        if (!(arguments.length - 1) && typeof cols == "object") {
            for (var x in cols) {
                for (var i = 0, ii = columns.length; i < ii; i++) if (columns[i].axis == x) {
                    columns[i].attr("href", cols[x]);
                }
            }
        }
        !columns && createColumns();
        for (var i = 0, ii = hrefs.length; i < ii; i++) {
            columns[i] && columns[i].attr("href", hrefs[i]);
        }
        return this;
    };
    chart.hover = function (fin, fout) {
        !dots && createDots();
        dots.mouseover(fin).mouseout(fout);
        return this;
    };
    chart.click = function (f) {
        !dots && createDots();
        dots.click(f);
        return this;
    };
    chart.each = function (f) {
        createDots(f);
        return this;
    };
    chart.eachColumn = function (f) {
        createColumns(f);
        return this;
    };
    return chart;
};
