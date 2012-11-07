/**
 * Client-side and Node.js Profiler Helper
 * ==========================================================
 *
 * @package     Javie
 * @require     underscore, console
 * @since       0.1
 * @author      Mior Muhammad Zaki <https://github.com/crynobone>
 * @license     MIT License
 */

(function (console) { 'use strict';

	var root, Profiler, _, caches;

	// Save a reference to the global object (`window` in the browser, `global` on the server)
	root     = this;

	// store collection of Profiler instances, if any.
	caches   = {};

	// Create a safe reference to the Profiler object for use below.
	Profiler = {};

	// Export the object for **Node.js**, with
	// backwards-compatibility for the old `require()` API. If we're in
	// the browser, add `Profiler` as a global object via a string identifier,
	// for Closure Compiler "advanced" mode.
	if ('undefined' !== typeof exports) {
		if ('undefined' !== typeof module && module.exports) {
			exports = module.exports = Profiler;
		}

		exports.Profiler = Profiler;
	}
	else {
		// Register Javie namespace if it's not available yet. 
		if ('undefined' === typeof root.Javie) {
			root.Javie = {};
		}

		root.Javie.Profiler = Profiler;
	}
	
	// load all dependencies
	_ = root._;

	// Require Underscore, if we're on the server, and it's not already present.
	if (!_ && ('undefined' !== typeof require)) {
		_ = require('underscore');
	}

	// throw an error if underscore still not available
	if (!_) {
		throw new Error('Expected Underscore.js not available');
	}

	// set default value for logs
	function schema() {
		return {
			id      : '',
			type    : '',
			start   : null,
			end     : null,
			total   : null,
			message : ''
		};
	}

	/**
	 * calculate microtime
	 *
	 * @param  {Boolean}   asFloat
	 * @return {mixed}
	 */
	function microtime (asFloat) {
		var ms, sec;

		ms  = new Date().getTime();
		sec = parseInt(ms / 1000, 10);

		return asFloat ? (ms / 1000) : (ms - (sec * 1000)) / 1000 + ' ' + sec;
	}

	// To allow client-side profiling (default to false)
	Profiler.enabled = false;

	// Enable Profiler to run in this environment
	Profiler.enable  = function enable () {
		this.enabled = true;
	};

	// Disable Profiler to run in this environment
	Profiler.disable = function disable () {
		this.enabled = false;
	};

	// Get Profiler enabled status
	Profiler.status = function status () {
		return this.enabled;
	};

	/**
	* Make Profiler instance or return one from cache.
	*
	* @return {Profiler}
	*/
	Profiler.make = function make (name) {
		var util, self, cache;

		if (console === undefined && this.enabled === true) {
			throw new Error("console is not available.");
		}
		// set a default instance name if none provided
		if (_.isUndefined(name) || name === '') {
			name = 'default';
		}

		// check if instance already exist, load from cache if available
		if (caches[name] !== undefined) {
			return caches[name];
		}

		// shortcode to this library
		self = this;

		// return a new instance (and cache it at the same time)
		cache = {
			/**
			 * List of logs
			 * 
			 * @type {Array}
			 */
			logs: [],

			/**
			 * list of pair id to key
			 * 
			 * @type {Object}
			 */
			pair: {},

			/**
			 * mark initial starting microtime
			 * 
			 * @type {[type]}
			 */
			startedAt: microtime(true),

			/**
			 * Mark start time and return the given ID
			 * 
			 * @param  {String}     id
			 * @param  {String}     message
			 * @return {String}
			 */
			time: function start (id, message) {
				var key, log;

				if (_.isNull(id)) {
					id = this.logs.length;
				}

				if (self.enabled === false) {
					return null;
				}

				log         = schema();
				log.id      = id;
				log.type    = 'time';
				log.message = message.toString();
				log.start   = microtime(true);

				if (!_.isUndefined(this.pair['time.' + id])) {
					key            = this.pair['time.' + id];
					this.logs[key] = log;
				} else {
					this.logs.push(log);
					this.pair['time.' + id] = (this.logs.length - 1);
				}

				console.time(id);

				return id;
			},

			/**
			 * Mark end time
			 *
			 * @param  {String}
			 * @param  {mixed}
			 * @return {Float}
			 */
			timeEnd: function mark (id, message) {
				var key, start, end, total, log;

				if (_.isNull(id)) {
					id = this.logs.length;
				}

				if (self.enabled === false) {
					return;
				}

				if (_.isUndefined(this.pair['time.' + id])) {
					log       = schema();
					log.start = this.startedAt;

					if (util.isSet(message)) {
						log.message = message;
					}

					this.logs.push(log);
					this.pair['time.' + id] = (this.logs.length - 1);

					log.id   = id;
					log.type = 'time';
				} else {
					console.timeEnd(id);
				}

				key   = this.pair['time.' + id];
				log   = this.logs[key];
				end   = log.end = microtime(true);
				start = log.start;
				total = (end - start);

				log.total      = total;
				this.logs[key] = log;

				return total;
			},

			/**
			 * Run console.trace()
			 * 
			 * @return {void}
			 */
			trace: function trace () {
				if (self.enabled === false) {
					return;
				}

				console.trace();
			},

			/**
			 * Output the profiler based on current state
			 *
			 * <code>
			 *    var p = Profiler.make();
			 *    p.mark('page.load', 'Load page');
			 *    p.output();
			 * </code>
			 * 
			 * @param  {Boolean}
			 * @return {void}
			 */
			output: function output (autoEnabled) {
				var logs, index, length, current;

				if (self.enabled === false) {
					if (autoEnabled === true) {
						self.enable();
					} else {
						return;
					}
				}

				logs   = this.logs;
				length = logs.length;

				for (index = 0; index < length; index = index + 1) {
					current = logs[index];

					if ('time' === current.type) {
						console.info('%s: %s - %dms', current.id, current.message, Math.floor(current.total* 1000));
					} else {
						console.log(current.id, current.message);
					}
				}
			}
		};

		caches[name] = cache;

		return caches[name];
	};

}).call(this, console);

