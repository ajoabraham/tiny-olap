# tiny-olap
OLAP functionality for use with data visualizations. Aggregate, filter, and grouping data along key dimensions and measures.  This is a light weight olap lib.  Probably one of the simplest api's currently available. Inspired by moment and numeral js libraries libraries.

## Installation

```javascript
npm install -s tiny-olap
```


## Getting Started

Given the following sample for the proceeding examples:

```javascript
  var data = [
	 {"country": "us", "date": "2012-02-03", "gender": "m", "pageviews": 10, "signups": 2, "paid": 3}
	,{"country": "ca", "date": "2012-02-03", "gender": "m", "pageviews": 20, "signups": 1, "paid": 5}
	,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
	,{"country": "mx", "date": "2012-02-03", "gender": "f", "pageviews": 2, "signups": 1, "paid": 0}
	,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
	,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
	,{"country": "mx", "date": "2012-02-03", "gender": "m", "pageviews": 6, "signups": 0, "paid": 1}
  ]
 ```

### Group and Aggregate

```javascript

var TinyOlap = require('tiny-olap');
var olap = new TinyOlap(data);

var result = olap.query()
		.group('country')
		.measure({name: 'pageviews', formula: 'pageviews', agg: 'sum'})
		.run();

```

### Group by Multiple Dimensions

```javascript

var TinyOlap = require('tiny-olap');
var olap = new TinyOlap(data);

var result = olap.query()
		.group(['country', 'gender'])
		.measure({name: 'pageviews', formula: 'pageviews', agg: 'sum'})
		.run();

```

### Measure
Measure objects must be supplied in order for tiny-olap to aggregate a column.

* name (required) - output column name
* formula (required) - function|string - Either a function that takes a row object or string pointing to the original column name
* agg (required) - sum|avg|count|min|max - Aggregation function

### Filtering Data
Filter takes an array of 2 dimensional arrays. The first element refers is the data column name and the second is the value to filter on.

```javascript

var TinyOlap = require('tiny-olap');
var olap = new TinyOlap(data);

var result = olap.query()
		.group(['country', 'gender'])
		.measure({name: 'pageviews', formula: 'pageviews', agg: 'sum'})
		.filter([ ['country', 'us'], ['country', 'mx'] ] )
		.run();

```

### Ordering Data
Ordering accepts an array of columns to order by and optional corresponding array of order directions.

```javascript

var TinyOlap = require('tiny-olap');
var olap = new TinyOlap(data);

var result = olap.query()
		.group(['country', 'gender'])
		.measure({name: 'pageviews', formula: 'pageviews', agg: 'sum'})
		.filter([ ['country', 'us'], ['country', 'mx'] ] )
		.order(['country', 'gender'], ['asc', 'desc'])
		.run();

```

## Unindexed Data
When each row is an array instead of an object tiny-olap requires a header parameter in order to work properly.  

```javascript
var data = [
	 ["us", "2012-02-03", 10, 2, 3]
	,["ca", "2012-02-03", 20, 1, 5]
	,["mx", "2012-02-03", 6, 0, 1]
	,["us", "2012-02-04", 5, 2, 3]
	,["ca", "2012-02-04", 10, 6, 5]
	,["mx", "2012-02-04", 10, 3, 5]
]

var TinyOlap = require('tiny-olap');

// pass in headers paramenter 
var olap = new TinyOlap(data, ["country", "date", 
		"pageviews", "signups", "paid"]);

// You can use tiny-olap like normal from here.

```