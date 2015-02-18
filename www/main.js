"use strict";
/* global d3 */

var type = 'manies',
	region, gender;

d3.json("datas.json", function(error, root) {

	jQuery.each(root.regions, function(slug, name) {
		jQuery('.region ul').append('<label for="region-' + slug + '">' + name + ' <input type="radio" name="region" id="region-' + slug + '" value="' + slug + '"></label>');
	});

	if (document.location.hash.length) {
		var args = document.location.hash.match(/#([\w\-]+)\,([\w\-]+)\,(\w+)/);
		if (args) {
			type = args[1];
			jQuery('#type-' + type).attr('CHECKED', 'CHECKED');
			region = args[2];
			jQuery('#region-' + region).attr('CHECKED', 'CHECKED');
			gender = args[3];
			jQuery('#gender-' + gender).attr('CHECKED', 'CHECKED');

			var $dasboardSelectionGender = jQuery('.dashboard-selection__gender');
			$dasboardSelectionGender.find('p').addClass('dashboard-selection__gender-' + gender);
			$dasboardSelectionGender.find('span').html(jQuery('#gender-' + gender).next('em').text());

			var $dashBoardSelectionRegion = jQuery('.dashboard-selection__region');
			$dashBoardSelectionRegion.find('p').removeAttr('class').addClass('region-' + region);
			$dashBoardSelectionRegion.find('span').empty().html(root.regions[region]);

		}
	}

	if (type && region && gender) {
		createGraph();
		jQuery('.step-1').fadeOut('slow', function() {
			jQuery('.step-2').fadeIn('slow');
		});
	}

	jQuery('input').on('change', function() {
		type = jQuery('[name="type"]:checked').val();
		region = jQuery('[name="region"]:checked').val();
		gender = jQuery('[name="gender"]:checked').val();
		if (type && region && gender) {
			document.location.href = document.location.pathname + '#' + type + ',' + region + ',' + gender;
			createGraph();
		}
	});
});

function setEmbedCode() {
	jQuery('#meetic-embed__content__url').text('<iframe src="http://' + document.location.host + document.location.pathname + '" frameborder="0" width="650" height="810" scrolling="no"></iframe>');
}
setEmbedCode();

function createGraph() {

	if (jQuery('.graph div').length) {
		jQuery('.graph div').fadeOut(function() {
			jQuery('.graph div').remove();
			createGraph();
		});
	} else {
		jQuery(".current-type").html(type);
		var margin = {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0
		},
			width = 550 - margin.left - margin.right,
			height = 212 - margin.top - margin.bottom;

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

		var div = d3.select(".graph").append("div")
			.style("position", "relative")
			.style("width", (width + margin.left + margin.right) + "px")
			.style("height", (height + margin.top + margin.bottom) + "px")
			.style("left", margin.left + "px")
			.style("top", margin.top + "px");

		d3.json("datas.json", function(error, root) {
			var data = root[type][region];
			div.datum(data).selectAll(".node")
				.data(treemap.nodes)
				.enter().append("div")
				.attr("class", "node")
				.call(position)
				.style("background-color", function(d) {
					return d.children ? '#035669' : '#81BFC8';
				})
				.on("mouseover", function(d) {
					if (d.parent) {
						var pct = d.value / d.parent.value * 100;
						jQuery('.treemap-description').find('p').removeClass('default-message').html(d.name);
						jQuery('.treemap-description').find('span').html('<strong>' + pct.toPrecision(pct > 1 ? 3 : 2).replace('.', ',') + '</strong>%').show();
						jQuery(this).css("background-color", '#f5bb11');
					}
				})
				.on("mouseout", function(d) {
					if (d.parent) {
						jQuery('.treemap-description').find('p').addClass('default-message').html('Survolez les zones');
						jQuery('.treemap-description').find('span').empty().hide();
						jQuery(this).css("background-color", '#7fbfc9');
					}
				});
			jQuery('body').addClass('graph-ready');
		});
	}
	setEmbedCode();
}

function position() {
	var block_margin = 1;
	this.style("left", function(d) {
		return d.x + "px";
	})
		.style("top", function(d) {
			return d.y + "px";
		})
		.style("width", function(d) {
			return Math.max(0, d.dx - block_margin) + "px";
		})
		.style("height", function(d) {
			return Math.max(0, d.dy - block_margin) + "px";
		});
}

function setType(t) {
	type = t;
	jQuery('#type-' + type).attr('CHECKED', 'CHECKED');
	createGraph();
}

var activeGender = function() {
	jQuery('.gender-selection__item').on('click', function() {
		var $this = jQuery(this),
			$dasboardSelectionGender = jQuery('.dashboard-selection__gender');
		jQuery('.gender-selection__item').removeClass('active');
		$this.addClass('active');
		$dasboardSelectionGender.find('p').addClass('dashboard-selection__' + $this.find('input').attr('id'));
		$dasboardSelectionGender.find('span').html($this.find('em').html());
		showButton();
	});
};

var showSteps = function() {
	jQuery('.show-step2').on('click', function() {
		jQuery('.step-1').fadeOut('slow', function() {
			jQuery('.step-2').fadeIn('slow');
		});

	});
	jQuery('.show-step1').on('click', function() {
		jQuery('.step-2').fadeOut('slow', function() {
			jQuery('.step-1').fadeIn('slow');
		});
	});
};

var regionLocator = function() {
	jQuery('.map').find('polyline, polygon, span').on('click', function() {
		var $this = jQuery(this),
			$currentRegion = $this.data('region'),
			$currentTitle = $this.data('title'),
			$dashBoardSelectionRegion = jQuery('.dashboard-selection__region');
		jQuery('#' + $currentRegion).click();
		jQuery('.map').find('polyline, polygon, span').each(function(i) {
			jQuery(this).removeAttr('id');
		});
		$this.attr('id', 'active');
		$dashBoardSelectionRegion.find('p').removeAttr('class').addClass($currentRegion);
		$dashBoardSelectionRegion.find('span').empty().html($currentTitle);
		showButton();
	});
};

function showButton() {
	if (jQuery('[name="region"]:checked').val() && jQuery('[name="gender"]:checked').val()) {
		jQuery('.show-step2').css('visibility', 'visible');
	}
}

var colorboxEmbed = function() {
	jQuery('.inline').colorbox({
		inline: true,
		height: "320px",
		width: "50%",
		onComplete: function() {
			jQuery('#meetic-embed__content').find('textarea').select();
		}
	});
};

jQuery(document).ready(function() {
	activeGender();
	showSteps();
	jQuery('.tooltip').tooltipster({
		position: 'top-left'
	});
	regionLocator();
	colorboxEmbed();
});