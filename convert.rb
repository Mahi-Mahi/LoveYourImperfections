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

['manies', 'imperfections'].each do |type|

	pp type
	region_data = nil
	region_slug = nil
	region_name = nil

	CSV.foreach("#{type}.csv", :col_sep => ';') do |row|

		p row

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
			region_data << {
				name: row[0],
				m: row[1].to_i,
				f: row[2].to_i,
				a: row[1].to_i + row[2].to_i
			}
		end

	end
end

datas['regions'] = regions

pp datas

File.open('www/datas.json', 'w') { |file| file.write datas.to_json }

