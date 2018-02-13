var assert = require('assert');
var TinyOlap = require('../index')

describe('TinyOlap Indexed Data', function() {
  
  var data = [
	 {country: "us", date: "2012-02-03", pageviews: 10, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-03", pageviews: 20, signups: 1, paid: 5}
	,{country: "mx", date: "2012-02-03", pageviews: 6, signups: 0, paid: 1}
	,{country: "us", date: "2012-02-04", pageviews: 5, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-04", pageviews: 10, signups: 6, paid: 5}
	,{country: "mx", date: "2012-02-04", pageviews: 10, signups: 3, paid: 5}
  ]

	var olap1 = new TinyOlap(data)

	describe('Group and Measure', function() {
		var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return country grouped with one metric', function() {					
		  	assert.equal(res.length, 3);
		});
		it('should return pageviews sum of 15 for US', function() {
		  	assert.equal(res[0].pageviews, 15);
		});
	});

	describe('Group, Measure, and Order', function() {		
		
		it('should return result sorted asc by country', function() {
			var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.order(['country'])
				    		.run()	

		  	assert.equal(res[0]['country'], 'ca');
		  	assert.equal(res[1]['country'], 'mx');
		});
		it('should return result sorted desc by country', function() {
			var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.order(['country'], ['desc'])
				    		.run()	

		  	assert.equal(res[0]['country'], 'us');
		  	assert.equal(res[2]['country'], 'ca');
		});
	});

	describe('Group Only', function() {
		var res = olap1.query()				    		
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return one row with one col', function() {
		  	assert.equal(res.length, 1);
		});
		it('should return pageviews sum of 61', function() {
		  	assert.equal(res[0].pageviews, 61);
		});
	});

	describe('Filter', function() {
		var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.filter(['country', 'us'])
				    		.run()	

		it('should filter on array', function() {					
		  	assert.equal(res.length, 1);
		});
		it('should filter only', function() {	
			var res2 = olap1.query()
				 .filter(['country', 'us'])
				 .run()				
		  	assert.equal(res2.length, 2);
		});
		it('should filter only multi array', function() {	
			var res3 = olap1.query()
				 .filter([ ['country', 'us'], ['country', 'mx'] ])
				 .run()			
		  	assert.equal(res3.length, 4);
		});
		it('should filter only with function', function() {	
			var res3 = olap1.query()
				 .filter((row) => {
				 	return row['country'] == 'us' || row['country'] == 'mx'
				 })
				 .run()			
		  	assert.equal(res3.length, 4);
		});
	});

});

describe('TinyOlap Indexed Sparse Data', function() {
  
  var data = [
	 {country: undefined, date: "2012-02-03", pageviews: 10, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-03", pageviews: 20, signups: 1, paid: 5}
	,{country: "mx", date: "2012-02-03", pageviews: 6, signups: 0, paid: 1}
	,{country: "", date: "2012-02-04", pageviews: 5, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-04", pageviews: 10, signups: 6, paid: 5}
	,{country: null, date: "2012-02-04", pageviews: 10, signups: 3, paid: 5}
  ]

	var olap1 = new TinyOlap(data)


	describe('Group and Measure', function() {
		var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return country grouped with one metric', function() {					
		  	assert.equal(res.length, 3);
		});
		it('should return pageviews sum of 25 for US', function() {
		  	assert.equal(res[0].pageviews, 25);
		});
	});

	describe('Group Only', function() {
		var res = olap1.query()				    		
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return one row with one col', function() {
		  	assert.equal(res.length, 1);
		});
		it('should return pageviews sum of 61', function() {
		  	assert.equal(res[0].pageviews, 61);
		});
	});

});


describe('TinyOlap UnIndexed Data', function() {
  
	var data = [
		 ["us", "2012-02-03", 10, 2, 3]
		,["ca", "2012-02-03", 20, 1, 5]
		,["mx", "2012-02-03", 6, 0, 1]
		,["us", "2012-02-04", 5, 2, 3]
		,["ca", "2012-02-04", 10, 6, 5]
		,["mx", "2012-02-04", 10, 3, 5]
	]

	var olap1 = new TinyOlap(data, ["country", "date", 
		"pageviews", "signups", "paid"])


	describe('Group and Measure', function() {
		var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return country grouped with one metric', function() {					
		  	assert.equal(res.length, 3);
		});
		it('should return pageviews sum of 15 for US', function() {
		  	assert.equal(res[0][1], 15);
		});
	});

	describe('Group Only', function() {
		var res = olap1.query()				    		
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.run()	

		it('should return one row with one col', function() {
		  	assert.equal(res.length, 1);
		});
		it('should return pageviews sum of 61', function() {
		  	assert.equal(res[0][0], 61);
		});
	});

	it('should return result sorted asc by country', function() {
			var res = olap1.query()
				    		.group("country")
				    		.measure({name: "pageviews",formula: "pageviews", agg: "sum"})
				    		.order(['country'])
				    		.run()	

		  	assert.equal(res[0][0], 'ca');
		  	assert.equal(res[1][0], 'mx');
	});

});

describe('TinyOlap Sparse Data', function() {
  
	var data = [
		 ["us", undefined, 10, 2, 10]
		,["ca", "2012-02-03", 20, 4, 8]
		,["mx", null, 6, 0, 1]
		,["us", "2012-02-04", 5, 2, 3]
		,["ca", "2012-02-04", 10, 6, 5]
		,["mx", undefined, 10, " ", undefined]
	]

	var olap1 = new TinyOlap(data, ["country", "date", 
		"pageviews", "signups", "paid"])


	describe('Group and Measure', function() {
		var res = olap1.query()
				    		.group("date")
				    		.measure([
				    			{name: "pageviews",formula: "pageviews", agg: "sum"},
				    			{name: "signups", formula: "signups",agg: "count"},
				    			{name: "paid", formula: "paid",agg: "max"},
				    			{name: "signups2",formula: "signups", agg: "sum"},
				    			{name: "avg paid",formula: "paid", agg: "avg"},
				    		])
				    		.run()	
		
		it('should return date one undefined row', function() {		
			// nulls are aggregated into undfined			
		  	assert.equal(res.length, 3);
		  	assert.equal(res[0][0], "");
		});
		it('should return paid max for undefined', function() {
		  	assert.equal(res[0][3], 10);
		});
		it('should not count null/undfined and sum should only sum nums', function() {
		  	assert.equal(res[0][2], 1);
		  	assert.equal(res[0][4], 2);
		});
		it('should return avg ignoring invalid values', function() {
		  	assert.equal(res[0][5], 5.5);
		});
	});

});

describe('TinyOlap MultiDimensional', function() {
  
	var data = [
		 {"country": "us", "date": "2012-02-03", "gender": "m", "pageviews": 10, "signups": 2, "paid": 3}
		,{"country": "ca", "date": "2012-02-03", "gender": "m", "pageviews": 20, "signups": 1, "paid": 5}
		,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
		,{"country": "mx", "date": "2012-02-03", "gender": "f", "pageviews": 2, "signups": 1, "paid": 0}
		,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
		,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
		,{"country": "ca", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
	  ]

	var olap1 = new TinyOlap(data)


	describe('Group and Measure', function() {
		var res = olap1.query()
				    		.group(["country", "gender"])
				    		.measure([
				    			{name: "pageviews",formula: "pageviews", agg: "sum"},
				    			{name: "avg paid",formula: "paid", agg: "avg"},
				    		])
				    		.run()	

		
		it('should return country and date grouped', function() {		
			// nulls are aggregated into undfined			
		  	assert.equal(res.length, 4);
		  	assert.equal(res[0].gender, "m");
		});
	});

});