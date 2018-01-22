import { groupBy, join, forEach , filter, orderBy, 
	findIndex, indexOf, fill, isArray, isNil} from 'lodash'
import numeral from 'numeral'

class Query {
	constructor(cube){
		this.q = {
			groups: [],
			filters: [],
			having: [],
			order: [],
			orderDir: [],
			measures: []
		}
		this.cube = cube
	}

	group(fields = []){
		if(isArray(fields)){
			this.q.groups = this.q.groups.concat(fields)
		}else{
			this.q.groups.push(fields)
		}
		
		return this
	}

	/**
     *	Set of measures to be calculated 
     *
	 *	@param {Object[]} measures - Collections of measures that will be default aggregated
	 *	@param {string} measures[].name - Output name, required for object rows
	 *	@param {function|string} [measures[].formula] - could be a function or the string reference to column name
	 *	@param {boolean} [measures[].calculateAfter=true] - Wheather the derived formula should apply before or after aggregating the base measures. i.e. sum(measure1)/sum(measure2) or sum(measure1/measure2)
	 *	@param {string="sum","avg","count","min","max"} measures[].agg - Aggregation funtion to use on measure
	 */
	measure(measures = []){
		if(isArray(measures)){
			this.q.measures = this.q.measures.concat(measures)
		}else{
			this.q.measures.push(measures)
		}
		
		return this
	}

	filter(f = []){
		if(isArray(f) && f.length == 2 && typeof f[1] != "function" && !isArray(f[1])){
			f = [f]
		}else if (typeof f == "function"){
			f = [f]
		}


		let _this = this
		forEach(f, (fil) => {
			if(isArray(fil) && fil.length == 2 && typeof fil[1] != "function"){
				_this.q.filters.push(function(row,headers){
					return row[_this.cube.getIndex(fil[0])] == fil[1]
				})
			}else if(isArray(fil)){
				this.q.filters = this.q.filters.concat(fil)
			}else{
				this.q.filters.push(fil)
			}
		})
		return this
	}

	having(f){
		if(isArray(f)){
			this.q.having = this.q.having.concat(filters)
		}else{
			this.q.having.push(filters)
		}
		
		return this
	}

	order(cols, direction = []){

		if(direction.length == 0 ){
			forEach(cols, (c) => this.q.orderDir.push('asc'))
		}else{
			this.q.orderDir = this.q.orderDir.concat(direction)
		}

		if(!this.cube.isObjectRow){
			forEach(cols, (c) => {
				if(typeof c == "function"){
					this.q.order.push(c)
				}else{
					let cube = this.cube
					this.q.order.push(function(o){
						return o[cube.getIndex(c)]
					})
				}
			})
		}else{
			this.q.order = this.q.order.concat(cols)
		}		
		
		return this
	}

	run(){
		return this.cube.run(this.q)
	}
}

export class TinyOlap {

	/**
	 *	Create a TinyOlap object to be repeatedly used to slice and dice data
     *
	 *	@param {string[]} [headers] - Ordered header names for scalar data. Required when data row are not objects
	 */
	constructor(data, headers = []){
		this.data = data
		this.headers = headers

		this.isObjectRow = typeof this.data[0] == "object" && isArray(this.data[0]) == false

		if(!this.isObjectRow && this.headers.length == 0){
			throw "Each row should be an object or you should provide a list of headers"
		}
	}

	query(){
		let q = new Query(this)
		return q
	}

	filter(filters, data){
		let _this = this
		if(filters.length > 0){
			data = filter(data, (row)=>{

				let include = false
				forEach(filters, (f) => {		
					f(row, _this.headers) ? include=true : false
				})
				return include
			})
		}
		return data
	}

	getIndex(fieldName){
		let res = ""
		if(this.headers.length==0 || fieldName === undefined){
			res = fieldName
		}else{
			res = indexOf(this.headers, fieldName )
		}

		return res
	}

	run(query){
		const q = query
		let data = this.data.slice()
		let measures = q.measures
		let headers = this.headers
		let _this = this

		data = _this.filter(q.filters, data)

		if(q.groups.length ==0 && q.measures.length == 0){
			return data
		}

		let res = groupBy(data, function(row){
			let  mFields = q.groups.map((g) => typeof g=="function" ? g(row) : row[_this.getIndex(g)])
			return join(mFields, "_#_")
		})
		
		let result = []
		forEach(res, function(values,key) {
			forEach(measures, (f) => {
				f.sum = 0
				f.min = 0
				f.max = 0
				f.count = 0
				f.avg = 0
			})
			
			let keys = key.split("_#_")
			let row
			if(_this.isObjectRow){
				row ={}
				forEach(q.groups, (field, idx) => row[field] = keys[idx])
				forEach(measures, (measure) => row[measure["name"]] = null)
			}else{
				row = fill(Array(q.groups.length+q.measures.length), null);
				forEach(q.groups, (field, idx) => row[idx] = keys[idx]);
			}
			
			forEach(values, (val) => {
				forEach(measures, (f) => {				
					let fieldVal = typeof f.formula == "function" ? f.formula.call(val) : val[_this.getIndex(f.formula)]

					if(fieldVal){						
						switch(f.agg){
							case "avg":
							case "sum":
								f.sum = f.sum + numeral(fieldVal).value()
								if(!isNil(fieldVal) && (fieldVal +"").trim() != ""){
									f.count++
								}
								break
							case "min":
								f.min = Math.min(numeral(fieldVal).value(), f.min)
								break
							case "max":
								f.max = Math.max(numeral(fieldVal).value(), f.max)
								break
							default:
								if(!isNil(fieldVal) && (fieldVal +"").trim() != ""){
									f.count++
								}

						}

					}
				})
			})

			forEach(measures, (f,idx) =>{
				let col = _this.isObjectRow ? f.name : q.groups.length + idx
				
				switch(f.agg){
					case "avg":
						row[col] = f.sum / f.count
						break;
					case "sum":
						row[col] = f.sum
						break;
					case "count":
						row[col] = f.count
						break;
					case "max":
						row[col] = f.max
						break;
					case "min":
						row[col] = f.min
						break;
					default:
						row[col] = null
				}
			})
			result.push(row)
		})
		
		if(q.order.length>0){
			result = orderBy(result, q.order, q.orderDir)
		}

		return result

	}
}

module.exports = TinyOlap