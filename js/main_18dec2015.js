$(document).ready(function(){
    
    /**Add location input box js**/
    	var max_fields      = 10; //maximum input boxes allowed
		var wrapper         = $(".locationWrapper"); //Fields wrapper
		var add_button      = $(".add_btn"); //Add button ID
	
		var x = 1; //initlal text box count
		$(add_button).click(function(e){ //on add input button click
			e.preventDefault();
			
		    var adddelocationName = $('.add--location').val();
			if(adddelocationName.length==0){
				return false;	
			}
			$('.add--location').val("");
			//if(x < max_fields){ //max input box allowed
				x++; //text box increment
				$(wrapper).append('<div class="added-location">'+adddelocationName+'<span class="append-text"></span><span class="add-removeBtn remove_btn"></span></div>'); //add input box
			//}
		});
		
		$(wrapper).on("click",".remove_btn", function(e){ //user click on remove text
			e.preventDefault(); $(this).parent('div').remove(); x--;
		})
		//.locationWrapper scroll init is at 54
		
		 
		/**video page template**/
        //used in ap-video-lib-template.html 
        //This will change tab content on when you select option from select list
        $('.selectpicker').on('change', function (e) {
            $('#tab-nav li a').eq($(this).val()).tab('show'); 
        });

    
    

	$('.accrdn-title').click(function (){
		if($(this).hasClass("open")){
			$(this).removeClass("open");
			$(this).next(".accrdn-cntnt").removeClass("showng");
			$(this).next(".accrdn-cntnt").slideUp();
		}
		else{
			$(this).next(".accrdn-cntnt").slideDown();
			$(this).addClass("open");
			$(this).parent().siblings().find(".accrdn-cntnt").slideUp();
			$(this).next(".accrdn-cntnt").addClass("showng");
			$(this).parent().siblings().find(".accrdn-title").removeClass("open");
		}	
	});

	var winWidth = $(window).width();

	if (winWidth > 767) {
		$('ul.sf-menu').superfish({
			pathClass:	'current'
		});
		$('.scroll-div,.locationWrapper').niceScroll({
			background: "#6e6d71",
			cursorcolor: "#6e6d71",
			cursorwidth: "6px",
			cursorborder: "0 none",
			autohidemode: false,
			cursorborderradius: "10px",
			horizrailenabled: false
		});
		$('.sf-mega').niceScroll({
			background: "#333",
			cursorcolor: "#ff3333",
			cursorwidth: "6px",
			cursorborder: "0 none",
			autohidemode: false,
			cursorborderradius: "10px",
			horizrailenabled: false
		});
		$('#gutter1').css("height", "142px");
	
		$(window).scroll(function() {
			if ($(this).scrollTop() > 38) {
		      	$('.hdr-top').slideUp(400);
		      	$('#gutter1').css("height", "104px");
		    } else {
		    	$('#gutter1').css("height", "142px");
		      	$('.hdr-top').slideDown(400);
		    }
		});
	}
	$('.main-sldr').bxSlider({
		auto: true,
		controls: false
	});

	$('.choose-intrst a').click(function(e) {
		e.preventDefault();
		$(this).toggleClass('active');
		$('.intrst-panel').slideToggle(100);
	});
	
	$('.interest_search, .interest_save').click(function(e) {
		$('.intrst-panel').slideUp(100);
		
		
		$('.choose-intrst a').removeClass('active');
	});

	$('.menu-btn').click(function(e) {
		e.preventDefault();
		$(this).toggleClass('active');
		$('.inner-menu').slideToggle(100);
	});
	

	$('.post-scroll').niceScroll({
		background: "#ccc",
		cursorcolor: "#333",
		cursorwidth: "10px",
		cursorborder: "0 none",
		autohidemode: false,
		cursorborderradius: "0px",
		horizrailenabled: false
	});
	$('.menu-tabs').responsiveTabs();

	
	if (winWidth < 767) {
		$('.intrst-hdng').click(function (e){
			if($(this).hasClass("active-hdng")){
				$(this).removeClass("active-hdng");
				$(this).next(".intrst-check").slideUp();
			}
			else{
				$(this).next(".intrst-check").slideDown();
				$(this).addClass("active-hdng");
				$(this).parent().siblings().find(".intrst-check").slideUp();
				$(this).parent().siblings().find(".intrst-hdng").removeClass("active-hdng");
			}	
		});
		$('.main-nav > li > a').click(function (e){
			if($(this).hasClass("active-hdng")){
				$(this).removeClass("active-hdng");
				$(this).next(".sf-mega").slideUp();
			}
			else{
				$(this).next(".sf-mega").slideDown();
				$(this).addClass("active-hdng");
				$(this).parent().siblings().find(".sf-mega").slideUp();
				$(this).parent().siblings().find("a").removeClass("active-hdng");
			}	
		});
		$('#homeowner-tggle').click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			$('#homeowner-drpdwn').toggle();
		});
		$('html').click( function(e){
			$('#homeowner-drpdwn').hide();
		});
		$('.menu-tggle').click( function() {
			$(this).toggleClass("active");
			$('.main-nav').slideToggle(100);
		});
		$('#gutter1').css("height", "70px");
		$(window).scroll(function() {
			if ($(this).scrollTop() > 21) {
				$('#gutter1').css("height", "70px");
		      	$('.hdr-top').slideUp(400);
		      	$('.fix-secn').addClass('actv');
		    } else {
		      	$('.hdr-top').slideDown(400);
		      	$('.fix-secn').removeClass('actv');
		    }
		});
		$('.inner-menu li a').click(function(e) {
			e.preventDefault();
			if (!$(this).parent().hasClass("child")) {
				$(this).parents(".inner-menu").hide();
			}
			$(this).parent().find('ul').slideToggle();
		});
	}
	if (winWidth > 992) {
		
		$('.choose-intrst a').click(function() {
			if (!$('choose-intrst a').hasClass('active')){
				$('html, body').animate({scrollTop: $('.choose-intrst').offset().top -104 }, 'slow');
			}
		});
	}
	$(window).scroll(function() {
		if ($(this).scrollTop() > 38) {
			$('.morph-button button').addClass('opacity');
		} else {
			$('.morph-button button').removeClass('opacity');
		}
	});

	if (winWidth < 992) {
		$('.srch-input button').click( function(e) {
			e.preventDefault();
			$('.srch-input input').toggle();
			$(this).toggleClass('active');
		});		
	}
	
	$(window).resize(function() {
			$(window).scroll(function() {
				if ($(document).scrollTop() > 38) {
			      	$('.fix-secn').addClass("fixed");
			    } else {
			      	$('.fix-secn').removeClass("fixed");
			    }
			});
		if (winWidth < 992) {
			$('.srch-input button').click( function(e) {
				e.preventDefault();
				$('.srch-input input').toggle();
				$(this).toggleClass('active');
			});
			
		}
	});
	$('.cntry-list li').click(function() {
		var imgSrc = $(this).find('.cntry-flag img').attr('src');
		$('.india-flag img').attr('src', imgSrc);
	});

	var docElem = window.document.documentElement, didScroll, scrollPosition,
					container = document.getElementById( 'container' );

				// trick to prevent scrolling when opening/closing button
				function noScrollFn() {
					window.scrollTo( scrollPosition ? scrollPosition.x : 0, scrollPosition ? scrollPosition.y : 0 );
				}

				function noScroll() {
					window.removeEventListener( 'scroll', scrollHandler );
					window.addEventListener( 'scroll', noScrollFn );
				}

				function scrollFn() {
					window.addEventListener( 'scroll', scrollHandler );
				}

				function canScroll() {
					window.removeEventListener( 'scroll', noScrollFn );
					scrollFn();
				}

				function scrollHandler() {
					if( !didScroll ) {
						didScroll = true;
						setTimeout( function() { scrollPage(); }, 60 );
					}
				};

				function scrollPage() {
					scrollPosition = { x : window.pageXOffset || docElem.scrollLeft, y : window.pageYOffset || docElem.scrollTop };
					didScroll = false;
				};

				scrollFn();
				
				var el = document.querySelector( '.morph-button' );
				
				new UIMorphingButton( el, {
					closeEl : '.icon-close',
					onBeforeOpen : function() {
						// don't allow to scroll
						noScroll();
						// push main container
						classie.addClass( container, 'pushed' );
					},
					onAfterOpen : function() {
						// can scroll again
						canScroll();
						// add scroll class to main el
						classie.addClass( el, 'scroll' );
					},
					onBeforeClose : function() {
						// remove scroll class from main el
						classie.removeClass( el, 'scroll' );
						// don't allow to scroll
						noScroll();
						// push back main container
						classie.removeClass( container, 'pushed' );
					},
					onAfterClose : function() {
						// can scroll again
						canScroll();
					}
				} );

				var offset = 600,
					offset_opacity = 1200,
					scroll_top_duration = 500,
					$back_to_top = $('.move-top');

				$(window).scroll(function(){
					( $(this).scrollTop() > offset ) ? $back_to_top.addClass('visible') : $back_to_top.removeClass('visible cd-fade-out');
					if( $(this).scrollTop() > offset_opacity ) { 
						$back_to_top.addClass('cd-fade-out');
					}
				});

				$back_to_top.on('click', function(event){
					event.preventDefault();
					$('body,html').animate({
						scrollTop: 0 ,
					 	}, scroll_top_duration
					);
				});

			$('.newslttr .signup-input button').click(function(){
				$("#myModal").modal('show');
			});

			$('.selectpicker').selectpicker();
			$('.selectform-bluebg').selectpicker();

			$('.inner-menu li a[href*=#]:not([href=#])').click(function() {
			    if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
					var target = $(this.hash);
					target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
					if (target.length && $(window).width() > 767) {
						$('html,body').animate({
							scrollTop: target.offset().top - 170 + "px"
						}, 1000);
						return false;
					} else {
						$('html,body').animate({
							scrollTop: target.offset().top - 70 + "px"
						}, 1000);
					}
			    }
			});

			$('.services-slider').bxSlider({
				controls:true,
				pager:false
			});
			$(".gallery-thumb-carousel").owlCarousel({
				items: 3,
				pagination: false,
				mouseDrag: false,
				navigation: true
			});
			$(".gallery-carousel").owlCarousel({
				singleItem: true,
				pagination: false,
				mouseDrag: false,
				navigation: true
			});
			$(".gallery-thumb-carousel2").owlCarousel({
				items: 2,
				pagination: false,
				mouseDrag: false,
				navigation: true
			});

			function reposition() {
		        var modal = $(this),
		            dialog = modal.find('.modal-dialog');
		        modal.css('display', 'block');
		        
		        // Dividing by two centers the modal exactly, but dividing by three 
		        // or four works better for larger screens.
		        dialog.css("margin-top", Math.max(0, ($(window).height() - dialog.height()) / 2));
		    }
		    // Reposition when a modal is shown
		    $('.modal').on('show.bs.modal', reposition);
		    // Reposition when the window is resized
		    $(window).on('resize', function() {
		        $('.modal:visible').each(reposition);
		    });

		    $('.add-file').click(function() {
		    	$('.upload-col:first').clone().insertBefore('.add-file-col');
		    });

		    $(".owl-carousel-item-4").owlCarousel({
				items: 4,
				navigation : true,
				responsiveClass:true,
				navigationText: [ "", "" ],
				autoplay:false
			});

			var owl2 = $(".owlCarousel-auto-item-4"),
 		status = $("#owlStatus");
		
      $(".owlCarousel-auto-item-6").owlCarousel({
		  items: 6,
		  navigation : true,
        afterAction : afterAction,
		 responsiveClass:true,
		autoPlay: 3000,
		itemsTablet: [768,3],
		navigationText: [
      "<i class='icon-chevron-left icon-white'><</i>",
      "<i class='icon-chevron-right icon-white'>></i>"
      ]
      });
	  $(".owlCarousel-auto-item-4").owlCarousel({
		  items : 4,
		  navigation : true,
        afterAction : afterAction,
		 responsiveClass:true,
		autoPlay: 3000,
		itemsTablet: [768,3],
		navigationText: [
      "<i class='icon-chevron-left icon-white'><</i>",
      "<i class='icon-chevron-right icon-white'>></i>"
      ]
      });

      function updateResult(pos,value){
        status.find(pos).find(".result").text(value);
      }

      function afterAction(){
        updateResult(".owlItems", this.owl.owlItems.length);
        updateResult(".currentItem", this.owl.currentItem);
        updateResult(".prevItem", this.prevItem);
        updateResult(".visibleItems", this.owl.visibleItems);
        updateResult(".dragDirection", this.owl.dragDirection);
      }

       var owl3 = $(".owlCarousel-auto-item-4"),
 		status = $("#owlStatus");
		
      $(".owlCarousel-auto-item-5").owlCarousel({
		  items: 5,
		  navigation : true,
		   responsiveClass:true,
        afterAction : afterAction,
		//autoPlay: 3000,
		itemsTablet: [768,3],
		navigationText: [
      "",
      ""
      ]
      });
	  $(".owlCarousel-auto-item-6").owlCarousel({
		  items : 6,
		  navigation : true,
		   responsiveClass:true,
        afterAction : afterAction,
		autoPlay: 3000,
		itemsTablet: [768,3],
		navigationText: [
      "<i class='icon-chevron-left icon-white'><</i>",
      "<i class='icon-chevron-right icon-white'>></i>"
      ]
      });
	  $(".owlCarousel-auto-item-4").owlCarousel({
		  items : 4,
		  navigation : true,
		  responsiveClass:true,
        afterAction : afterAction,
		autoPlay: 3000,
		itemsTablet: [768,3],
		navigationText: [
      "<i class='icon-chevron-left icon-white'><</i>",
      "<i class='icon-chevron-right icon-white'>></i>"
      ]
      });

      function updateResult(pos,value){
        status.find(pos).find(".result").text(value);
      }

      function afterAction(){
        updateResult(".owlItems", this.owl.owlItems.length);
        updateResult(".currentItem", this.owl.currentItem);
        updateResult(".prevItem", this.prevItem);
        updateResult(".visibleItems", this.owl.visibleItems);
        updateResult(".dragDirection", this.owl.dragDirection);
      }

      $('.slide-link').click(function(){
			$('.slide-link').children('.arrow_box').removeClass("active-border");
			$(this).children('.arrow_box').addClass("active-border");
			var catId = $(this).data("id");
			$('.gall-detail').removeClass('active-itm')
			 $('.gall-detail').hide();
		    $("#" + catId + ".gall-detail").show();
		});

});