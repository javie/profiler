Javie.Profiler
========

Client-side and Node.js Profiler Helper

[![Build Status](https://secure.travis-ci.org/javie/profiler.png?branch=master)](http://travis-ci.org/javie/profiler)

## Profiler

Profile your application the easy way, the functionality is wrapped around V8 or Firebug `console` and default to disabled unless required to run. This allow the code to sit nicely between DEVELOPMENT and PRODUCTION environment.

    // Enable the Profiler
	Profiler.enable();

	// Disable the Profiler
	Profiler.disable(); 

Let start with a simple profiling. 

	var p = Profiler.make();
	
	// start a time log
	p.time('benchmark.a', 'Some description');

	for (var i = 100; i--; ) console.log(i);

	// marked an end time
	p.timeEnd('benchmark.a');

	/* 
     * In addition you can also ignore start time and based the timestamp 
	 * to the first instance loaded time
	 */
	p.timeEnd('benchmark.b', 'Compared to Profiler.make()');

Trace function call up to now.

	p.trace();

To compile the output, use `Profiler::output()`
	
	p.output();

	
### Requirement

* `Utility`
* `console` from V8 or Firebug
