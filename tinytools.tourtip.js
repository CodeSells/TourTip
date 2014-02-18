/*!
	TourTip 1.0.0 - 2014-02-01
	jQuery Help and Tour Layout
	(c) 2014, http://tinytools.codesells.com
	license: http://www.opensource.org/licenses/mit-license.php
*/


; (function ($, document, window) {
	var tourTipObjects = new Array();
	var tourTip = 'tourTip';
	var tourTipCurrentIndex = -1;
	var tourTipGeneralSettings;
	var BrowserDetect = {
		init: function () {
			this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
			this.version = this.searchVersion(navigator.userAgent)
				|| this.searchVersion(navigator.appVersion)
				|| "an unknown version";
			this.OS = this.searchString(this.dataOS) || "an unknown OS";
		},
		searchString: function (data) {
			for (var i = 0; i < data.length; i++) {
				var dataString = data[i].string;
				var dataProp = data[i].prop;
				this.versionSearchString = data[i].versionSearch || data[i].identity;
				if (dataString) {
					if (dataString.indexOf(data[i].subString) != -1)
						return data[i].identity;
				}
				else if (dataProp)
					return data[i].identity;
			}
		},
		searchVersion: function (dataString) {
			var index = dataString.indexOf(this.versionSearchString);
			if (index == -1) return;
			return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
		},
		dataBrowser: [
			{
				string: navigator.userAgent,
				subString: "Chrome",
				identity: "Chrome"
			},
			{
				string: navigator.userAgent,
				subString: "OmniWeb",
				versionSearch: "OmniWeb/",
				identity: "OmniWeb"
			},
			{
				string: navigator.vendor,
				subString: "Apple",
				identity: "Safari",
				versionSearch: "Version"
			},
			{
				prop: window.opera,
				identity: "Opera",
				versionSearch: "Version"
			},
			{
				string: navigator.vendor,
				subString: "iCab",
				identity: "iCab"
			},
			{
				string: navigator.vendor,
				subString: "KDE",
				identity: "Konqueror"
			},
			{
				string: navigator.userAgent,
				subString: "Firefox",
				identity: "Firefox"
			},
			{
				string: navigator.vendor,
				subString: "Camino",
				identity: "Camino"
			},
			{		// for newer Netscapes (6+)
				string: navigator.userAgent,
				subString: "Netscape",
				identity: "Netscape"
			},
			{
				string: navigator.userAgent,
				subString: "MSIE",
				identity: "Explorer",
				versionSearch: "MSIE"
			},
			{
				string: navigator.userAgent,
				subString: "Gecko",
				identity: "Mozilla",
				versionSearch: "rv"
			},
			{ 		// for older Netscapes (4-)
				string: navigator.userAgent,
				subString: "Mozilla",
				identity: "Netscape",
				versionSearch: "Mozilla"
			}
		],
		dataOS: [
			{
				string: navigator.platform,
				subString: "Win",
				identity: "Windows"
			},
			{
				string: navigator.platform,
				subString: "Mac",
				identity: "Mac"
			},
			{
				string: navigator.userAgent,
				subString: "iPhone",
				identity: "iPhone/iPod"
			},
			{
				string: navigator.platform,
				subString: "Linux",
				identity: "Linux"
			}
		]

	};
	BrowserDetect.init();

	if ($.tourTip) {
		return;
	}

	publicMethod = $.fn[tourTip] = $[tourTip] = function (options) {
		var settings = options;

		return this.each(function (i, obj) {
			tourTipObjects.push({
				tipObject: obj,
				tipSettings: settings,
				tipProperties: setProperties(obj)
			});
		});
	};

	publicMethod.create = function (options) {
		var settings = options;
		tourTipObjects.push({
			tipObject: undefined,
			tipSettings: settings,
			tipProperties: setProperties(undefined)
		});
	}

	function setSettings(options) {
		var settings = $.extend({
			parentScroll: $('body'),
			title: '',
			description: '',
			position: 'bottom',
			externalContent: undefined,
			externalContentHtml: '',
			closeIcon: true,
			nextButtonText: 'Next',
			previousButtonText: 'Previous',
			closeButtonText: 'Close',
			next: true,
			previous: false,
			close: false,
			width: '300px',
			height: 'auto',
			autoNextInterval: 0,//Todo: New Feature
			repeatIcon: false,//Todo: New Feature
			animation: 'fade',
			smoothScroll: true,

			//Events:
			onShow: false,
			onHide: false,
			onClose: false,
			onNext: false,
			onPrevious: false,
			onStart: false
		}, options);

		return settings;
	}

	publicMethod.start = function (generalOptions) {
		if (tourTipObjects.length > 0) {
			tourTipGeneralSettings = $.extend({}, generalOptions);
			trigger(tourTipGeneralSettings.onStart);
			initializeDisabledArea();
			initializeTourTips();
			showDisabledArea();
			showTip(0);
		}
	};

	publicMethod.next = function () {
		trigger(tourTipObjects[tourTipCurrentIndex].tipSettings.onNext);
		showTip(tourTipCurrentIndex + 1);
	}

	publicMethod.previous = function () {
		trigger(tourTipObjects[tourTipCurrentIndex].tipSettings.onPrevious);
		showTip(tourTipCurrentIndex - 1);
	}

	publicMethod.close = function () {
		hideTip();
		trigger(tourTipObjects[tourTipCurrentIndex].tipSettings.onClose);
		clearTourTipElements();
	}

	function setProperties(obj) {
		return { isFree: typeof (obj) == 'undefined' };
	}

	function initializeTourTips() {
		$(tourTipObjects).each(function (i, obj) {
			var position;
			var specialClasses = '';
			var specialContentClasses = '';
			var nubClass = ' TourTipBottomNub';

			var setting = setSettings({});
			setting = $.extend(setting, tourTipGeneralSettings);
			obj.tipSettings = $.extend(setting, obj.tipSettings);

			if (obj.tipProperties.isFree) {
				specialClasses = ' FreeTourTip';
				specialContentClasses = ' FreeContentTourTip';
				position = 'fixed';
			}
			else if ($(obj.tipObject).css('position') == 'fixed')
				position = 'fixed'
			else if (!obj.tipSettings.parentScroll.is('body') && obj.tipSettings.parentScroll.css('position') == 'fixed')
				position = 'fixed';
			else
				position = 'absolute'

			switch (obj.tipSettings.position) {
				case 'top':
					nubClass = ' TourTipTopNub';
					break;

				case 'left':
					nubClass = ' TourTipLeftNub';
					break;

				case 'right':
					nubClass = ' TourTipRightNub';
					break;
			}

			var coverContent = '<div class="TourTipCover TourTipTransitOpacity" id="TourTipCover' + i.toString() + '" style="position: ' + position + ';"></div>';
			var content = '<div class="TourTip TourTipTransitOpacity' + specialClasses + '" id="TourTip' + i.toString() + '" style="position: ' + position + ';">';

			if (obj.tipSettings.closeIcon == true)
				content += '<div class="TourTipCloseIcon" onclick="$.tourTip.close();"></div>';

			content += '<div class="TourTipContent' + specialContentClasses + '" style="width: ' + obj.tipSettings.width + ';height: ' + obj.tipSettings.height + ';">';
			content += '<p class="TourTipTitle">' + obj.tipSettings.title + '</p>';
			content += '<p class="TourTipDesc">' + obj.tipSettings.description + '</p>';

			if (obj.tipSettings.externalContentHtml.length > 0)
				content += '<div class="TourTipExternalContent">' + obj.tipSettings.externalContentHtml + '</div>';
			else if (obj.tipSettings.externalContent != undefined)
				content += '<div class="TourTipExternalContent">' + obj.tipSettings.externalContent.html() + '</div>';

			if (!obj.tipProperties.isFree)
				content += '<div class="TourTipNub' + nubClass + '"></div>';

			content += generateButtonsContent(i);
			content += '</div></div>';
			$('body').append(content);

			if (!obj.tipProperties.isFree)
				$('body').append(coverContent);

			tourTipCurrentIndex = i;
			setTourTipPosition(true);
		});

		tourTipCurrentIndex = -1;
	}

	function generateButtonsContent(index) {
		var content = '<div class="TourTipButtonsHolder">';

		if (index > 0 && tourTipObjects[index].tipSettings.previous == true)
			content += '<button class="TourTipButton TourTipPreviousBotton" onclick="$.tourTip.previous();">' +
					   tourTipObjects[index].tipSettings.previousButtonText +
					   '</button>';
		if (index < tourTipObjects.length - 1 && tourTipObjects[index].tipSettings.next == true)
			content += '<button class="TourTipButton TourTipNextBotton" onclick="$.tourTip.next();">' +
					   tourTipObjects[index].tipSettings.nextButtonText +
					   '</button>';
		if (tourTipObjects[index].tipSettings.close == true)
			content += '<button class="TourTipButton TourTipCloseBotton" onclick="$.tourTip.close();">' +
					   tourTipObjects[index].tipSettings.closeButtonText +
					   '</button>';

		content += '</div>';
		return content;
	}

	function clearTourTipElements() {
		$('.TourTip').remove();
		$('.TourTipDisabledArea').remove();
		tourTipCurrentIndex = -1;
	}

	function trigger(callback) {
		if ($.isFunction(callback)) {
			callback.call(undefined, currentTourTip());
		}
	}

	function showTip(index) {
		if (index >= 0 && index < tourTipObjects.length && tourTipCurrentIndex != index) {
			hideTip();

			tourTipCurrentIndex = index;
			trigger(tourTipObjects[index].tipSettings.onShow);

			visibility(false, index, false);
			$('#TourTip' + index.toString()).css('display', 'block');

			if (!tourTipObjects[index].tipProperties.isFree)
				$('#TourTipCover' + index.toString()).css('display', 'block');

			setTourTipPosition();
		}
	}

	function hideTip() {
		if (tourTipCurrentIndex >= 0) {
			trigger(tourTipObjects[tourTipCurrentIndex].tipSettings.onHide);
			visibility(false, tourTipCurrentIndex, true);
		}
	}

	function currentTourTip() {
		return $('#TourTip' + tourTipCurrentIndex.toString());
	}

	function currentTourTipCover() {
		if (!tourTipObjects[tourTipCurrentIndex].tipProperties.isFree)
			return $('#TourTipCover' + tourTipCurrentIndex.toString());
		else
			return undefined;
	}

	function finalizeTourTipPosition(initialize) {
		var obj = currentTourTip();
		var coverObj = currentTourTipCover();
		var tipObj = $(tourTipObjects[tourTipCurrentIndex].tipObject);
		var tipSetting = tourTipObjects[tourTipCurrentIndex].tipSettings;
		var currentPosition = tipSetting.position;
		var ignoreScroll = $(tipObj).css('position') == 'fixed' ||
						   $(tipObj).parent().css('position') == 'fixed' ||
						   tipSetting.parentScroll.css('position') == 'fixed';

		if (!tourTipObjects[tourTipCurrentIndex].tipProperties.isFree) {
			if (currentPosition == 'top') {
				obj.css('left', tipObj.offset().left - (ignoreScroll ? $(document).scrollLeft() : 0));
				obj.css('top', tipObj.offset().top - (ignoreScroll ? $(document).scrollTop() : 0) - obj.outerHeight() - 10);
			}
			else if (currentPosition == 'left') {
				obj.css('left', tipObj.offset().left - (ignoreScroll ? $(document).scrollLeft() : 0) - obj.width() - 10);
				obj.css('top', tipObj.offset().top - (ignoreScroll ? $(document).scrollTop() : 0));
			}
			else if (currentPosition == 'right') {
				obj.css('left', tipObj.offset().left - (ignoreScroll ? $(document).scrollLeft() : 0) + tipObj.outerWidth() + 10);
				obj.css('top', tipObj.offset().top - (ignoreScroll ? $(document).scrollTop() : 0));
			}
			else {
				obj.css('left', tipObj.offset().left - (ignoreScroll ? $(document).scrollLeft() : 0));
				obj.css('top', tipObj.offset().top - (ignoreScroll ? $(document).scrollTop() : 0) + tipObj.outerHeight() + 10);
			}

			coverObj.css('left', tipObj.offset().left - (ignoreScroll ? $(document).scrollLeft() : 0));
			coverObj.css('top', tipObj.offset().top - (ignoreScroll ? $(document).scrollTop() : 0));
			coverObj.css('width', tipObj.outerWidth());
			coverObj.css('height', tipObj.outerHeight());
		}
		else {
			setFreePosition();
		}

		if (!initialize)
			visibility(true, tourTipCurrentIndex, true);
	}

	function visibility(visible, index, animate) {
		var isFreeTourTip = tourTipObjects[index].tipProperties.isFree;
		var animationVal = tourTipObjects[index].tipSettings.animation;

		if (visible) {
			switch (animationVal) {
				case 'none':
					break;

				case 'fade':
				default:
					$('#TourTip' + index.toString()).css('opacity', '1');

					if (!isFreeTourTip)
						$('#TourTipCover' + index.toString()).css('opacity', '.6');
			}
		}
		else {
			switch (animationVal) {
				case 'none':
					break;

				case 'fade':
				default:
					$('#TourTip' + index.toString()).css('opacity', '0');

					if (!isFreeTourTip) {
						$('#TourTipCover' + index.toString()).css('opacity', '0');
					}
			}
			$('#TourTip' + index.toString()).css('display', 'none');
			$('#TourTipCover' + index.toString()).css('display', 'none');
		}
	}

	function setTourTipPosition(initialize) {
		initialize = typeof initialize != 'undefined' ? initialize : false;
		var tipObj = $(tourTipObjects[tourTipCurrentIndex].tipObject);

		if (!initialize) {
			if (tourTipObjects[tourTipCurrentIndex].tipProperties.isFree)
				setFreePosition();
			else
				scrollIntoView();

			var wait = setInterval(function () {
				if (!$(tipObj).parents().is(":animated") && !$(tipObj).is(":animated")) {
					clearInterval(wait);
					finalizeTourTipPosition();
				}
			}, 200);
		}
		else {
			finalizeTourTipPosition(initialize);
		}
	}

	function setFreePosition() {
		centralize(currentTourTip());
	}

	function isCurrentTourTipFree() {
		return tourTipCurrentIndex != -1 && tourTipObjects[tourTipCurrentIndex].tipProperties.isFree;
	}

	function centralize(element) {
		element.css('left', $(window).width() / 2 - (element.outerWidth() / 2));
		element.css('top', $(window).height() / 2 - (element.outerHeight() / 2));
	}

	function switchBodyElement(element) {
		if (BrowserDetect.browser == 'Firefox' ||
			BrowserDetect.browser == 'Mozilla' ||
			BrowserDetect.browser == 'Explorer')
			return $('html, body');
		else
			return element;
	}

	function scrollParentsIntoView() {
		var parentObj;
		var tipObj = $(tourTipObjects[tourTipCurrentIndex].tipObject);
		var self = $(tourTipObjects[tourTipCurrentIndex].tipSettings.parentScroll);
		var objParents = new Array(self);
		var animationVal = tourTipObjects[tourTipCurrentIndex].tipSettings.animation;

		self.parents().each(function (i, obj) { objParents.push(obj); });

		for (var i = 0; i < objParents.length; i++) {
			obj = objParents[i];
			parentObj = $(obj).parent();

			if (i < objParents.length - 2 && $(obj).css('position') != 'fixed' && parentObj.length > 0) {
				if (parentObj.is('body') || parentObj.is('html')) {
					parentObj = switchBodyElement(parentObj);
					if (animationVal == 'none') {
						parentObj.scrollTop($(obj).position().top - 20 + marginTop($(obj)));
						parentObj.scrollLeft($(obj).position().left - 20 + marginLeft($(obj)));
					}
					else {
						parentObj.animate(
							{
								scrollTop: $(obj).position().top - 20 + marginTop($(obj)),
								scrollLeft: $(obj).position().left - 20 + marginLeft($(obj))
							}
						);
					}
				}
				else 
				{
					if (animationVal == 'none') {
						parentObj.scrollTop($(obj).position().top - 20 + marginTop($(obj)));
						parentObj.scrollLeft($(obj).position().left - 20 + marginLeft($(obj)));
					}
					else {
						parentObj.animate(
							{
								scrollTop: $(obj).position().top - 20 + marginTop($(obj)),
								scrollLeft: $(obj).position().left - 20 + marginLeft($(obj))
							}
						);
					}
				}
			}

			if ($(obj).css('position') == 'fixed')
				return false;
		};
	}

	function scrollIntoView() {
		var tipObj = $(tourTipObjects[tourTipCurrentIndex].tipObject);
		var tipSetting = tourTipObjects[tourTipCurrentIndex].tipSettings;
		var parentObj;
		var parents = tipObj.parents();
		var smooth = tipSetting.smoothScroll;

		if (tipObj.css('position') != 'fixed') {
			scrollParentsIntoView();

			var currentPosition = tipObj.position();
			parentObj = tipSetting.parentScroll;
			if (parentObj.is('body') || parentObj.is('html')) {
				parentObj = switchBodyElement(parentObj);
				var additionalBottom = tipSetting.position != 'bottom' ? 0 : currentTourTip().outerHeight();
				var additionalRight = tipSetting.position != 'right' ? 0 : currentTourTip().outerWidth();
				if (tipSetting.position == 'top') {
					if (currentPosition.top + marginTop(tipObj) - currentTourTip().outerHeight() < parentObj.scrollTop() ||
						currentPosition.top + tipObj.outerHeight() - marginBottom(tipObj) + additionalBottom > $(window).height()) {
						if (smooth == false) {
							parentObj.scrollTop(currentPosition.top - 5 - currentTourTip().outerHeight());
						}
						else {
							parentObj.animate({ scrollTop: currentPosition.top - 5 - currentTourTip().outerHeight() });
						}
					}
				}
				else {
					if (currentPosition.top + marginTop(tipObj) < parentObj.scrollTop() ||
						currentPosition.top + tipObj.outerHeight() - marginBottom(tipObj) + additionalBottom > $(window).height()) {
						if (smooth == false) {
							parentObj.scrollTop(currentPosition.top - 20 + marginTop(tipObj));
						}
						else {
							parentObj.animate({ scrollTop: currentPosition.top - 20 + marginTop(tipObj) });
						}
					}
				}

				if (currentPosition.left + marginLeft(tipObj) < parentObj.scrollLeft() ||
					currentPosition.left + tipObj.outerWidth() - marginRight(tipObj) + additionalRight > $(window).width()) {
					if (smooth == false) {
						parentObj.scrollLeft(currentPosition.left - 20 + marginLeft(tipObj));
					}
					else {
						parentObj.animate({ scrollLeft: currentPosition.left - 20 + marginLeft(tipObj) });
					}
				}
			}
			else {
				if (tipSetting.position == 'top') {
					if (currentPosition.top + marginTop(tipObj) < 0 ||
						currentPosition.top + tipObj.outerHeight() - marginBottom(tipObj) > parentObj.outerHeight()) {
						if (smooth == false) {
							parentObj.scrollTop(currentPosition.top - 5 - currentTourTip().outerHeight());
						}
						else {
							parentObj.animate({ scrollTop: currentPosition.top - 5 - currentTourTip().outerHeight() });
						}
					}
				}
				else {
					if (currentPosition.top + marginTop(tipObj) < parentObj.scrollTop() ||
						currentPosition.top + tipObj.outerHeight() - marginBottom(tipObj) + parentObj.scrollTop() > parentObj.outerHeight()) {
						if (smooth == false) {
							parentObj.scrollTop(currentPosition.top - 20 + marginTop(tipObj) + parentObj.scrollTop());
						}
						else {
							parentObj.animate({ scrollTop: currentPosition.top - 20 + marginTop(tipObj) + parentObj.scrollTop() });
						}
					}
				}

				if (currentPosition.left + marginLeft(tipObj) < parentObj.scrollLeft() ||
					currentPosition.left + tipObj.outerWidth() - marginRight(tipObj) + parentObj.scrollLeft() > parentObj.outerWidth()) {
					if (smooth == false) {
						parentObj.scrollLeft(currentPosition.left - 20 + marginLeft(tipObj) + parentObj.scrollLeft());
					}
					else {
						parentObj.animate({ scrollLeft: currentPosition.left - 20 + marginLeft(tipObj) + parentObj.scrollLeft() });
					}
				}
			}
		}
	}

	function initializeDisabledArea() {
		$('body').append('<canvas id="TourTipDisabledArea" class="TourTipDisabledArea"></canvas>');
		$(window).resize(function () {
			$('.TourTipDisabledArea').css('width', $(window).width().toString() + 'px');
			$('.TourTipDisabledArea').css('height', $(window).height().toString() + 'px');
		}).resize();
	}

	function showDisabledArea() {
		$('.TourTipDisabledArea').css('display', 'block');
	}

	function hideDisabledArea() {
		$('.TourTipDisabledArea').css('display', 'none');
	}

	function marginLeft(element) {
		return parseInt($(element).css("margin-left").replace('px', ''), 10);
	}

	function marginRight(element) {
		return parseInt($(element).css("margin-right").replace('px', ''), 10);
	}

	function marginTop(element) {
		return parseInt(element.css("margin-top").replace('px', ''), 10);
	}

	function marginBottom(element) {
		return parseInt($(element).css("margin-bottom").replace('px', ''), 10);
	}

	$(window).resize(function () {
		if (isCurrentTourTipFree())
			centralize(currentTourTip());
	});
}(jQuery, document, window));
