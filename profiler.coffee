instances = {}
enabled = false
root = exports ? this
underscore = root._
underscore = require('underscore') unless underscore and require?

throw new Error("Underscore.js is not available") unless underscore

schema = (id, type, start) ->
	id ?= ''
	type ?= ''
	start ?= microtime(true)

	schema =
		id: id
		type: type
		start: start
		end: null
		total: null
		message: ''

microtime = (asFloat) ->
	ms = new Date().getTime()
	sec = parseInt(ms / 1000, 10)

	return ms/1000 if asFloat is yes

	"#{(ms-(sec*1000))/1000} sec"

class Profiler
	logs: null
	pair: null
	startedAt: null
	constructor: ->
		@logs = []
		@pair = {}
		@startedAt = microtime(true)
	time: (id, message) ->
		id ?= @logs.length

		return null if enabled is no

		log = schema('time', id)
		log.message = message.toString()

		key = @pair["time#{id}"]

		unless typeof key is 'undefined'
			@logs[key] = log
		else
			@logs.push(log)
			@pair["time#{id}"] = (@logs.length - 1)

		console.time(id)
		id
	timeEnd: (id, message) ->
		id ?= @logs.length

		return null if enabled is no

		key = @pair["time#{id}"]

		unless typeof key is 'undefined'
			console.timeEnd(id)
			log = @logs[key]
		else
			log = schema('time', id, @startAt)
			log.message = message unless typeof message is 'undefined'

			@logs.push(log)
			key = (@logs.length - 1)

		end = log.end = microtime(true)
		start = log.start
		total = end - start
		log.total = total
		@logs[key] = log

		total
	trace: ->
		console.trace() if enabled
		true
	output: (auto) ->
		if auto is yes then enabled = true

		return false if enabled is no

		for log in @logs
			if log.type is 'time'
				sec = Math.floor(log.total * 1000)
				console.log('%s: %s - %dms', log.id, log.message, sec)
			else
				console.log(log.id, log.message)

		true

class ProfilerRepository
	constructor: (name) ->
		return @make(name)
	@make: (name) ->
		name = 'default' unless name? or name isnt ''
		instances[name] ?= new Profiler
	@enable: ->
		enabled = true
	@disable: ->
		enabled = false
	@status: ->
		enabled

if exports?
	module.exports = ProfilerRepository if module? and module.exports
	exports.Profiler = ProfilerRepository
else
	root.Javie = {} unless root.Javie?
	root.Javie.Profiler = ProfilerRepository
