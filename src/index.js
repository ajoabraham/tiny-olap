import * as _ from 'lodash'

class Query {
	constructor(cube){
		this.q = {
			select: [],
			where: [],
			having: [],
			order: []
		}
		this.cube = cube
	}

	select(selections){
		this.q.select = this.q.select.concat(selections)
		return this
	}

	where(filters){
		this.q.where = this.q.where.concat(filters)
		return this
	}

	having(filters){
		this.q.having = this.q.having.concat(filters)
		return this
	}

	order(sorts){
		this.q.order = this.q.order.concat(sorts)
		return this
	}

	run(){
		return this.cube.run(this.q)
	}
}

class Cube {

	/**
	 *	Create a Hulky object to be repeatedly used to slice and dice data
	 *
	 *	@param {Object[]} measures - Collections of measures that will be default aggregated
	 *	@param {string} measures[].name - The header name of the measure field in question
	 *	@param {function} [measures[].formula] - Supply a function for derived measures
	 *	@param {boolean} [measures[].calculateAfter=true] - Wheather the derived formula should apply before or after aggregating the base measures. i.e. sum(measure1)/sum(measure2) or sum(measure1/measure2)
	 *	@param {string="sum","avg","count","min","max"} measures[].agg - Aggregation funtion to use on measure
	 *	@param {string[]} [headers] - Ordered header names for scalar data. Required when data row are not objects
	 */
	constructor(data, measures = [], headers = []){
		this.data = data
		this.headers = headers
		this.measures = measures.slice()

		this.isObjectRow = typeof this.data[0] == "object"

		if(!this.isObjectRow && this.headers.length == 0){
			throw "Each row should be an object or you should provide a list of headers"
		}
	}

	/**
	 *	Add a measure to the hulky schema
	 *
	 *	@param {Object} measure
	 *	@param {string} measure.name - The header name of the measure field in question
	 *	@param {function} [measure.formula] - Supply a function for derived measures
	 *	@param {boolean} [measure.calculateAfter=true] - Whether the derived formula should apply before or after aggregating the base measures
	 *	@param {string="sum","avg","count","min","max"} measure.agg - Aggregation funtion to use on measure
	 */
	addMeasure(measure){
		this.measures.push(measure)
	}

	select(selections){
		let q = new Query(this)
		return q.select(selections)
	}

	run(query){

	}
}