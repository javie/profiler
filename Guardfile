guard 'shell' do
	watch(%r{^profiler\.js}) { |m|
		n m[0], "Changed"
		`ant build`
	}
end
