// JavaScript Document

/*  ---------- superfish for menu--------*/
/*
 * jQuery Superfish Menu Plugin
 * Copyright (c) 2013 Joel Birch
 *
 * Dual licensed under the MIT and GPL licenses:
 *	http://www.opensource.org/licenses/mit-license.php
 *	http://www.gnu.org/licenses/gpl.html
 */


(function ($, w) {
	"use strict";

	var methods = (function () {
		// private properties and methods go here
		var c = {
				bcClass: 'sf-breadcrumb',
				menuClass: 'sf-js-enabled',
				anchorClass: 'sf-with-ul',
				menuArrowClass: 'sf-arrows'
			},
			ios = (function () {
				var ios = /iPhone|iPad|iPod/i.test(navigator.userAgent);
				if (ios) {
					// iOS clicks only bubble as far as body children
					$(w).load(function () {
						$('body').children().on('click', $.noop);
					});
				}
				return ios;
			})(),
			wp7 = (function () {
				var style = document.documentElement.style;
				return ('behavior' in style && 'fill' in style && /iemobile/i.test(navigator.userAgent));
			})(),
			unprefixedPointerEvents = (function () {
				return (!!w.PointerEvent);
			})(),
			toggleMenuClasses = function ($menu, o) {
				var classes = c.menuClass;
				if (o.cssArrows) {
					classes += ' ' + c.menuArrowClass;
				}
				$menu.toggleClass(classes);
			},
			setPathToCurrent = function ($menu, o) {
				return $menu.find('li.' + o.pathClass).slice(0, o.pathLevels)
					.addClass(o.hoverClass + ' ' + c.bcClass)
						.filter(function () {
							return ($(this).children(o.popUpSelector).hide().show().length);
						}).removeClass(o.pathClass);
			},
			toggleAnchorClass = function ($li) {
				$li.children('a').toggleClass(c.anchorClass);
			},
			toggleTouchAction = function ($menu) {
				var msTouchAction = $menu.css('ms-touch-action');
				var touchAction = $menu.css('touch-action');
				touchAction = touchAction || msTouchAction;
				touchAction = (touchAction === 'pan-y') ? 'auto' : 'pan-y';
				$menu.css({
					'ms-touch-action': touchAction,
					'touch-action': touchAction
				});
			},
			applyHandlers = function ($menu, o) {
				var targets = 'li:has(' + o.popUpSelector + ')';
				if ($.fn.hoverIntent && !o.disableHI) {
					$menu.hoverIntent(over, out, targets);
				}
				else {
					$menu
						.on('mouseenter.superfish', targets, over)
						.on('mouseleave.superfish', targets, out);
				}
				var touchevent = 'MSPointerDown.superfish';
				if (unprefixedPointerEvents) {
					touchevent = 'pointerdown.superfish';
				}
				if (!ios) {
					touchevent += ' touchend.superfish';
				}
				if (wp7) {
					touchevent += ' mousedown.superfish';
				}
				$menu
					.on('focusin.superfish', 'li', over)
					.on('focusout.superfish', 'li', out)
					.on(touchevent, 'a', o, touchHandler);
			},
			touchHandler = function (e) {
				var $this = $(this),
					o = getOptions($this),
					$ul = $this.siblings(e.data.popUpSelector);

				if (o.onHandleTouch.call($ul) === false) {
					return this;
				}

				if ($ul.length > 0 && $ul.is(':hidden')) {
					$this.one('click.superfish', false);
					if (e.type === 'MSPointerDown' || e.type === 'pointerdown') {
						$this.trigger('focus');
					} else {
						$.proxy(over, $this.parent('li'))();
					}
				}
			},
			over = function () {
				var $this = $(this),
					o = getOptions($this);
				clearTimeout(o.sfTimer);
				$this.siblings().superfish('hide').end().superfish('show');
			},
			out = function () {
				var $this = $(this),
					o = getOptions($this);
				if (ios) {
					$.proxy(close, $this, o)();
				}
				else {
					clearTimeout(o.sfTimer);
					o.sfTimer = setTimeout($.proxy(close, $this, o), o.delay);
				}
			},
			close = function (o) {
				o.retainPath = ($.inArray(this[0], o.$path) > -1);
				this.superfish('hide');

				if (!this.parents('.' + o.hoverClass).length) {
					o.onIdle.call(getMenu(this));
					if (o.$path.length) {
						$.proxy(over, o.$path)();
					}
				}
			},
			getMenu = function ($el) {
				return $el.closest('.' + c.menuClass);
			},
			getOptions = function ($el) {
				return getMenu($el).data('sf-options');
			};

		return {
			// public methods
			hide: function (instant) {
				if (this.length) {
					var $this = this,
						o = getOptions($this);
					if (!o) {
						return this;
					}
					var not = (o.retainPath === true) ? o.$path : '',
						$ul = $this.find('li.' + o.hoverClass).add(this).not(not).removeClass(o.hoverClass).children(o.popUpSelector),
						speed = o.speedOut;

					if (instant) {
						$ul.show();
						speed = 0;
					}
					o.retainPath = false;

					if (o.onBeforeHide.call($ul) === false) {
						return this;
					}

					$ul.stop(true, true).animate(o.animationOut, speed, function () {
						var $this = $(this);
						o.onHide.call($this);
					});
				}
				return this;
			},
			show: function () {
				var o = getOptions(this);
				if (!o) {
					return this;
				}
				var $this = this.addClass(o.hoverClass),
					$ul = $this.children(o.popUpSelector);

				if (o.onBeforeShow.call($ul) === false) {
					return this;
				}

				$ul.stop(true, true).animate(o.animation, o.speed, function () {
					o.onShow.call($ul);
				});
				return this;
			},
			destroy: function () {
				return this.each(function () {
					var $this = $(this),
						o = $this.data('sf-options'),
						$hasPopUp;
					if (!o) {
						return false;
					}
					$hasPopUp = $this.find(o.popUpSelector).parent('li');
					clearTimeout(o.sfTimer);
					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					// remove event handlers
					$this.off('.superfish').off('.hoverIntent');
					// clear animation's inline display style
					$hasPopUp.children(o.popUpSelector).attr('style', function (i, style) {
						return style.replace(/display[^;]+;?/g, '');
					});
					// reset 'current' path classes
					o.$path.removeClass(o.hoverClass + ' ' + c.bcClass).addClass(o.pathClass);
					$this.find('.' + o.hoverClass).removeClass(o.hoverClass);
					o.onDestroy.call($this);
					$this.removeData('sf-options');
				});
			},
			init: function (op) {
				return this.each(function () {
					var $this = $(this);
					if ($this.data('sf-options')) {
						return false;
					}
					var o = $.extend({}, $.fn.superfish.defaults, op),
						$hasPopUp = $this.find(o.popUpSelector).parent('li');
					o.$path = setPathToCurrent($this, o);

					$this.data('sf-options', o);

					toggleMenuClasses($this, o);
					toggleAnchorClass($hasPopUp);
					toggleTouchAction($this);
					applyHandlers($this, o);

					$hasPopUp.not('.' + c.bcClass).superfish('hide', true);

					o.onInit.call(this);
				});
			}
		};
	})();

	$.fn.superfish = function (method, args) {
		if (methods[method]) {
			return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
		}
		else if (typeof method === 'object' || ! method) {
			return methods.init.apply(this, arguments);
		}
		else {
			return $.error('Method ' +  method + ' does not exist on jQuery.fn.superfish');
		}
	};

	$.fn.superfish.defaults = {
		popUpSelector: 'ul,.sf-mega', // within menu context
		hoverClass: 'sfHover',
		pathClass: 'overrideThisToUse',
		pathLevels: 1,
		delay: 200,
		animation: {opacity: 'show'},
		animationOut: {opacity: 'hide'},
		speed: 100,
		speedOut: 100,
		cssArrows: true,
		disableHI: false,
		onInit: $.noop,
		onBeforeShow: $.noop,
		onShow: $.noop,
		onBeforeHide: $.noop,
		onHide: $.noop,
		onIdle: $.noop,
		onDestroy: $.noop,
		onHandleTouch: $.noop
	};

})(jQuery, window);

/*  ---------- superfish for menu end--------*/


/*  ----------bxslider for home page slider --------------*/

/**
 * BxSlider v4.1.2 - Fully loaded, responsive content slider
 * http://bxslider.com
 *
 * Copyright 2014, Steven Wanderski - http://stevenwanderski.com - http://bxcreative.com
 * Written while drinking Belgian ales and listening to jazz
 *
 * Released under the MIT license - http://opensource.org/licenses/MIT
 */

;(function($){

	var plugin = {};

	var defaults = {

		// GENERAL
		mode: 'horizontal',
		slideSelector: '',
		infiniteLoop: true,
		hideControlOnEnd: false,
		speed: 500,
		easing: null,
		slideMargin: 0,
		startSlide: 0,
		randomStart: false,
		captions: false,
		ticker: false,
		tickerHover: false,
		adaptiveHeight: false,
		adaptiveHeightSpeed: 500,
		video: false,
		useCSS: true,
		preloadImages: 'visible',
		responsive: true,
		slideZIndex: 50,
		wrapperClass: 'bx-wrapper',

		// TOUCH
		touchEnabled: true,
		swipeThreshold: 50,
		oneToOneTouch: true,
		preventDefaultSwipeX: true,
		preventDefaultSwipeY: false,

		// PAGER
		pager: true,
		pagerType: 'full',
		pagerShortSeparator: ' / ',
		pagerSelector: null,
		buildPager: null,
		pagerCustom: null,

		// CONTROLS
		controls: true,
		nextText: 'Next',
		prevText: 'Prev',
		nextSelector: null,
		prevSelector: null,
		autoControls: false,
		startText: 'Start',
		stopText: 'Stop',
		autoControlsCombine: false,
		autoControlsSelector: null,

		// AUTO
		auto: false,
		pause: 4000,
		autoStart: true,
		autoDirection: 'next',
		autoHover: false,
		autoDelay: 0,
		autoSlideForOnePage: false,

		// CAROUSEL
		minSlides: 1,
		maxSlides: 1,
		moveSlides: 0,
		slideWidth: 0,

		// CALLBACKS
		onSliderLoad: function() {},
		onSlideBefore: function() {},
		onSlideAfter: function() {},
		onSlideNext: function() {},
		onSlidePrev: function() {},
		onSliderResize: function() {}
	}

	$.fn.bxSlider = function(options){

		if(this.length == 0) return this;

		// support mutltiple elements
		if(this.length > 1){
			this.each(function(){$(this).bxSlider(options)});
			return this;
		}

		// create a namespace to be used throughout the plugin
		var slider = {};
		// set a reference to our slider element
		var el = this;
		plugin.el = this;

		/**
		 * Makes slideshow responsive
		 */
		// first get the original window dimens (thanks alot IE)
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();



		/**
		 * ===================================================================================
		 * = PRIVATE FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Initializes namespace settings to be used throughout plugin
		 */
		var init = function(){
			// merge user-supplied options with the defaults
			slider.settings = $.extend({}, defaults, options);
			// parse slideWidth setting
			slider.settings.slideWidth = parseInt(slider.settings.slideWidth);
			// store the original children
			slider.children = el.children(slider.settings.slideSelector);
			// check if actual number of slides is less than minSlides / maxSlides
			if(slider.children.length < slider.settings.minSlides) slider.settings.minSlides = slider.children.length;
			if(slider.children.length < slider.settings.maxSlides) slider.settings.maxSlides = slider.children.length;
			// if random start, set the startSlide setting to random number
			if(slider.settings.randomStart) slider.settings.startSlide = Math.floor(Math.random() * slider.children.length);
			// store active slide information
			slider.active = { index: slider.settings.startSlide }
			// store if the slider is in carousel mode (displaying / moving multiple slides)
			slider.carousel = slider.settings.minSlides > 1 || slider.settings.maxSlides > 1;
			// if carousel, force preloadImages = 'all'
			if(slider.carousel) slider.settings.preloadImages = 'all';
			// calculate the min / max width thresholds based on min / max number of slides
			// used to setup and update carousel slides dimensions
			slider.minThreshold = (slider.settings.minSlides * slider.settings.slideWidth) + ((slider.settings.minSlides - 1) * slider.settings.slideMargin);
			slider.maxThreshold = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
			// store the current state of the slider (if currently animating, working is true)
			slider.working = false;
			// initialize the controls object
			slider.controls = {};
			// initialize an auto interval
			slider.interval = null;
			// determine which property to use for transitions
			slider.animProp = slider.settings.mode == 'vertical' ? 'top' : 'left';
			// determine if hardware acceleration can be used
			slider.usingCSS = slider.settings.useCSS && slider.settings.mode != 'fade' && (function(){
				// create our test div element
				var div = document.createElement('div');
				// css transition properties
				var props = ['WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
				// test for each property
				for(var i in props){
					if(div.style[props[i]] !== undefined){
						slider.cssPrefix = props[i].replace('Perspective', '').toLowerCase();
						slider.animProp = '-' + slider.cssPrefix + '-transform';
						return true;
					}
				}
				return false;
			}());
			// if vertical mode always make maxSlides and minSlides equal
			if(slider.settings.mode == 'vertical') slider.settings.maxSlides = slider.settings.minSlides;
			// save original style data
			el.data("origStyle", el.attr("style"));
			el.children(slider.settings.slideSelector).each(function() {
			  $(this).data("origStyle", $(this).attr("style"));
			});
			// perform all DOM / CSS modifications
			setup();
		}

		/**
		 * Performs all DOM and CSS modifications
		 */
		var setup = function(){
			// wrap el in a wrapper
			el.wrap('<div class="' + slider.settings.wrapperClass + '"><div class="bx-viewport"></div></div>');
			// store a namspace reference to .bx-viewport
			slider.viewport = el.parent();
			// add a loading div to display while images are loading
			slider.loader = $('<div class="bx-loading" />');
			slider.viewport.prepend(slider.loader);
			// set el to a massive width, to hold any needed slides
			// also strip any margin and padding from el
			el.css({
				width: slider.settings.mode == 'horizontal' ? (slider.children.length * 100 + 215) + '%' : 'auto',
				position: 'relative'
			});
			// if using CSS, add the easing property
			if(slider.usingCSS && slider.settings.easing){
				el.css('-' + slider.cssPrefix + '-transition-timing-function', slider.settings.easing);
			// if not using CSS and no easing value was supplied, use the default JS animation easing (swing)
			}else if(!slider.settings.easing){
				slider.settings.easing = 'swing';
			}
			var slidesShowing = getNumberSlidesShowing();
			// make modifications to the viewport (.bx-viewport)
			slider.viewport.css({
				width: '100%',
				overflow: 'hidden',
				position: 'relative'
			});
			slider.viewport.parent().css({
				maxWidth: getViewportMaxWidth()
			});
			// make modification to the wrapper (.bx-wrapper)
			if(!slider.settings.pager) {
				slider.viewport.parent().css({
				margin: '0 auto 0px'
				});
			}
			// apply css to all slider children
			slider.children.css({
				'float': slider.settings.mode == 'horizontal' ? 'left' : 'none',
				listStyle: 'none',
				position: 'relative'
			});
			// apply the calculated width after the float is applied to prevent scrollbar interference
			slider.children.css('width', getSlideWidth());
			// if slideMargin is supplied, add the css
			if(slider.settings.mode == 'horizontal' && slider.settings.slideMargin > 0) slider.children.css('marginRight', slider.settings.slideMargin);
			if(slider.settings.mode == 'vertical' && slider.settings.slideMargin > 0) slider.children.css('marginBottom', slider.settings.slideMargin);
			// if "fade" mode, add positioning and z-index CSS
			if(slider.settings.mode == 'fade'){
				slider.children.css({
					position: 'absolute',
					zIndex: 0,
					display: 'none'
				});
				// prepare the z-index on the showing element
				slider.children.eq(slider.settings.startSlide).css({zIndex: slider.settings.slideZIndex, display: 'block'});
			}
			// create an element to contain all slider controls (pager, start / stop, etc)
			slider.controls.el = $('<div class="bx-controls" />');
			// if captions are requested, add them
			if(slider.settings.captions) appendCaptions();
			// check if startSlide is last slide
			slider.active.last = slider.settings.startSlide == getPagerQty() - 1;
			// if video is true, set up the fitVids plugin
			if(slider.settings.video) el.fitVids();
			// set the default preload selector (visible)
			var preloadSelector = slider.children.eq(slider.settings.startSlide);
			if (slider.settings.preloadImages == "all") preloadSelector = slider.children;
			// only check for control addition if not in "ticker" mode
			if(!slider.settings.ticker){
				// if pager is requested, add it
				if(slider.settings.pager) appendPager();
				// if controls are requested, add them
				if(slider.settings.controls) appendControls();
				// if auto is true, and auto controls are requested, add them
				if(slider.settings.auto && slider.settings.autoControls) appendControlsAuto();
				// if any control option is requested, add the controls wrapper
				if(slider.settings.controls || slider.settings.autoControls || slider.settings.pager) slider.viewport.after(slider.controls.el);
			// if ticker mode, do not allow a pager
			}else{
				slider.settings.pager = false;
			}
			// preload all images, then perform final DOM / CSS modifications that depend on images being loaded
			loadElements(preloadSelector, start);
		}

		var loadElements = function(selector, callback){
			var total = selector.find('img, iframe').length;
			if (total == 0){
				callback();
				return;
			}
			var count = 0;
			selector.find('img, iframe').each(function(){
				$(this).one('load', function() {
				  if(++count == total) callback();
				}).each(function() {
				  if(this.complete) $(this).load();
				});
			});
		}

		/**
		 * Start the slider
		 */
		var start = function(){
			// if infinite loop, prepare additional slides
			if(slider.settings.infiniteLoop && slider.settings.mode != 'fade' && !slider.settings.ticker){
				var slice = slider.settings.mode == 'vertical' ? slider.settings.minSlides : slider.settings.maxSlides;
				var sliceAppend = slider.children.slice(0, slice).clone().addClass('bx-clone');
				var slicePrepend = slider.children.slice(-slice).clone().addClass('bx-clone');
				el.append(sliceAppend).prepend(slicePrepend);
			}
			// remove the loading DOM element
			slider.loader.remove();
			// set the left / top position of "el"
			setSlidePosition();
			// if "vertical" mode, always use adaptiveHeight to prevent odd behavior
			if (slider.settings.mode == 'vertical') slider.settings.adaptiveHeight = true;
			// set the viewport height
			slider.viewport.height(getViewportHeight());
			// make sure everything is positioned just right (same as a window resize)
			el.redrawSlider();
			// onSliderLoad callback
			slider.settings.onSliderLoad(slider.active.index);
			// slider has been fully initialized
			slider.initialized = true;
			// bind the resize call to the window
			if (slider.settings.responsive) $(window).bind('resize', resizeWindow);
			// if auto is true and has more than 1 page, start the show
			if (slider.settings.auto && slider.settings.autoStart && (getPagerQty() > 1 || slider.settings.autoSlideForOnePage)) initAuto();
			// if ticker is true, start the ticker
			if (slider.settings.ticker) initTicker();
			// if pager is requested, make the appropriate pager link active
			if (slider.settings.pager) updatePagerActive(slider.settings.startSlide);
			// check for any updates to the controls (like hideControlOnEnd updates)
			if (slider.settings.controls) updateDirectionControls();
			// if touchEnabled is true, setup the touch events
			if (slider.settings.touchEnabled && !slider.settings.ticker) initTouch();
		}

		/**
		 * Returns the calculated height of the viewport, used to determine either adaptiveHeight or the maxHeight value
		 */
		var getViewportHeight = function(){
			var height = 0;
			// first determine which children (slides) should be used in our height calculation
			var children = $();
			// if mode is not "vertical" and adaptiveHeight is false, include all children
			if(slider.settings.mode != 'vertical' && !slider.settings.adaptiveHeight){
				children = slider.children;
			}else{
				// if not carousel, return the single active child
				if(!slider.carousel){
					children = slider.children.eq(slider.active.index);
				// if carousel, return a slice of children
				}else{
					// get the individual slide index
					var currentIndex = slider.settings.moveSlides == 1 ? slider.active.index : slider.active.index * getMoveBy();
					// add the current slide to the children
					children = slider.children.eq(currentIndex);
					// cycle through the remaining "showing" slides
					for (i = 1; i <= slider.settings.maxSlides - 1; i++){
						// if looped back to the start
						if(currentIndex + i >= slider.children.length){
							children = children.add(slider.children.eq(i - 1));
						}else{
							children = children.add(slider.children.eq(currentIndex + i));
						}
					}
				}
			}
			// if "vertical" mode, calculate the sum of the heights of the children
			if(slider.settings.mode == 'vertical'){
				children.each(function(index) {
				  height += $(this).outerHeight();
				});
				// add user-supplied margins
				if(slider.settings.slideMargin > 0){
					height += slider.settings.slideMargin * (slider.settings.minSlides - 1);
				}
			// if not "vertical" mode, calculate the max height of the children
			}else{
				height = Math.max.apply(Math, children.map(function(){
					return $(this).outerHeight(false);
				}).get());
			}

			if(slider.viewport.css('box-sizing') == 'border-box'){
				height +=	parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom')) +
							parseFloat(slider.viewport.css('border-top-width')) + parseFloat(slider.viewport.css('border-bottom-width'));
			}else if(slider.viewport.css('box-sizing') == 'padding-box'){
				height +=	parseFloat(slider.viewport.css('padding-top')) + parseFloat(slider.viewport.css('padding-bottom'));
			}

			return height;
		}

		/**
		 * Returns the calculated width to be used for the outer wrapper / viewport
		 */
		var getViewportMaxWidth = function(){
			var width = '100%';
			if(slider.settings.slideWidth > 0){
				if(slider.settings.mode == 'horizontal'){
					width = (slider.settings.maxSlides * slider.settings.slideWidth) + ((slider.settings.maxSlides - 1) * slider.settings.slideMargin);
				}else{
					width = slider.settings.slideWidth;
				}
			}
			return width;
		}

		/**
		 * Returns the calculated width to be applied to each slide
		 */
		var getSlideWidth = function(){
			// start with any user-supplied slide width
			var newElWidth = slider.settings.slideWidth;
			// get the current viewport width
			var wrapWidth = slider.viewport.width();
			// if slide width was not supplied, or is larger than the viewport use the viewport width
			if(slider.settings.slideWidth == 0 ||
				(slider.settings.slideWidth > wrapWidth && !slider.carousel) ||
				slider.settings.mode == 'vertical'){
				newElWidth = wrapWidth;
			// if carousel, use the thresholds to determine the width
			}else if(slider.settings.maxSlides > 1 && slider.settings.mode == 'horizontal'){
				if(wrapWidth > slider.maxThreshold){
					// newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.maxSlides - 1))) / slider.settings.maxSlides;
				}else if(wrapWidth < slider.minThreshold){
					newElWidth = (wrapWidth - (slider.settings.slideMargin * (slider.settings.minSlides - 1))) / slider.settings.minSlides;
				}
			}
			return newElWidth;
		}

		/**
		 * Returns the number of slides currently visible in the viewport (includes partially visible slides)
		 */
		var getNumberSlidesShowing = function(){
			var slidesShowing = 1;
			if(slider.settings.mode == 'horizontal' && slider.settings.slideWidth > 0){
				// if viewport is smaller than minThreshold, return minSlides
				if(slider.viewport.width() < slider.minThreshold){
					slidesShowing = slider.settings.minSlides;
				// if viewport is larger than minThreshold, return maxSlides
				}else if(slider.viewport.width() > slider.maxThreshold){
					slidesShowing = slider.settings.maxSlides;
				// if viewport is between min / max thresholds, divide viewport width by first child width
				}else{
					var childWidth = slider.children.first().width() + slider.settings.slideMargin;
					slidesShowing = Math.floor((slider.viewport.width() +
						slider.settings.slideMargin) / childWidth);
				}
			// if "vertical" mode, slides showing will always be minSlides
			}else if(slider.settings.mode == 'vertical'){
				slidesShowing = slider.settings.minSlides;
			}
			return slidesShowing;
		}

		/**
		 * Returns the number of pages (one full viewport of slides is one "page")
		 */
		var getPagerQty = function(){
			var pagerQty = 0;
			// if moveSlides is specified by the user
			if(slider.settings.moveSlides > 0){
				if(slider.settings.infiniteLoop){
					pagerQty = Math.ceil(slider.children.length / getMoveBy());
				}else{
					// use a while loop to determine pages
					var breakPoint = 0;
					var counter = 0
					// when breakpoint goes above children length, counter is the number of pages
					while (breakPoint < slider.children.length){
						++pagerQty;
						breakPoint = counter + getNumberSlidesShowing();
						counter += slider.settings.moveSlides <= getNumberSlidesShowing() ? slider.settings.moveSlides : getNumberSlidesShowing();
					}
				}
			// if moveSlides is 0 (auto) divide children length by sides showing, then round up
			}else{
				pagerQty = Math.ceil(slider.children.length / getNumberSlidesShowing());
			}
			return pagerQty;
		}

		/**
		 * Returns the number of indivual slides by which to shift the slider
		 */
		var getMoveBy = function(){
			// if moveSlides was set by the user and moveSlides is less than number of slides showing
			if(slider.settings.moveSlides > 0 && slider.settings.moveSlides <= getNumberSlidesShowing()){
				return slider.settings.moveSlides;
			}
			// if moveSlides is 0 (auto)
			return getNumberSlidesShowing();
		}

		/**
		 * Sets the slider's (el) left or top position
		 */
		var setSlidePosition = function(){
			// if last slide, not infinite loop, and number of children is larger than specified maxSlides
			if(slider.children.length > slider.settings.maxSlides && slider.active.last && !slider.settings.infiniteLoop){
				if (slider.settings.mode == 'horizontal'){
					// get the last child's position
					var lastChild = slider.children.last();
					var position = lastChild.position();
					// set the left position
					setPositionProperty(-(position.left - (slider.viewport.width() - lastChild.outerWidth())), 'reset', 0);
				}else if(slider.settings.mode == 'vertical'){
					// get the last showing index's position
					var lastShowingIndex = slider.children.length - slider.settings.minSlides;
					var position = slider.children.eq(lastShowingIndex).position();
					// set the top position
					setPositionProperty(-position.top, 'reset', 0);
				}
			// if not last slide
			}else{
				// get the position of the first showing slide
				var position = slider.children.eq(slider.active.index * getMoveBy()).position();
				// check for last slide
				if (slider.active.index == getPagerQty() - 1) slider.active.last = true;
				// set the repective position
				if (position != undefined){
					if (slider.settings.mode == 'horizontal') setPositionProperty(-position.left, 'reset', 0);
					else if (slider.settings.mode == 'vertical') setPositionProperty(-position.top, 'reset', 0);
				}
			}
		}

		/**
		 * Sets the el's animating property position (which in turn will sometimes animate el).
		 * If using CSS, sets the transform property. If not using CSS, sets the top / left property.
		 *
		 * @param value (int)
		 *  - the animating property's value
		 *
		 * @param type (string) 'slider', 'reset', 'ticker'
		 *  - the type of instance for which the function is being
		 *
		 * @param duration (int)
		 *  - the amount of time (in ms) the transition should occupy
		 *
		 * @param params (array) optional
		 *  - an optional parameter containing any variables that need to be passed in
		 */
		var setPositionProperty = function(value, type, duration, params){
			// use CSS transform
			if(slider.usingCSS){
				// determine the translate3d value
				var propValue = slider.settings.mode == 'vertical' ? 'translate3d(0, ' + value + 'px, 0)' : 'translate3d(' + value + 'px, 0, 0)';
				// add the CSS transition-duration
				el.css('-' + slider.cssPrefix + '-transition-duration', duration / 1000 + 's');
				if(type == 'slide'){
					// set the property value
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, propValue);
				}else if(type == 'ticker'){
					// make the transition use 'linear'
					el.css('-' + slider.cssPrefix + '-transition-timing-function', 'linear');
					el.css(slider.animProp, propValue);
					// bind a callback method - executes when CSS transition completes
					el.bind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', function(){
						// unbind the callback
						el.unbind('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd');
						// reset the position
						setPositionProperty(params['resetValue'], 'reset', 0);
						// start the loop again
						tickerLoop();
					});
				}
			// use JS animate
			}else{
				var animateObj = {};
				animateObj[slider.animProp] = value;
				if(type == 'slide'){
					el.animate(animateObj, duration, slider.settings.easing, function(){
						updateAfterSlideTransition();
					});
				}else if(type == 'reset'){
					el.css(slider.animProp, value)
				}else if(type == 'ticker'){
					el.animate(animateObj, speed, 'linear', function(){
						setPositionProperty(params['resetValue'], 'reset', 0);
						// run the recursive loop after animation
						tickerLoop();
					});
				}
			}
		}

		/**
		 * Populates the pager with proper amount of pages
		 */
		var populatePager = function(){
			var pagerHtml = '';
			var pagerQty = getPagerQty();
			// loop through each pager item
			for(var i=0; i < pagerQty; i++){
				var linkContent = '';
				// if a buildPager function is supplied, use it to get pager link value, else use index + 1
				if(slider.settings.buildPager && $.isFunction(slider.settings.buildPager)){
					linkContent = slider.settings.buildPager(i);
					slider.pagerEl.addClass('bx-custom-pager');
				}else{
					linkContent = i + 1;
					slider.pagerEl.addClass('bx-default-pager');
				}
				// var linkContent = slider.settings.buildPager && $.isFunction(slider.settings.buildPager) ? slider.settings.buildPager(i) : i + 1;
				// add the markup to the string
				pagerHtml += '<div class="bx-pager-item"><a href="" data-slide-index="' + i + '" class="bx-pager-link">' + linkContent + '</a></div>';
			};
			// populate the pager element with pager links
			slider.pagerEl.html(pagerHtml);
		}

		/**
		 * Appends the pager to the controls element
		 */
		var appendPager = function(){
			if(!slider.settings.pagerCustom){
				// create the pager DOM element
				slider.pagerEl = $('<div class="bx-pager" />');
				// if a pager selector was supplied, populate it with the pager
				if(slider.settings.pagerSelector){
					$(slider.settings.pagerSelector).html(slider.pagerEl);
				// if no pager selector was supplied, add it after the wrapper
				}else{
					slider.controls.el.addClass('bx-has-pager').append(slider.pagerEl);
				}
				// populate the pager
				populatePager();
			}else{
				slider.pagerEl = $(slider.settings.pagerCustom);
			}
			// assign the pager click binding
			slider.pagerEl.on('click', 'a', clickPagerBind);
		}

		/**
		 * Appends prev / next controls to the controls element
		 */
		var appendControls = function(){
			slider.controls.next = $('<a class="bx-next" href="">' + slider.settings.nextText + '</a>');
			slider.controls.prev = $('<a class="bx-prev" href="">' + slider.settings.prevText + '</a>');
			// bind click actions to the controls
			slider.controls.next.bind('click', clickNextBind);
			slider.controls.prev.bind('click', clickPrevBind);
			// if nextSlector was supplied, populate it
			if(slider.settings.nextSelector){
				$(slider.settings.nextSelector).append(slider.controls.next);
			}
			// if prevSlector was supplied, populate it
			if(slider.settings.prevSelector){
				$(slider.settings.prevSelector).append(slider.controls.prev);
			}
			// if no custom selectors were supplied
			if(!slider.settings.nextSelector && !slider.settings.prevSelector){
				// add the controls to the DOM
				slider.controls.directionEl = $('<div class="bx-controls-direction" />');
				// add the control elements to the directionEl
				slider.controls.directionEl.append(slider.controls.prev).append(slider.controls.next);
				// slider.viewport.append(slider.controls.directionEl);
				slider.controls.el.addClass('bx-has-controls-direction').append(slider.controls.directionEl);
			}
		}

		/**
		 * Appends start / stop auto controls to the controls element
		 */
		var appendControlsAuto = function(){
			slider.controls.start = $('<div class="bx-controls-auto-item"><a class="bx-start" href="">' + slider.settings.startText + '</a></div>');
			slider.controls.stop = $('<div class="bx-controls-auto-item"><a class="bx-stop" href="">' + slider.settings.stopText + '</a></div>');
			// add the controls to the DOM
			slider.controls.autoEl = $('<div class="bx-controls-auto" />');
			// bind click actions to the controls
			slider.controls.autoEl.on('click', '.bx-start', clickStartBind);
			slider.controls.autoEl.on('click', '.bx-stop', clickStopBind);
			// if autoControlsCombine, insert only the "start" control
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.append(slider.controls.start);
			// if autoControlsCombine is false, insert both controls
			}else{
				slider.controls.autoEl.append(slider.controls.start).append(slider.controls.stop);
			}
			// if auto controls selector was supplied, populate it with the controls
			if(slider.settings.autoControlsSelector){
				$(slider.settings.autoControlsSelector).html(slider.controls.autoEl);
			// if auto controls selector was not supplied, add it after the wrapper
			}else{
				slider.controls.el.addClass('bx-has-controls-auto').append(slider.controls.autoEl);
			}
			// update the auto controls
			updateAutoControls(slider.settings.autoStart ? 'stop' : 'start');
		}

		/**
		 * Appends image captions to the DOM
		 */
		var appendCaptions = function(){
			// cycle through each child
			slider.children.each(function(index){
				// get the image title attribute
				var title = $(this).find('img:first').attr('title');
				// append the caption
				if (title != undefined && ('' + title).length) {
                    $(this).append('<div class="bx-caption"><span>' + title + '</span></div>');
                }
			});
		}

		/**
		 * Click next binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickNextBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToNextSlide();
			e.preventDefault();
		}

		/**
		 * Click prev binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPrevBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			el.goToPrevSlide();
			e.preventDefault();
		}

		/**
		 * Click start binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStartBind = function(e){
			el.startAuto();
			e.preventDefault();
		}

		/**
		 * Click stop binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickStopBind = function(e){
			el.stopAuto();
			e.preventDefault();
		}

		/**
		 * Click pager binding
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var clickPagerBind = function(e){
			// if auto show is running, stop it
			if (slider.settings.auto) el.stopAuto();
			var pagerLink = $(e.currentTarget);
			if(pagerLink.attr('data-slide-index') !== undefined){
				var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
				// if clicked pager link is not active, continue with the goToSlide call
				if(pagerIndex != slider.active.index) el.goToSlide(pagerIndex);
				e.preventDefault();
			}
		}

		/**
		 * Updates the pager links with an active class
		 *
		 * @param slideIndex (int)
		 *  - index of slide to make active
		 */
		var updatePagerActive = function(slideIndex){
			// if "short" pager type
			var len = slider.children.length; // nb of children
			if(slider.settings.pagerType == 'short'){
				if(slider.settings.maxSlides > 1) {
					len = Math.ceil(slider.children.length/slider.settings.maxSlides);
				}
				slider.pagerEl.html( (slideIndex + 1) + slider.settings.pagerShortSeparator + len);
				return;
			}
			// remove all pager active classes
			slider.pagerEl.find('a').removeClass('active');
			// apply the active class for all pagers
			slider.pagerEl.each(function(i, el) { $(el).find('a').eq(slideIndex).addClass('active'); });
		}

		/**
		 * Performs needed actions after a slide transition
		 */
		var updateAfterSlideTransition = function(){
			// if infinte loop is true
			if(slider.settings.infiniteLoop){
				var position = '';
				// first slide
				if(slider.active.index == 0){
					// set the new position
					position = slider.children.eq(0).position();
				// carousel, last slide
				}else if(slider.active.index == getPagerQty() - 1 && slider.carousel){
					position = slider.children.eq((getPagerQty() - 1) * getMoveBy()).position();
				// last slide
				}else if(slider.active.index == slider.children.length - 1){
					position = slider.children.eq(slider.children.length - 1).position();
				}
				if(position){
					if (slider.settings.mode == 'horizontal') { setPositionProperty(-position.left, 'reset', 0); }
					else if (slider.settings.mode == 'vertical') { setPositionProperty(-position.top, 'reset', 0); }
				}
			}
			// declare that the transition is complete
			slider.working = false;
			// onSlideAfter callback
			slider.settings.onSlideAfter(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
		}

		/**
		 * Updates the auto controls state (either active, or combined switch)
		 *
		 * @param state (string) "start", "stop"
		 *  - the new state of the auto show
		 */
		var updateAutoControls = function(state){
			// if autoControlsCombine is true, replace the current control with the new state
			if(slider.settings.autoControlsCombine){
				slider.controls.autoEl.html(slider.controls[state]);
			// if autoControlsCombine is false, apply the "active" class to the appropriate control
			}else{
				slider.controls.autoEl.find('a').removeClass('active');
				slider.controls.autoEl.find('a:not(.bx-' + state + ')').addClass('active');
			}
		}

		/**
		 * Updates the direction controls (checks if either should be hidden)
		 */
		var updateDirectionControls = function(){
			if(getPagerQty() == 1){
				slider.controls.prev.addClass('disabled');
				slider.controls.next.addClass('disabled');
			}else if(!slider.settings.infiniteLoop && slider.settings.hideControlOnEnd){
				// if first slide
				if (slider.active.index == 0){
					slider.controls.prev.addClass('disabled');
					slider.controls.next.removeClass('disabled');
				// if last slide
				}else if(slider.active.index == getPagerQty() - 1){
					slider.controls.next.addClass('disabled');
					slider.controls.prev.removeClass('disabled');
				// if any slide in the middle
				}else{
					slider.controls.prev.removeClass('disabled');
					slider.controls.next.removeClass('disabled');
				}
			}
		}

		/**
		 * Initialzes the auto process
		 */
		var initAuto = function(){
			// if autoDelay was supplied, launch the auto show using a setTimeout() call
			if(slider.settings.autoDelay > 0){
				var timeout = setTimeout(el.startAuto, slider.settings.autoDelay);
			// if autoDelay was not supplied, start the auto show normally
			}else{
				el.startAuto();
			}
			// if autoHover is requested
			if(slider.settings.autoHover){
				// on el hover
				el.hover(function(){
					// if the auto show is currently playing (has an active interval)
					if(slider.interval){
						// stop the auto show and pass true agument which will prevent control update
						el.stopAuto(true);
						// create a new autoPaused value which will be used by the relative "mouseout" event
						slider.autoPaused = true;
					}
				}, function(){
					// if the autoPaused value was created be the prior "mouseover" event
					if(slider.autoPaused){
						// start the auto show and pass true agument which will prevent control update
						el.startAuto(true);
						// reset the autoPaused value
						slider.autoPaused = null;
					}
				});
			}
		}

		/**
		 * Initialzes the ticker process
		 */
		var initTicker = function(){
			var startPosition = 0;
			// if autoDirection is "next", append a clone of the entire slider
			if(slider.settings.autoDirection == 'next'){
				el.append(slider.children.clone().addClass('bx-clone'));
			// if autoDirection is "prev", prepend a clone of the entire slider, and set the left position
			}else{
				el.prepend(slider.children.clone().addClass('bx-clone'));
				var position = slider.children.first().position();
				startPosition = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			}
			setPositionProperty(startPosition, 'reset', 0);
			// do not allow controls in ticker mode
			slider.settings.pager = false;
			slider.settings.controls = false;
			slider.settings.autoControls = false;
			// if autoHover is requested
			if(slider.settings.tickerHover && !slider.usingCSS){
				// on el hover
				slider.viewport.hover(function(){
					el.stop();
				}, function(){
					// calculate the total width of children (used to calculate the speed ratio)
					var totalDimens = 0;
					slider.children.each(function(index){
					  totalDimens += slider.settings.mode == 'horizontal' ? $(this).outerWidth(true) : $(this).outerHeight(true);
					});
					// calculate the speed ratio (used to determine the new speed to finish the paused animation)
					var ratio = slider.settings.speed / totalDimens;
					// determine which property to use
					var property = slider.settings.mode == 'horizontal' ? 'left' : 'top';
					// calculate the new speed
					var newSpeed = ratio * (totalDimens - (Math.abs(parseInt(el.css(property)))));
					tickerLoop(newSpeed);
				});
			}
			// start the ticker loop
			tickerLoop();
		}

		/**
		 * Runs a continuous loop, news ticker-style
		 */
		var tickerLoop = function(resumeSpeed){
			speed = resumeSpeed ? resumeSpeed : slider.settings.speed;
			var position = {left: 0, top: 0};
			var reset = {left: 0, top: 0};
			// if "next" animate left position to last child, then reset left to 0
			if(slider.settings.autoDirection == 'next'){
				position = el.find('.bx-clone').first().position();
			// if "prev" animate left position to 0, then reset left to first non-clone child
			}else{
				reset = slider.children.first().position();
			}
			var animateProperty = slider.settings.mode == 'horizontal' ? -position.left : -position.top;
			var resetValue = slider.settings.mode == 'horizontal' ? -reset.left : -reset.top;
			var params = {resetValue: resetValue};
			setPositionProperty(animateProperty, 'ticker', speed, params);
		}

		/**
		 * Initializes touch events
		 */
		var initTouch = function(){
			// initialize object to contain all touch values
			slider.touch = {
				start: {x: 0, y: 0},
				end: {x: 0, y: 0}
			}
			slider.viewport.bind('touchstart', onTouchStart);
		}

		/**
		 * Event handler for "touchstart"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchStart = function(e){
			if(slider.working){
				e.preventDefault();
			}else{
				// record the original position when touch starts
				slider.touch.originalPos = el.position();
				var orig = e.originalEvent;
				// record the starting touch x, y coordinates
				slider.touch.start.x = orig.changedTouches[0].pageX;
				slider.touch.start.y = orig.changedTouches[0].pageY;
				// bind a "touchmove" event to the viewport
				slider.viewport.bind('touchmove', onTouchMove);
				// bind a "touchend" event to the viewport
				slider.viewport.bind('touchend', onTouchEnd);
			}
		}

		/**
		 * Event handler for "touchmove"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchMove = function(e){
			var orig = e.originalEvent;
			// if scrolling on y axis, do not prevent default
			var xMovement = Math.abs(orig.changedTouches[0].pageX - slider.touch.start.x);
			var yMovement = Math.abs(orig.changedTouches[0].pageY - slider.touch.start.y);
			// x axis swipe
			if((xMovement * 3) > yMovement && slider.settings.preventDefaultSwipeX){
				e.preventDefault();
			// y axis swipe
			}else if((yMovement * 3) > xMovement && slider.settings.preventDefaultSwipeY){
				e.preventDefault();
			}
			if(slider.settings.mode != 'fade' && slider.settings.oneToOneTouch){
				var value = 0;
				// if horizontal, drag along x axis
				if(slider.settings.mode == 'horizontal'){
					var change = orig.changedTouches[0].pageX - slider.touch.start.x;
					value = slider.touch.originalPos.left + change;
				// if vertical, drag along y axis
				}else{
					var change = orig.changedTouches[0].pageY - slider.touch.start.y;
					value = slider.touch.originalPos.top + change;
				}
				setPositionProperty(value, 'reset', 0);
			}
		}

		/**
		 * Event handler for "touchend"
		 *
		 * @param e (event)
		 *  - DOM event object
		 */
		var onTouchEnd = function(e){
			slider.viewport.unbind('touchmove', onTouchMove);
			var orig = e.originalEvent;
			var value = 0;
			// record end x, y positions
			slider.touch.end.x = orig.changedTouches[0].pageX;
			slider.touch.end.y = orig.changedTouches[0].pageY;
			// if fade mode, check if absolute x distance clears the threshold
			if(slider.settings.mode == 'fade'){
				var distance = Math.abs(slider.touch.start.x - slider.touch.end.x);
				if(distance >= slider.settings.swipeThreshold){
					slider.touch.start.x > slider.touch.end.x ? el.goToNextSlide() : el.goToPrevSlide();
					el.stopAuto();
				}
			// not fade mode
			}else{
				var distance = 0;
				// calculate distance and el's animate property
				if(slider.settings.mode == 'horizontal'){
					distance = slider.touch.end.x - slider.touch.start.x;
					value = slider.touch.originalPos.left;
				}else{
					distance = slider.touch.end.y - slider.touch.start.y;
					value = slider.touch.originalPos.top;
				}
				// if not infinite loop and first / last slide, do not attempt a slide transition
				if(!slider.settings.infiniteLoop && ((slider.active.index == 0 && distance > 0) || (slider.active.last && distance < 0))){
					setPositionProperty(value, 'reset', 200);
				}else{
					// check if distance clears threshold
					if(Math.abs(distance) >= slider.settings.swipeThreshold){
						distance < 0 ? el.goToNextSlide() : el.goToPrevSlide();
						el.stopAuto();
					}else{
						// el.animate(property, 200);
						setPositionProperty(value, 'reset', 200);
					}
				}
			}
			slider.viewport.unbind('touchend', onTouchEnd);
		}

		/**
		 * Window resize event callback
		 */
		var resizeWindow = function(e){
			// don't do anything if slider isn't initialized.
			if(!slider.initialized) return;
			// get the new window dimens (again, thank you IE)
			var windowWidthNew = $(window).width();
			var windowHeightNew = $(window).height();
			// make sure that it is a true window resize
			// *we must check this because our dinosaur friend IE fires a window resize event when certain DOM elements
			// are resized. Can you just die already?*
			if(windowWidth != windowWidthNew || windowHeight != windowHeightNew){
				// set the new window dimens
				windowWidth = windowWidthNew;
				windowHeight = windowHeightNew;
				// update all dynamic elements
				el.redrawSlider();
				// Call user resize handler
				slider.settings.onSliderResize.call(el, slider.active.index);
			}
		}

		/**
		 * ===================================================================================
		 * = PUBLIC FUNCTIONS
		 * ===================================================================================
		 */

		/**
		 * Performs slide transition to the specified slide
		 *
		 * @param slideIndex (int)
		 *  - the destination slide's index (zero-based)
		 *
		 * @param direction (string)
		 *  - INTERNAL USE ONLY - the direction of travel ("prev" / "next")
		 */
		el.goToSlide = function(slideIndex, direction){
			// if plugin is currently in motion, ignore request
			if(slider.working || slider.active.index == slideIndex) return;
			// declare that plugin is in motion
			slider.working = true;
			// store the old index
			slider.oldIndex = slider.active.index;
			// if slideIndex is less than zero, set active index to last child (this happens during infinite loop)
			if(slideIndex < 0){
				slider.active.index = getPagerQty() - 1;
			// if slideIndex is greater than children length, set active index to 0 (this happens during infinite loop)
			}else if(slideIndex >= getPagerQty()){
				slider.active.index = 0;
			// set active index to requested slide
			}else{
				slider.active.index = slideIndex;
			}
			// onSlideBefore, onSlideNext, onSlidePrev callbacks
			slider.settings.onSlideBefore(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			if(direction == 'next'){
				slider.settings.onSlideNext(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}else if(direction == 'prev'){
				slider.settings.onSlidePrev(slider.children.eq(slider.active.index), slider.oldIndex, slider.active.index);
			}
			// check if last slide
			slider.active.last = slider.active.index >= getPagerQty() - 1;
			// update the pager with active class
			if(slider.settings.pager) updatePagerActive(slider.active.index);
			// // check for direction control update
			if(slider.settings.controls) updateDirectionControls();
			// if slider is set to mode: "fade"
			if(slider.settings.mode == 'fade'){
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				// fade out the visible child and reset its z-index value
				slider.children.filter(':visible').fadeOut(slider.settings.speed).css({zIndex: 0});
				// fade in the newly requested slide
				slider.children.eq(slider.active.index).css('zIndex', slider.settings.slideZIndex+1).fadeIn(slider.settings.speed, function(){
					$(this).css('zIndex', slider.settings.slideZIndex);
					updateAfterSlideTransition();
				});
			// slider mode is not "fade"
			}else{
				// if adaptiveHeight is true and next height is different from current height, animate to the new height
				if(slider.settings.adaptiveHeight && slider.viewport.height() != getViewportHeight()){
					slider.viewport.animate({height: getViewportHeight()}, slider.settings.adaptiveHeightSpeed);
				}
				var moveBy = 0;
				var position = {left: 0, top: 0};
				// if carousel and not infinite loop
				if(!slider.settings.infiniteLoop && slider.carousel && slider.active.last){
					if(slider.settings.mode == 'horizontal'){
						// get the last child position
						var lastChild = slider.children.eq(slider.children.length - 1);
						position = lastChild.position();
						// calculate the position of the last slide
						moveBy = slider.viewport.width() - lastChild.outerWidth();
					}else{
						// get last showing index position
						var lastShowingIndex = slider.children.length - slider.settings.minSlides;
						position = slider.children.eq(lastShowingIndex).position();
					}
					// horizontal carousel, going previous while on first slide (infiniteLoop mode)
				}else if(slider.carousel && slider.active.last && direction == 'prev'){
					// get the last child position
					var eq = slider.settings.moveSlides == 1 ? slider.settings.maxSlides - getMoveBy() : ((getPagerQty() - 1) * getMoveBy()) - (slider.children.length - slider.settings.maxSlides);
					var lastChild = el.children('.bx-clone').eq(eq);
					position = lastChild.position();
				// if infinite loop and "Next" is clicked on the last slide
				}else if(direction == 'next' && slider.active.index == 0){
					// get the last clone position
					position = el.find('> .bx-clone').eq(slider.settings.maxSlides).position();
					slider.active.last = false;
				// normal non-zero requests
				}else if(slideIndex >= 0){
					var requestEl = slideIndex * getMoveBy();
					position = slider.children.eq(requestEl).position();
				}

				/* If the position doesn't exist
				 * (e.g. if you destroy the slider on a next click),
				 * it doesn't throw an error.
				 */
				if ("undefined" !== typeof(position)) {
					var value = slider.settings.mode == 'horizontal' ? -(position.left - moveBy) : -position.top;
					// plugin values to be animated
					setPositionProperty(value, 'slide', slider.settings.speed);
				}
			}
		}

		/**
		 * Transitions to the next slide in the show
		 */
		el.goToNextSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.last) return;
			var pagerIndex = parseInt(slider.active.index) + 1;
			el.goToSlide(pagerIndex, 'next');
		}

		/**
		 * Transitions to the prev slide in the show
		 */
		el.goToPrevSlide = function(){
			// if infiniteLoop is false and last page is showing, disregard call
			if (!slider.settings.infiniteLoop && slider.active.index == 0) return;
			var pagerIndex = parseInt(slider.active.index) - 1;
			el.goToSlide(pagerIndex, 'prev');
		}

		/**
		 * Starts the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.startAuto = function(preventControlUpdate){
			// if an interval already exists, disregard call
			if(slider.interval) return;
			// create an interval
			slider.interval = setInterval(function(){
				slider.settings.autoDirection == 'next' ? el.goToNextSlide() : el.goToPrevSlide();
			}, slider.settings.pause);
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('stop');
		}

		/**
		 * Stops the auto show
		 *
		 * @param preventControlUpdate (boolean)
		 *  - if true, auto controls state will not be updated
		 */
		el.stopAuto = function(preventControlUpdate){
			// if no interval exists, disregard call
			if(!slider.interval) return;
			// clear the interval
			clearInterval(slider.interval);
			slider.interval = null;
			// if auto controls are displayed and preventControlUpdate is not true
			if (slider.settings.autoControls && preventControlUpdate != true) updateAutoControls('start');
		}

		/**
		 * Returns current slide index (zero-based)
		 */
		el.getCurrentSlide = function(){
			return slider.active.index;
		}

		/**
		 * Returns current slide element
		 */
		el.getCurrentSlideElement = function(){
			return slider.children.eq(slider.active.index);
		}

		/**
		 * Returns number of slides in show
		 */
		el.getSlideCount = function(){
			return slider.children.length;
		}

		/**
		 * Update all dynamic slider elements
		 */
		el.redrawSlider = function(){
			// resize all children in ratio to new screen size
			slider.children.add(el.find('.bx-clone')).width(getSlideWidth());
			// adjust the height
			slider.viewport.css('height', getViewportHeight());
			// update the slide position
			if(!slider.settings.ticker) setSlidePosition();
			// if active.last was true before the screen resize, we want
			// to keep it last no matter what screen size we end on
			if (slider.active.last) slider.active.index = getPagerQty() - 1;
			// if the active index (page) no longer exists due to the resize, simply set the index as last
			if (slider.active.index >= getPagerQty()) slider.active.last = true;
			// if a pager is being displayed and a custom pager is not being used, update it
			if(slider.settings.pager && !slider.settings.pagerCustom){
				populatePager();
				updatePagerActive(slider.active.index);
			}
		}

		/**
		 * Destroy the current instance of the slider (revert everything back to original state)
		 */
		el.destroySlider = function(){
			// don't do anything if slider has already been destroyed
			if(!slider.initialized) return;
			slider.initialized = false;
			$('.bx-clone', this).remove();
			slider.children.each(function() {
				$(this).data("origStyle") != undefined ? $(this).attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			});
			$(this).data("origStyle") != undefined ? this.attr("style", $(this).data("origStyle")) : $(this).removeAttr('style');
			$(this).unwrap().unwrap();
			if(slider.controls.el) slider.controls.el.remove();
			if(slider.controls.next) slider.controls.next.remove();
			if(slider.controls.prev) slider.controls.prev.remove();
			if(slider.pagerEl && slider.settings.controls) slider.pagerEl.remove();
			$('.bx-caption', this).remove();
			if(slider.controls.autoEl) slider.controls.autoEl.remove();
			clearInterval(slider.interval);
			if(slider.settings.responsive) $(window).unbind('resize', resizeWindow);
		}

		/**
		 * Reload the slider (revert all DOM changes, and re-initialize)
		 */
		el.reloadSlider = function(settings){
			if (settings != undefined) options = settings;
			el.destroySlider();
			init();
		}

		init();

		// returns the current jQuery object
		return this;
	}

})(jQuery);


/*  ----------bxslider for home page slider end --------------*/


/*----------nice scroll start----------------*/

/* jquery.nicescroll 3.6.0 InuYaksa*2014 MIT http://nicescroll.areaaperta.com */(function(f){"function"===typeof define&&define.amd?define(["jquery"],f):f(jQuery)})(function(f){var y=!1,D=!1,N=0,O=2E3,x=0,H=["webkit","ms","moz","o"],s=window.requestAnimationFrame||!1,t=window.cancelAnimationFrame||!1;if(!s)for(var P in H){var E=H[P];s||(s=window[E+"RequestAnimationFrame"]);t||(t=window[E+"CancelAnimationFrame"]||window[E+"CancelRequestAnimationFrame"])}var v=window.MutationObserver||window.WebKitMutationObserver||!1,I={zindex:"auto",cursoropacitymin:0,cursoropacitymax:1,cursorcolor:"#424242",
cursorwidth:"5px",cursorborder:"1px solid #fff",cursorborderradius:"5px",scrollspeed:60,mousescrollstep:24,touchbehavior:!1,hwacceleration:!0,usetransition:!0,boxzoom:!1,dblclickzoom:!0,gesturezoom:!0,grabcursorenabled:!0,autohidemode:!0,background:"",iframeautoresize:!0,cursorminheight:32,preservenativescrolling:!0,railoffset:!1,railhoffset:!1,bouncescroll:!0,spacebarenabled:!0,railpadding:{top:0,right:0,left:0,bottom:0},disableoutline:!0,horizrailenabled:!0,railalign:"right",railvalign:"bottom",
enabletranslate3d:!0,enablemousewheel:!0,enablekeyboard:!0,smoothscroll:!0,sensitiverail:!0,enablemouselockapi:!0,cursorfixedheight:!1,directionlockdeadzone:6,hidecursordelay:400,nativeparentscrolling:!0,enablescrollonselection:!0,overflowx:!0,overflowy:!0,cursordragspeed:.3,rtlmode:"auto",cursordragontouch:!1,oneaxismousemode:"auto",scriptpath:function(){var f=document.getElementsByTagName("script"),f=f[f.length-1].src.split("?")[0];return 0<f.split("/").length?f.split("/").slice(0,-1).join("/")+
"/":""}(),preventmultitouchscrolling:!0},F=!1,Q=function(){if(F)return F;var f=document.createElement("DIV"),c=f.style,h=navigator.userAgent,m=navigator.platform,d={haspointerlock:"pointerLockElement"in document||"webkitPointerLockElement"in document||"mozPointerLockElement"in document};d.isopera="opera"in window;d.isopera12=d.isopera&&"getUserMedia"in navigator;d.isoperamini="[object OperaMini]"===Object.prototype.toString.call(window.operamini);d.isie="all"in document&&"attachEvent"in f&&!d.isopera;
d.isieold=d.isie&&!("msInterpolationMode"in c);d.isie7=d.isie&&!d.isieold&&(!("documentMode"in document)||7==document.documentMode);d.isie8=d.isie&&"documentMode"in document&&8==document.documentMode;d.isie9=d.isie&&"performance"in window&&9<=document.documentMode;d.isie10=d.isie&&"performance"in window&&10==document.documentMode;d.isie11="msRequestFullscreen"in f&&11<=document.documentMode;d.isie9mobile=/iemobile.9/i.test(h);d.isie9mobile&&(d.isie9=!1);d.isie7mobile=!d.isie9mobile&&d.isie7&&/iemobile/i.test(h);
d.ismozilla="MozAppearance"in c;d.iswebkit="WebkitAppearance"in c;d.ischrome="chrome"in window;d.ischrome22=d.ischrome&&d.haspointerlock;d.ischrome26=d.ischrome&&"transition"in c;d.cantouch="ontouchstart"in document.documentElement||"ontouchstart"in window;d.hasmstouch=window.MSPointerEvent||!1;d.hasw3ctouch=window.PointerEvent||!1;d.ismac=/^mac$/i.test(m);d.isios=d.cantouch&&/iphone|ipad|ipod/i.test(m);d.isios4=d.isios&&!("seal"in Object);d.isios7=d.isios&&"webkitHidden"in document;d.isandroid=/android/i.test(h);
d.haseventlistener="addEventListener"in f;d.trstyle=!1;d.hastransform=!1;d.hastranslate3d=!1;d.transitionstyle=!1;d.hastransition=!1;d.transitionend=!1;m=["transform","msTransform","webkitTransform","MozTransform","OTransform"];for(h=0;h<m.length;h++)if("undefined"!=typeof c[m[h]]){d.trstyle=m[h];break}d.hastransform=!!d.trstyle;d.hastransform&&(c[d.trstyle]="translate3d(1px,2px,3px)",d.hastranslate3d=/translate3d/.test(c[d.trstyle]));d.transitionstyle=!1;d.prefixstyle="";d.transitionend=!1;for(var m=
"transition webkitTransition msTransition MozTransition OTransition OTransition KhtmlTransition".split(" "),n=" -webkit- -ms- -moz- -o- -o -khtml-".split(" "),p="transitionend webkitTransitionEnd msTransitionEnd transitionend otransitionend oTransitionEnd KhtmlTransitionEnd".split(" "),h=0;h<m.length;h++)if(m[h]in c){d.transitionstyle=m[h];d.prefixstyle=n[h];d.transitionend=p[h];break}d.ischrome26&&(d.prefixstyle=n[1]);d.hastransition=d.transitionstyle;a:{h=["-webkit-grab","-moz-grab","grab"];if(d.ischrome&&
!d.ischrome22||d.isie)h=[];for(m=0;m<h.length;m++)if(n=h[m],c.cursor=n,c.cursor==n){c=n;break a}c="url(//mail.google.com/mail/images/2/openhand.cur),n-resize"}d.cursorgrabvalue=c;d.hasmousecapture="setCapture"in f;d.hasMutationObserver=!1!==v;return F=d},R=function(k,c){function h(){var b=a.doc.css(e.trstyle);return b&&"matrix"==b.substr(0,6)?b.replace(/^.*\((.*)\)$/g,"$1").replace(/px/g,"").split(/, +/):!1}function m(){var b=a.win;if("zIndex"in b)return b.zIndex();for(;0<b.length&&9!=b[0].nodeType;){var g=
b.css("zIndex");if(!isNaN(g)&&0!=g)return parseInt(g);b=b.parent()}return!1}function d(b,g,q){g=b.css(g);b=parseFloat(g);return isNaN(b)?(b=w[g]||0,q=3==b?q?a.win.outerHeight()-a.win.innerHeight():a.win.outerWidth()-a.win.innerWidth():1,a.isie8&&b&&(b+=1),q?b:0):b}function n(b,g,q,c){a._bind(b,g,function(a){a=a?a:window.event;var c={original:a,target:a.target||a.srcElement,type:"wheel",deltaMode:"MozMousePixelScroll"==a.type?0:1,deltaX:0,deltaZ:0,preventDefault:function(){a.preventDefault?a.preventDefault():
a.returnValue=!1;return!1},stopImmediatePropagation:function(){a.stopImmediatePropagation?a.stopImmediatePropagation():a.cancelBubble=!0}};"mousewheel"==g?(c.deltaY=-.025*a.wheelDelta,a.wheelDeltaX&&(c.deltaX=-.025*a.wheelDeltaX)):c.deltaY=a.detail;return q.call(b,c)},c)}function p(b,g,c){var d,e;0==b.deltaMode?(d=-Math.floor(a.opt.mousescrollstep/54*b.deltaX),e=-Math.floor(a.opt.mousescrollstep/54*b.deltaY)):1==b.deltaMode&&(d=-Math.floor(b.deltaX*a.opt.mousescrollstep),e=-Math.floor(b.deltaY*a.opt.mousescrollstep));
g&&a.opt.oneaxismousemode&&0==d&&e&&(d=e,e=0,c&&(0>d?a.getScrollLeft()>=a.page.maxw:0>=a.getScrollLeft())&&(e=d,d=0));d&&(a.scrollmom&&a.scrollmom.stop(),a.lastdeltax+=d,a.debounced("mousewheelx",function(){var b=a.lastdeltax;a.lastdeltax=0;a.rail.drag||a.doScrollLeftBy(b)},15));if(e){if(a.opt.nativeparentscrolling&&c&&!a.ispage&&!a.zoomactive)if(0>e){if(a.getScrollTop()>=a.page.maxh)return!0}else if(0>=a.getScrollTop())return!0;a.scrollmom&&a.scrollmom.stop();a.lastdeltay+=e;a.debounced("mousewheely",
function(){var b=a.lastdeltay;a.lastdeltay=0;a.rail.drag||a.doScrollBy(b)},15)}b.stopImmediatePropagation();return b.preventDefault()}var a=this;this.version="3.6.0";this.name="nicescroll";this.me=c;this.opt={doc:f("body"),win:!1};f.extend(this.opt,I);this.opt.snapbackspeed=80;if(k)for(var G in a.opt)"undefined"!=typeof k[G]&&(a.opt[G]=k[G]);this.iddoc=(this.doc=a.opt.doc)&&this.doc[0]?this.doc[0].id||"":"";this.ispage=/^BODY|HTML/.test(a.opt.win?a.opt.win[0].nodeName:this.doc[0].nodeName);this.haswrapper=
!1!==a.opt.win;this.win=a.opt.win||(this.ispage?f(window):this.doc);this.docscroll=this.ispage&&!this.haswrapper?f(window):this.win;this.body=f("body");this.iframe=this.isfixed=this.viewport=!1;this.isiframe="IFRAME"==this.doc[0].nodeName&&"IFRAME"==this.win[0].nodeName;this.istextarea="TEXTAREA"==this.win[0].nodeName;this.forcescreen=!1;this.canshowonmouseevent="scroll"!=a.opt.autohidemode;this.page=this.view=this.onzoomout=this.onzoomin=this.onscrollcancel=this.onscrollend=this.onscrollstart=this.onclick=
this.ongesturezoom=this.onkeypress=this.onmousewheel=this.onmousemove=this.onmouseup=this.onmousedown=!1;this.scroll={x:0,y:0};this.scrollratio={x:0,y:0};this.cursorheight=20;this.scrollvaluemax=0;this.isrtlmode="auto"==this.opt.rtlmode?"rtl"==(this.win[0]==window?this.body:this.win).css("direction"):!0===this.opt.rtlmode;this.observerbody=this.observerremover=this.observer=this.scrollmom=this.scrollrunning=!1;do this.id="ascrail"+O++;while(document.getElementById(this.id));this.hasmousefocus=this.hasfocus=
this.zoomactive=this.zoom=this.selectiondrag=this.cursorfreezed=this.cursor=this.rail=!1;this.visibility=!0;this.hidden=this.locked=this.railslocked=!1;this.cursoractive=!0;this.wheelprevented=!1;this.overflowx=a.opt.overflowx;this.overflowy=a.opt.overflowy;this.nativescrollingarea=!1;this.checkarea=0;this.events=[];this.saved={};this.delaylist={};this.synclist={};this.lastdeltay=this.lastdeltax=0;this.detected=Q();var e=f.extend({},this.detected);this.ishwscroll=(this.canhwscroll=e.hastransform&&
a.opt.hwacceleration)&&a.haswrapper;this.hasreversehr=this.isrtlmode&&!e.iswebkit;this.istouchcapable=!1;!e.cantouch||e.isios||e.isandroid||!e.iswebkit&&!e.ismozilla||(this.istouchcapable=!0,e.cantouch=!1);a.opt.enablemouselockapi||(e.hasmousecapture=!1,e.haspointerlock=!1);this.debounced=function(b,g,c){var d=a.delaylist[b];a.delaylist[b]=g;d||setTimeout(function(){var g=a.delaylist[b];a.delaylist[b]=!1;g.call(a)},c)};var r=!1;this.synched=function(b,g){a.synclist[b]=g;(function(){r||(s(function(){r=
!1;for(var b in a.synclist){var g=a.synclist[b];g&&g.call(a);a.synclist[b]=!1}}),r=!0)})();return b};this.unsynched=function(b){a.synclist[b]&&(a.synclist[b]=!1)};this.css=function(b,g){for(var c in g)a.saved.css.push([b,c,b.css(c)]),b.css(c,g[c])};this.scrollTop=function(b){return"undefined"==typeof b?a.getScrollTop():a.setScrollTop(b)};this.scrollLeft=function(b){return"undefined"==typeof b?a.getScrollLeft():a.setScrollLeft(b)};var A=function(a,g,c,d,e,f,h){this.st=a;this.ed=g;this.spd=c;this.p1=
d||0;this.p2=e||1;this.p3=f||0;this.p4=h||1;this.ts=(new Date).getTime();this.df=this.ed-this.st};A.prototype={B2:function(a){return 3*a*a*(1-a)},B3:function(a){return 3*a*(1-a)*(1-a)},B4:function(a){return(1-a)*(1-a)*(1-a)},getNow:function(){var a=1-((new Date).getTime()-this.ts)/this.spd,g=this.B2(a)+this.B3(a)+this.B4(a);return 0>a?this.ed:this.st+Math.round(this.df*g)},update:function(a,g){this.st=this.getNow();this.ed=a;this.spd=g;this.ts=(new Date).getTime();this.df=this.ed-this.st;return this}};
if(this.ishwscroll){this.doc.translate={x:0,y:0,tx:"0px",ty:"0px"};e.hastranslate3d&&e.isios&&this.doc.css("-webkit-backface-visibility","hidden");this.getScrollTop=function(b){if(!b){if(b=h())return 16==b.length?-b[13]:-b[5];if(a.timerscroll&&a.timerscroll.bz)return a.timerscroll.bz.getNow()}return a.doc.translate.y};this.getScrollLeft=function(b){if(!b){if(b=h())return 16==b.length?-b[12]:-b[4];if(a.timerscroll&&a.timerscroll.bh)return a.timerscroll.bh.getNow()}return a.doc.translate.x};this.notifyScrollEvent=
function(a){var g=document.createEvent("UIEvents");g.initUIEvent("scroll",!1,!0,window,1);g.niceevent=!0;a.dispatchEvent(g)};var K=this.isrtlmode?1:-1;e.hastranslate3d&&a.opt.enabletranslate3d?(this.setScrollTop=function(b,g){a.doc.translate.y=b;a.doc.translate.ty=-1*b+"px";a.doc.css(e.trstyle,"translate3d("+a.doc.translate.tx+","+a.doc.translate.ty+",0px)");g||a.notifyScrollEvent(a.win[0])},this.setScrollLeft=function(b,g){a.doc.translate.x=b;a.doc.translate.tx=b*K+"px";a.doc.css(e.trstyle,"translate3d("+
a.doc.translate.tx+","+a.doc.translate.ty+",0px)");g||a.notifyScrollEvent(a.win[0])}):(this.setScrollTop=function(b,g){a.doc.translate.y=b;a.doc.translate.ty=-1*b+"px";a.doc.css(e.trstyle,"translate("+a.doc.translate.tx+","+a.doc.translate.ty+")");g||a.notifyScrollEvent(a.win[0])},this.setScrollLeft=function(b,g){a.doc.translate.x=b;a.doc.translate.tx=b*K+"px";a.doc.css(e.trstyle,"translate("+a.doc.translate.tx+","+a.doc.translate.ty+")");g||a.notifyScrollEvent(a.win[0])})}else this.getScrollTop=
function(){return a.docscroll.scrollTop()},this.setScrollTop=function(b){return a.docscroll.scrollTop(b)},this.getScrollLeft=function(){return a.detected.ismozilla&&a.isrtlmode?Math.abs(a.docscroll.scrollLeft()):a.docscroll.scrollLeft()},this.setScrollLeft=function(b){return a.docscroll.scrollLeft(a.detected.ismozilla&&a.isrtlmode?-b:b)};this.getTarget=function(a){return a?a.target?a.target:a.srcElement?a.srcElement:!1:!1};this.hasParent=function(a,g){if(!a)return!1;for(var c=a.target||a.srcElement||
a||!1;c&&c.id!=g;)c=c.parentNode||!1;return!1!==c};var w={thin:1,medium:3,thick:5};this.getDocumentScrollOffset=function(){return{top:window.pageYOffset||document.documentElement.scrollTop,left:window.pageXOffset||document.documentElement.scrollLeft}};this.getOffset=function(){if(a.isfixed){var b=a.win.offset(),g=a.getDocumentScrollOffset();b.top-=g.top;b.left-=g.left;return b}b=a.win.offset();if(!a.viewport)return b;g=a.viewport.offset();return{top:b.top-g.top,left:b.left-g.left}};this.updateScrollBar=
function(b){if(a.ishwscroll)a.rail.css({height:a.win.innerHeight()-(a.opt.railpadding.top+a.opt.railpadding.bottom)}),a.railh&&a.railh.css({width:a.win.innerWidth()-(a.opt.railpadding.left+a.opt.railpadding.right)});else{var g=a.getOffset(),c=g.top,e=g.left-(a.opt.railpadding.left+a.opt.railpadding.right),c=c+d(a.win,"border-top-width",!0),e=e+(a.rail.align?a.win.outerWidth()-d(a.win,"border-right-width")-a.rail.width:d(a.win,"border-left-width")),f=a.opt.railoffset;f&&(f.top&&(c+=f.top),a.rail.align&&
f.left&&(e+=f.left));a.railslocked||a.rail.css({top:c,left:e,height:(b?b.h:a.win.innerHeight())-(a.opt.railpadding.top+a.opt.railpadding.bottom)});a.zoom&&a.zoom.css({top:c+1,left:1==a.rail.align?e-20:e+a.rail.width+4});if(a.railh&&!a.railslocked){c=g.top;e=g.left;if(f=a.opt.railhoffset)f.top&&(c+=f.top),f.left&&(e+=f.left);b=a.railh.align?c+d(a.win,"border-top-width",!0)+a.win.innerHeight()-a.railh.height:c+d(a.win,"border-top-width",!0);e+=d(a.win,"border-left-width");a.railh.css({top:b-(a.opt.railpadding.top+
a.opt.railpadding.bottom),left:e,width:a.railh.width})}}};this.doRailClick=function(b,g,c){var e;a.railslocked||(a.cancelEvent(b),g?(g=c?a.doScrollLeft:a.doScrollTop,e=c?(b.pageX-a.railh.offset().left-a.cursorwidth/2)*a.scrollratio.x:(b.pageY-a.rail.offset().top-a.cursorheight/2)*a.scrollratio.y,g(e)):(g=c?a.doScrollLeftBy:a.doScrollBy,e=c?a.scroll.x:a.scroll.y,b=c?b.pageX-a.railh.offset().left:b.pageY-a.rail.offset().top,c=c?a.view.w:a.view.h,g(e>=b?c:-c)))};a.hasanimationframe=s;a.hascancelanimationframe=
t;a.hasanimationframe?a.hascancelanimationframe||(t=function(){a.cancelAnimationFrame=!0}):(s=function(a){return setTimeout(a,15-Math.floor(+new Date/1E3)%16)},t=clearInterval);this.init=function(){a.saved.css=[];if(e.isie7mobile||e.isoperamini)return!0;e.hasmstouch&&a.css(a.ispage?f("html"):a.win,{"-ms-touch-action":"none"});a.zindex="auto";a.zindex=a.ispage||"auto"!=a.opt.zindex?a.opt.zindex:m()||"auto";!a.ispage&&"auto"!=a.zindex&&a.zindex>x&&(x=a.zindex);a.isie&&0==a.zindex&&"auto"==a.opt.zindex&&
(a.zindex="auto");if(!a.ispage||!e.cantouch&&!e.isieold&&!e.isie9mobile){var b=a.docscroll;a.ispage&&(b=a.haswrapper?a.win:a.doc);e.isie9mobile||a.css(b,{"overflow-y":"hidden"});a.ispage&&e.isie7&&("BODY"==a.doc[0].nodeName?a.css(f("html"),{"overflow-y":"hidden"}):"HTML"==a.doc[0].nodeName&&a.css(f("body"),{"overflow-y":"hidden"}));!e.isios||a.ispage||a.haswrapper||a.css(f("body"),{"-webkit-overflow-scrolling":"touch"});var g=f(document.createElement("div"));g.css({position:"relative",top:0,"float":"right",
width:a.opt.cursorwidth,height:"0px","background-color":a.opt.cursorcolor,border:a.opt.cursorborder,"background-clip":"padding-box","-webkit-border-radius":a.opt.cursorborderradius,"-moz-border-radius":a.opt.cursorborderradius,"border-radius":a.opt.cursorborderradius});g.hborder=parseFloat(g.outerHeight()-g.innerHeight());g.addClass("nicescroll-cursors");a.cursor=g;var c=f(document.createElement("div"));c.attr("id",a.id);c.addClass("nicescroll-rails nicescroll-rails-vr");var d,h,k=["left","right",
"top","bottom"],J;for(J in k)h=k[J],(d=a.opt.railpadding[h])?c.css("padding-"+h,d+"px"):a.opt.railpadding[h]=0;c.append(g);c.width=Math.max(parseFloat(a.opt.cursorwidth),g.outerWidth());c.css({width:c.width+"px",zIndex:a.zindex,background:a.opt.background,cursor:"default"});c.visibility=!0;c.scrollable=!0;c.align="left"==a.opt.railalign?0:1;a.rail=c;g=a.rail.drag=!1;!a.opt.boxzoom||a.ispage||e.isieold||(g=document.createElement("div"),a.bind(g,"click",a.doZoom),a.bind(g,"mouseenter",function(){a.zoom.css("opacity",
a.opt.cursoropacitymax)}),a.bind(g,"mouseleave",function(){a.zoom.css("opacity",a.opt.cursoropacitymin)}),a.zoom=f(g),a.zoom.css({cursor:"pointer","z-index":a.zindex,backgroundImage:"url("+a.opt.scriptpath+"zoomico.png)",height:18,width:18,backgroundPosition:"0px 0px"}),a.opt.dblclickzoom&&a.bind(a.win,"dblclick",a.doZoom),e.cantouch&&a.opt.gesturezoom&&(a.ongesturezoom=function(b){1.5<b.scale&&a.doZoomIn(b);.8>b.scale&&a.doZoomOut(b);return a.cancelEvent(b)},a.bind(a.win,"gestureend",a.ongesturezoom)));
a.railh=!1;var l;a.opt.horizrailenabled&&(a.css(b,{"overflow-x":"hidden"}),g=f(document.createElement("div")),g.css({position:"absolute",top:0,height:a.opt.cursorwidth,width:"0px","background-color":a.opt.cursorcolor,border:a.opt.cursorborder,"background-clip":"padding-box","-webkit-border-radius":a.opt.cursorborderradius,"-moz-border-radius":a.opt.cursorborderradius,"border-radius":a.opt.cursorborderradius}),e.isieold&&g.css({overflow:"hidden"}),g.wborder=parseFloat(g.outerWidth()-g.innerWidth()),
g.addClass("nicescroll-cursors"),a.cursorh=g,l=f(document.createElement("div")),l.attr("id",a.id+"-hr"),l.addClass("nicescroll-rails nicescroll-rails-hr"),l.height=Math.max(parseFloat(a.opt.cursorwidth),g.outerHeight()),l.css({height:l.height+"px",zIndex:a.zindex,background:a.opt.background}),l.append(g),l.visibility=!0,l.scrollable=!0,l.align="top"==a.opt.railvalign?0:1,a.railh=l,a.railh.drag=!1);a.ispage?(c.css({position:"fixed",top:"0px",height:"100%"}),c.align?c.css({right:"0px"}):c.css({left:"0px"}),
a.body.append(c),a.railh&&(l.css({position:"fixed",left:"0px",width:"100%"}),l.align?l.css({bottom:"0px"}):l.css({top:"0px"}),a.body.append(l))):(a.ishwscroll?("static"==a.win.css("position")&&a.css(a.win,{position:"relative"}),b="HTML"==a.win[0].nodeName?a.body:a.win,f(b).scrollTop(0).scrollLeft(0),a.zoom&&(a.zoom.css({position:"absolute",top:1,right:0,"margin-right":c.width+4}),b.append(a.zoom)),c.css({position:"absolute",top:0}),c.align?c.css({right:0}):c.css({left:0}),b.append(c),l&&(l.css({position:"absolute",
left:0,bottom:0}),l.align?l.css({bottom:0}):l.css({top:0}),b.append(l))):(a.isfixed="fixed"==a.win.css("position"),b=a.isfixed?"fixed":"absolute",a.isfixed||(a.viewport=a.getViewport(a.win[0])),a.viewport&&(a.body=a.viewport,0==/fixed|absolute/.test(a.viewport.css("position"))&&a.css(a.viewport,{position:"relative"})),c.css({position:b}),a.zoom&&a.zoom.css({position:b}),a.updateScrollBar(),a.body.append(c),a.zoom&&a.body.append(a.zoom),a.railh&&(l.css({position:b}),a.body.append(l))),e.isios&&a.css(a.win,
{"-webkit-tap-highlight-color":"rgba(0,0,0,0)","-webkit-touch-callout":"none"}),e.isie&&a.opt.disableoutline&&a.win.attr("hideFocus","true"),e.iswebkit&&a.opt.disableoutline&&a.win.css({outline:"none"}));!1===a.opt.autohidemode?(a.autohidedom=!1,a.rail.css({opacity:a.opt.cursoropacitymax}),a.railh&&a.railh.css({opacity:a.opt.cursoropacitymax})):!0===a.opt.autohidemode||"leave"===a.opt.autohidemode?(a.autohidedom=f().add(a.rail),e.isie8&&(a.autohidedom=a.autohidedom.add(a.cursor)),a.railh&&(a.autohidedom=
a.autohidedom.add(a.railh)),a.railh&&e.isie8&&(a.autohidedom=a.autohidedom.add(a.cursorh))):"scroll"==a.opt.autohidemode?(a.autohidedom=f().add(a.rail),a.railh&&(a.autohidedom=a.autohidedom.add(a.railh))):"cursor"==a.opt.autohidemode?(a.autohidedom=f().add(a.cursor),a.railh&&(a.autohidedom=a.autohidedom.add(a.cursorh))):"hidden"==a.opt.autohidemode&&(a.autohidedom=!1,a.hide(),a.railslocked=!1);if(e.isie9mobile)a.scrollmom=new L(a),a.onmangotouch=function(){var b=a.getScrollTop(),c=a.getScrollLeft();
if(b==a.scrollmom.lastscrolly&&c==a.scrollmom.lastscrollx)return!0;var g=b-a.mangotouch.sy,e=c-a.mangotouch.sx;if(0!=Math.round(Math.sqrt(Math.pow(e,2)+Math.pow(g,2)))){var d=0>g?-1:1,f=0>e?-1:1,q=+new Date;a.mangotouch.lazy&&clearTimeout(a.mangotouch.lazy);80<q-a.mangotouch.tm||a.mangotouch.dry!=d||a.mangotouch.drx!=f?(a.scrollmom.stop(),a.scrollmom.reset(c,b),a.mangotouch.sy=b,a.mangotouch.ly=b,a.mangotouch.sx=c,a.mangotouch.lx=c,a.mangotouch.dry=d,a.mangotouch.drx=f,a.mangotouch.tm=q):(a.scrollmom.stop(),
a.scrollmom.update(a.mangotouch.sx-e,a.mangotouch.sy-g),a.mangotouch.tm=q,g=Math.max(Math.abs(a.mangotouch.ly-b),Math.abs(a.mangotouch.lx-c)),a.mangotouch.ly=b,a.mangotouch.lx=c,2<g&&(a.mangotouch.lazy=setTimeout(function(){a.mangotouch.lazy=!1;a.mangotouch.dry=0;a.mangotouch.drx=0;a.mangotouch.tm=0;a.scrollmom.doMomentum(30)},100)))}},c=a.getScrollTop(),l=a.getScrollLeft(),a.mangotouch={sy:c,ly:c,dry:0,sx:l,lx:l,drx:0,lazy:!1,tm:0},a.bind(a.docscroll,"scroll",a.onmangotouch);else{if(e.cantouch||
a.istouchcapable||a.opt.touchbehavior||e.hasmstouch){a.scrollmom=new L(a);a.ontouchstart=function(b){if(b.pointerType&&2!=b.pointerType&&"touch"!=b.pointerType)return!1;a.hasmoving=!1;if(!a.railslocked){var c;if(e.hasmstouch)for(c=b.target?b.target:!1;c;){var g=f(c).getNiceScroll();if(0<g.length&&g[0].me==a.me)break;if(0<g.length)return!1;if("DIV"==c.nodeName&&c.id==a.id)break;c=c.parentNode?c.parentNode:!1}a.cancelScroll();if((c=a.getTarget(b))&&/INPUT/i.test(c.nodeName)&&/range/i.test(c.type))return a.stopPropagation(b);
!("clientX"in b)&&"changedTouches"in b&&(b.clientX=b.changedTouches[0].clientX,b.clientY=b.changedTouches[0].clientY);a.forcescreen&&(g=b,b={original:b.original?b.original:b},b.clientX=g.screenX,b.clientY=g.screenY);a.rail.drag={x:b.clientX,y:b.clientY,sx:a.scroll.x,sy:a.scroll.y,st:a.getScrollTop(),sl:a.getScrollLeft(),pt:2,dl:!1};if(a.ispage||!a.opt.directionlockdeadzone)a.rail.drag.dl="f";else{var g=f(window).width(),d=f(window).height(),q=Math.max(document.body.scrollWidth,document.documentElement.scrollWidth),
h=Math.max(document.body.scrollHeight,document.documentElement.scrollHeight),d=Math.max(0,h-d),g=Math.max(0,q-g);a.rail.drag.ck=!a.rail.scrollable&&a.railh.scrollable?0<d?"v":!1:a.rail.scrollable&&!a.railh.scrollable?0<g?"h":!1:!1;a.rail.drag.ck||(a.rail.drag.dl="f")}a.opt.touchbehavior&&a.isiframe&&e.isie&&(g=a.win.position(),a.rail.drag.x+=g.left,a.rail.drag.y+=g.top);a.hasmoving=!1;a.lastmouseup=!1;a.scrollmom.reset(b.clientX,b.clientY);if(!e.cantouch&&!this.istouchcapable&&!b.pointerType){if(!c||
!/INPUT|SELECT|TEXTAREA/i.test(c.nodeName))return!a.ispage&&e.hasmousecapture&&c.setCapture(),a.opt.touchbehavior?(c.onclick&&!c._onclick&&(c._onclick=c.onclick,c.onclick=function(b){if(a.hasmoving)return!1;c._onclick.call(this,b)}),a.cancelEvent(b)):a.stopPropagation(b);/SUBMIT|CANCEL|BUTTON/i.test(f(c).attr("type"))&&(pc={tg:c,click:!1},a.preventclick=pc)}}};a.ontouchend=function(b){if(!a.rail.drag)return!0;if(2==a.rail.drag.pt){if(b.pointerType&&2!=b.pointerType&&"touch"!=b.pointerType)return!1;
a.scrollmom.doMomentum();a.rail.drag=!1;if(a.hasmoving&&(a.lastmouseup=!0,a.hideCursor(),e.hasmousecapture&&document.releaseCapture(),!e.cantouch))return a.cancelEvent(b)}else if(1==a.rail.drag.pt)return a.onmouseup(b)};var n=a.opt.touchbehavior&&a.isiframe&&!e.hasmousecapture;a.ontouchmove=function(b,c){if(!a.rail.drag||b.targetTouches&&a.opt.preventmultitouchscrolling&&1<b.targetTouches.length||b.pointerType&&2!=b.pointerType&&"touch"!=b.pointerType)return!1;if(2==a.rail.drag.pt){if(e.cantouch&&
e.isios&&"undefined"==typeof b.original)return!0;a.hasmoving=!0;a.preventclick&&!a.preventclick.click&&(a.preventclick.click=a.preventclick.tg.onclick||!1,a.preventclick.tg.onclick=a.onpreventclick);b=f.extend({original:b},b);"changedTouches"in b&&(b.clientX=b.changedTouches[0].clientX,b.clientY=b.changedTouches[0].clientY);if(a.forcescreen){var g=b;b={original:b.original?b.original:b};b.clientX=g.screenX;b.clientY=g.screenY}var d,g=d=0;n&&!c&&(d=a.win.position(),g=-d.left,d=-d.top);var q=b.clientY+
d;d=q-a.rail.drag.y;var h=b.clientX+g,u=h-a.rail.drag.x,k=a.rail.drag.st-d;a.ishwscroll&&a.opt.bouncescroll?0>k?k=Math.round(k/2):k>a.page.maxh&&(k=a.page.maxh+Math.round((k-a.page.maxh)/2)):(0>k&&(q=k=0),k>a.page.maxh&&(k=a.page.maxh,q=0));var l;a.railh&&a.railh.scrollable&&(l=a.isrtlmode?u-a.rail.drag.sl:a.rail.drag.sl-u,a.ishwscroll&&a.opt.bouncescroll?0>l?l=Math.round(l/2):l>a.page.maxw&&(l=a.page.maxw+Math.round((l-a.page.maxw)/2)):(0>l&&(h=l=0),l>a.page.maxw&&(l=a.page.maxw,h=0)));g=!1;if(a.rail.drag.dl)g=
!0,"v"==a.rail.drag.dl?l=a.rail.drag.sl:"h"==a.rail.drag.dl&&(k=a.rail.drag.st);else{d=Math.abs(d);var u=Math.abs(u),z=a.opt.directionlockdeadzone;if("v"==a.rail.drag.ck){if(d>z&&u<=.3*d)return a.rail.drag=!1,!0;u>z&&(a.rail.drag.dl="f",f("body").scrollTop(f("body").scrollTop()))}else if("h"==a.rail.drag.ck){if(u>z&&d<=.3*u)return a.rail.drag=!1,!0;d>z&&(a.rail.drag.dl="f",f("body").scrollLeft(f("body").scrollLeft()))}}a.synched("touchmove",function(){a.rail.drag&&2==a.rail.drag.pt&&(a.prepareTransition&&
a.prepareTransition(0),a.rail.scrollable&&a.setScrollTop(k),a.scrollmom.update(h,q),a.railh&&a.railh.scrollable?(a.setScrollLeft(l),a.showCursor(k,l)):a.showCursor(k),e.isie10&&document.selection.clear())});e.ischrome&&a.istouchcapable&&(g=!1);if(g)return a.cancelEvent(b)}else if(1==a.rail.drag.pt)return a.onmousemove(b)}}a.onmousedown=function(b,c){if(!a.rail.drag||1==a.rail.drag.pt){if(a.railslocked)return a.cancelEvent(b);a.cancelScroll();a.rail.drag={x:b.clientX,y:b.clientY,sx:a.scroll.x,sy:a.scroll.y,
pt:1,hr:!!c};var g=a.getTarget(b);!a.ispage&&e.hasmousecapture&&g.setCapture();a.isiframe&&!e.hasmousecapture&&(a.saved.csspointerevents=a.doc.css("pointer-events"),a.css(a.doc,{"pointer-events":"none"}));a.hasmoving=!1;return a.cancelEvent(b)}};a.onmouseup=function(b){if(a.rail.drag){if(1!=a.rail.drag.pt)return!0;e.hasmousecapture&&document.releaseCapture();a.isiframe&&!e.hasmousecapture&&a.doc.css("pointer-events",a.saved.csspointerevents);a.rail.drag=!1;a.hasmoving&&a.triggerScrollEnd();return a.cancelEvent(b)}};
a.onmousemove=function(b){if(a.rail.drag&&1==a.rail.drag.pt){if(e.ischrome&&0==b.which)return a.onmouseup(b);a.cursorfreezed=!0;a.hasmoving=!0;if(a.rail.drag.hr){a.scroll.x=a.rail.drag.sx+(b.clientX-a.rail.drag.x);0>a.scroll.x&&(a.scroll.x=0);var c=a.scrollvaluemaxw;a.scroll.x>c&&(a.scroll.x=c)}else a.scroll.y=a.rail.drag.sy+(b.clientY-a.rail.drag.y),0>a.scroll.y&&(a.scroll.y=0),c=a.scrollvaluemax,a.scroll.y>c&&(a.scroll.y=c);a.synched("mousemove",function(){a.rail.drag&&1==a.rail.drag.pt&&(a.showCursor(),
a.rail.drag.hr?a.hasreversehr?a.doScrollLeft(a.scrollvaluemaxw-Math.round(a.scroll.x*a.scrollratio.x),a.opt.cursordragspeed):a.doScrollLeft(Math.round(a.scroll.x*a.scrollratio.x),a.opt.cursordragspeed):a.doScrollTop(Math.round(a.scroll.y*a.scrollratio.y),a.opt.cursordragspeed))});return a.cancelEvent(b)}};if(e.cantouch||a.opt.touchbehavior)a.onpreventclick=function(b){if(a.preventclick)return a.preventclick.tg.onclick=a.preventclick.click,a.preventclick=!1,a.cancelEvent(b)},a.bind(a.win,"mousedown",
a.ontouchstart),a.onclick=e.isios?!1:function(b){return a.lastmouseup?(a.lastmouseup=!1,a.cancelEvent(b)):!0},a.opt.grabcursorenabled&&e.cursorgrabvalue&&(a.css(a.ispage?a.doc:a.win,{cursor:e.cursorgrabvalue}),a.css(a.rail,{cursor:e.cursorgrabvalue}));else{var p=function(b){if(a.selectiondrag){if(b){var c=a.win.outerHeight();b=b.pageY-a.selectiondrag.top;0<b&&b<c&&(b=0);b>=c&&(b-=c);a.selectiondrag.df=b}0!=a.selectiondrag.df&&(a.doScrollBy(2*-Math.floor(a.selectiondrag.df/6)),a.debounced("doselectionscroll",
function(){p()},50))}};a.hasTextSelected="getSelection"in document?function(){return 0<document.getSelection().rangeCount}:"selection"in document?function(){return"None"!=document.selection.type}:function(){return!1};a.onselectionstart=function(b){a.ispage||(a.selectiondrag=a.win.offset())};a.onselectionend=function(b){a.selectiondrag=!1};a.onselectiondrag=function(b){a.selectiondrag&&a.hasTextSelected()&&a.debounced("selectionscroll",function(){p(b)},250)}}e.hasw3ctouch?(a.css(a.rail,{"touch-action":"none"}),
a.css(a.cursor,{"touch-action":"none"}),a.bind(a.win,"pointerdown",a.ontouchstart),a.bind(document,"pointerup",a.ontouchend),a.bind(document,"pointermove",a.ontouchmove)):e.hasmstouch?(a.css(a.rail,{"-ms-touch-action":"none"}),a.css(a.cursor,{"-ms-touch-action":"none"}),a.bind(a.win,"MSPointerDown",a.ontouchstart),a.bind(document,"MSPointerUp",a.ontouchend),a.bind(document,"MSPointerMove",a.ontouchmove),a.bind(a.cursor,"MSGestureHold",function(a){a.preventDefault()}),a.bind(a.cursor,"contextmenu",
function(a){a.preventDefault()})):this.istouchcapable&&(a.bind(a.win,"touchstart",a.ontouchstart),a.bind(document,"touchend",a.ontouchend),a.bind(document,"touchcancel",a.ontouchend),a.bind(document,"touchmove",a.ontouchmove));if(a.opt.cursordragontouch||!e.cantouch&&!a.opt.touchbehavior)a.rail.css({cursor:"default"}),a.railh&&a.railh.css({cursor:"default"}),a.jqbind(a.rail,"mouseenter",function(){if(!a.ispage&&!a.win.is(":visible"))return!1;a.canshowonmouseevent&&a.showCursor();a.rail.active=!0}),
a.jqbind(a.rail,"mouseleave",function(){a.rail.active=!1;a.rail.drag||a.hideCursor()}),a.opt.sensitiverail&&(a.bind(a.rail,"click",function(b){a.doRailClick(b,!1,!1)}),a.bind(a.rail,"dblclick",function(b){a.doRailClick(b,!0,!1)}),a.bind(a.cursor,"click",function(b){a.cancelEvent(b)}),a.bind(a.cursor,"dblclick",function(b){a.cancelEvent(b)})),a.railh&&(a.jqbind(a.railh,"mouseenter",function(){if(!a.ispage&&!a.win.is(":visible"))return!1;a.canshowonmouseevent&&a.showCursor();a.rail.active=!0}),a.jqbind(a.railh,
"mouseleave",function(){a.rail.active=!1;a.rail.drag||a.hideCursor()}),a.opt.sensitiverail&&(a.bind(a.railh,"click",function(b){a.doRailClick(b,!1,!0)}),a.bind(a.railh,"dblclick",function(b){a.doRailClick(b,!0,!0)}),a.bind(a.cursorh,"click",function(b){a.cancelEvent(b)}),a.bind(a.cursorh,"dblclick",function(b){a.cancelEvent(b)})));e.cantouch||a.opt.touchbehavior?(a.bind(e.hasmousecapture?a.win:document,"mouseup",a.ontouchend),a.bind(document,"mousemove",a.ontouchmove),a.onclick&&a.bind(document,"click",
a.onclick),a.opt.cursordragontouch&&(a.bind(a.cursor,"mousedown",a.onmousedown),a.bind(a.cursor,"mouseup",a.onmouseup),a.cursorh&&a.bind(a.cursorh,"mousedown",function(b){a.onmousedown(b,!0)}),a.cursorh&&a.bind(a.cursorh,"mouseup",a.onmouseup))):(a.bind(e.hasmousecapture?a.win:document,"mouseup",a.onmouseup),a.bind(document,"mousemove",a.onmousemove),a.onclick&&a.bind(document,"click",a.onclick),a.bind(a.cursor,"mousedown",a.onmousedown),a.bind(a.cursor,"mouseup",a.onmouseup),a.railh&&(a.bind(a.cursorh,
"mousedown",function(b){a.onmousedown(b,!0)}),a.bind(a.cursorh,"mouseup",a.onmouseup)),!a.ispage&&a.opt.enablescrollonselection&&(a.bind(a.win[0],"mousedown",a.onselectionstart),a.bind(document,"mouseup",a.onselectionend),a.bind(a.cursor,"mouseup",a.onselectionend),a.cursorh&&a.bind(a.cursorh,"mouseup",a.onselectionend),a.bind(document,"mousemove",a.onselectiondrag)),a.zoom&&(a.jqbind(a.zoom,"mouseenter",function(){a.canshowonmouseevent&&a.showCursor();a.rail.active=!0}),a.jqbind(a.zoom,"mouseleave",
function(){a.rail.active=!1;a.rail.drag||a.hideCursor()})));a.opt.enablemousewheel&&(a.isiframe||a.bind(e.isie&&a.ispage?document:a.win,"mousewheel",a.onmousewheel),a.bind(a.rail,"mousewheel",a.onmousewheel),a.railh&&a.bind(a.railh,"mousewheel",a.onmousewheelhr));a.ispage||e.cantouch||/HTML|^BODY/.test(a.win[0].nodeName)||(a.win.attr("tabindex")||a.win.attr({tabindex:N++}),a.jqbind(a.win,"focus",function(b){y=a.getTarget(b).id||!0;a.hasfocus=!0;a.canshowonmouseevent&&a.noticeCursor()}),a.jqbind(a.win,
"blur",function(b){y=!1;a.hasfocus=!1}),a.jqbind(a.win,"mouseenter",function(b){D=a.getTarget(b).id||!0;a.hasmousefocus=!0;a.canshowonmouseevent&&a.noticeCursor()}),a.jqbind(a.win,"mouseleave",function(){D=!1;a.hasmousefocus=!1;a.rail.drag||a.hideCursor()}))}a.onkeypress=function(b){if(a.railslocked&&0==a.page.maxh)return!0;b=b?b:window.e;var c=a.getTarget(b);if(c&&/INPUT|TEXTAREA|SELECT|OPTION/.test(c.nodeName)&&(!c.getAttribute("type")&&!c.type||!/submit|button|cancel/i.tp)||f(c).attr("contenteditable"))return!0;
if(a.hasfocus||a.hasmousefocus&&!y||a.ispage&&!y&&!D){c=b.keyCode;if(a.railslocked&&27!=c)return a.cancelEvent(b);var g=b.ctrlKey||!1,d=b.shiftKey||!1,e=!1;switch(c){case 38:case 63233:a.doScrollBy(72);e=!0;break;case 40:case 63235:a.doScrollBy(-72);e=!0;break;case 37:case 63232:a.railh&&(g?a.doScrollLeft(0):a.doScrollLeftBy(72),e=!0);break;case 39:case 63234:a.railh&&(g?a.doScrollLeft(a.page.maxw):a.doScrollLeftBy(-72),e=!0);break;case 33:case 63276:a.doScrollBy(a.view.h);e=!0;break;case 34:case 63277:a.doScrollBy(-a.view.h);
e=!0;break;case 36:case 63273:a.railh&&g?a.doScrollPos(0,0):a.doScrollTo(0);e=!0;break;case 35:case 63275:a.railh&&g?a.doScrollPos(a.page.maxw,a.page.maxh):a.doScrollTo(a.page.maxh);e=!0;break;case 32:a.opt.spacebarenabled&&(d?a.doScrollBy(a.view.h):a.doScrollBy(-a.view.h),e=!0);break;case 27:a.zoomactive&&(a.doZoom(),e=!0)}if(e)return a.cancelEvent(b)}};a.opt.enablekeyboard&&a.bind(document,e.isopera&&!e.isopera12?"keypress":"keydown",a.onkeypress);a.bind(document,"keydown",function(b){b.ctrlKey&&
(a.wheelprevented=!0)});a.bind(document,"keyup",function(b){b.ctrlKey||(a.wheelprevented=!1)});a.bind(window,"blur",function(b){a.wheelprevented=!1});a.bind(window,"resize",a.lazyResize);a.bind(window,"orientationchange",a.lazyResize);a.bind(window,"load",a.lazyResize);if(e.ischrome&&!a.ispage&&!a.haswrapper){var r=a.win.attr("style"),c=parseFloat(a.win.css("width"))+1;a.win.css("width",c);a.synched("chromefix",function(){a.win.attr("style",r)})}a.onAttributeChange=function(b){a.lazyResize(a.isieold?
250:30)};!1!==v&&(a.observerbody=new v(function(b){b.forEach(function(b){if("attributes"==b.type)return f("body").hasClass("modal-open")?a.hide():a.show()});if(document.body.scrollHeight!=a.page.maxh)return a.lazyResize(30)}),a.observerbody.observe(document.body,{childList:!0,subtree:!0,characterData:!1,attributes:!0,attributeFilter:["class"]}));a.ispage||a.haswrapper||(!1!==v?(a.observer=new v(function(b){b.forEach(a.onAttributeChange)}),a.observer.observe(a.win[0],{childList:!0,characterData:!1,
attributes:!0,subtree:!1}),a.observerremover=new v(function(b){b.forEach(function(b){if(0<b.removedNodes.length)for(var c in b.removedNodes)if(a&&b.removedNodes[c]==a.win[0])return a.remove()})}),a.observerremover.observe(a.win[0].parentNode,{childList:!0,characterData:!1,attributes:!1,subtree:!1})):(a.bind(a.win,e.isie&&!e.isie9?"propertychange":"DOMAttrModified",a.onAttributeChange),e.isie9&&a.win[0].attachEvent("onpropertychange",a.onAttributeChange),a.bind(a.win,"DOMNodeRemoved",function(b){b.target==
a.win[0]&&a.remove()})));!a.ispage&&a.opt.boxzoom&&a.bind(window,"resize",a.resizeZoom);a.istextarea&&a.bind(a.win,"mouseup",a.lazyResize);a.lazyResize(30)}if("IFRAME"==this.doc[0].nodeName){var M=function(){a.iframexd=!1;var b;try{b="contentDocument"in this?this.contentDocument:this.contentWindow.document}catch(c){a.iframexd=!0,b=!1}if(a.iframexd)return"console"in window&&console.log("NiceScroll error: policy restriced iframe"),!0;a.forcescreen=!0;a.isiframe&&(a.iframe={doc:f(b),html:a.doc.contents().find("html")[0],
body:a.doc.contents().find("body")[0]},a.getContentSize=function(){return{w:Math.max(a.iframe.html.scrollWidth,a.iframe.body.scrollWidth),h:Math.max(a.iframe.html.scrollHeight,a.iframe.body.scrollHeight)}},a.docscroll=f(a.iframe.body));if(!e.isios&&a.opt.iframeautoresize&&!a.isiframe){a.win.scrollTop(0);a.doc.height("");var g=Math.max(b.getElementsByTagName("html")[0].scrollHeight,b.body.scrollHeight);a.doc.height(g)}a.lazyResize(30);e.isie7&&a.css(f(a.iframe.html),{"overflow-y":"hidden"});a.css(f(a.iframe.body),
{"overflow-y":"hidden"});e.isios&&a.haswrapper&&a.css(f(b.body),{"-webkit-transform":"translate3d(0,0,0)"});"contentWindow"in this?a.bind(this.contentWindow,"scroll",a.onscroll):a.bind(b,"scroll",a.onscroll);a.opt.enablemousewheel&&a.bind(b,"mousewheel",a.onmousewheel);a.opt.enablekeyboard&&a.bind(b,e.isopera?"keypress":"keydown",a.onkeypress);if(e.cantouch||a.opt.touchbehavior)a.bind(b,"mousedown",a.ontouchstart),a.bind(b,"mousemove",function(b){return a.ontouchmove(b,!0)}),a.opt.grabcursorenabled&&
e.cursorgrabvalue&&a.css(f(b.body),{cursor:e.cursorgrabvalue});a.bind(b,"mouseup",a.ontouchend);a.zoom&&(a.opt.dblclickzoom&&a.bind(b,"dblclick",a.doZoom),a.ongesturezoom&&a.bind(b,"gestureend",a.ongesturezoom))};this.doc[0].readyState&&"complete"==this.doc[0].readyState&&setTimeout(function(){M.call(a.doc[0],!1)},500);a.bind(this.doc,"load",M)}};this.showCursor=function(b,c){a.cursortimeout&&(clearTimeout(a.cursortimeout),a.cursortimeout=0);if(a.rail){a.autohidedom&&(a.autohidedom.stop().css({opacity:a.opt.cursoropacitymax}),
a.cursoractive=!0);a.rail.drag&&1==a.rail.drag.pt||("undefined"!=typeof b&&!1!==b&&(a.scroll.y=Math.round(1*b/a.scrollratio.y)),"undefined"!=typeof c&&(a.scroll.x=Math.round(1*c/a.scrollratio.x)));a.cursor.css({height:a.cursorheight,top:a.scroll.y});if(a.cursorh){var d=a.hasreversehr?a.scrollvaluemaxw-a.scroll.x:a.scroll.x;!a.rail.align&&a.rail.visibility?a.cursorh.css({width:a.cursorwidth,left:d+a.rail.width}):a.cursorh.css({width:a.cursorwidth,left:d});a.cursoractive=!0}a.zoom&&a.zoom.stop().css({opacity:a.opt.cursoropacitymax})}};
this.hideCursor=function(b){a.cursortimeout||!a.rail||!a.autohidedom||a.hasmousefocus&&"leave"==a.opt.autohidemode||(a.cursortimeout=setTimeout(function(){a.rail.active&&a.showonmouseevent||(a.autohidedom.stop().animate({opacity:a.opt.cursoropacitymin}),a.zoom&&a.zoom.stop().animate({opacity:a.opt.cursoropacitymin}),a.cursoractive=!1);a.cursortimeout=0},b||a.opt.hidecursordelay))};this.noticeCursor=function(b,c,d){a.showCursor(c,d);a.rail.active||a.hideCursor(b)};this.getContentSize=a.ispage?function(){return{w:Math.max(document.body.scrollWidth,
document.documentElement.scrollWidth),h:Math.max(document.body.scrollHeight,document.documentElement.scrollHeight)}}:a.haswrapper?function(){return{w:a.doc.outerWidth()+parseInt(a.win.css("paddingLeft"))+parseInt(a.win.css("paddingRight")),h:a.doc.outerHeight()+parseInt(a.win.css("paddingTop"))+parseInt(a.win.css("paddingBottom"))}}:function(){return{w:a.docscroll[0].scrollWidth,h:a.docscroll[0].scrollHeight}};this.onResize=function(b,c){if(!a||!a.win)return!1;if(!a.haswrapper&&!a.ispage){if("none"==
a.win.css("display"))return a.visibility&&a.hideRail().hideRailHr(),!1;a.hidden||a.visibility||a.showRail().showRailHr()}var d=a.page.maxh,e=a.page.maxw,f=a.view.h,h=a.view.w;a.view={w:a.ispage?a.win.width():parseInt(a.win[0].clientWidth),h:a.ispage?a.win.height():parseInt(a.win[0].clientHeight)};a.page=c?c:a.getContentSize();a.page.maxh=Math.max(0,a.page.h-a.view.h);a.page.maxw=Math.max(0,a.page.w-a.view.w);if(a.page.maxh==d&&a.page.maxw==e&&a.view.w==h&&a.view.h==f){if(a.ispage)return a;d=a.win.offset();
if(a.lastposition&&(e=a.lastposition,e.top==d.top&&e.left==d.left))return a;a.lastposition=d}0==a.page.maxh?(a.hideRail(),a.scrollvaluemax=0,a.scroll.y=0,a.scrollratio.y=0,a.cursorheight=0,a.setScrollTop(0),a.rail.scrollable=!1):(a.page.maxh-=a.opt.railpadding.top+a.opt.railpadding.bottom,a.rail.scrollable=!0);0==a.page.maxw?(a.hideRailHr(),a.scrollvaluemaxw=0,a.scroll.x=0,a.scrollratio.x=0,a.cursorwidth=0,a.setScrollLeft(0),a.railh.scrollable=!1):(a.page.maxw-=a.opt.railpadding.left+a.opt.railpadding.right,
a.railh.scrollable=!0);a.railslocked=a.locked||0==a.page.maxh&&0==a.page.maxw;if(a.railslocked)return a.ispage||a.updateScrollBar(a.view),!1;a.hidden||a.visibility?a.hidden||a.railh.visibility||a.showRailHr():a.showRail().showRailHr();a.istextarea&&a.win.css("resize")&&"none"!=a.win.css("resize")&&(a.view.h-=20);a.cursorheight=Math.min(a.view.h,Math.round(a.view.h/a.page.h*a.view.h));a.cursorheight=a.opt.cursorfixedheight?a.opt.cursorfixedheight:Math.max(a.opt.cursorminheight,a.cursorheight);a.cursorwidth=
Math.min(a.view.w,Math.round(a.view.w/a.page.w*a.view.w));a.cursorwidth=a.opt.cursorfixedheight?a.opt.cursorfixedheight:Math.max(a.opt.cursorminheight,a.cursorwidth);a.scrollvaluemax=a.view.h-a.cursorheight-a.cursor.hborder-(a.opt.railpadding.top+a.opt.railpadding.bottom);a.railh&&(a.railh.width=0<a.page.maxh?a.view.w-a.rail.width:a.view.w,a.scrollvaluemaxw=a.railh.width-a.cursorwidth-a.cursorh.wborder-(a.opt.railpadding.left+a.opt.railpadding.right));a.ispage||a.updateScrollBar(a.view);a.scrollratio=
{x:a.page.maxw/a.scrollvaluemaxw,y:a.page.maxh/a.scrollvaluemax};a.getScrollTop()>a.page.maxh?a.doScrollTop(a.page.maxh):(a.scroll.y=Math.round(a.getScrollTop()*(1/a.scrollratio.y)),a.scroll.x=Math.round(a.getScrollLeft()*(1/a.scrollratio.x)),a.cursoractive&&a.noticeCursor());a.scroll.y&&0==a.getScrollTop()&&a.doScrollTo(Math.floor(a.scroll.y*a.scrollratio.y));return a};this.resize=a.onResize;this.lazyResize=function(b){b=isNaN(b)?30:b;a.debounced("resize",a.resize,b);return a};this.jqbind=function(b,
c,d){a.events.push({e:b,n:c,f:d,q:!0});f(b).bind(c,d)};this.bind=function(b,c,d,f){var h="jquery"in b?b[0]:b;"mousewheel"==c?window.addEventListener||"onwheel"in document?a._bind(h,"wheel",d,f||!1):(b="undefined"!=typeof document.onmousewheel?"mousewheel":"DOMMouseScroll",n(h,b,d,f||!1),"DOMMouseScroll"==b&&n(h,"MozMousePixelScroll",d,f||!1)):h.addEventListener?(e.cantouch&&/mouseup|mousedown|mousemove/.test(c)&&a._bind(h,"mousedown"==c?"touchstart":"mouseup"==c?"touchend":"touchmove",function(a){if(a.touches){if(2>
a.touches.length){var b=a.touches.length?a.touches[0]:a;b.original=a;d.call(this,b)}}else a.changedTouches&&(b=a.changedTouches[0],b.original=a,d.call(this,b))},f||!1),a._bind(h,c,d,f||!1),e.cantouch&&"mouseup"==c&&a._bind(h,"touchcancel",d,f||!1)):a._bind(h,c,function(b){(b=b||window.event||!1)&&b.srcElement&&(b.target=b.srcElement);"pageY"in b||(b.pageX=b.clientX+document.documentElement.scrollLeft,b.pageY=b.clientY+document.documentElement.scrollTop);return!1===d.call(h,b)||!1===f?a.cancelEvent(b):
!0})};e.haseventlistener?(this._bind=function(b,c,d,e){a.events.push({e:b,n:c,f:d,b:e,q:!1});b.addEventListener(c,d,e||!1)},this.cancelEvent=function(a){if(!a)return!1;a=a.original?a.original:a;a.preventDefault();a.stopPropagation();a.preventManipulation&&a.preventManipulation();return!1},this.stopPropagation=function(a){if(!a)return!1;a=a.original?a.original:a;a.stopPropagation();return!1},this._unbind=function(a,c,d,e){a.removeEventListener(c,d,e)}):(this._bind=function(b,c,d,e){a.events.push({e:b,
n:c,f:d,b:e,q:!1});b.attachEvent?b.attachEvent("on"+c,d):b["on"+c]=d},this.cancelEvent=function(a){a=window.event||!1;if(!a)return!1;a.cancelBubble=!0;a.cancel=!0;return a.returnValue=!1},this.stopPropagation=function(a){a=window.event||!1;if(!a)return!1;a.cancelBubble=!0;return!1},this._unbind=function(a,c,d,e){a.detachEvent?a.detachEvent("on"+c,d):a["on"+c]=!1});this.unbindAll=function(){for(var b=0;b<a.events.length;b++){var c=a.events[b];c.q?c.e.unbind(c.n,c.f):a._unbind(c.e,c.n,c.f,c.b)}};this.showRail=
function(){0==a.page.maxh||!a.ispage&&"none"==a.win.css("display")||(a.visibility=!0,a.rail.visibility=!0,a.rail.css("display","block"));return a};this.showRailHr=function(){if(!a.railh)return a;0==a.page.maxw||!a.ispage&&"none"==a.win.css("display")||(a.railh.visibility=!0,a.railh.css("display","block"));return a};this.hideRail=function(){a.visibility=!1;a.rail.visibility=!1;a.rail.css("display","none");return a};this.hideRailHr=function(){if(!a.railh)return a;a.railh.visibility=!1;a.railh.css("display",
"none");return a};this.show=function(){a.hidden=!1;a.railslocked=!1;return a.showRail().showRailHr()};this.hide=function(){a.hidden=!0;a.railslocked=!0;return a.hideRail().hideRailHr()};this.toggle=function(){return a.hidden?a.show():a.hide()};this.remove=function(){a.stop();a.cursortimeout&&clearTimeout(a.cursortimeout);a.doZoomOut();a.unbindAll();e.isie9&&a.win[0].detachEvent("onpropertychange",a.onAttributeChange);!1!==a.observer&&a.observer.disconnect();!1!==a.observerremover&&a.observerremover.disconnect();
!1!==a.observerbody&&a.observerbody.disconnect();a.events=null;a.cursor&&a.cursor.remove();a.cursorh&&a.cursorh.remove();a.rail&&a.rail.remove();a.railh&&a.railh.remove();a.zoom&&a.zoom.remove();for(var b=0;b<a.saved.css.length;b++){var c=a.saved.css[b];c[0].css(c[1],"undefined"==typeof c[2]?"":c[2])}a.saved=!1;a.me.data("__nicescroll","");var d=f.nicescroll;d.each(function(b){if(this&&this.id===a.id){delete d[b];for(var c=++b;c<d.length;c++,b++)d[b]=d[c];d.length--;d.length&&delete d[d.length]}});
for(var h in a)a[h]=null,delete a[h];a=null};this.scrollstart=function(b){this.onscrollstart=b;return a};this.scrollend=function(b){this.onscrollend=b;return a};this.scrollcancel=function(b){this.onscrollcancel=b;return a};this.zoomin=function(b){this.onzoomin=b;return a};this.zoomout=function(b){this.onzoomout=b;return a};this.isScrollable=function(a){a=a.target?a.target:a;if("OPTION"==a.nodeName)return!0;for(;a&&1==a.nodeType&&!/^BODY|HTML/.test(a.nodeName);){var c=f(a),c=c.css("overflowY")||c.css("overflowX")||
c.css("overflow")||"";if(/scroll|auto/.test(c))return a.clientHeight!=a.scrollHeight;a=a.parentNode?a.parentNode:!1}return!1};this.getViewport=function(a){for(a=a&&a.parentNode?a.parentNode:!1;a&&1==a.nodeType&&!/^BODY|HTML/.test(a.nodeName);){var c=f(a);if(/fixed|absolute/.test(c.css("position")))return c;var d=c.css("overflowY")||c.css("overflowX")||c.css("overflow")||"";if(/scroll|auto/.test(d)&&a.clientHeight!=a.scrollHeight||0<c.getNiceScroll().length)return c;a=a.parentNode?a.parentNode:!1}return!1};
this.triggerScrollEnd=function(){if(a.onscrollend){var b=a.getScrollLeft(),c=a.getScrollTop();a.onscrollend.call(a,{type:"scrollend",current:{x:b,y:c},end:{x:b,y:c}})}};this.onmousewheel=function(b){if(!a.wheelprevented){if(a.railslocked)return a.debounced("checkunlock",a.resize,250),!0;if(a.rail.drag)return a.cancelEvent(b);"auto"==a.opt.oneaxismousemode&&0!=b.deltaX&&(a.opt.oneaxismousemode=!1);if(a.opt.oneaxismousemode&&0==b.deltaX&&!a.rail.scrollable)return a.railh&&a.railh.scrollable?a.onmousewheelhr(b):
!0;var c=+new Date,d=!1;a.opt.preservenativescrolling&&a.checkarea+600<c&&(a.nativescrollingarea=a.isScrollable(b),d=!0);a.checkarea=c;if(a.nativescrollingarea)return!0;if(b=p(b,!1,d))a.checkarea=0;return b}};this.onmousewheelhr=function(b){if(!a.wheelprevented){if(a.railslocked||!a.railh.scrollable)return!0;if(a.rail.drag)return a.cancelEvent(b);var c=+new Date,d=!1;a.opt.preservenativescrolling&&a.checkarea+600<c&&(a.nativescrollingarea=a.isScrollable(b),d=!0);a.checkarea=c;return a.nativescrollingarea?
!0:a.railslocked?a.cancelEvent(b):p(b,!0,d)}};this.stop=function(){a.cancelScroll();a.scrollmon&&a.scrollmon.stop();a.cursorfreezed=!1;a.scroll.y=Math.round(a.getScrollTop()*(1/a.scrollratio.y));a.noticeCursor();return a};this.getTransitionSpeed=function(b){var c=Math.round(10*a.opt.scrollspeed);b=Math.min(c,Math.round(b/20*a.opt.scrollspeed));return 20<b?b:0};a.opt.smoothscroll?a.ishwscroll&&e.hastransition&&a.opt.usetransition&&a.opt.smoothscroll?(this.prepareTransition=function(b,c){var d=c?20<
b?b:0:a.getTransitionSpeed(b),f=d?e.prefixstyle+"transform "+d+"ms ease-out":"";a.lasttransitionstyle&&a.lasttransitionstyle==f||(a.lasttransitionstyle=f,a.doc.css(e.transitionstyle,f));return d},this.doScrollLeft=function(b,c){var d=a.scrollrunning?a.newscrolly:a.getScrollTop();a.doScrollPos(b,d,c)},this.doScrollTop=function(b,c){var d=a.scrollrunning?a.newscrollx:a.getScrollLeft();a.doScrollPos(d,b,c)},this.doScrollPos=function(b,c,d){var f=a.getScrollTop(),h=a.getScrollLeft();(0>(a.newscrolly-
f)*(c-f)||0>(a.newscrollx-h)*(b-h))&&a.cancelScroll();0==a.opt.bouncescroll&&(0>c?c=0:c>a.page.maxh&&(c=a.page.maxh),0>b?b=0:b>a.page.maxw&&(b=a.page.maxw));if(a.scrollrunning&&b==a.newscrollx&&c==a.newscrolly)return!1;a.newscrolly=c;a.newscrollx=b;a.newscrollspeed=d||!1;if(a.timer)return!1;a.timer=setTimeout(function(){var d=a.getScrollTop(),f=a.getScrollLeft(),h,k;h=b-f;k=c-d;h=Math.round(Math.sqrt(Math.pow(h,2)+Math.pow(k,2)));h=a.newscrollspeed&&1<a.newscrollspeed?a.newscrollspeed:a.getTransitionSpeed(h);
a.newscrollspeed&&1>=a.newscrollspeed&&(h*=a.newscrollspeed);a.prepareTransition(h,!0);a.timerscroll&&a.timerscroll.tm&&clearInterval(a.timerscroll.tm);0<h&&(!a.scrollrunning&&a.onscrollstart&&a.onscrollstart.call(a,{type:"scrollstart",current:{x:f,y:d},request:{x:b,y:c},end:{x:a.newscrollx,y:a.newscrolly},speed:h}),e.transitionend?a.scrollendtrapped||(a.scrollendtrapped=!0,a.bind(a.doc,e.transitionend,a.onScrollTransitionEnd,!1)):(a.scrollendtrapped&&clearTimeout(a.scrollendtrapped),a.scrollendtrapped=
setTimeout(a.onScrollTransitionEnd,h)),a.timerscroll={bz:new A(d,a.newscrolly,h,0,0,.58,1),bh:new A(f,a.newscrollx,h,0,0,.58,1)},a.cursorfreezed||(a.timerscroll.tm=setInterval(function(){a.showCursor(a.getScrollTop(),a.getScrollLeft())},60)));a.synched("doScroll-set",function(){a.timer=0;a.scrollendtrapped&&(a.scrollrunning=!0);a.setScrollTop(a.newscrolly);a.setScrollLeft(a.newscrollx);if(!a.scrollendtrapped)a.onScrollTransitionEnd()})},50)},this.cancelScroll=function(){if(!a.scrollendtrapped)return!0;
var b=a.getScrollTop(),c=a.getScrollLeft();a.scrollrunning=!1;e.transitionend||clearTimeout(e.transitionend);a.scrollendtrapped=!1;a._unbind(a.doc[0],e.transitionend,a.onScrollTransitionEnd);a.prepareTransition(0);a.setScrollTop(b);a.railh&&a.setScrollLeft(c);a.timerscroll&&a.timerscroll.tm&&clearInterval(a.timerscroll.tm);a.timerscroll=!1;a.cursorfreezed=!1;a.showCursor(b,c);return a},this.onScrollTransitionEnd=function(){a.scrollendtrapped&&a._unbind(a.doc[0],e.transitionend,a.onScrollTransitionEnd);
a.scrollendtrapped=!1;a.prepareTransition(0);a.timerscroll&&a.timerscroll.tm&&clearInterval(a.timerscroll.tm);a.timerscroll=!1;var b=a.getScrollTop(),c=a.getScrollLeft();a.setScrollTop(b);a.railh&&a.setScrollLeft(c);a.noticeCursor(!1,b,c);a.cursorfreezed=!1;0>b?b=0:b>a.page.maxh&&(b=a.page.maxh);0>c?c=0:c>a.page.maxw&&(c=a.page.maxw);if(b!=a.newscrolly||c!=a.newscrollx)return a.doScrollPos(c,b,a.opt.snapbackspeed);a.onscrollend&&a.scrollrunning&&a.triggerScrollEnd();a.scrollrunning=!1}):(this.doScrollLeft=
function(b,c){var d=a.scrollrunning?a.newscrolly:a.getScrollTop();a.doScrollPos(b,d,c)},this.doScrollTop=function(b,c){var d=a.scrollrunning?a.newscrollx:a.getScrollLeft();a.doScrollPos(d,b,c)},this.doScrollPos=function(b,c,d){function e(){if(a.cancelAnimationFrame)return!0;a.scrollrunning=!0;if(n=1-n)return a.timer=s(e)||1;var b=0,c,d,g=d=a.getScrollTop();if(a.dst.ay){g=a.bzscroll?a.dst.py+a.bzscroll.getNow()*a.dst.ay:a.newscrolly;c=g-d;if(0>c&&g<a.newscrolly||0<c&&g>a.newscrolly)g=a.newscrolly;
a.setScrollTop(g);g==a.newscrolly&&(b=1)}else b=1;d=c=a.getScrollLeft();if(a.dst.ax){d=a.bzscroll?a.dst.px+a.bzscroll.getNow()*a.dst.ax:a.newscrollx;c=d-c;if(0>c&&d<a.newscrollx||0<c&&d>a.newscrollx)d=a.newscrollx;a.setScrollLeft(d);d==a.newscrollx&&(b+=1)}else b+=1;2==b?(a.timer=0,a.cursorfreezed=!1,a.bzscroll=!1,a.scrollrunning=!1,0>g?g=0:g>a.page.maxh&&(g=a.page.maxh),0>d?d=0:d>a.page.maxw&&(d=a.page.maxw),d!=a.newscrollx||g!=a.newscrolly?a.doScrollPos(d,g):a.onscrollend&&a.triggerScrollEnd()):
a.timer=s(e)||1}c="undefined"==typeof c||!1===c?a.getScrollTop(!0):c;if(a.timer&&a.newscrolly==c&&a.newscrollx==b)return!0;a.timer&&t(a.timer);a.timer=0;var f=a.getScrollTop(),h=a.getScrollLeft();(0>(a.newscrolly-f)*(c-f)||0>(a.newscrollx-h)*(b-h))&&a.cancelScroll();a.newscrolly=c;a.newscrollx=b;a.bouncescroll&&a.rail.visibility||(0>a.newscrolly?a.newscrolly=0:a.newscrolly>a.page.maxh&&(a.newscrolly=a.page.maxh));a.bouncescroll&&a.railh.visibility||(0>a.newscrollx?a.newscrollx=0:a.newscrollx>a.page.maxw&&
(a.newscrollx=a.page.maxw));a.dst={};a.dst.x=b-h;a.dst.y=c-f;a.dst.px=h;a.dst.py=f;var k=Math.round(Math.sqrt(Math.pow(a.dst.x,2)+Math.pow(a.dst.y,2)));a.dst.ax=a.dst.x/k;a.dst.ay=a.dst.y/k;var l=0,m=k;0==a.dst.x?(l=f,m=c,a.dst.ay=1,a.dst.py=0):0==a.dst.y&&(l=h,m=b,a.dst.ax=1,a.dst.px=0);k=a.getTransitionSpeed(k);d&&1>=d&&(k*=d);a.bzscroll=0<k?a.bzscroll?a.bzscroll.update(m,k):new A(l,m,k,0,1,0,1):!1;if(!a.timer){(f==a.page.maxh&&c>=a.page.maxh||h==a.page.maxw&&b>=a.page.maxw)&&a.checkContentSize();
var n=1;a.cancelAnimationFrame=!1;a.timer=1;a.onscrollstart&&!a.scrollrunning&&a.onscrollstart.call(a,{type:"scrollstart",current:{x:h,y:f},request:{x:b,y:c},end:{x:a.newscrollx,y:a.newscrolly},speed:k});e();(f==a.page.maxh&&c>=f||h==a.page.maxw&&b>=h)&&a.checkContentSize();a.noticeCursor()}},this.cancelScroll=function(){a.timer&&t(a.timer);a.timer=0;a.bzscroll=!1;a.scrollrunning=!1;return a}):(this.doScrollLeft=function(b,c){var d=a.getScrollTop();a.doScrollPos(b,d,c)},this.doScrollTop=function(b,
c){var d=a.getScrollLeft();a.doScrollPos(d,b,c)},this.doScrollPos=function(b,c,d){var e=b>a.page.maxw?a.page.maxw:b;0>e&&(e=0);var f=c>a.page.maxh?a.page.maxh:c;0>f&&(f=0);a.synched("scroll",function(){a.setScrollTop(f);a.setScrollLeft(e)})},this.cancelScroll=function(){});this.doScrollBy=function(b,c){var d=0,d=c?Math.floor((a.scroll.y-b)*a.scrollratio.y):(a.timer?a.newscrolly:a.getScrollTop(!0))-b;if(a.bouncescroll){var e=Math.round(a.view.h/2);d<-e?d=-e:d>a.page.maxh+e&&(d=a.page.maxh+e)}a.cursorfreezed=
!1;e=a.getScrollTop(!0);if(0>d&&0>=e)return a.noticeCursor();if(d>a.page.maxh&&e>=a.page.maxh)return a.checkContentSize(),a.noticeCursor();a.doScrollTop(d)};this.doScrollLeftBy=function(b,c){var d=0,d=c?Math.floor((a.scroll.x-b)*a.scrollratio.x):(a.timer?a.newscrollx:a.getScrollLeft(!0))-b;if(a.bouncescroll){var e=Math.round(a.view.w/2);d<-e?d=-e:d>a.page.maxw+e&&(d=a.page.maxw+e)}a.cursorfreezed=!1;e=a.getScrollLeft(!0);if(0>d&&0>=e||d>a.page.maxw&&e>=a.page.maxw)return a.noticeCursor();a.doScrollLeft(d)};
this.doScrollTo=function(b,c){c&&Math.round(b*a.scrollratio.y);a.cursorfreezed=!1;a.doScrollTop(b)};this.checkContentSize=function(){var b=a.getContentSize();b.h==a.page.h&&b.w==a.page.w||a.resize(!1,b)};a.onscroll=function(b){a.rail.drag||a.cursorfreezed||a.synched("scroll",function(){a.scroll.y=Math.round(a.getScrollTop()*(1/a.scrollratio.y));a.railh&&(a.scroll.x=Math.round(a.getScrollLeft()*(1/a.scrollratio.x)));a.noticeCursor()})};a.bind(a.docscroll,"scroll",a.onscroll);this.doZoomIn=function(b){if(!a.zoomactive){a.zoomactive=
!0;a.zoomrestore={style:{}};var c="position top left zIndex backgroundColor marginTop marginBottom marginLeft marginRight".split(" "),d=a.win[0].style,h;for(h in c){var k=c[h];a.zoomrestore.style[k]="undefined"!=typeof d[k]?d[k]:""}a.zoomrestore.style.width=a.win.css("width");a.zoomrestore.style.height=a.win.css("height");a.zoomrestore.padding={w:a.win.outerWidth()-a.win.width(),h:a.win.outerHeight()-a.win.height()};e.isios4&&(a.zoomrestore.scrollTop=f(window).scrollTop(),f(window).scrollTop(0));
a.win.css({position:e.isios4?"absolute":"fixed",top:0,left:0,"z-index":x+100,margin:"0px"});c=a.win.css("backgroundColor");(""==c||/transparent|rgba\(0, 0, 0, 0\)|rgba\(0,0,0,0\)/.test(c))&&a.win.css("backgroundColor","#fff");a.rail.css({"z-index":x+101});a.zoom.css({"z-index":x+102});a.zoom.css("backgroundPosition","0px -18px");a.resizeZoom();a.onzoomin&&a.onzoomin.call(a);return a.cancelEvent(b)}};this.doZoomOut=function(b){if(a.zoomactive)return a.zoomactive=!1,a.win.css("margin",""),a.win.css(a.zoomrestore.style),
e.isios4&&f(window).scrollTop(a.zoomrestore.scrollTop),a.rail.css({"z-index":a.zindex}),a.zoom.css({"z-index":a.zindex}),a.zoomrestore=!1,a.zoom.css("backgroundPosition","0px 0px"),a.onResize(),a.onzoomout&&a.onzoomout.call(a),a.cancelEvent(b)};this.doZoom=function(b){return a.zoomactive?a.doZoomOut(b):a.doZoomIn(b)};this.resizeZoom=function(){if(a.zoomactive){var b=a.getScrollTop();a.win.css({width:f(window).width()-a.zoomrestore.padding.w+"px",height:f(window).height()-a.zoomrestore.padding.h+"px"});
a.onResize();a.setScrollTop(Math.min(a.page.maxh,b))}};this.init();f.nicescroll.push(this)},L=function(f){var c=this;this.nc=f;this.steptime=this.lasttime=this.speedy=this.speedx=this.lasty=this.lastx=0;this.snapy=this.snapx=!1;this.demuly=this.demulx=0;this.lastscrolly=this.lastscrollx=-1;this.timer=this.chky=this.chkx=0;this.time=function(){return+new Date};this.reset=function(f,k){c.stop();var d=c.time();c.steptime=0;c.lasttime=d;c.speedx=0;c.speedy=0;c.lastx=f;c.lasty=k;c.lastscrollx=-1;c.lastscrolly=
-1};this.update=function(f,k){var d=c.time();c.steptime=d-c.lasttime;c.lasttime=d;var d=k-c.lasty,n=f-c.lastx,p=c.nc.getScrollTop(),a=c.nc.getScrollLeft(),p=p+d,a=a+n;c.snapx=0>a||a>c.nc.page.maxw;c.snapy=0>p||p>c.nc.page.maxh;c.speedx=n;c.speedy=d;c.lastx=f;c.lasty=k};this.stop=function(){c.nc.unsynched("domomentum2d");c.timer&&clearTimeout(c.timer);c.timer=0;c.lastscrollx=-1;c.lastscrolly=-1};this.doSnapy=function(f,k){var d=!1;0>k?(k=0,d=!0):k>c.nc.page.maxh&&(k=c.nc.page.maxh,d=!0);0>f?(f=0,d=
!0):f>c.nc.page.maxw&&(f=c.nc.page.maxw,d=!0);d?c.nc.doScrollPos(f,k,c.nc.opt.snapbackspeed):c.nc.triggerScrollEnd()};this.doMomentum=function(f){var k=c.time(),d=f?k+f:c.lasttime;f=c.nc.getScrollLeft();var n=c.nc.getScrollTop(),p=c.nc.page.maxh,a=c.nc.page.maxw;c.speedx=0<a?Math.min(60,c.speedx):0;c.speedy=0<p?Math.min(60,c.speedy):0;d=d&&60>=k-d;if(0>n||n>p||0>f||f>a)d=!1;f=c.speedx&&d?c.speedx:!1;if(c.speedy&&d&&c.speedy||f){var s=Math.max(16,c.steptime);50<s&&(f=s/50,c.speedx*=f,c.speedy*=f,s=
50);c.demulxy=0;c.lastscrollx=c.nc.getScrollLeft();c.chkx=c.lastscrollx;c.lastscrolly=c.nc.getScrollTop();c.chky=c.lastscrolly;var e=c.lastscrollx,r=c.lastscrolly,t=function(){var d=600<c.time()-k?.04:.02;c.speedx&&(e=Math.floor(c.lastscrollx-c.speedx*(1-c.demulxy)),c.lastscrollx=e,0>e||e>a)&&(d=.1);c.speedy&&(r=Math.floor(c.lastscrolly-c.speedy*(1-c.demulxy)),c.lastscrolly=r,0>r||r>p)&&(d=.1);c.demulxy=Math.min(1,c.demulxy+d);c.nc.synched("domomentum2d",function(){c.speedx&&(c.nc.getScrollLeft()!=
c.chkx&&c.stop(),c.chkx=e,c.nc.setScrollLeft(e));c.speedy&&(c.nc.getScrollTop()!=c.chky&&c.stop(),c.chky=r,c.nc.setScrollTop(r));c.timer||(c.nc.hideCursor(),c.doSnapy(e,r))});1>c.demulxy?c.timer=setTimeout(t,s):(c.stop(),c.nc.hideCursor(),c.doSnapy(e,r))};t()}else c.doSnapy(c.nc.getScrollLeft(),c.nc.getScrollTop())}},w=f.fn.scrollTop;f.cssHooks.pageYOffset={get:function(k,c,h){return(c=f.data(k,"__nicescroll")||!1)&&c.ishwscroll?c.getScrollTop():w.call(k)},set:function(k,c){var h=f.data(k,"__nicescroll")||
!1;h&&h.ishwscroll?h.setScrollTop(parseInt(c)):w.call(k,c);return this}};f.fn.scrollTop=function(k){if("undefined"==typeof k){var c=this[0]?f.data(this[0],"__nicescroll")||!1:!1;return c&&c.ishwscroll?c.getScrollTop():w.call(this)}return this.each(function(){var c=f.data(this,"__nicescroll")||!1;c&&c.ishwscroll?c.setScrollTop(parseInt(k)):w.call(f(this),k)})};var B=f.fn.scrollLeft;f.cssHooks.pageXOffset={get:function(k,c,h){return(c=f.data(k,"__nicescroll")||!1)&&c.ishwscroll?c.getScrollLeft():B.call(k)},
set:function(k,c){var h=f.data(k,"__nicescroll")||!1;h&&h.ishwscroll?h.setScrollLeft(parseInt(c)):B.call(k,c);return this}};f.fn.scrollLeft=function(k){if("undefined"==typeof k){var c=this[0]?f.data(this[0],"__nicescroll")||!1:!1;return c&&c.ishwscroll?c.getScrollLeft():B.call(this)}return this.each(function(){var c=f.data(this,"__nicescroll")||!1;c&&c.ishwscroll?c.setScrollLeft(parseInt(k)):B.call(f(this),k)})};var C=function(k){var c=this;this.length=0;this.name="nicescrollarray";this.each=function(d){for(var f=
0,h=0;f<c.length;f++)d.call(c[f],h++);return c};this.push=function(d){c[c.length]=d;c.length++};this.eq=function(d){return c[d]};if(k)for(var h=0;h<k.length;h++){var m=f.data(k[h],"__nicescroll")||!1;m&&(this[this.length]=m,this.length++)}return this};(function(f,c,h){for(var m=0;m<c.length;m++)h(f,c[m])})(C.prototype,"show hide toggle onResize resize remove stop doScrollPos".split(" "),function(f,c){f[c]=function(){var f=arguments;return this.each(function(){this[c].apply(this,f)})}});f.fn.getNiceScroll=
function(k){return"undefined"==typeof k?new C(this):this[k]&&f.data(this[k],"__nicescroll")||!1};f.extend(f.expr[":"],{nicescroll:function(k){return f.data(k,"__nicescroll")?!0:!1}});f.fn.niceScroll=function(k,c){"undefined"!=typeof c||"object"!=typeof k||"jquery"in k||(c=k,k=!1);c=f.extend({},c);var h=new C;"undefined"==typeof c&&(c={});k&&(c.doc=f(k),c.win=f(this));var m=!("doc"in c);m||"win"in c||(c.win=f(this));this.each(function(){var d=f(this).data("__nicescroll")||!1;d||(c.doc=m?f(this):c.doc,
d=new R(c,f(this)),f(this).data("__nicescroll",d));h.push(d)});return 1==h.length?h[0]:h};window.NiceScroll={getjQuery:function(){return f}};f.nicescroll||(f.nicescroll=new C,f.nicescroll.options=I)});


/*----------nice scroll end----------------*/


/* ------------jquery responsive tab------------*/

/*!
 *  Project: jquery.responsiveTabs.js
 *  Description: A plugin that creates responsive tabs, optimized for all devices
 *  Author: Jelle Kralt (jelle@jellekralt.nl)
 *  Version: 1.5.0
 *  License: MIT
 */
!function(t,s,a){function e(s,a){this.element=s,this.$element=t(s),this.tabs=[],this.state="",this.rotateInterval=0,this.$queue=t({}),this.options=t.extend({},o,a),this.init()}var o={active:null,event:"click",disabled:[],collapsible:"accordion",startCollapsed:!1,rotate:!1,setHash:!1,animation:"default",animationQueue:!1,duration:500,scrollToAccordion:!1,accordionTabElement:"<div></div>",activate:function(){},deactivate:function(){},load:function(){},activateState:function(){},classes:{stateDefault:"r-tabs-state-default",stateActive:"r-tabs-state-active",stateDisabled:"r-tabs-state-disabled",stateExcluded:"r-tabs-state-excluded",container:"r-tabs",ul:"r-tabs-nav",tab:"r-tabs-tab",anchor:"r-tabs-anchor",panel:"r-tabs-panel",accordionTitle:"r-tabs-accordion-title"}};e.prototype.init=function(){var a=this;this.tabs=this._loadElements(),this._loadClasses(),this._loadEvents(),t(s).on("resize",function(t){a._setState(t)}),t(s).on("hashchange",function(t){var e=a._getTabRefBySelector(s.location.hash),o=a._getTab(e);e>=0&&!o._ignoreHashChange&&!o.disabled&&a._openTab(t,a._getTab(e),!0)}),this.options.rotate!==!1&&this.startRotation(),this.$element.bind("tabs-activate",function(t,s){a.options.activate.call(this,t,s)}),this.$element.bind("tabs-deactivate",function(t,s){a.options.deactivate.call(this,t,s)}),this.$element.bind("tabs-activate-state",function(t,s){a.options.activateState.call(this,t,s)}),this.$element.bind("tabs-load",function(t){var s;a._setState(t),a.options.startCollapsed===!0||"accordion"===a.options.startCollapsed&&"accordion"===a.state||(s=a._getStartTab(),a._openTab(t,s),a.options.load.call(this,t,s))}),this.$element.trigger("tabs-load")},e.prototype._loadElements=function(){var s=this,a=this.$element.children("ul"),e=[],o=0;return this.$element.addClass(s.options.classes.container),a.addClass(s.options.classes.ul),t("li",a).each(function(){var a,i,n,l,r,c=t(this),p=c.hasClass(s.options.classes.stateExcluded);if(!p){a=t("a",c),r=a.attr("href"),i=t(r),n=t(s.options.accordionTabElement).insertBefore(i),l=t("<a></a>").attr("href",r).html(a.html()).appendTo(n);var h={_ignoreHashChange:!1,id:o,disabled:-1!==t.inArray(o,s.options.disabled),tab:t(this),anchor:t("a",c),panel:i,selector:r,accordionTab:n,accordionAnchor:l,active:!1};o++,e.push(h)}}),e},e.prototype._loadClasses=function(){for(var t=0;t<this.tabs.length;t++)this.tabs[t].tab.addClass(this.options.classes.stateDefault).addClass(this.options.classes.tab),this.tabs[t].anchor.addClass(this.options.classes.anchor),this.tabs[t].panel.addClass(this.options.classes.stateDefault).addClass(this.options.classes.panel),this.tabs[t].accordionTab.addClass(this.options.classes.accordionTitle),this.tabs[t].accordionAnchor.addClass(this.options.classes.anchor),this.tabs[t].disabled&&(this.tabs[t].tab.removeClass(this.options.classes.stateDefault).addClass(this.options.classes.stateDisabled),this.tabs[t].accordionTab.removeClass(this.options.classes.stateDefault).addClass(this.options.classes.stateDisabled))},e.prototype._loadEvents=function(){for(var t=this,a=function(a){var e=t._getCurrentTab(),o=a.data.tab;a.preventDefault(),o.disabled||(t.options.setHash&&(history.pushState?history.pushState(null,null,o.selector):s.location.hash=o.selector),a.data.tab._ignoreHashChange=!0,(e!==o||t._isCollapisble())&&(t._closeTab(a,e),e===o&&t._isCollapisble()||t._openTab(a,o,!1,!0)))},e=0;e<this.tabs.length;e++)this.tabs[e].anchor.on(t.options.event,{tab:t.tabs[e]},a),this.tabs[e].accordionAnchor.on(t.options.event,{tab:t.tabs[e]},a)},e.prototype._getStartTab=function(){var t,a=this._getTabRefBySelector(s.location.hash);return t=this._getTab(a>=0&&!this._getTab(a).disabled?a:this.options.active>0&&!this._getTab(this.options.active).disabled?this.options.active:0)},e.prototype._setState=function(s){var e,o=t("ul",this.$element),i=this.state,n="string"==typeof this.options.startCollapsed;this.state=o.is(":visible")?"tabs":"accordion",this.state!==i&&(this.$element.trigger("tabs-activate-state",{oldState:i,newState:this.state}),i&&n&&this.options.startCollapsed!==this.state&&this._getCurrentTab()===a&&(e=this._getStartTab(s),this._openTab(s,e)))},e.prototype._openTab=function(s,a,e,o){var i=this;e&&this._closeTab(s,this._getCurrentTab()),o&&this.rotateInterval>0&&this.stopRotation(),a.active=!0,a.tab.removeClass(i.options.classes.stateDefault).addClass(i.options.classes.stateActive),a.accordionTab.removeClass(i.options.classes.stateDefault).addClass(i.options.classes.stateActive),i._doTransition(a.panel,i.options.animation,"open",function(){a.panel.removeClass(i.options.classes.stateDefault).addClass(i.options.classes.stateActive),"accordion"!==i.getState()||!i.options.scrollToAccordion||i._isInView(a.accordionTab)&&"default"===i.options.animation||("default"!==i.options.animation&&i.options.duration>0?t("html, body").animate({scrollTop:a.accordionTab.offset().top},i.options.duration):t("html, body").scrollTop(a.accordionTab.offset().top))}),this.$element.trigger("tabs-activate",a)},e.prototype._closeTab=function(t,s){var e,o=this,i="string"==typeof o.options.animationQueue;s!==a&&(e=i&&o.getState()===o.options.animationQueue?!0:i?!1:o.options.animationQueue,s.active=!1,s.tab.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault),o._doTransition(s.panel,o.options.animation,"close",function(){s.accordionTab.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault),s.panel.removeClass(o.options.classes.stateActive).addClass(o.options.classes.stateDefault)},!e),this.$element.trigger("tabs-deactivate",s))},e.prototype._doTransition=function(t,s,a,e,o){var i,n=this;switch(s){case"slide":i="open"===a?"slideDown":"slideUp";break;case"fade":i="open"===a?"fadeIn":"fadeOut";break;default:i="open"===a?"show":"hide",n.options.duration=0}this.$queue.queue("responsive-tabs",function(o){t[i]({duration:n.options.duration,complete:function(){e.call(t,s,a),o()}})}),("open"===a||o)&&this.$queue.dequeue("responsive-tabs")},e.prototype._isCollapisble=function(){return"boolean"==typeof this.options.collapsible&&this.options.collapsible||"string"==typeof this.options.collapsible&&this.options.collapsible===this.getState()},e.prototype._getTab=function(t){return this.tabs[t]},e.prototype._getTabRefBySelector=function(t){for(var s=0;s<this.tabs.length;s++)if(this.tabs[s].selector===t)return s;return-1},e.prototype._getCurrentTab=function(){return this._getTab(this._getCurrentTabRef())},e.prototype._getNextTabRef=function(t){var s=t||this._getCurrentTabRef(),a=s===this.tabs.length-1?0:s+1;return this._getTab(a).disabled?this._getNextTabRef(a):a},e.prototype._getPreviousTabRef=function(){return 0===this._getCurrentTabRef()?this.tabs.length-1:this._getCurrentTabRef()-1},e.prototype._getCurrentTabRef=function(){for(var t=0;t<this.tabs.length;t++)if(this.tabs[t].active)return t;return-1},e.prototype._isInView=function(a){var e=t(s).scrollTop(),o=e+t(s).height(),i=a.offset().top,n=i+a.height();return o>=n&&i>=e},e.prototype.activate=function(t,s){var a=jQuery.Event("tabs-activate"),e=this._getTab(t);e.disabled||this._openTab(a,e,!0,s||!0)},e.prototype.deactivate=function(t){var s=jQuery.Event("tabs-dectivate"),a=this._getTab(t);a.disabled||this._closeTab(s,a)},e.prototype.enable=function(t){var s=this._getTab(t);s&&(s.disabled=!1,s.tab.addClass(this.options.classes.stateDefault).removeClass(this.options.classes.stateDisabled),s.accordionTab.addClass(this.options.classes.stateDefault).removeClass(this.options.classes.stateDisabled))},e.prototype.disable=function(t){var s=this._getTab(t);s&&(s.disabled=!0,s.tab.removeClass(this.options.classes.stateDefault).addClass(this.options.classes.stateDisabled),s.accordionTab.removeClass(this.options.classes.stateDefault).addClass(this.options.classes.stateDisabled))},e.prototype.getState=function(){return this.state},e.prototype.startRotation=function(s){var a=this;if(!(this.tabs.length>this.options.disabled.length))throw new Error("Rotation is not possible if all tabs are disabled");this.rotateInterval=setInterval(function(){var t=jQuery.Event("rotate");a._openTab(t,a._getTab(a._getNextTabRef()),!0)},s||(t.isNumeric(a.options.rotate)?a.options.rotate:4e3))},e.prototype.stopRotation=function(){s.clearInterval(this.rotateInterval),this.rotateInterval=0},e.prototype.option=function(t,s){return s&&(this.options[t]=s),this.options[t]},t.fn.responsiveTabs=function(s){var o=arguments;return s===a||"object"==typeof s?this.each(function(){t.data(this,"responsivetabs")||t.data(this,"responsivetabs",new e(this,s))}):"string"==typeof s&&"_"!==s[0]&&"init"!==s?this.each(function(){var a=t.data(this,"responsivetabs");a instanceof e&&"function"==typeof a[s]&&a[s].apply(a,Array.prototype.slice.call(o,1)),"destroy"===s&&t.data(this,"responsivetabs",null)}):void 0}}(jQuery,window);

/* ------------jquery responsive tab end------------*/


/*-------------jquery fresco popup plugin --------------*/
/*!
 * Fresco - A Beautiful Responsive Lightbox - v2.1.1
 * (c) 2012-2015 Nick Stakenburg
 *
 * http://www.frescojs.com
 *
 * License: http://www.frescojs.com/license
 */
!function(a,b){"function"==typeof define&&define.amd?define(["jquery"],b):"object"==typeof module&&module.exports?module.exports=b(require("jquery")):a.Fresco=b(jQuery)}(this,function($){function baseToString(a){return"string"==typeof a?a:null==a?"":a+""}function Timers(){return this.initialize.apply(this,_slice.call(arguments))}function getURIData(a){var b={type:"image"};return $.each(Types,function(c,d){var e=d.data(a);e&&(b=e,b.type=c,b.url=a)}),b}function detectExtension(a){var b=(a||"").replace(/\?.*/g,"").match(/\.([^.]{3,4})$/);return b?b[1].toLowerCase():null}function View(){this.initialize.apply(this,_slice.call(arguments))}function Thumbnail(){this.initialize.apply(this,_slice.call(arguments))}var Fresco={};$.extend(Fresco,{version:"2.1.1"}),Fresco.Skins={fresco:{}};var Bounds={viewport:function(){var a={width:$(window).width()};if(Browser.MobileSafari||Browser.Android&&Browser.Gecko){var b=document.documentElement.clientWidth/window.innerWidth;a.height=window.innerHeight*b}else a.height=$(window).height();return a}},Browser=function(a){function b(b){var c=new RegExp(b+"([\\d.]+)").exec(a);return c?parseFloat(c[1]):!0}return{IE:!(!window.attachEvent||-1!==a.indexOf("Opera"))&&b("MSIE "),Opera:a.indexOf("Opera")>-1&&(!!window.opera&&opera.version&&parseFloat(opera.version())||7.55),WebKit:a.indexOf("AppleWebKit/")>-1&&b("AppleWebKit/"),Gecko:a.indexOf("Gecko")>-1&&-1===a.indexOf("KHTML")&&b("rv:"),MobileSafari:!!a.match(/Apple.*Mobile.*Safari/),Chrome:a.indexOf("Chrome")>-1&&b("Chrome/"),ChromeMobile:a.indexOf("CrMo")>-1&&b("CrMo/"),Android:a.indexOf("Android")>-1&&b("Android "),IEMobile:a.indexOf("IEMobile")>-1&&b("IEMobile/")}}(navigator.userAgent),_slice=Array.prototype.slice,_={isElement:function(a){return a&&1==a.nodeType},String:{capitalize:function(a){return a=baseToString(a),a&&a.charAt(0).toUpperCase()+a.slice(1)}}};!function(){function a(a){var b;if(a.originalEvent.wheelDelta?b=a.originalEvent.wheelDelta/120:a.originalEvent.detail&&(b=-a.originalEvent.detail/3),b){var c=$.Event("fresco:mousewheel");$(a.target).trigger(c,b),c.isPropagationStopped()&&a.stopPropagation(),c.isDefaultPrevented()&&a.preventDefault()}}$(document.documentElement).on("mousewheel DOMMouseScroll",a)}();var Fit={within:function(a,b){for(var c=$.extend({height:!0,width:!0},arguments[2]||{}),d=$.extend({},b),e=1,f=5,g={width:c.width,height:c.height};f>0&&(g.width&&d.width>a.width||g.height&&d.height>a.height);){var h=1,i=1;g.width&&d.width>a.width&&(h=a.width/d.width),g.height&&d.height>a.height&&(i=a.height/d.height);var e=Math.min(h,i);d={width:Math.round(b.width*e),height:Math.round(b.height*e)},f--}return d.width=Math.max(d.width,0),d.height=Math.max(d.height,0),d}};$.extend($.easing,{frescoEaseInCubic:function(a,b,c,d,e){return d*(b/=e)*b*b+c},frescoEaseInSine:function(a,b,c,d,e){return-d*Math.cos(b/e*(Math.PI/2))+d+c},frescoEaseOutSine:function(a,b,c,d,e){return d*Math.sin(b/e*(Math.PI/2))+c}});var Support=function(){function a(a){return c(a,"prefix")}function b(a,b){for(var c in a)if(void 0!==d.style[a[c]])return"prefix"==b?a[c]:!0;return!1}function c(a,c){var d=a.charAt(0).toUpperCase()+a.substr(1),f=(a+" "+e.join(d+" ")+d).split(" ");return b(f,c)}var d=document.createElement("div"),e="Webkit Moz O ms Khtml".split(" ");return{canvas:function(){var a=document.createElement("canvas");return!(!a.getContext||!a.getContext("2d"))}(),css:{animation:c("animation"),transform:c("transform"),prefixed:a},svg:!!document.createElementNS&&!!document.createElementNS("http://www.w3.org/2000/svg","svg").createSVGRect,touch:function(){try{return!!("ontouchstart"in window||window.DocumentTouch&&document instanceof DocumentTouch)}catch(a){return!1}}()}}();Support.detectMobileTouch=function(){Support.mobileTouch=Support.touch&&(Browser.MobileSafari||Browser.Android||Browser.IEMobile||Browser.ChromeMobile||!/^(Win|Mac|Linux)/.test(navigator.platform))},Support.detectMobileTouch();var ImageReady=function(){return this.initialize.apply(this,Array.prototype.slice.call(arguments))};$.extend(ImageReady.prototype,{supports:{naturalWidth:function(){return"naturalWidth"in new Image}()},initialize:function(a,b,c){return this.img=$(a)[0],this.successCallback=b,this.errorCallback=c,this.isLoaded=!1,this.options=$.extend({method:"naturalWidth",pollFallbackAfter:1e3},arguments[3]||{}),this.supports.naturalWidth&&"onload"!=this.options.method?this.img.complete&&"undefined"!=$.type(this.img.naturalWidth)?void setTimeout($.proxy(function(){this.img.naturalWidth>0?this.success():this.error()},this)):($(this.img).bind("error",$.proxy(function(){setTimeout($.proxy(function(){this.error()},this))},this)),this.intervals=[[1e3,10],[2e3,50],[4e3,100],[2e4,500]],this._ipos=0,this._time=0,this._delay=this.intervals[this._ipos][1],void this.poll()):void setTimeout($.proxy(this.fallback,this))},poll:function(){this._polling=setTimeout($.proxy(function(){if(this.img.naturalWidth>0)return void this.success();if(this._time+=this._delay,this.options.pollFallbackAfter&&this._time>=this.options.pollFallbackAfter&&!this._usedPollFallback&&(this._usedPollFallback=!0,this.fallback()),this._time>this.intervals[this._ipos][0]){if(!this.intervals[this._ipos+1])return void this.error();this._ipos++,this._delay=this.intervals[this._ipos][1]}this.poll()},this),this._delay)},fallback:function(){var a=new Image;this._fallbackImg=a,a.onload=$.proxy(function(){a.onload=function(){},this.supports.naturalWidth||(this.img.naturalWidth=a.width,this.img.naturalHeight=a.height),this.success()},this),a.onerror=$.proxy(this.error,this),a.src=this.img.src},abort:function(){this._fallbackImg&&(this._fallbackImg.onload=function(){}),this._polling&&(clearTimeout(this._polling),this._polling=null)},success:function(){this._calledSuccess||(this._calledSuccess=!0,this.isLoaded=!0,this.successCallback(this))},error:function(){this._calledError||(this._calledError=!0,this.abort(),this.errorCallback&&this.errorCallback(this))}}),$.extend(Timers.prototype,{initialize:function(){this._timers={}},set:function(a,b,c){this._timers[a]=setTimeout(b,c)},get:function(a){return this._timers[a]},clear:function(a){a?this._timers[a]&&(clearTimeout(this._timers[a]),delete this._timers[a]):this.clearAll()},clearAll:function(){$.each(this._timers,function(a,b){clearTimeout(b)}),this._timers={}}});var Type={isVideo:function(a){return/^(youtube|vimeo)$/.test(a)}},Types={image:{extensions:"bmp gif jpeg jpg png webp",detect:function(a){return $.inArray(detectExtension(a),this.extensions.split(" "))>-1},data:function(a){return this.detect()?{extension:detectExtension(a)}:!1}},vimeo:{detect:function(a){var b=/(vimeo\.com)\/([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a);return b&&b[2]?b[2]:!1},data:function(a){var b=this.detect(a);return b?{id:b}:!1}},youtube:{detect:function(a){var b=/(youtube\.com|youtu\.be)\/watch\?(?=.*vi?=([a-zA-Z0-9-_]+))(?:\S+)?$/.exec(a);return b&&b[2]?b[2]:(b=/(youtube\.com|youtu\.be)\/(vi?\/|u\/|embed\/)?([a-zA-Z0-9-_]+)(?:\S+)?$/i.exec(a),b&&b[3]?b[3]:!1)},data:function(a){var b=this.detect(a);return b?{id:b}:!1}}},VimeoThumbnail=function(){var a=function(){return this.initialize.apply(this,_slice.call(arguments))};$.extend(a.prototype,{initialize:function(a,b,c){this.url=a,this.successCallback=b,this.errorCallback=c,this.load()},load:function(){var a=b.get(this.url);if(a)return this.successCallback(a.data.url);var c="http"+(window.location&&"https:"==window.location.protocol?"s":"")+":",d=getURIData(this.url).id;this._xhr=$.getJSON(c+"//vimeo.com/api/oembed.json?url="+c+"//vimeo.com/"+d+"&callback=?",$.proxy(function(a){if(a&&a.thumbnail_url){var a={url:a.thumbnail_url};b.set(this.url,a),this.successCallback(a.url)}else this.errorCallback()},this))},abort:function(){this._xhr&&(this._xhr.abort(),this._xhr=null)}});var b={cache:[],get:function(a){for(var b=null,c=0;c<this.cache.length;c++)this.cache[c]&&this.cache[c].url==a&&(b=this.cache[c]);return b},set:function(a,b){this.remove(a),this.cache.push({url:a,data:b})},remove:function(a){for(var b=0;b<this.cache.length;b++)this.cache[b]&&this.cache[b].url==a&&delete this.cache[b]}};return a}(),VimeoReady=function(){var a=function(){return this.initialize.apply(this,_slice.call(arguments))};$.extend(a.prototype,{initialize:function(a,b){this.url=a,this.callback=b,this.load()},load:function(){var a=b.get(this.url);if(a)return this.callback(a.data);var c="http"+(window.location&&"https:"==window.location.protocol?"s":"")+":",d=getURIData(this.url).id;this._xhr=$.getJSON(c+"//vimeo.com/api/oembed.json?url="+c+"//vimeo.com/"+d+"&callback=?",$.proxy(function(a){var c={dimensions:{width:a.width,height:a.height}};b.set(this.url,c),this.callback&&this.callback(c)},this))},abort:function(){this._xhr&&(this._xhr.abort(),this._xhr=null)}});var b={cache:[],get:function(a){for(var b=null,c=0;c<this.cache.length;c++)this.cache[c]&&this.cache[c].url==a&&(b=this.cache[c]);return b},set:function(a,b){this.remove(a),this.cache.push({url:a,data:b})},remove:function(a){for(var b=0;b<this.cache.length;b++)this.cache[b]&&this.cache[b].url==a&&delete this.cache[b]}};return a}(),Options={defaults:{effects:{content:{show:0,hide:0},spinner:{show:150,hide:150},window:{show:440,hide:300},thumbnail:{show:300,delay:150},thumbnails:{slide:0}},keyboard:{left:!0,right:!0,esc:!0},loadedMethod:"naturalWidth",loop:!1,onClick:"previous-next",overflow:!1,overlay:{close:!0},preload:[1,2],position:!0,skin:"fresco",spinner:!0,spinnerDelay:300,sync:!0,thumbnails:"horizontal",ui:"outside",uiDelay:3e3,vimeo:{autoplay:1,api:1,title:1,byline:1,portrait:0,loop:0},youtube:{autoplay:1,controls:1,enablejsapi:1,hd:1,iv_load_policy:3,loop:0,modestbranding:1,rel:0,vq:"hd1080"},initialTypeOptions:{image:{},vimeo:{width:1280},youtube:{width:1280,height:720}}},create:function(a,b,c){a=a||{},c=c||{},a.skin=a.skin||this.defaults.skin;var d=a.skin?$.extend({},Fresco.Skins[a.skin]||Fresco.Skins[this.defaults.skin]):{},e=$.extend(!0,{},this.defaults,d);e.initialTypeOptions&&(b&&e.initialTypeOptions[b]&&(e=$.extend(!0,{},e.initialTypeOptions[b],e)),delete e.initialTypeOptions);var f=$.extend(!0,{},e,a);if(Support.mobileTouch&&"inside"==f.ui&&(f.ui="outside"),(!f.effects||Browser.IE&&Browser.IE<9)&&(f.effects={},$.each(this.defaults.effects,function(a,b){$.each(f.effects[a]=$.extend({},b),function(b){f.effects[a][b]=0})}),f.spinner=!1),f.keyboard&&("boolean"==$.type(f.keyboard)&&(f.keyboard={},$.each(this.defaults.keyboard,function(a,b){f.keyboard[a]=!0})),("vimeo"==b||"youtube"==b)&&$.extend(f.keyboard,{left:!1,right:!1})),!f.overflow||Support.mobileTouch?f.overflow={x:!1,y:!1}:"boolean"==$.type(f.overflow)&&(f.overflow={x:!1,y:!0}),("vimeo"==b||"youtube"==b)&&(f.overlap=!1),(Browser.IE&&Browser.IE<9||Support.mobileTouch)&&(f.thumbnail=!1,f.thumbnails=!1),"youtube"!=b&&(f.width&&!f.maxWidth&&(f.maxWidth=f.width),f.height&&!f.maxHeight&&(f.maxHeight=f.height)),!f.thumbnail&&"boolean"!=$.type(f.thumbnail)){var g=!1;switch(b){case"youtube":var h="http"+(window.location&&"https:"==window.location.protocol?"s":"")+":";g=h+"//img.youtube.com/vi/"+c.id+"/0.jpg";break;case"image":case"vimeo":g=!0}f.thumbnail=g}return f}},Overlay={initialize:function(){this.build(),this.visible=!1},build:function(){this.element=$("<div>").addClass("fr-overlay").hide().append($("<div>").addClass("fr-overlay-background")),this.element.on("click",$.proxy(function(){var a=Pages.page;a&&a.view&&a.view.options.overlay&&!a.view.options.overlay.close||Window.hide()},this)),Support.mobileTouch&&this.element.addClass("fr-mobile-touch"),this.element.on("fresco:mousewheel",function(a){a.preventDefault()})},setSkin:function(a){this.skin&&this.element.removeClass("fr-overlay-skin-"+this.skin),this.element.addClass("fr-overlay-skin-"+a),this.skin=a},attach:function(){$(document.body).append(this.element)},detach:function(){this.element.detach()},show:function(a,b){if(this.visible)return void(a&&a());this.visible=!0,this.attach(),this.max();var c=Pages.page&&Pages.page.view.options.effects.window.show||0,d=("number"==$.type(b)?b:c)||0;this.element.stop(!0).fadeTo(d,1,a)},hide:function(a,b){if(!this.visible)return void(a&&a());var c=Pages.page&&Pages.page.view.options.effects.window.hide||0,d=("number"==$.type(b)?b:c)||0;this.element.stop(!0).fadeOut(d||0,$.proxy(function(){this.detach(),this.visible=!1,a&&a()},this))},getScrollDimensions:function(){var a={};return $.each(["width","height"],function(b,c){var d=c.substr(0,1).toUpperCase()+c.substr(1),e=document.documentElement;a[c]=(Browser.IE?Math.max(e["offset"+d],e["scroll"+d]):Browser.WebKit?document.body["scroll"+d]:e["scroll"+d])||0}),a},max:function(){var a;if(Browser.MobileSafari&&Browser.WebKit&&Browser.WebKit<533.18&&(a=this.getScrollDimensions(),this.element.css(a)),Browser.IE&&Browser.IE<9){var b=Bounds.viewport();this.element.css({height:b.height,width:b.width})}Support.mobileTouch&&!a&&this.element.css({height:this.getScrollDimensions().height})}},Window={initialize:function(){this.queues=[],this.queues.hide=$({}),this.pages=[],this._tracking=[],this._first=!0,this.timers=new Timers,this.build(),this.setSkin(Options.defaults.skin)},build:function(){if(this.element=$("<div>").addClass("fr-window fr-measured").hide().append(this._box=$("<div>").addClass("fr-box").append(this._pages=$("<div>").addClass("fr-pages"))).append(this._thumbnails=$("<div>").addClass("fr-thumbnails")),Overlay.initialize(),Pages.initialize(this._pages),Thumbnails.initialize(this._thumbnails),Spinner.initialize(),UI.initialize(),this.element.addClass("fr"+(Support.mobileTouch?"":"-no")+"-mobile-touch"),this.element.addClass("fr"+(Support.svg?"":"-no")+"-svg"),Browser.IE)for(var a=7;9>=a;a++)Browser.IE<a&&this.element.addClass("fr-ltIE"+a);this.element.on("fresco:mousewheel",function(a){a.preventDefault()})},attach:function(){this._attached||($(document.body).append(this.element),this._attached=!0)},detach:function(){this._attached&&(this.element.detach(),this._attached=!1)},setSkin:function(a){this._skin&&this.element.removeClass("fr-window-skin-"+this._skin),this.element.addClass("fr-window-skin-"+a),Overlay.setSkin(a),this._skin=a},setShowingType:function(a){this._showingType!=a&&(this._showingType&&(this.element.removeClass("fr-showing-type-"+this._showingType),Type.isVideo(this._showingType)&&this.element.removeClass("fr-showing-type-video")),this.element.addClass("fr-showing-type-"+a),Type.isVideo(a)&&this.element.addClass("fr-showing-type-video"),this._showingType=a)},startObservingResize:function(){this._onWindowResizeHandler||$(window).on("resize orientationchange",this._onWindowResizeHandler=$.proxy(this._onWindowResize,this))},stopObservingResize:function(){this._onWindowResizeHandler&&($(window).off("resize orientationchange",this._onWindowResizeHandler),this._onWindowResizeHandler=null)},_onScroll:function(){Support.mobileTouch&&this.timers.set("scroll",$.proxy(this.adjustToScroll,this),0)},_onWindowResize:function(){var a;(a=Pages.page)&&(Thumbnails.fitToViewport(),this.updateBoxDimensions(),a.fitToBox(),UI.update(),UI.adjustPrevNext(null,0),Spinner.center(),Overlay.max(),UI._onWindowResize(),this._onScroll())},adjustToScroll:function(){Support.mobileTouch&&this.element.css({top:$(window).scrollTop()})},getBoxDimensions:function(){return this._boxDimensions},updateBoxDimensions:function(){var a;if(a=Pages.page){var b=Bounds.viewport(),c=Thumbnails.getDimensions(),d="horizontal"==Thumbnails._orientation;this._boxDimensions={width:d?b.width:b.width-c.width,height:d?b.height-c.height:b.height},this._boxPosition={top:0,left:d?0:c.width},this._box.css($.extend({},this._boxDimensions,this._boxPosition))}},show:function(a,b){if(this.visible)return void(a&&a());this.visible=!0,this.opening=!0,this.attach(),this.timers.clear("show-window"),this.timers.clear("hide-overlay"),this.adjustToScroll();var c=("number"==$.type(b)?b:Pages.page&&Pages.page.view.options.effects.window.show)||0,d=2;Overlay[Pages.page&&Pages.page.view.options.overlay?"show":"hide"](function(){a&&--d<1&&a()},c),this.timers.set("show-window",$.proxy(function(){this._show($.proxy(function(){this.opening=!1,a&&--d<1&&a()},this),c)},this),c>1?Math.min(.5*c,50):1)},_show:function(a,b){var c=("number"==$.type(b)?b:Pages.page&&Pages.page.view.options.effects.window.show)||0;this.element.stop(!0).fadeTo(c,1,a)},hide:function(a){var b=this.queues.hide;b.queue([]),this.timers.clear("show-window"),this.timers.clear("hide-overlay");var c=Pages.page?Pages.page.view.options.effects.window.hide:0;b.queue($.proxy(function(a){Pages.stop(),Spinner.hide(),a()},this)),b.queue($.proxy(function(a){UI.disable(),UI.hide(null,c),Keyboard.disable(),a()},this)),b.queue($.proxy(function(a){var b=2;this._hide(function(){--b<1&&a()},c),this.timers.set("hide-overlay",$.proxy(function(){Overlay.hide(function(){--b<1&&a()},c)},this),c>1?Math.min(.5*c,150):1),this._first=!0},this)),b.queue($.proxy(function(a){this._reset(),this.stopObservingResize(),Pages.removeAll(),Thumbnails.clear(),this.timers.clear(),this._position=-1;var b=Pages.page&&Pages.page.view.options.afterHide;"function"==$.type(b)&&b.call(Fresco),this.view=null,this.opening=!1,this.closing=!1,this.detach(),a()},this)),"function"==$.type(a)&&b.queue($.proxy(function(b){a(),b()},this))},_hide:function(a,b){var c=("number"==$.type(b)?b:Pages.page&&Pages.page.view.options.effects.window.hide)||0;this.element.stop(!0).fadeOut(c,a)},load:function(a,b){this.views=a,this.attach(),Thumbnails.load(a),Pages.load(a),this.startObservingResize(),b&&this.setPosition(b)},setPosition:function(a,b){this._position=a,this.view=this.views[a-1],this.stopHideQueue(),this.page=Pages.show(a,$.proxy(function(){b&&b()},this))},stopHideQueue:function(){this.queues.hide.queue([])},_reset:function(){this.visible=!1,UI.hide(null,0),UI.reset()},mayPrevious:function(){return this.view&&this.view.options.loop&&this.views&&this.views.length>1||1!=this._position},previous:function(a){var b=this.mayPrevious();(a||b)&&this.setPosition(this.getSurroundingIndexes().previous)},mayNext:function(){var a=this.views&&this.views.length>1;return this.view&&this.view.options.loop&&a||a&&1!=this.getSurroundingIndexes().next},next:function(a){var b=this.mayNext();(a||b)&&this.setPosition(this.getSurroundingIndexes().next)},getSurroundingIndexes:function(){if(!this.views)return{};var a=this._position,b=this.views.length,c=1>=a?b:a-1,d=a>=b?1:a+1;return{previous:c,next:d}}},Keyboard={enabled:!1,keyCode:{left:37,right:39,esc:27},enable:function(a){this.disable(),a&&($(document).on("keydown",this._onKeyDownHandler=$.proxy(this.onKeyDown,this)).on("keyup",this._onKeyUpHandler=$.proxy(this.onKeyUp,this)),this.enabled=a)},disable:function(){this.enabled=!1,this._onKeyUpHandler&&($(document).off("keyup",this._onKeyUpHandler).off("keydown",this._onKeyDownHandler),this._onKeyUpHandler=this._onKeyDownHandler=null)},onKeyDown:function(a){if(this.enabled){var b=this.getKeyByKeyCode(a.keyCode);if(b&&(!b||!this.enabled||this.enabled[b]))switch(a.preventDefault(),a.stopPropagation(),b){case"left":Window.previous();break;case"right":Window.next()}}},onKeyUp:function(a){if(this.enabled){var b=this.getKeyByKeyCode(a.keyCode);if(b&&(!b||!this.enabled||this.enabled[b]))switch(b){case"esc":Window.hide()}}},getKeyByKeyCode:function(a){for(var b in this.keyCode)if(this.keyCode[b]==a)return b;return null}},Page=function(){function a(){return this.initialize.apply(this,_slice.call(arguments))}var b=0,c={},d=$("<div>").addClass("fr-stroke fr-stroke-top fr-stroke-horizontal").append($("<div>").addClass("fr-stroke-color")).add($("<div>").addClass("fr-stroke fr-stroke-bottom fr-stroke-horizontal").append($("<div>").addClass("fr-stroke-color"))).add($("<div>").addClass("fr-stroke fr-stroke-left fr-stroke-vertical").append($("<div>").addClass("fr-stroke-color"))).add($("<div>").addClass("fr-stroke fr-stroke-right fr-stroke-vertical").append($("<div>").addClass("fr-stroke-color")));return $.extend(a.prototype,{initialize:function(a,c,d){this.view=a,this.dimensions={width:0,height:0},this.uid=b++,this._position=c,this._total=d,this._fullClick=!1,this._visible=!1,this.queues={},this.queues.showhide=$({})},create:function(){if(!this._created){Pages.element.append(this.element=$("<div>").addClass("fr-page").append(this.container=$("<div>").addClass("fr-container")).css({opacity:0}).hide());var a=this.view.options.position&&this._total>1;if(a&&this.element.addClass("fr-has-position"),(this.view.caption||a)&&(this.element.append(this.info=$("<div>").addClass("fr-info").append($("<div>").addClass("fr-info-background")).append(d.clone(!0)).append(this.infoPadder=$("<div>").addClass("fr-info-padder"))),a&&(this.element.addClass("fr-has-position"),this.infoPadder.append(this.pos=$("<div>").addClass("fr-position").append($("<span>").addClass("fr-position-text").html(this._position+" / "+this._total)))),this.view.caption&&this.infoPadder.append(this.caption=$("<div>").addClass("fr-caption").html(this.view.caption))),this.container.append(this.background=$("<div>").addClass("fr-content-background")).append(this.content=$("<div>").addClass("fr-content")),"image"==this.view.type&&(this.content.append(this.image=$("<img>").addClass("fr-content-element").attr({src:this.view.url})),this.content.append(d.clone(!0))),a&&"outside"==this.view.options.ui&&this.container.append(this.positionOutside=$("<div>").addClass("fr-position-outside").append($("<div>").addClass("fr-position-background")).append($("<span>").addClass("fr-position-text").html(this._position+" / "+this._total))),"inside"==this.view.options.ui){this.content.append(this.previousInside=$("<div>").addClass("fr-side fr-side-previous fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this.nextInside=$("<div>").addClass("fr-side fr-side-next fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this.closeInside=$("<div>").addClass("fr-close fr-toggle-ui").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon"))),(this.view.caption||a&&this.view.grouped.caption)&&(this.content.append(this.infoInside=$("<div>").addClass("fr-info fr-toggle-ui").append($("<div>").addClass("fr-info-background")).append(d.clone(!0)).append(this.infoPadderInside=$("<div>").addClass("fr-info-padder"))),a&&this.infoPadderInside.append(this.posInside=$("<div>").addClass("fr-position").append($("<span>").addClass("fr-position-text").html(this._position+" / "+this._total))),this.view.caption&&this.infoPadderInside.append(this.captionInside=$("<div>").addClass("fr-caption").html(this.view.caption))),this.view.caption||!a||this.view.grouped.caption||this.content.append(this.positionInside=$("<div>").addClass("fr-position-inside fr-toggle-ui").append($("<div>").addClass("fr-position-background")).append($("<span>").addClass("fr-position-text").html(this._position+" / "+this._total)));var b=this.view.options.loop&&this._total>1||1!=this._position,c=this.view.options.loop&&this._total>1||this._position<this._total;this.previousInside[(b?"remove":"add")+"Class"]("fr-side-disabled"),this.nextInside[(c?"remove":"add")+"Class"]("fr-side-disabled")}$.each(["x","y"],$.proxy(function(a,b){this.view.options.overflow[b]&&this.element.addClass("fr-overflow-"+b)},this)),this.element.addClass("fr-type-"+this.view.type),Type.isVideo(this.view.type)&&this.element.addClass("fr-type-video"),this._total<2&&this.element.addClass("fr-no-sides"),this._created=!0}},_getSurroundingPages:function(){var a;if(!(a=this.view.options.preload))return[];for(var b=[],c=Math.max(1,this._position-a[0]),d=Math.min(this._position+a[1],this._total),e=this._position,f=e;d>=f;f++){var g=Pages.pages[f-1];g._position!=e&&b.push(g)}for(var f=e;f>=c;f--){var g=Pages.pages[f-1];g._position!=e&&b.push(g)}return b},preloadSurroundingImages:function(){var a=this._getSurroundingPages();$.each(a,$.proxy(function(a,b){b.preload()},this))},preload:function(){this.preloading||this.preloaded||"image"!=this.view.type||!this.view.options.preload||this.loaded||(this.create(),this.preloading=!0,this.preloadReady=new ImageReady(this.image[0],$.proxy(function(a){this.loaded=!0,c[this.view.url]=!0,this.preloading=!1,this.preloaded=!0,this.dimensions={width:a.img.naturalWidth,height:a.img.naturalHeight}},this),null,{method:"naturalWidth"}))},load:function(a,b){if(this.create(),this.loaded)return void(a&&a());switch(this.abort(),this.loading=!0,this.view.options.spinner&&(this._spinnerDelay=setTimeout($.proxy(function(){Spinner.show()},this),this.view.options.spinnerDelay||0)),this.view.type){case"image":if(this.error)return void(a&&a());this.imageReady=new ImageReady(this.image[0],$.proxy(function(b){this._markAsLoaded(),this.setDimensions({width:b.img.naturalWidth,height:b.img.naturalHeight}),a&&a()},this),$.proxy(function(){this._markAsLoaded(),this.image.hide(),this.content.prepend(this.error=$("<div>").addClass("fr-error fr-content-element").append($("<div>").addClass("fr-error-icon"))),this.element.addClass("fr-has-error"),this.setDimensions({width:this.error.outerWidth(),height:this.error.outerHeight()}),this.error.css({width:"100%",height:"100%"}),a&&a()},this),{method:this.view.options.loadedMethod});break;case"vimeo":this.vimeoReady=new VimeoReady(this.view.url,$.proxy(function(b){this._markAsLoaded(),this.setDimensions({width:b.dimensions.width,height:b.dimensions.height}),a&&a()},this));break;case"youtube":this._markAsLoaded(),this.setDimensions({width:this.view.options.width,height:this.view.options.height}),a&&a()}},setDimensions:function(a){if(this.dimensions=a,this.view.options.maxWidth||this.view.options.maxHeight){var b=this.view.options,c={width:b.maxWidth?b.maxWidth:this.dimensions.width,height:b.maxHeight?b.maxHeight:this.dimensions.height};this.dimensions=Fit.within(c,this.dimensions)}},_markAsLoaded:function(){this._abortSpinnerDelay(),this.loading=!1,this.loaded=!0,c[this.view.url]=!0,Spinner.hide(null,null,this._position)},isVideo:function(){return Type.isVideo(this.view.type)},insertVideo:function(a){if(this.playerIframe||!this.isVideo())return void(a&&a());var b="http"+(window.location&&"https:"==window.location.protocol?"s":"")+":",c=$.extend({},this.view.options[this.view.type]||{}),d=$.param(c),e={vimeo:b+"//player.vimeo.com/video/{id}?{queryString}",youtube:b+"//www.youtube.com/embed/{id}?{queryString}"},f=e[this.view.type].replace("{id}",this.view._data.id).replace("{queryString}",d);this.content.prepend(this.playerIframe=$("<iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen>").addClass("fr-content-element").attr({src:f,height:this._contentDimensions.height,width:this._contentDimensions.width,frameborder:0})),a&&a()},raise:function(){var a=Pages.element[0].lastChild;a&&a==this.element[0]||Pages.element.append(this.element)},show:function(a){var b=this.queues.showhide;b.queue([]),b.queue($.proxy(function(a){var b=this.view.options.spinner&&!c[this.view.url];Spinner._visible&&!b&&Spinner.hide(),Pages.stopInactive(),a()},this)),b.queue($.proxy(function(a){this.updateUI(),UI.set(this._ui),a()},this)),b.queue($.proxy(function(a){Keyboard.enable(this.view.options.keyboard),a()},this)),b.queue($.proxy(function(a){Spinner.setSkin(this.view.options.skin),this.load($.proxy(function(){this.preloadSurroundingImages(),a()},this))},this)),b.queue($.proxy(function(a){this.raise(),Window.setSkin(this.view.options.skin),UI.enable(),this.fitToBox(),Window.adjustToScroll(),a()},this)),this.isVideo()&&b.queue($.proxy(function(a){this.insertVideo($.proxy(function(){a()}))},this)),this.view.options.sync||b.queue($.proxy(function(a){Pages.hideInactive(a)},this)),b.queue($.proxy(function(a){var b=3,c=this.view.options.effects.content.show;Window.setShowingType(this.view.type),Window.visible||(c=this.view.options.effects.window.show,"function"==$.type(this.view.options.onShow)&&this.view.options.onShow.call(Fresco)),this.view.options.sync&&(b++,Pages.hideInactive(function(){--b<1&&a()})),Window.show(function(){--b<1&&a()},this.view.options.effects.window.show),this._show(function(){--b<1&&a()},c),UI.adjustPrevNext(function(){--b<1&&a()},Window._first?0:c),Window._first?(UI.show(null,0),Window._first=!1):UI.show(null,0);var d=this.view.options.afterPosition;"function"==$.type(d)&&d.call(Fresco,this._position)},this)),b.queue($.proxy(function(b){this._visible=!0,a&&a(),b()},this))},_show:function(a,b){var c=Window.visible?"number"==$.type(b)?b:this.view.options.effects.content.show:0;this.element.stop(!0).show().fadeTo(c||0,1,a)},hide:function(a,b){if(!this.element)return void(a&&a());this.removeVideo(),this.abort();var c="number"==$.type(b)?b:this.view.options.effects.content.hide;this.isVideo()&&(c=0),this.element.stop(!0).fadeTo(c,0,"frescoEaseInCubic",$.proxy(function(){this.element.hide(),this._visible=!1,Pages.removeTracking(this._position),a&&a()},this))},stop:function(){var a=this.queues.showhide;a.queue([]),this.element&&this.element.stop(!0),this.abort()},removeVideo:function(){this.playerIframe&&(this.playerIframe[0].src="//about:blank",this.playerIframe.remove(),this.playerIframe=null)},remove:function(){this.stop(),this.removeVideo(),this.element&&this.element.remove(),this._track&&(Pages.removeTracking(this._position),this._track=!1),this.preloadReady&&(this.preloadReady.abort(),this.preloadReady=null,this.preloading=null,this.preloaded=null),this._visible=!1,this.removed=!0},abort:function(){this.imageReady&&(this.imageReady.abort(),this.imageReady=null),this.vimeoReady&&(this.vimeoReady.abort(),this.vimeoReady=null),this._abortSpinnerDelay(),this.loading=!1},_abortSpinnerDelay:function(){this._spinnerDelay&&(clearTimeout(this._spinnerDelay),this._spinnerDelay=null)},_getInfoHeight:function(a){var b=this.view.options.position&&this._total>1;switch(this._ui){case"fullclick":case"inside":if(!this.view.caption&&!b)return 0;break;case"outside":if(!this.view.caption)return 0}var c="inside"==this._ui?this.infoInside:this.info;"outside"==this._ui&&(a=Math.min(a,Window._boxDimensions.width));var d,e=c[0].style.width;return("inside"==this._ui||"fullclick"==this._ui)&&(e="100%"),c.css({width:a+"px"}),d=parseFloat(c.outerHeight()),c.css({width:e}),d},_whileVisible:function(a,b){var c=[],d=Window.element.add(this.element);b&&(d=d.add(b)),$.each(d,function(a,b){var d=$(b).is(":visible");d||c.push($(b).show())});var e=this.element.hasClass("fr-no-caption");this.element.removeClass("fr-no-caption");var f=this.element.hasClass("fr-has-caption");this.element.addClass("fr-has-caption"),Window.element.css({visibility:"hidden"}),a(),Window.element.css({visibility:"visible"}),e&&this.element.addClass("fr-no-caption"),f||this.element.removeClass("fr-has-caption"),$.each(c,function(a,b){b.hide()})},updateForced:function(){this.create(),this._fullClick=this.view.options.fullClick,this._noOverflow=!1,parseInt(this.element.css("min-width"))>0&&(this._fullClick=!0),parseInt(this.element.css("min-height"))>0&&(this._noOverflow=!0)},updateUI:function(a){this.updateForced();var a=this._fullClick?"fullclick":this.view.options.ui;this._ui&&this.element.removeClass("fr-ui-"+this._ui),this.element.addClass("fr-ui-"+a),this._ui=a},fitToBox:function(){if(this.content){var a=(this.element,$.extend({},Window.getBoxDimensions())),b=$.extend({},this.dimensions),c=this.container;this.updateUI();var d={left:parseInt(c.css("padding-left")),top:parseInt(c.css("padding-top"))};if("outside"==this._ui&&this._positionOutside){var e=0;this._whileVisible($.proxy(function(){this._positionOutside.is(":visible")&&(e=this._positionOutside.outerWidth(!0))},this)),e>d.left&&(d.left=e)}a.width-=2*d.left,a.height-=2*d.top;var f,g={width:!0,height:this._noOverflow?!0:!this.view.options.overflow.y},h=Fit.within(a,b,g),i=$.extend({},h),j=(this.content,0),k="inside"==this._ui,l=k?this.infoInside:this.info,m=k?this.captionInside:this.caption,n=k?this.posInside:this.pos,o=!!m;switch(this._ui){case"outside":var p,q=$.extend({},i);this.caption&&(p=this.caption,this._whileVisible($.proxy(function(){for(var b=0,c=2;c>b;){j=this._getInfoHeight(i.width);var d=a.height-i.height;j>d&&(i=Fit.within({width:i.width,height:Math.max(i.height-(j-d),0)},i,g)),b++}j=this._getInfoHeight(i.width);var e=.5;(!this.view.options.overflow.y&&j+i.height>a.height||l&&"none"==l.css("display")||e&&j>=e*i.height)&&(o=!1,j=0,i=q)},this),p)),l&&l.css({width:i.width+"px"}),f={width:i.width,height:i.height+j};break;case"inside":if(this.caption){var p=m;this._whileVisible($.proxy(function(){j=this._getInfoHeight(i.width);var a=.45;a&&j>=a*i.height&&(o=!1,j=0)},this),p)}f=i;break;case"fullclick":var r=[];m&&r.push(m),this._whileVisible($.proxy(function(){if((m||n)&&l.css({width:"100%"}),j=this._getInfoHeight(Window._boxDimensions.width),m&&j>.5*a.height)if(o=!1,n){var b=this.caption.is(":visible");this.caption.hide(),j=this._getInfoHeight(Window._boxDimensions.width),b&&this.caption.show()}else j=0;i=Fit.within({width:a.width,height:Math.max(0,a.height-j)},i,g),f=i},this),r),this.content.css({"padding-bottom":0})}m&&m[o?"show":"hide"](),this.element[(o?"remove":"add")+"Class"]("fr-no-caption"),this.element[(o?"add":"remove")+"Class"]("fr-has-caption"),this.content.css(i),this.background.css(f),this.playerIframe&&this.playerIframe.attr(i),this.overlap={y:f.height+("fullclick"==this._ui?j:0)-Window._boxDimensions.height,x:0},this._track=!this._noOverflow&&this.view.options.overflow.y&&this.overlap.y>0,this._infoHeight=j,this._padding=d,this._contentDimensions=i,this._backgroundDimensions=f,Pages[(this._track?"set":"remove")+"Tracking"](this._position),this.position()}},position:function(){if(this.content){var a=this._contentDimensions,b=this._backgroundDimensions,c={top:.5*Window._boxDimensions.height-.5*b.height,left:.5*Window._boxDimensions.width-.5*b.width},d={top:c.top+a.height,left:c.left},e=0,f="inside"==this._ui?this.infoInside:this.info;switch(this._ui){case"fullclick":c.top=.5*(Window._boxDimensions.height-this._infoHeight)-.5*b.height,d={top:Window._boxDimensions.height-this._infoHeight,left:0,bottom:"auto"},e=this._infoHeight;break;case"inside":d={top:"auto",left:0,bottom:0}}if(this.overlap.y>0){var g=Pages.getXYP();switch(c.top=0-g.y*this.overlap.y,this._ui){case"outside":case"fullclick":d.top=Window._boxDimensions.height-this._infoHeight;break;case"inside":var h=c.top+a.height-Window._boxDimensions.height,i=-1*c.top;if(d.bottom=h,this.closeInside.css({top:i}),this._total>1){var j=Window.element.is(":visible");j||Window.element.show();var k=this.previousInside.attr("style");this.previousInside.removeAttr("style");var l=parseInt(this.previousInside.css("margin-top"));this.previousInside.attr({style:k}),j||Window.element.hide();var m=this.previousInside.add(this.nextInside),n=.5*this.overlap.y;m.css({"margin-top":l+(i-n)}),this.positionInside&&this.positionInside.css({bottom:h})}}}else"inside"==this._ui&&this.element.find(".fr-info, .fr-side, .fr-close, .fr-position-inside").removeAttr("style");f&&f.css(d),this.container.css({bottom:e}),this.content.css(c),this.background.css(c)}}}),a}(),Pages={initialize:function(a){this.element=a,this.pages=[],this.uid=1,this._tracking=[]},load:function(a){this.views=a,this.removeAll(),$.each(a,$.proxy(function(a,b){this.pages.push(new Page(b,a+1,this.views.length))},this))},show:function(a,b){var c=this.pages[a-1];this.page&&this.page.uid==c.uid||(this.page=c,Thumbnails.show(a),Window.updateBoxDimensions(),c.show($.proxy(function(){b&&b()},this)))},getPositionInActivePageGroup:function(a){var b=0;return $.each(this.pages,function(c,d){d.view.element&&d.view.element==a&&(b=c+1)}),b},getLoadingCount:function(){var a=0;return $.each(this.pages,function(b,c){c.loading&&a++}),a},removeAll:function(){$.each(this.pages,function(a,b){b.remove()}),this.pages=[]},hideInactive:function(a,b){var c=[];$.each(this.pages,$.proxy(function(a,b){b.uid!=this.page.uid&&c.push(b)},this));var d=0+c.length;return 1>d?a&&a():$.each(c,function(c,e){e.hide(function(){a&&--d<1&&a()},b)}),c.length},stopInactive:function(){$.each(this.pages,$.proxy(function(a,b){b.uid!=this.page.uid&&b.stop()},this))},stop:function(){$.each(this.pages,function(a,b){b.stop()})},handleTracking:function(a){Browser.IE&&Browser.IE<9?(this.setXY({x:a.pageX,y:a.pageY}),this.updatePositions()):this._tracking_timer=setTimeout($.proxy(function(){this.setXY({x:a.pageX,y:a.pageY}),this.updatePositions()},this),30)},clearTrackingTimer:function(){this._tracking_timer&&(clearTimeout(this._tracking_timer),this._tracking_timer=null)},startTracking:function(){Support.mobileTouch||this._handleTracking||$(document.documentElement).on("mousemove",this._handleTracking=$.proxy(this.handleTracking,this))},stopTracking:function(){!Support.mobileTouch&&this._handleTracking&&($(document.documentElement).off("mousemove",this._handleTracking),this._handleTracking=null,this.clearTrackingTimer())},setTracking:function(a){this.isTracking(a)||(this._tracking.push(this.pages[a-1]),1==this._tracking.length&&this.startTracking())},clearTracking:function(){this._tracking=[]},removeTracking:function(a){this._tracking=$.grep(this._tracking,function(b){return b._position!=a}),this._tracking.length<1&&this.stopTracking()},isTracking:function(a){var b=!1;return $.each(this._tracking,function(c,d){return d._position==a?(b=!0,!1):void 0}),b},setXY:function(a){this._xy=a},getXYP:function(a){var b=Pages.page,c=$.extend({},Window._boxDimensions),a=$.extend({},this._xy);a.y-=$(window).scrollTop(),b&&("outside"==b._ui||"fullclick"==b._ui)&&b._infoHeight>0&&(c.height-=b._infoHeight),a.y-=Window._boxPosition.top;var d={x:0,y:Math.min(Math.max(a.y/c.height,0),1)},e=20,f={x:"width",y:"height"},g={};return $.each("y".split(" "),$.proxy(function(a,b){g[b]=Math.min(Math.max(e/c[f[b]],0),1),d[b]*=1+2*g[b],d[b]-=g[b],d[b]=Math.min(Math.max(d[b],0),1)},this)),this.setXYP(d),this._xyp},setXYP:function(a){this._xyp=a},updatePositions:function(){this._tracking.length<1||$.each(this._tracking,function(a,b){b.position()})}};$.extend(View.prototype,{initialize:function(object){var options=arguments[1]||{},data={};if("string"==$.type(object))object={url:object};else if(object&&1==object.nodeType){var element=$(object);object={element:element[0],url:element.attr("href"),caption:element.data("fresco-caption"),group:element.data("fresco-group"),extension:element.data("fresco-extension"),type:element.data("fresco-type"),options:element.data("fresco-options")&&eval("({"+element.data("fresco-options")+"})")||{}}}if(object&&(object.extension||(object.extension=detectExtension(object.url)),!object.type)){var data=getURIData(object.url);object._data=data,object.type=data.type}return object._data||(object._data=getURIData(object.url)),object&&object.options?object.options=$.extend(!0,$.extend({},options),$.extend({},object.options)):object.options=$.extend({},options),object.options=Options.create(object.options,object.type,object._data),$.extend(this,object),this}});var Spinner={supported:Support.css.transform&&Support.css.animation,initialize:function(a){this.element=$("<div>").addClass("fr-spinner").hide();for(var b=1;12>=b;b++)this.element.append($("<div>").addClass("fr-spin-"+b));this.element.on("click",$.proxy(function(){Window.hide()},this)),this.element.on("fresco:mousewheel",function(a){a.preventDefault()})},setSkin:function(a){this.supported&&(this._skin&&this.element.removeClass("fr-spinner-skin-"+this._skin),this.updateDimensions(),this.element.addClass("fr-spinner-skin-"+a),this._skin=a)},updateDimensions:function(){var a=this._attached;a||this.attach(),this._dimensions={width:this.element.outerWidth(),height:this.element.outerHeight()},a||this.detach()},attach:function(){this._attached||($(document.body).append(this.element),this._attached=!0)},detach:function(){this._attached&&(this.element.detach(),this._attached=!1)},show:function(a,b){this._visible=!0,this.attach(),this.center();var c=Pages.page&&Pages.page.view.options.effects.spinner.show||0,d=("number"==$.type(b)?b:c)||0;this.element.stop(!0).fadeTo(d,1,a)},hide:function(a,b,c){this._visible=!1;var d=Pages.page&&Pages.page.view.options.effects.spinner.hide||0,e=("number"==$.type(b)?b:d)||0;this.element.stop(!0).fadeOut(e||0,$.proxy(function(){this.detach(),a&&a()},this))},center:function(){if(this.supported){this._dimensions||this.updateDimensions();var a=Pages.page,b=0;a&&"fullclick"==a._ui&&a._whileVisible(function(){b=a._getInfoHeight(Window._boxDimensions.width)}),this.element.css({top:Window._boxPosition.top+.5*Window._boxDimensions.height-.5*this._dimensions.height-.5*b,left:Window._boxPosition.left+.5*Window._boxDimensions.width-.5*this._dimensions.width})}}},_Fresco={_disabled:!1,_fallback:!0,initialize:function(){Window.initialize(),this._disabled||this.startDelegating()},startDelegating:function(){this._delegateHandler||$(document.documentElement).on("click",".fresco[href]",this._delegateHandler=$.proxy(this.delegate,this)).on("click",this._setClickXYHandler=$.proxy(this.setClickXY,this))},stopDelegating:function(){this._delegateHandler&&($(document.documentElement).off("click",".fresco[href]",this._delegateHandler).off("click",this._setClickXYHandler),this._setClickXYHandler=null,this._delegateHandler=null)},setClickXY:function(a){Pages.setXY({x:a.pageX,y:a.pageY})},delegate:function(a){if(!this._disabled){a.stopPropagation(),a.preventDefault();var b=a.currentTarget;this.setClickXY(a),_Fresco.show(b)}},show:function(object){if(this._disabled)return void this.showFallback.apply(_Fresco,_slice.call(arguments));var options=arguments[1]||{},position=arguments[2];arguments[1]&&"number"==$.type(arguments[1])&&(position=arguments[1],options={});var views=[],object_type,isElement=_.isElement(object);switch(object_type=$.type(object)){case"string":case"object":var view=new View(object,options),_dgo="data-fresco-group-options";if(view.group){if(isElement){var elements=$('.fresco[data-fresco-group="'+$(object).data("fresco-group")+'"]'),groupOptions={};elements.filter("["+_dgo+"]").each(function(i,element){$.extend(groupOptions,eval("({"+($(element).attr(_dgo)||"")+"})"))}),elements.each(function(a,b){position||b!=object||(position=a+1),views.push(new View(b,$.extend({},groupOptions,options)))})}}else{var groupOptions={};isElement&&$(object).is("["+_dgo+"]")&&($.extend(groupOptions,eval("({"+($(object).attr(_dgo)||"")+"})")),view=new View(object,$.extend({},groupOptions,options))),views.push(view)}break;case"array":$.each(object,function(a,b){var c=new View(b,options);views.push(c)})}var groupExtend={grouped:{caption:!1}},firstUI=views[0].options.ui;$.each(views,function(a,b){b.caption&&(groupExtend.grouped.caption=!0),a>0&&b.options.ui!=firstUI&&(b.options.ui=firstUI)}),$.each(views,function(a,b){b=$.extend(b,groupExtend)}),(!position||1>position)&&(position=1),position>views.length&&(position=views.length);var positionInAPG;isElement&&(positionInAPG=Pages.getPositionInActivePageGroup(object))?Window.setPosition(positionInAPG):Window.load(views,position)},showFallback:function(){function a(b){var c,d=$.type(b);if("string"==d)c=b;else if("array"==d&&b[0])c=a(b[0]);else if(_.isElement(b)&&$(b).attr("href"))var c=$(b).attr("href");else c=b.url?b.url:!1;return c}return function(b){if(this._fallback){var c=a(b);c&&(window.location.href=c)}}}()};$.extend(Fresco,{show:function(a){return _Fresco.show.apply(_Fresco,_slice.call(arguments)),this},hide:function(){return Window.hide(),this},disable:function(){return _Fresco.stopDelegating(),_Fresco._disabled=!0,this},enable:function(){return _Fresco._disabled=!1,_Fresco.startDelegating(),this},fallback:function(a){return _Fresco._fallback=a,this},setDefaultSkin:function(a){return Options.defaults.skin=a,this}}),(Browser.IE&&Browser.IE<7||"number"==$.type(Browser.Android)&&Browser.Android<3||Browser.MobileSafari&&"number"==$.type(Browser.WebKit)&&Browser.WebKit<533.18)&&(_Fresco.show=_Fresco.showFallback);var Thumbnails={initialize:function(a){this.element=a,this._thumbnails=[],this._orientation="vertical",this._vars={thumbnail:{},thumbnailFrame:{},thumbnails:{}},this.build(),this.startObserving()},build:function(){this.element.append(this.wrapper=$("<div>").addClass("fr-thumbnails-wrapper").append(this._slider=$("<div>").addClass("fr-thumbnails-slider").append(this._previous=$("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-previous").append(this._previous_button=$("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon")))).append(this._thumbs=$("<div>").addClass("fr-thumbnails-thumbs").append(this._slide=$("<div>").addClass("fr-thumbnails-slide"))).append(this._next=$("<div>").addClass("fr-thumbnails-side fr-thumbnails-side-next").append(this._next_button=$("<div>").addClass("fr-thumbnails-side-button").append($("<div>").addClass("fr-thumbnails-side-button-background")).append($("<div>").addClass("fr-thumbnails-side-button-icon"))))))},startObserving:function(){this._slider.delegate(".fr-thumbnail","click",$.proxy(function(a){a.stopPropagation();var b=$(a.target).closest(".fr-thumbnail")[0],c=b&&$(b).data("fr-position");c&&(this.setActive(c),Window.setPosition(c))},this)),this._slider.bind("click",function(a){a.stopPropagation()}),this._previous.bind("click",$.proxy(this.previousPage,this)),this._next.bind("click",$.proxy(this.nextPage,this))},load:function(a){this.clear();var b="horizontal",c=!1;$.each(a,$.proxy(function(a,d){"vertical"==d.options.thumbnails&&(b="vertical"),d.options.thumbnails||(c=!0)},this)),this.setOrientation(b),this._disabledGroup=c,$.each(a,$.proxy(function(a,b){this._thumbnails.push(new Thumbnail(b,a+1))},this)),this.fitToViewport()},clear:function(){$.each(this._thumbnails,function(a,b){b.remove()}),this._thumbnails=[],this._position=-1,this._page=-1},setOrientation:function(a){this._orientation&&Window.element.removeClass("fr-thumbnails-"+this._orientation),Window.element.addClass("fr-thumbnails-"+a),this._orientation=a},disable:function(){Window.element.removeClass("fr-thumbnails-enabled").addClass("fr-thumbnails-disabled"),this._disabled=!0},enable:function(){Window.element.removeClass("fr-thumbnails-disabled").addClass("fr-thumbnails-enabled"),this._disabled=!1},enabled:function(){return!this._disabled},disabled:function(){return this._disabled},updateVars:function(){var a=Window.element,b=this._vars,c=this._orientation,d="horizontal"==c,e=d?"top":"left",f=d?"left":"top",g=d?"bottom":"left",h=d?"top":"right",i=d?"width":"height",j=d?"height":"width",k={left:"right",right:"left",top:"bottom",bottom:"top"};this.element.removeClass("fr-thumbnails-measured");var l=a.is(":visible");if(l||a.show(),this.disabled()&&this.enable(),!this.element.is(":visible")||this._thumbnails.length<2||this._disabledGroup)return this.disable(),$.extend(this._vars.thumbnails,{width:0,height:0}),l||a.hide(),void this.element.addClass("fr-thumbnails-measured");this.enable();var m=this._previous,n=this._next,o=this._thumbs,p=Bounds.viewport(),q=this.element["inner"+_.String.capitalize(j)](),r=parseInt(this._thumbs.css("padding-"+e))||0,s=Math.max(q-2*r,0),t=parseInt(this._thumbs.css("padding-"+f))||0,u=(parseInt(this.element.css("margin-"+g))||0)+(parseInt(this.element.css("margin-"+h))||0);$.extend(b.thumbnails,{height:q+u,width:p[d?"width":"height"],paddingTop:r}),$.extend(b.thumbnail,{height:s,width:s}),$.extend(b.thumbnailFrame,{width:s+2*t,height:q}),b.sides={previous:{width:n["inner"+_.String.capitalize(i)](),marginLeft:parseInt(m.css("margin-"+f))||0,marginRight:parseInt(m.css("margin-"+k[f]))||0},next:{width:n["inner"+_.String.capitalize(i)](),marginLeft:parseInt(n.css("margin-"+f))||0,marginRight:parseInt(n.css("margin-"+k[f]))||0}};var v=p[i],w=b.thumbnailFrame.width,o=this._thumbnails.length;b.thumbnails.width=v,b.sides.enabled=o*w/v>1;var x=v,y=b.sides,z=y.previous,A=y.next,B=z.marginLeft+z.width+z.marginRight+A.marginLeft+A.width+A.marginRight;b.sides.enabled&&(x-=B),x=Math.floor(x/w)*w;var C=o*w;x>C&&(x=C);var D=x+(b.sides.enabled?B:0);b.ipp=x/w,this._mode="page",b.ipp<=1&&(x=v,D=v,b.sides.enabled=!1,this._mode="center"),b.pages=Math.ceil(o*w/x),b.wrapper={width:D+1,height:q},b.thumbs={width:x,height:q},b.slide={width:o*w+1,height:q},l||a.hide(),this.element.addClass("fr-thumbnails-measured")},hide:function(){this.disable(),this.thumbnails.hide(),this._visible=!1},getDimensions:function(){var a="horizontal"==this._orientation;return{width:a?this._vars.thumbnails.width:this._vars.thumbnails.height,height:a?this._vars.thumbnails.height:this._vars.thumbnails.width}},fitToViewport:function(){if(this.updateVars(),!this.disabled()){var a=$.extend({},this._vars),b="horizontal"==this._orientation;$.each(this._thumbnails,function(a,b){b.resize()}),this._previous[a.sides.enabled?"show":"hide"](),this._next[a.sides.enabled?"show":"hide"](),this._thumbs.css({width:a.thumbs[b?"width":"height"],height:a.thumbs[b?"height":"width"]}),this._slide.css({width:a.slide[b?"width":"height"],height:a.slide[b?"height":"width"]});var c={width:a.wrapper[b?"width":"height"],height:a.wrapper[b?"height":"width"]};c["margin-"+(b?"left":"top")]=Math.round(-.5*a.wrapper.width)+"px",c["margin-"+(b?"top":"left")]=0,this.wrapper.css(c),this._position&&this.moveTo(this._position,!0)}},moveToPage:function(a){if(!(1>a||a>this._vars.pages||a==this._page)){var b=this._vars.ipp*(a-1)+1;this.moveTo(b)}},previousPage:function(){this.moveToPage(this._page-1)},nextPage:function(){this.moveToPage(this._page+1)},show:function(a){var b=this._position<0;1>a&&(a=1);var c=this._thumbnails.length;a>c&&(a=c),this._position=a,this.setActive(a),("page"!=this._mode||this._page!=Math.ceil(a/this._vars.ipp))&&this.moveTo(a,b)},moveTo:function(a,b){if(this.updateVars(),!this.disabled()){var c,d="horizontal"==this._orientation,e=Bounds.viewport()[d?"width":"height"],f=.5*e,g=this._vars.thumbnailFrame.width;if("page"==this._mode){var h=Math.ceil(a/this._vars.ipp);this._page=h,c=-1*(g*(this._page-1)*this._vars.ipp);var i="fr-thumbnails-side-button-disabled";this._previous_button[(2>h?"add":"remove")+"Class"](i),this._next_button[(h>=this._vars.pages?"add":"remove")+"Class"](i)}else c=f+-1*(g*(a-1)+.5*g);var h=Pages.page,j={},k={};j[d?"top":"left"]=0,k[d?"left":"top"]=c+"px",this._slide.stop(!0).css(j).animate(k,b?0:h?h.view.options.effects.thumbnails.slide||0:0,$.proxy(function(){this.loadCurrentPage()},this))}},loadCurrentPage:function(){var a,b;if(this._position&&this._vars.thumbnailFrame.width&&!(this._thumbnails.length<1)){if("page"==this._mode){if(this._page<1)return;a=(this._page-1)*this._vars.ipp+1,b=Math.min(a-1+this._vars.ipp,this._thumbnails.length)}else{var c=("horizontal"==this._orientation,Math.ceil(this._vars.thumbnails.width/this._vars.thumbnailFrame.width));a=Math.max(Math.floor(Math.max(this._position-.5*c,0)),1),b=Math.ceil(Math.min(this._position+.5*c)),this._thumbnails.length<b&&(b=this._thumbnails.length)}for(var d=a;b>=d;d++)this._thumbnails[d-1].load()}},setActive:function(a){this._slide.find(".fr-thumbnail-active").removeClass("fr-thumbnail-active");var b=a&&this._thumbnails[a-1];b&&b.activate()},refresh:function(){this._position&&this.setPosition(this._position)}};$.extend(Thumbnail.prototype,{initialize:function(a,b){this.view=a,this._dimension={},this._position=b,this.preBuild()},preBuild:function(){this.thumbnail=$("<div>").addClass("fr-thumbnail").data("fr-position",this._position)},build:function(){if(!this.thumbnailFrame){var a=this.view.options;Thumbnails._slide.append(this.thumbnailFrame=$("<div>").addClass("fr-thumbnail-frame").append(this.thumbnail.append(this.thumbnailWrapper=$("<div>").addClass("fr-thumbnail-wrapper")))),"image"==this.view.type&&this.thumbnail.addClass("fr-load-thumbnail").data("thumbnail",{view:this.view,src:a.thumbnail||this.view.url});var b=a.thumbnail&&a.thumbnail.icon;b&&this.thumbnail.append($("<div>").addClass("fr-thumbnail-icon fr-thumbnail-icon-"+b));var c;this.thumbnail.append(c=$("<div>").addClass("fr-thumbnail-overlay").append($("<div>").addClass("fr-thumbnail-overlay-background")).append(this.loading=$("<div>").addClass("fr-thumbnail-loading").append($("<div>").addClass("fr-thumbnail-loading-background")).append(this.spinner=$("<div>").addClass("fr-thumbnail-spinner").hide().append($("<div>").addClass("fr-thumbnail-spinner-spin")))).append($("<div>").addClass("fr-thumbnail-overlay-border"))),this.thumbnail.append($("<div>").addClass("fr-thumbnail-state")),this.resize()}},remove:function(){this.thumbnailFrame&&(this.thumbnailFrame.remove(),this.thumbnailFrame=null,this.image=null),this.ready&&(this.ready.abort(),this.ready=null),this.vimeoThumbnail&&(this.vimeoThumbnail.abort(),this.vimeoThumbnail=null),this._loading=!1,this._removed=!0,this.view=null,this._clearDelay()},load:function(){if(!(this._loaded||this._loading||this._removed)){this.thumbnailWrapper||this.build(),this._loading=!0;var a=this.view.options.thumbnail,b=a&&"boolean"==$.type(a)?this.view.url:a||this.view.url;if(this._url=b,b)if("vimeo"==this.view.type)if(b==a)this._url=b,this._load(this._url);else switch(this.view.type){case"vimeo":this.vimeoThumbnail=new VimeoThumbnail(this.view.url,$.proxy(function(a){this._url=a,this._load(a)},this),$.proxy(function(){this._error()},this))}else this._load(this._url)}},activate:function(){this.thumbnail.addClass("fr-thumbnail-active")},_load:function(a){this.thumbnailWrapper.prepend(this.image=$("<img>").addClass("fr-thumbnail-image").attr({src:a}).css({opacity:1e-4})),this.fadeInSpinner(),this.ready=new ImageReady(this.image[0],$.proxy(function(a){var b=a.img;this.thumbnailFrame&&this._loading&&(this._loaded=!0,this._loading=!1,this._dimensions={width:b.naturalWidth,height:b.naturalHeight},this.resize(),this.show())},this),$.proxy(function(){this._error()},this),{method:this.view.options.loadedMethod})},_error:function(){this._loaded=!0,this._loading=!1,this.thumbnail.addClass("fr-thumbnail-error"),this.image.hide(),this.thumbnailWrapper.append($("<div>").addClass("fr-thumbnail-image")),this.show()},fadeInSpinner:function(){if(Spinner.supported&&this.view.options.spinner){this._clearDelay();var a=this.view.options.effects.thumbnail;this._delay=setTimeout($.proxy(function(){this.spinner.stop(!0).fadeTo(a.show||0,1)},this),this.view.options.spinnerDelay||0)}},show:function(){this._clearDelay();var a=this.view.options.effects.thumbnail;this.loading.stop(!0).delay(a.delay).fadeTo(a.show,0)},_clearDelay:function(){this._delay&&(clearTimeout(this._delay),this._delay=null)},resize:function(){if(this.thumbnailFrame){var a="horizontal"==Thumbnails._orientation;if(this.thumbnailFrame.css({width:Thumbnails._vars.thumbnailFrame[a?"width":"height"],height:Thumbnails._vars.thumbnailFrame[a?"height":"width"]}),this.thumbnailFrame.css({top:a?0:Thumbnails._vars.thumbnailFrame.width*(this._position-1),left:a?Thumbnails._vars.thumbnailFrame.width*(this._position-1):0}),this.thumbnailWrapper){var b=Thumbnails._vars.thumbnail;if(this.thumbnail.css({width:b.width,height:b.height,"margin-top":Math.round(-.5*b.height),"margin-left":Math.round(-.5*b.width),"margin-bottom":0,"margin-right":0}),this._dimensions){var c,d={width:b.width,height:b.height},e=Math.max(d.width,d.height),f=$.extend({},this._dimensions);if(f.width>d.width&&f.height>d.height){c=Fit.within(d,f);var g=1,h=1;c.width<d.width&&(g=d.width/c.width),c.height<d.height&&(h=d.height/c.height);var i=Math.max(g,h);i>1&&(c.width*=i,c.height*=i),$.each("width height".split(" "),function(a,b){c[b]=Math.round(c[b])})}else c=Fit.within(this._dimensions,f.width<d.width||f.height<d.height?{width:e,height:e}:d);var j=Math.round(.5*d.width-.5*c.width),k=Math.round(.5*d.height-.5*c.height);this.image.removeAttr("style").css($.extend({},c,{top:k,left:j}))}}}}});var UI={_modes:["fullclick","outside","inside"],_ui:!1,_validClickTargetSelector:[".fr-content-element",".fr-content",".fr-content > .fr-stroke",".fr-content > .fr-stroke .fr-stroke-color"].join(", "),initialize:function(a){$.each(this._modes,$.proxy(function(a,b){this[b].initialize()},this)),Window.element.addClass("fr-ui-inside-hidden fr-ui-fullclick-hidden")},set:function(a){this._ui&&(Window.element.removeClass("fr-window-ui-"+this._ui),Overlay.element.removeClass("fr-overlay-ui-"+this._ui)),Window.element.addClass("fr-window-ui-"+a),Overlay.element.addClass("fr-overlay-ui-"+a),this._enabled&&this._ui&&this._ui!=a&&(this[this._ui].disable(),this[a].enable(),UI[a].show()),this._ui=a},_onWindowResize:function(){Support.mobileTouch&&this.show()},enable:function(){$.each(this._modes,$.proxy(function(a,b){UI[b][b==this._ui?"enable":"disable"]()},this)),this._enabled=!0},disable:function(){$.each(this._modes,$.proxy(function(a,b){UI[b].disable()},this)),this._enabled=!1},adjustPrevNext:function(a,b){UI[this._ui].adjustPrevNext(a,b)},show:function(a,b){UI[this._ui].show(a,b)},hide:function(a,b){UI[this._ui].hide(a,b)},reset:function(){$.each(this._modes,$.proxy(function(a,b){UI[b].reset()},this))},update:function(){var a=Pages.page;a&&this.set(a._ui)}};return UI.fullclick={initialize:function(){this.build(),this._scrollLeft=-1},build:function(){Window._box.append(this._previous=$("<div>").addClass("fr-side fr-side-previous fr-side-previous-fullclick fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._next=$("<div>").addClass("fr-side fr-side-next fr-side-next-fullclick fr-toggle-ui").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._close=$("<div>").addClass("fr-close fr-close-fullclick").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon"))),Browser.IE&&Browser.IE<=7&&this._previous.add(this._next).add(this._close).hide(),this._close.on("click",$.proxy(function(a){a.preventDefault(),Window.hide()},this)),this._previous.on("click",$.proxy(function(a){Window.previous(),this._onMouseMove(a)},this)),this._next.on("click",$.proxy(function(a){Window.next(),this._onMouseMove(a)},this))},enable:function(){this.bind()},disable:function(){this.unbind()},reset:function(){Window.timers.clear("ui-fullclick"),this._x=-1,this._y=-1,this._scrollLeft=-1,this.resetPrevNext(),this._onMouseLeave()},resetPrevNext:function(){var a=this._previous.add(this._next);a.stop(!0).removeAttr("style")},bind:function(){this._onMouseUpHandler||(this.unbind(),Window._pages.on("mouseup",".fr-container",this._onMouseUpHandler=$.proxy(this._onMouseUp,this)),Support.mobileTouch||(Window.element.on("mouseenter",this._showHandler=$.proxy(this.show,this)).on("mouseleave",this._hideHandler=$.proxy(this.hide,this)),Window.element.on("mousemove",this._mousemoveHandler=$.proxy(function(a){var b=a.pageX,c=a.pageY;this._hoveringSideButton||c==this._y&&b==this._x||(this._x=b,this._y=c,this.show(),this.startTimer())},this)),Window._pages.on("mousemove",".fr-container",this._onMouseMoveHandler=$.proxy(this._onMouseMove,this)).on("mouseleave",".fr-container",this._onMouseLeaveHandler=$.proxy(this._onMouseLeave,this)).on("mouseenter",".fr-container",this._onMouseEnterHandler=$.proxy(this._onMouseEnter,this)),Window.element.on("mouseenter",".fr-side",this._onSideMouseEnterHandler=$.proxy(this._onSideMouseEnter,this)).on("mouseleave",".fr-side",this._onSideMouseLeaveHandler=$.proxy(this._onSideMouseLeave,this)),$(window).on("scroll",this._onScrollHandler=$.proxy(this._onScroll,this))))},unbind:function(){this._onMouseUpHandler&&(Window._pages.off("mouseup",".fr-container",this._onMouseUpHandler),this._onMouseUpHandler=null,this._showHandler&&(Window.element.off("mouseenter",this._showHandler).off("mouseleave",this._hideHandler).off("mousemove",this._mousemoveHandler),Window._pages.off("mousemove",".fr-container",this._onMouseMoveHandler).off("mouseleave",".fr-container",this._onMouseLeaveHandler).off("mouseenter",".fr-container",this._onMouseEnterHandler),Window.element.off("mouseenter",".fr-side",this._onSideMouseEnterHandler).off("mouseleave",".fr-side",this._onSideMouseLeaveHandler),$(window).off("scroll",this._onScrollHandler),this._showHandler=null))},adjustPrevNext:function(a,b){var c=Pages.page;if(!c)return void(a&&a());var d=Window.element.is(":visible");d||Window.element.show();var e=this._previous.attr("style");this._previous.removeAttr("style");var f=parseInt(this._previous.css("margin-top"));this._previous.attr({style:e}),d||Window.element.hide();var g=c._infoHeight||0,h=this._previous.add(this._next),i={"margin-top":f-.5*g},j="number"==$.type(b)?b:Pages.page&&Pages.page.view.options.effects.content.show||0;this.opening&&(j=0),h.stop(!0).animate(i,j,a),this._previous[(Window.mayPrevious()?"remove":"add")+"Class"]("fr-side-disabled"),this._next[(Window.mayNext()?"remove":"add")+"Class"]("fr-side-disabled"),h[(c._total<2?"add":"remove")+"Class"]("fr-side-hidden"),a&&a()},_onScroll:function(){this._scrollLeft=$(window).scrollLeft()},_onMouseMove:function(a){if(!Support.mobileTouch){var b=this._getEventSide(a),c=_.String.capitalize(b),d=b?Window["may"+c]():!1;if(b!=this._hoveringSide||d!=this._mayClickHoveringSide)switch(this._hoveringSide=b,this._mayClickHoveringSide=d,Window._box[(d?"add":"remove")+"Class"]("fr-hovering-clickable"),b){case"previous":Window._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");break;case"next":Window._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous")}}},_onMouseLeave:function(a){Window._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next"),this._hoveringSide=!1},_onMouseUp:function(a){if(!(a.which>1)){if(1==Pages.pages.length)return void Window.hide();var b=this._getEventSide(a);Window[b](),this._onMouseMove(a)}},_onMouseEnter:function(a){this._onMouseMove(a)},_getEventSide:function(a){var b=(this._scrollLeft>-1?this._scrollLeft:this._scrollLeft=$(window).scrollLeft(),a.pageX-Window._boxPosition.left-this._scrollLeft),c=Window._boxDimensions.width;return.5*c>b?"previous":"next"},_onSideMouseEnter:function(a){this._hoveringSideButton=!0,this._hoveringSide=this._getEventSide(a),this._mayClickHoveringSide=Window["may"+_.String.capitalize(this._hoveringSide)](),this.clearTimer()},_onSideMouseLeave:function(a){this._hoveringSideButton=!1,this._hoveringSide=!1,this._mayClickHoveringSide=!1,this.startTimer()},show:function(a){return this._visible?(this.startTimer(),void("function"==$.type(a)&&a())):(this._visible=!0,this.startTimer(),Window.element.addClass("fr-visible-fullclick-ui").removeClass("fr-hidden-fullclick-ui"),Browser.IE&&Browser.IE<=7&&this._previous.add(this._next).add(this._close).show(),void("function"==$.type(a)&&a()))},hide:function(a){var b=Pages.page&&Pages.page.view.type;return!this._visible||b&&("youtube"==b||"vimeo"==b)?void("function"==$.type(a)&&a()):(this._visible=!1,Window.element.removeClass("fr-visible-fullclick-ui").addClass("fr-hidden-fullclick-ui"),void("function"==$.type(a)&&a()))},clearTimer:function(){Support.mobileTouch||Window.timers.clear("ui-fullclick")},startTimer:function(){Support.mobileTouch||(this.clearTimer(),Window.timers.set("ui-fullclick",$.proxy(function(){this.hide()},this),Window.view?Window.view.options.uiDelay:0))}},UI.inside={initialize:function(){},enable:function(){this.bind()},disable:function(){this.unbind()},bind:function(){this._onMouseUpHandler||(this.unbind(),Window._pages.on("mouseup",".fr-content",this._onMouseUpHandler=$.proxy(this._onMouseUp,this)),Window._pages.on("click",".fr-content .fr-close",$.proxy(function(a){a.preventDefault(),Window.hide()},this)).on("click",".fr-content .fr-side-previous",$.proxy(function(a){Window.previous(),this._onMouseMove(a)},this)).on("click",".fr-content .fr-side-next",$.proxy(function(a){Window.next(),this._onMouseMove(a)},this)),Window.element.on("click",".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper",this._delegateOverlayCloseHandler=$.proxy(this._delegateOverlayClose,this)),Support.mobileTouch||(Window.element.on("mouseenter",".fr-content",this._showHandler=$.proxy(this.show,this)).on("mouseleave",".fr-content",this._hideHandler=$.proxy(this.hide,this)),Window.element.on("mousemove",".fr-content",this._mousemoveHandler=$.proxy(function(a){var b=a.pageX,c=a.pageY;this._hoveringSideButton||c==this._y&&b==this._x||(this._x=b,this._y=c,this.show(),this.startTimer())},this)),Window._pages.on("mousemove",".fr-info, .fr-close",$.proxy(function(a){a.stopPropagation(),this._onMouseLeave(a)},this)),Window._pages.on("mousemove",".fr-info",$.proxy(function(a){this.clearTimer()},this)),Window._pages.on("mousemove",".fr-content",this._onMouseMoveHandler=$.proxy(this._onMouseMove,this)).on("mouseleave",".fr-content",this._onMouseLeaveHandler=$.proxy(this._onMouseLeave,this)).on("mouseenter",".fr-content",this._onMouseEnterHandler=$.proxy(this._onMouseEnter,this)),Window.element.on("mouseenter",".fr-side",this._onSideMouseEnterHandler=$.proxy(this._onSideMouseEnter,this)).on("mouseleave",".fr-side",this._onSideMouseLeaveHandler=$.proxy(this._onSideMouseLeave,this)),$(window).on("scroll",this._onScrollHandler=$.proxy(this._onScroll,this))))},unbind:function(){this._onMouseUpHandler&&(Window._pages.off("mouseup",".fr-content",this._onMouseUpHandler),this._onMouseUpHandler=null,Window._pages.off("click",".fr-content .fr-close").off("click",".fr-content .fr-side-previous").off("click",".fr-content .fr-side-next"),Window.element.off("click",".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper",this._delegateOverlayCloseHandler),this._showHandler&&(Window.element.off("mouseenter",".fr-content",this._showHandler).off("mouseleave",".fr-content",this._hideHandler).off("mousemove",".fr-content",this._mousemoveHandler),Window._pages.off("mousemove",".fr-info, .fr-close"),Window._pages.off("mousemove",".fr-info"),Window._pages.off("mousemove",".fr-content-element",this._onMouseMoveHandler).off("mouseleave",".fr-content",this._onMouseLeaveHandler).off("mouseenter",".fr-content",this._onMouseEnterHandler),Window.element.off("mouseenter",".fr-side",this._onSideMouseEnterHandler).off("mouseleave",".fr-side",this._onSideMouseLeaveHandler),$(window).off("scroll",this._onScrollHandler),this._showHandler=null))},reset:function(){Window.timers.clear("ui-fullclick"),this._x=-1,this._y=-1,this._scrollLeft=-1,this._hoveringSide=!1,this._onMouseLeave()},adjustPrevNext:function(a){a&&a()},_onScroll:function(){this._scrollLeft=$(window).scrollLeft()},_delegateOverlayClose:function(a){var b=Pages.page;b&&b.view.options.overlay&&!b.view.options.overlay.close||$(a.target).is(".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper")&&(a.preventDefault(),a.stopPropagation(),Window.hide())},_onMouseMove:function(a){if(!Support.mobileTouch){var b=this._getEventSide(a),c=_.String.capitalize(b),d=b?Window["may"+c]():!1;if((1==Pages.pages.length||Pages.page&&"close"==Pages.page.view.options.onClick)&&(b=!1),b!=this._hoveringSide||d!=this._mayClickHoveringSide)if(this._hoveringSide=b,this._mayClickHoveringSide=d,b)switch(Window._box[(d?"add":"remove")+"Class"]("fr-hovering-clickable"),b){case"previous":Window._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");break;case"next":Window._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous")}else Window._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next")}},_onMouseLeave:function(a){Window._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next"),this._hoveringSide=!1},_onMouseUp:function(a){if(!(a.which>1)&&$(a.target).is(UI._validClickTargetSelector)){if(1==Pages.pages.length||Pages.page&&"close"==Pages.page.view.options.onClick)return void Window.hide();var b=this._getEventSide(a);Window[b](),this._onMouseMove(a)}},_onMouseEnter:function(a){this._onMouseMove(a)},_getEventSide:function(a){var b=(this._scrollLeft>-1?this._scrollLeft:this._scrollLeft=$(window).scrollLeft(),a.pageX-Window._boxPosition.left-this._scrollLeft),c=Window._boxDimensions.width;return.5*c>b?"previous":"next"},_onSideMouseEnter:function(a){this._hoveringSideButton=!0,this._hoveringSide=this._getEventSide(a),this._mayClickHoveringSide=Window["may"+_.String.capitalize(this._hoveringSide)](),this.clearTimer()},_onSideMouseLeave:function(a){this._hoveringSideButton=!1,this._hoveringSide=!1,this._mayClickHoveringSide=!1,this.startTimer()},show:function(a){return this._visible?(this.startTimer(),void("function"==$.type(a)&&a())):(this._visible=!0,this.startTimer(),Window.element.addClass("fr-visible-inside-ui").removeClass("fr-hidden-inside-ui"),void("function"==$.type(a)&&a()))},hide:function(a){return this._visible?(this._visible=!1,Window.element.removeClass("fr-visible-inside-ui").addClass("fr-hidden-inside-ui"),void("function"==$.type(a)&&a())):void("function"==$.type(a)&&a())},clearTimer:function(){Support.mobileTouch||Window.timers.clear("ui-inside")},startTimer:function(){Support.mobileTouch||(this.clearTimer(),Window.timers.set("ui-inside",$.proxy(function(){this.hide()},this),Window.view?Window.view.options.uiDelay:0))}},UI.outside={initialize:function(){this.build(),this._scrollLeft=-1},build:function(){Window._box.append(this._previous=$("<div>").addClass("fr-side fr-side-previous fr-side-previous-outside").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._next=$("<div>").addClass("fr-side fr-side-next fr-side-next-outside").append($("<div>").addClass("fr-side-button").append($("<div>").addClass("fr-side-button-background")).append($("<div>").addClass("fr-side-button-icon")))).append(this._close=$("<div>").addClass("fr-close fr-close-outside").append($("<div>").addClass("fr-close-background")).append($("<div>").addClass("fr-close-icon"))),Browser.IE&&Browser.IE<=7&&this._previous.add(this._next).add(this._close).hide(),this._close.on("click",$.proxy(function(a){a.preventDefault(),Window.hide()},this)),this._previous.on("click",$.proxy(function(a){Window.previous(),this._onMouseMove(a)},this)),this._next.on("click",$.proxy(function(a){Window.next(),this._onMouseMove(a)},this))},enable:function(){this.bind()},disable:function(){this.unbind()},reset:function(){Window.timers.clear("ui-outside"),this._x=-1,this._y=-1,this._scrollLeft=-1,this._onMouseLeave()},bind:function(){this._onMouseUpHandler||(this.unbind(),Window.element.on("mouseup",".fr-content",this._onMouseUpHandler=$.proxy(this._onMouseUp,this)),Window.element.on("click",".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper",this._delegateOverlayCloseHandler=$.proxy(this._delegateOverlayClose,this)),Support.mobileTouch||(Window._pages.on("mousemove",".fr-content",this._onMouseMoveHandler=$.proxy(this._onMouseMove,this)).on("mouseleave",".fr-content",this._onMouseLeaveHandler=$.proxy(this._onMouseLeave,this)).on("mouseenter",".fr-content",this._onMouseEnterHandler=$.proxy(this._onMouseEnter,this)),Window.element.on("mouseenter",".fr-side",this._onSideMouseEnterHandler=$.proxy(this._onSideMouseEnter,this)).on("mouseleave",".fr-side",this._onSideMouseLeaveHandler=$.proxy(this._onSideMouseLeave,this)),$(window).on("scroll",this._onScrollHandler=$.proxy(this._onScroll,this))))},unbind:function(){this._onMouseUpHandler&&(Window.element.off("mouseup",".fr-content",this._onMouseUpHandler),this._onMouseUpHandler=null,Window.element.off("click",".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper",this._delegateOverlayCloseHandler),this._onMouseMoveHandler&&(Window._pages.off("mousemove",".fr-content",this._onMouseMoveHandler).off("mouseleave",".fr-content",this._onMouseLeaveHandler).off("mouseenter",".fr-content",this._onMouseEnterHandler),Window.element.off("mouseenter",".fr-side",this._onSideMouseEnterHandler).off("mouseleave",".fr-side",this._onSideMouseLeaveHandler),$(window).off("scroll",this._onScrollHandler),this._onMouseMoveHandler=null))},adjustPrevNext:function(a,b){var c=Pages.page;if(!c)return void(a&&a());var d=this._previous.add(this._next);this._previous[(Window.mayPrevious()?"remove":"add")+"Class"]("fr-side-disabled"),this._next[(Window.mayNext()?"remove":"add")+"Class"]("fr-side-disabled"),d[(c._total<2?"add":"remove")+"Class"]("fr-side-hidden"),a&&a()},_onScroll:function(){this._scrollLeft=$(window).scrollLeft()},_delegateOverlayClose:function(a){var b=Pages.page;b&&b.view.options.overlay&&!b.view.options.overlay.close||$(a.target).is(".fr-container, .fr-thumbnails, .fr-thumbnails-wrapper")&&(a.preventDefault(),a.stopPropagation(),Window.hide())},_onMouseMove:function(a){if(!Support.mobileTouch){var b=this._getEventSide(a),c=_.String.capitalize(b),d=b?Window["may"+c]():!1;if((1==Pages.pages.length||Pages.page&&"close"==Pages.page.view.options.onClick)&&(b=!1),b!=this._hoveringSide||d!=this._mayClickHoveringSide)if(this._hoveringSide=b,this._mayClickHoveringSide=d,b)switch(Window._box[(d?"add":"remove")+"Class"]("fr-hovering-clickable"),b){case"previous":Window._box.addClass("fr-hovering-previous").removeClass("fr-hovering-next");break;case"next":Window._box.addClass("fr-hovering-next").removeClass("fr-hovering-previous")}else Window._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next")}},_onMouseLeave:function(a){Window._box.removeClass("fr-hovering-clickable fr-hovering-previous fr-hovering-next"),this._hoveringSide=!1},_onMouseUp:function(a){if(!(a.which>1)&&$(a.target).is(UI._validClickTargetSelector)){if(1==Pages.pages.length||Pages.page&&"close"==Pages.page.view.options.onClick)return void Window.hide();var b=this._getEventSide(a);Window[b](),this._onMouseMove(a)}},_onMouseEnter:function(a){this._onMouseMove(a)},_getEventSide:function(a){var b=(this._scrollLeft>-1?this._scrollLeft:this._scrollLeft=$(window).scrollLeft(),a.pageX-Window._boxPosition.left-this._scrollLeft),c=Window._boxDimensions.width;return.5*c>b?"previous":"next"},show:function(){Browser.IE&&Browser.IE<=7&&this._previous.add(this._next).add(this._close).show()},hide:function(){},_onSideMouseEnter:function(a){this._hoveringSideButton=!0,this._hoveringSide=this._getEventSide(a),this._mayClickHoveringSide=Window["may"+_.String.capitalize(this._hoveringSide)]()},_onSideMouseLeave:function(a){this._hoveringSideButton=!1,this._hoveringSide=!1,this._mayClickHoveringSide=!1},clearTimer:function(){}},$(document).ready(function(a){_Fresco.initialize()}),Fresco});

/*-------------jquery fresco popup plugin--------------*/