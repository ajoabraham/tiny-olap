# tiny-olap
OLAP functionality for use with data visualizations. Aggregate, filter, and grouping data along key dimensions and measures.  This is a light weight olap lib.  Probably one of the simplest api's currently available. Inspired by moment and numeral js libraries libraries.

# Getting Started

With an indexed dataset like the following

```json
  var data = [
	 {country: "us", date: "2012-02-03", pageviews: 10, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-03", pageviews: 20, signups: 1, paid: 5}
	,{country: "mx", date: "2012-02-03", pageviews: 6, signups: 0, paid: 1}
	,{country: "us", date: "2012-02-04", pageviews: 5, signups: 2, paid: 3}
	,{country: "ca", date: "2012-02-04", pageviews: 10, signups: 6, paid: 5}
	,{country: "mx", date: "2012-02-04", pageviews: 10, signups: 3, paid: 5}
  ]
 ```

Group and aggregate

```javascript

var TinyOlap = require('tiny-olap')
var olap = new TinyOlap(data)

var result = olap.query()
				 .group('country')
				 .measure({name: 'pageviews', formula: 'pageviews', agg: 'sum'})

```