
guard :shell do
  watch(/(.*).rb/) do |m|
  	p m
  	system("ruby #{m[0]}")
  end
end
