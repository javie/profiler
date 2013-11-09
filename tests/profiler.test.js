describe('Javie.Profiler', function () {
	var Profiler, stub;

	Profiler = require(__dirname+'/../profiler.js');
	stub = Profiler.make();

	it('should return status true when Profiler is enabled', function (done) {
		Profiler.enable();

		if (Profiler.status() === true) {
			done();
		}
	});

	it('should return status false when Profiler is disabled', function (done) {
		Profiler.disable();

		if (Profiler.status() === false) {
			done();
		}
	});
});
