"use strict";
/* global d3 */

var type, region, gender;

if (document.location.hash.length) {
	var args = document.location.hash.match(/#(\w+)\,([\w\-]+)\,(\w+)/);
	console.log(args);
	if (args) {
		type = args[1];
		region = args[2];
		gender = args[3];
	}
}

if (type && region && gender) {
	initGraph();
}
d3.json("datas.json", function(error, root) {
	jQuery.each(root.regions, function(slug, name) {
		jQuery('.region ul').append('<label for="region-' + slug + '">' + name + ' <input type="radio" name="region" id="region-' + slug + '" value="' + slug + '"></label>');
	});
	jQuery('input').on('change', function() {
		type = jQuery('[name="type"]:checked').val();
		region = jQuery('[name="region"]:checked').val();
		gender = jQuery('[name="gender"]:checked').val();
		console.log(type, region, gender);
		if (type && region && gender) {
			document.location.href = document.location.pathname + '#' + type + ',' + region + ',' + gender;
			initGraph();
		}
	});
});

function initGraph() {

	var margin = {
		top: 40,
		right: 10,
		bottom: 10,
		left: 10
	},
		width = 960 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;

	var color = d3.scale.category20c();

	var treemap = d3.layout.treemap()
		.size([width, height])
		.sticky(true)
		.sort(function(a, b) {
			return a.value - b.value;
		})
		.value(function(d) {
			return d[gender];
		});

	jQuery('.graph').html('');

	var div = d3.select(".graph").append("div")
		.style("position", "relative")
		.style("width", (width + margin.left + margin.right) + "px")
		.style("height", (height + margin.top + margin.bottom) + "px")
		.style("left", margin.left + "px")
		.style("top", margin.top + "px");

	d3.json("datas.json", function(error, root) {
		var data = root[type][region];
		console.log(data);
		div.datum(data).selectAll(".node")
			.data(treemap.nodes)
			.enter().append("div")
			.attr("class", "node")
			.call(position)
			.text(function(d) {
				return d.children ? null : d.name;
			});
		jQuery('body').addClass('graph-ready');
	});
}

function position() {
	this.style("left", function(d) {
		return d.x + "px";
	})
		.style("top", function(d) {
			return d.y + "px";
		})
		.style("width", function(d) {
			return Math.max(0, d.dx - 1) + "px";
		})
		.style("height", function(d) {
			return Math.max(0, d.dy - 1) + "px";
		});
}