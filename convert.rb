#!/usr/bin/env ruby
# encoding: utf-8

Encoding.default_external = Encoding::UTF_8
Encoding.default_internal = Encoding::UTF_8

require 'csv'
require 'unicode_utils'
require 'json'
require 'pp'
require 'fileutils'

class String
	def sanitize
		# Strip out the non-ascii character
		UnicodeUtils.nfkd(self).gsub(/(\p{Letter})\p{Mark}+/,'\\1').gsub(/[^0-9A-Za-z@\-\_]/, '-').gsub(/^\-+/, '').gsub(/\-+$/, '').gsub(/\-+/, '-').downcase
	end
end


datas = {}
datas['manies'] = {}
datas['imperfections'] = {}

regions = {}

regions['france'] = "Toute la france"

france_data = {}
france_data['manies'] = {}
france_data['imperfections'] = {}

['manies', 'imperfections'].each do |type|

	region_data = nil
	region_slug = nil
	region_name = nil

	CSV.foreach("#{type}.csv", :col_sep => ';') do |row|

		if row[0].match(/^_/)

			unless region_data.nil?
				datas[type][region_slug] = {
					name: region_name,
					children: region_data
				}
			end

			region_name = row[0].gsub(/^_/, '')
			region_slug = region_name.sanitize
			region_data = []

			if regions[region_slug].nil?
				regions[region_slug] = region_name
			end

		else
			unless row[0].match(/blank/)
				region_data << {
					name: row[0],
					m: row[1].to_i,
					f: row[2].to_i,
					a: row[1].to_i + row[2].to_i
				}
				france_data[type][row[0]] = {} if france_data[type][row[0]].nil?
				france_data[type][row[0]][:name] = row[0]

				france_data[type][row[0]][:m] = 0 if france_data[type][row[0]][:m].nil?
				france_data[type][row[0]][:m] += row[1].to_i

				france_data[type][row[0]][:f] = 0 if france_data[type][row[0]][:f].nil?
				france_data[type][row[0]][:f] += row[2].to_i

				france_data[type][row[0]][:a] = 0 if france_data[type][row[0]][:a].nil?
				france_data[type][row[0]][:a] += row[1].to_i + row[2].to_i
			end
		end

	end

	unless region_data.nil?
		datas[type][region_slug] = {
			name: region_name,
			children: region_data
		}
	end

end

datas['regions'] = regions
datas['manies']['france'] = {
	name: "Toute la france",
	children: france_data['manies'].values
}
datas['imperfections']['france'] = {
	name: "Toute la france",
	children: france_data['imperfections'].values
}


File.open('www/datas.json', 'w') { |file| file.write datas.to_json }

