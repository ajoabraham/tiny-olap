'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.TinyOlap = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _lodash = require('lodash');

var _numeral = require('numeral');

var _numeral2 = _interopRequireDefault(_numeral);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Query = function () {
	function Query(cube) {
		_classCallCheck(this, Query);

		this.q = {
			groups: [],
			filters: [],
			having: [],
			order: [],
			orderDir: [],
			measures: []
		};
		this.cube = cube;
	}

	_createClass(Query, [{
		key: 'group',
		value: function group() {
			var fields = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			if ((0, _lodash.isArray)(fields)) {
				this.q.groups = this.q.groups.concat(fields);
			} else {
				this.q.groups.push(fields);
			}

			return this;
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

	}, {
		key: 'measure',
		value: function measure() {
			var measures = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			if ((0, _lodash.isArray)(measures)) {
				this.q.measures = this.q.measures.concat(measures);
			} else {
				this.q.measures.push(measures);
			}

			return this;
		}
	}, {
		key: 'filter',
		value: function filter() {
			var _this2 = this;

			var f = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

			if ((0, _lodash.isArray)(f) && f.length == 2 && typeof f[1] != "function" && !(0, _lodash.isArray)(f[1])) {
				f = [f];
			} else if (typeof f == "function") {
				f = [f];
			}

			var _this = this;
			(0, _lodash.forEach)(f, function (fil) {
				if ((0, _lodash.isArray)(fil) && fil.length == 2 && typeof fil[1] != "function") {
					_this.q.filters.push(function (row, headers) {
						return row[_this.cube.getIndex(fil[0])] == fil[1];
					});
				} else if ((0, _lodash.isArray)(fil)) {
					_this2.q.filters = _this2.q.filters.concat(fil);
				} else {
					_this2.q.filters.push(fil);
				}
			});
			return this;
		}
	}, {
		key: 'having',
		value: function having(f) {
			if ((0, _lodash.isArray)(f)) {
				this.q.having = this.q.having.concat(filters);
			} else {
				this.q.having.push(filters);
			}

			return this;
		}
	}, {
		key: 'order',
		value: function order(cols) {
			var _this3 = this;

			var direction = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];


			if (direction.length == 0) {
				(0, _lodash.forEach)(cols, function (c) {
					return _this3.q.orderDir.push('asc');
				});
			} else {
				this.q.orderDir = this.q.orderDir.concat(direction);
			}

			if (!this.cube.isObjectRow) {
				(0, _lodash.forEach)(cols, function (c) {
					if (typeof c == "function") {
						_this3.q.order.push(c);
					} else {
						var cube = _this3.cube;
						_this3.q.order.push(function (o) {
							return o[cube.getIndex(c)];
						});
					}
				});
			} else {
				this.q.order = this.q.order.concat(cols);
			}

			return this;
		}
	}, {
		key: 'run',
		value: function run() {
			return this.cube.run(this.q);
		}
	}]);

	return Query;
}();

var TinyOlap = exports.TinyOlap = function () {

	/**
  *	Create a TinyOlap object to be repeatedly used to slice and dice data
     *
  *	@param {string[]} [headers] - Ordered header names for scalar data. Required when data row are not objects
  */
	function TinyOlap(data) {
		var headers = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];

		_classCallCheck(this, TinyOlap);

		this.data = data;

		this.isObjectRow = _typeof(this.data[0]) == "object" && (0, _lodash.isArray)(this.data[0]) == false;
		this.headers = this.isObjectRow ? [] : headers;

		if (!this.isObjectRow && this.headers.length == 0) {
			throw "Each row should be an object or you should provide a list of headers";
		}
	}

	_createClass(TinyOlap, [{
		key: 'query',
		value: function query() {
			var q = new Query(this);
			return q;
		}
	}, {
		key: 'filter',
		value: function filter(filters, data) {
			var _this = this;
			if (filters.length > 0) {
				data = (0, _lodash.filter)(data, function (row) {

					var include = false;
					(0, _lodash.forEach)(filters, function (f) {
						f(row, _this.headers) ? include = true : false;
					});
					return include;
				});
			}
			return data;
		}
	}, {
		key: 'getIndex',
		value: function getIndex(fieldName) {
			var res = "";
			if (this.headers.length == 0 || fieldName === undefined) {
				res = fieldName;
			} else {
				res = (0, _lodash.indexOf)(this.headers, fieldName);
			}

			return res;
		}
	}, {
		key: 'run',
		value: function run(query) {
			var q = query;
			var data = this.data.slice();
			var measures = q.measures;
			var headers = this.headers;
			var _this = this;

			data = _this.filter(q.filters, data);

			if (q.groups.length == 0 && q.measures.length == 0) {
				return data;
			}

			var res = (0, _lodash.groupBy)(data, function (row) {
				var mFields = q.groups.map(function (g) {
					return typeof g == "function" ? g(row) : row[_this.getIndex(g)];
				});
				return (0, _lodash.join)(mFields, "_#_");
			});

			var result = [];
			(0, _lodash.forEach)(res, function (values, key) {
				(0, _lodash.forEach)(measures, function (f) {
					f.sum = 0;
					f.min = 0;
					f.max = 0;
					f.count = 0;
					f.avg = 0;
				});

				var keys = key.split("_#_");
				var row = void 0;
				if (_this.isObjectRow) {
					row = {};
					(0, _lodash.forEach)(q.groups, function (field, idx) {
						return row[field] = keys[idx];
					});
					(0, _lodash.forEach)(measures, function (measure) {
						return row[measure["name"]] = null;
					});
				} else {
					row = (0, _lodash.fill)(Array(q.groups.length + q.measures.length), null);
					(0, _lodash.forEach)(q.groups, function (field, idx) {
						return row[idx] = keys[idx];
					});
				}

				(0, _lodash.forEach)(values, function (val) {
					(0, _lodash.forEach)(measures, function (f) {
						var fieldVal = typeof f.formula == "function" ? f.formula(val) : val[_this.getIndex(f.formula)];

						if (fieldVal) {
							switch (f.agg) {
								case "avg":
								case "sum":
									f.sum = f.sum + (0, _numeral2.default)(fieldVal).value();
									if (!(0, _lodash.isNil)(fieldVal) && (fieldVal + "").trim() != "") {
										f.count++;
									}
									break;
								case "min":
									f.min = Math.min((0, _numeral2.default)(fieldVal).value(), f.min);
									break;
								case "max":
									f.max = Math.max((0, _numeral2.default)(fieldVal).value(), f.max);
									break;
								default:
									if (!(0, _lodash.isNil)(fieldVal) && (fieldVal + "").trim() != "") {
										f.count++;
									}

							}
						}
					});
				});

				(0, _lodash.forEach)(measures, function (f, idx) {
					var col = _this.isObjectRow ? f.name : q.groups.length + idx;

					switch (f.agg) {
						case "avg":
							row[col] = f.sum / f.count;
							break;
						case "sum":
							row[col] = f.sum;
							break;
						case "count":
							row[col] = f.count;
							break;
						case "max":
							row[col] = f.max;
							break;
						case "min":
							row[col] = f.min;
							break;
						default:
							row[col] = null;
					}
				});
				result.push(row);
			});

			if (q.order.length > 0) {
				result = (0, _lodash.orderBy)(result, q.order, q.orderDir);
			}

			return result;
		}
	}]);

	return TinyOlap;
}();

module.exports = TinyOlap;
