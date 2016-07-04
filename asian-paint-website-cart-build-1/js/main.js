$(document).ready(function(){

    localStorage.setItem("loadmoreclick","false");

   /*** ------------------ Add location input box js ------------------ ***/
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


   /*** ------------------ custom responsive tabs ------------------ ***/
   //used in ap-video-lib-template.html
   //This will change tab content on when you select option from select list
   $(".custom-responsive-tab").each(function(){
       var wrapper = $(this);
       var selectPicker = $(".selectpicker", wrapper);
       var tabsWrapper = $(".tab-nav-wrapper", wrapper);
       var tabsList = tabsWrapper.children("li");
       selectPicker.on("change", function(e){
          tabsList.eq($(this).val()).children("a").tab('show');
          tabsList.eq($(this).val()).children("a").trigger('click');
       });
   });


   /*** ------------------ accordion component ------------------ ***/
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


   /*** ------------------ password component ------------------ ***/
   $(".edit_passowrd").css("display", "none");
   $("#change_passowrd").click(function(e) {
        $(".edit_passowrd").fadeIn(500).css("display", "block");
      return false;
    });
   $("#password_submit").click(function(e) {
         $(".edit_passowrd").fadeOut(500).css("display", "none");
         return false;
    });


   /*** ------------------ header menu component ------------------ ***/
   var winWidth = $(window).width();
   if(winWidth > 767) {
      $('ul.sf-menu').superfish({
         pathClass: 'current'
      });
      $('.scroll-div,.locationWrapper,.intrst-check').niceScroll({
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


   /* inspiration - show more toggle list */
   $('.choose-intrst a').click(function(e) {
      $(this).toggleClass('active');
      $('.intrst-panel').slideToggle(100);
      e.stopPropagation();
      return false;
   });
   $(".filter-secn.gllry").click(function(e) {
        e.stopPropagation();
    });
   $(document).click(function(e){
        $('.choose-intrst a').removeClass("active");
      $('.intrst-panel').slideUp(100);
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

    var isCollapsible = ($(window).width() < 768) ? true : false;
    var eventType = ($(window).width() < 768) ? 'click' : 'mouseover';
    var animType = ($(window).width() < 768) ? 'slide' : '';
    var isScrollToAccordion = ($(window).width() < 768) ? true : false;
    $('.menu-tabs').responsiveTabs({
      collapsible: isCollapsible,
      event: eventType,
      setHash: false,
      animation:animType
    });
        $('.super-close').click(function(){
          $('.sf-mega').css('display','none');
        });

   if(winWidth < 991) {
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
         if($(this).hasClass('active')){
            $('.morph-button').css({'visibility':'hidden'});
            $('html,body').css({'overflow':'hidden'});
         }else{
            $('.morph-button').css({'visibility':'visible'});
            $('html,body').css({'overflow':'auto'});
         }
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
            //$(this).parents(".inner-menu").hide();
         }
         $('.menu-btn').trigger("click");
         //$(this).parent().find('ul').slideToggle();
      });
   }

   if(winWidth > 992){
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
    $('.srch-input button').click( function(e) {
        var winWidth = $(window).width();
        if(winWidth < 992){
         e.preventDefault();
         $('.srch-input input').toggle();
         $(this).toggleClass('active');
        }
   });
   $(window).resize(function() {
      $(window).scroll(function() {
         if ($(document).scrollTop() > 38) {
            $('.fix-secn').addClass("fixed");
         } else {
            $('.fix-secn').removeClass("fixed");
         }
      });
      var winWidth = $(window).width();
      if(winWidth >= 992){
         $('.srch-input input').css('display', 'block');
      }
   });
   $('.cntry-list li').click(function() {
      var imgSrc = $(this).find('.cntry-flag img').attr('src');
      $('.india-flag img').attr('src', imgSrc);
   });

   var docElem = window.document.documentElement, didScroll, scrollPosition,
   container = document.getElementById( 'container' );


   /*** ------------------ morph menu trick to prevent scrolling when opening/closing button ------------------ ***/
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

   /*** ------------------ window top CTA ------------------ ***/
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


   /*** ------------------ Others ------------------ ***/
   /*$('.newslttr .signup-input button').click(function(){
      $("#myModal").modal('show');
   });*/
   $('.btn-colour-disclaimer').click(function(e){
         $('#colour-disclaimer-modal').modal('show');
         return false;
   });
   $('.selectpicker').selectpicker();
   $('.selectform-bluebg').selectpicker();


   /*** ------------------ grey band - clicking on sub links scrolls to respective section ------------------ ***/
   $('.inner-menu li a[href*=#]:not([href=#])').click(function() {
      var grayStripPosition = $(".gray-strip").css("position");
      var grayStripHeight = 0;
      if (location.pathname.replace(/^\//,'') == this.pathname.replace(/^\//,'') && location.hostname == this.hostname) {
         var target = $(this.hash);
         target = target.length ? target : $('[name=' + this.hash.slice(1) +']');
         if (target.length && $(window).width() > 767) {
            if(grayStripPosition == "static"){
               grayStripHeight = 80;
            }
            $('html,body').animate({
               scrollTop: target.offset().top - 170 - grayStripHeight + "px"
            }, 1000);
            return false;
         } else {
            if(grayStripPosition == "static"){
               grayStripHeight = 30;
            }
            $('html,body').animate({
               scrollTop: target.offset().top - 100 - grayStripHeight + "px"
            }, 1000);
         }
      }
   });


   /*** ------------------ carousal component ------------------ ***/
   var owl2 = $(".owlCarousel-auto-item-4");
   var owl3 = $(".owlCarousel-auto-item-4");
   var status = $("#owlStatus");
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
      autoHeight: false,
      navigation: true
   });
   $(".gallery-carousel-4").owlCarousel({
      items: 4,
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
   $(".owl-carousel-item-4").owlCarousel({
      items: 4,
      navigation : true,
      responsiveClass:true,
      navigationText: [ "", "" ],
      autoplay:false
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


   /*** ------------------ bootstrap modal resposition ------------------ ***/
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
   $('.slide-link').click(function(){
      $('.slide-link').children('.arrow_box').removeClass("active-border");
      $(this).children('.arrow_box').addClass("active-border");
      var catId = $(this).data("id");
      $('.gall-detail').removeClass('active-itm');
      $('.gall-detail').hide();
      $("#" + catId + ".gall-detail").show();
   });


   /*** ------------------ product section - day/night ------------------ ***/
   $(".day-icon").click(function(){
      $(this).parent("div").siblings("div").children(".night-icon").removeClass("night-active");
      $(this).parent("div").parent("div").parent("div").siblings("div").removeClass("active-itm");
      $(this).parent("div").parent("div").parent("div").siblings(".day-image").addClass("active-itm");
      $(this).addClass("day-active");
   });
   $(".night-icon").click(function(){
      $(this).parent("div").siblings("div").children(".day-icon").removeClass("day-active");
      $(this).parent("div").parent("div").parent("div").siblings("div").removeClass("active-itm");
      $(this).parent("div").parent("div").parent("div").siblings(".night-image").addClass("active-itm");
      $(this).addClass("night-active");
   });
   $('.day-night-btn-view div:first-child').click(function(){
      $(".night-image").removeClass("active-itm");
      $(".day-image").addClass("active-itm");
      $('.night-icon').removeClass("night-active");
      $(".day-icon").addClass("day-active");
   });
   $('.day-night-btn-view div:last-child').click(function(){
      $(".night-image").addClass("active-itm");
      $(".day-image").removeClass("active-itm");
      $('.night-icon').addClass("night-active");
      $(".day-icon").removeClass("day-active");
   });

   /*** ------------------ Magnet - day/night ------------------ ***/
       $('.magnet-btn-view div:first-child').click(function(){
            $(".night-image").removeClass("active-itm");
            $(".day-image").addClass("active-itm");
            $('.no-magnet').removeClass("no-magnet-active");
            $(".magnet").addClass("magnet-active");
         });

         $('.magnet-btn-view div:last-child').click(function(){
            $(".night-image").addClass("active-itm");
            $(".day-image").removeClass("active-itm");
            $('.no-magnet').addClass("no-magnet-active");
            $(".magnet").removeClass("magnet-active");
         });

   /*** ------------------ colour catalogue - Resize window width and height are same ------------------ ***/
   /*var abv=$(document).width();
   $(window).resize(function(){
      if(abv>$(document).width()){
         var gtliWidth=$('.color-patches li').innerWidth();
         var gtDvWidth=$('.shade-col .shade').innerWidth();
         var gecolorNavWidth=$('.owl-item .color-item .color-box3').innerWidth();
         $('.shade-col .shade').css({"height":gtDvWidth+"px"});
         $('.color-patches li span, .txtres .color-patches li span, #saved-shades .color-patches li span').height(gtliWidth+'px');
         $('.owl-item .color-item .color-box3').height(gecolorNavWidth+'px');
      }else{
         var gtliWidth=$('.color-patches li').innerWidth();
         var gtDvWidth=$('.shade-col .shade').innerWidth();
         var gecolorNavWidth=$('.owl-item .color-item .color-box3').innerWidth();
         $('.shade-col .shade').css({"height":gtDvWidth+"px"});
         $('.color-patches li span, .txtres .color-patches li span, #saved-shades .color-patches li span').height(gtliWidth+'px');
         $('.owl-item .color-item .color-box3').height(gecolorNavWidth+'px');
      }
   }).resize();*/

   $('#txtres-effects ul li a').click(function(){
      if($(window).width()>767){
         $('.tab-pane .bx-viewport').css({'height':'330px'}).find('ul').css({'transform': 'translate3d(0px, 0px, 0px)','-webkit-transform': 'translate3d(0px, 0px, 0px)'});
      }
   });
   $('.color-patch-list ul li').click(function(){
      //.color-patch-col ul li
      if($(window).width()<480){
         $("html, body").animate({scrollTop: $(this).parent('ul').parent('div').siblings('.shade-col').offset().top - $('.main-header').height() - 20});
      }
   });
});




/* ----------------------------------------------------------------------------- */
/* ------------------------- ICF CODE BLOCK - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(document).ready(function(e){
   try{
      var productTitle = document.getElementById('producttitle') != null ? document.getElementById('producttitle').value : "" ;
      if(productTitle != ""){
         document.title=productTitle;
      }
   }catch(err){
   }
   if (!$('.ap-smart-tab ul li').hasClass('active')){
      $('.ap-smart-tab ul li').addClass('active');
   }
   // Following method call will check the width of the page and it resize the images according to page size.
    if(window.hasOwnProperty("setAdaptiveImageWidth")){
      setAdaptiveImageWidth();
   }
   // Adding method to parse query string values
   $.urlParam = function(name){
      var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(decodeURIComponent(window.location.href));
      if (results==null){
         return null;
      }
      else{
         return results[1] || 0;
      }
   }
});

$(window).load(function(){
   $('.main-sldr').each(function(index, element){
      var ul = $(this);
      var liLen = ul.children("li").length;
      var isPager = (liLen >= 2) ? true : false;
      var isInfinite = (liLen >= 2) ? true : false;
      var hideControls = (liLen >= 2) ? false : true;

      ul.bxSlider({
            auto: true,
            adaptiveHeight: true,
            controls: false,
            pager: isPager,
            infiniteLoop: isInfinite,
            hideControlOnEnd: hideControls
         });
      });

    $('.services-slider').each(function(index, element){
         var ul = $(this);
         var liLen = ul.children("li").length;
         var isInfinite = (liLen >= 2) ? true : false;
         var hideControls = (liLen >= 2) ? false : true;

         ul.bxSlider({
               controls:true,
               pager:false,
               infiniteLoop: isInfinite,
               hideControlOnEnd: hideControls
            });
      });
});

$(window).scroll(function() {
   var scroll = $(window).scrollTop();
   if (scroll >= 300) {
      $(".brdcrumb_detail").fadeOut();
   } else {
      $(".brdcrumb_detail").fadeIn();
   }
});
/** Code to enable/disable button : START**/
function disableButton(btn){
      $(btn).addClass('spin');
   };
function enableButton(btn){
   $(btn).removeClass('spin');
};
/** Code to enable/disable button : END**/

/** Code to get Minimum length, Maximum Length and Exact Length validation message(i18n): START**/
function getMinLengthMsg(len, word){
   return $("span.i18n_error_msg.length_greater_than").html().replace('{0}', len).replace('{1}', word);
}
function getMaxLengthMsg(len, word){
   return $("span.i18n_error_msg.length_lesser_than").html().replace('{0}', len).replace('{1}', word);
}
function getExactLengthMsg(len, word){
   return $("span.i18n_error_msg.exact_length").html().replace('{0}', len).replace('{1}', word);
}
/** Code to get Minimum length, Maximum Length and Exact Length validation message(i18n): END**/

/** Code to get Password Match validation message(i18n): START**/
function pwdMatchMsg(){
   return $("span.i18n_error_msg.password_match").html();
}
/** Code to get Password Match validation message(i18n): END**/

/** Code to get Digits Only, Text Only and Email Only validation message(i18n): START**/
function digitsOnlyMsg(){
   return $("span.i18n_error_msg.must_be_digits").html();
}
function digitsOnlyMsg(){
   return $("span.i18n_error_msg.must_be_digits").html();
}
function emailOnlyMsg(){
   return $("span.i18n_error_msg.form_email_validation").html();
}
/** Code to get Digits Only, Text Only and Email Only validation message(i18n): END**/

/** Code to get Mandatory Field validation message(i18n): START**/
function getRequiredMsg(){
   $("span.i18n_error_msg.field_required").html();
}
/** Code to get Mandatory Field validation message(i18n): END**/

/** Code to allow only digits: START**/
$(document).on('keyup','.numbers_only', function(){
   this.value = this.value.replace(/[^0-9]/g, "")
});
/** Code to allow only digits: END**/

/** Get States: START**/
function getStates(){
   $.ajax({
      'url' : '/etc/designs/asianpaints/statecity.json',
      'method' : 'GET',
      'success': function(response){
         if(response){
            var stateObject = response['states'];
            for(var i=0; i<stateObject.length; i++) {
               $('.profile_state').append("<option value='"+stateObject[i]+"'>"+stateObject[i]+"</option>");
            }
         }
      },
      'error' : function(response){
      }
   });
}
/** Get States: END**/

/** Error Handler for Getting Profile Image: START**/
$(document).on('error', '.ap_profile_Pic', function(){
   this.src = "/etc/designs/asianpaints/clientlib-site/images/default_icon.jpg";
});
/** Error Handler for Getting Profile Image: END**/

/** checkbox tick image show/hide**/
$(document).on("change", ".cbox", function () {
   if($(this).prop('checked')) {
      $(this).parent().addClass("chkd");
   }else {
      $(this).parent().removeClass("chkd");
   }
});
/* ----------------------------------------------------------------------------- */
/* ------------------------- ICF CODE BLOCK - START ------------------------- */
/* ----------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------- */
/* ------------------------- ABOUT LYTEBOX - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(window).load(function(e) {
    updateLyteboxPositionHandler();
});
$(window).resize(function(e) {
    updateLyteboxPositionHandler();
});
$(window).scroll(function(e) {
    updateLyteboxPositionHandler();
});
function updateLyteboxPositionHandler(){
   var topScroll = $(window).scrollTop();
   var lyteboxElem = $("#lbMain");
   var lyteboxDisplayStatus = lyteboxElem.css('display');
   if(lyteboxDisplayStatus == "none"){
      $("#lbMain").css('top', topScroll);
   }
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- ABOUT LYTEBOX - END ------------------------- */
/* ----------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------- */
/* ------------------------- MAX HEIGHT MODULE - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(window).load(function(e) {
    maxHeightModuleHandler();
});
$(window).resize(function(e) {
   maxHeightModuleHandler();
});
function maxHeightModuleHandler(){
   $(".component-max-height-list").each(function(index, element) {
      var maxHeight = 0;
      var extraSpace = 50;
      var hasActiveClass = false;
      var listWrapper = $(this);
        var items = $(".component-max-height-item", listWrapper);
      var parent = listWrapper.closest(".tab-pane");
      if(parent.length){
         hasActiveClass = parent.hasClass('active');
      }
      parent.addClass('active');
      items.css('height', 'auto');
      items.each(function(index, element) {
            var elem = $(this);
         var height = elem.innerHeight();
         if(height >= maxHeight){
            maxHeight = height;
         }
        });
      if(hasActiveClass == false){
         parent.removeClass('active');
      }
      maxHeight = maxHeight + extraSpace;
      //items.css('height', maxHeight);
    });
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- MAX HEIGHT MODULE - END ------------------------- */
/* ----------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------------- */
/* ------------------------- GREY-BAND MODULE - START ------------------------- */
/* ----------------------------------------------------------------------------- */
greyBandModular();
function greyBandModular(){
   var resizeInterval = 0;
   $(document).ready(function(e) {
      initializePluginHandler();
      updateTopPositionHandler();
   });
   $(window).load(function(){
      clearInterval(resizeInterval);
      resizeInterval = setInterval(function(){
         clearInterval(resizeInterval);
         updateTopOffsetHandler();
         updateTopPositionHandler();
      }, 500);
   });
   $(window).resize(function(){
      updateTopOffsetHandler();
   });
   $(window).scroll(function(){
      updateTopPositionHandler();
   });

   function initializePluginHandler(){
      var winWidth = $(window).width();
      var greyStrip = $(".gray-strip");
      var headerHeight = $(".main-header").height();
      var fixedHeaderHeight = $(".main-header > .fix-secn").height();
      var innerBannerHeight = $(".inner-banner").height();
      var minusHeight = (winWidth <= 767) ? fixedHeaderHeight : headerHeight;
      if(greyStrip.length){
         var top = innerBannerHeight + minusHeight;
            //var top = greyStrip.offset().top - minusHeight;
         greyStrip.affix({
            offset: { top: top }
         });
      }
   }
   function updateTopOffsetHandler(){
      var winWidth = $(window).width();
      var greyStrip = $(".gray-strip");
      var headerHeight = $(".main-header").height();
      var fixedHeaderHeight = $(".main-header > .fix-secn").height();
      var innerBannerHeight = $(".inner-banner").height();
      var minusHeight = (winWidth <= 767) ? fixedHeaderHeight : headerHeight;
      if(greyStrip.length){
         var top = innerBannerHeight + minusHeight;
            //var top = greyStrip.offset().top - minusHeight;
         greyStrip.data('bs.affix').options.offset.top = top;
      }
   }
   function updateTopPositionHandler(){
      var greyStrip = $(".gray-strip.affix");
      var headerHeight = $(".main-header").height();
      if(greyStrip.length){
         greyStrip.css('top', headerHeight);
      }
   }
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- GREY-BAND MODULE - END ------------------------- */
/* ----------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------------- */
/* ------------------------- ELLIPSIS - START ------------------------- */
/* ----------------------------------------------------------------------------- */
var ellipsestext = "...";
var moretext = "Show more >";
var lesstext = "Show less";

$(document).ready(function(e) {
   $(".ellipsis-more-simple").each(function(index, element) {
        var elem = $(this);
      ellipsisHandler(elem, 230);
    });
   $(".ellipsis-more-200-simple").each(function(index, element) {
        var elem = $(this);
      ellipsisHandler(elem, 200);
    });

   $(".ellipsis-more-toggle").each(function(index, element) {
        var elem = $(this);
      ellipsisHandlerToggle(elem, 190);
    });
   $(".ellipsis-more-200-toggle").each(function(index, element) {
        var elem = $(this);
      ellipsisHandlerToggle(elem, 200);
    });
});
function ellipsisHandler(elem, maxCharLen){
   var content = elem.html();
   if(content.length > maxCharLen){
      var c = content.substr(0, maxCharLen);
      var h = content.substr(maxCharLen, content.length - maxCharLen);
      var html = c + '<span class="moreellipses">' + ellipsestext + '&nbsp;</span>';
   }
   elem.html(html);
}
function ellipsisHandlerToggle(elem, maxCharLen){
   var content = elem.html();
   if(content.length > maxCharLen){
      var c = content.substr(0, maxCharLen);
      var h = content.substr(maxCharLen, content.length - maxCharLen);
      var html = c + '<span class="moreellipses">' + ellipsestext+ '&nbsp;</span><span class="morecontent"><span>' + h + '</span>&nbsp;&nbsp;<a href="" class="morelink">' + moretext + '</a></span>';
   }
   elem.html(html);

   $(".morelink").click(function(){
      if($(this).hasClass("less")) {
         $(this).removeClass("less");
         $(this).html(moretext);
      } else {
         $(this).addClass("less");
         $(this).html(lesstext);
      }
      $(this).parent().prev().toggle();
      $(this).prev().toggle();
      return false;
   });
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- ELLIPSIS - END ------------------------- */
/* ----------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------------- */
/* ------------------------- PARSYS COLUMN - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(document).ready(function(){
    var colListing = $(".container").children(".row").children("div").children(".parsys_column");
    colListing.each(function(){
        var columnElem = $(this);
        columnElem.addClass("clearfix mb-30");
    });
});
/* ----------------------------------------------------------------------------- */
/* ------------------------- PARSYS COLUMN - END ------------------------- */
/* ----------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------------- */
/* ------------------------- COLUMN EQUAL HEIGHT - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(document).ready(function(){
    setEqualHeight();
});
$(window).load(function(){
    setEqualHeight();
});
$(window).resize(function(){
    setEqualHeight();
});
   function setEqualHeight(){
       $(".row.set-equal-height").each(function(index, elem){
           var wrapper = $(this);
           var childList = wrapper.children("div");
           var maxHeight = 0;

           childList.css({'height':'auto'});
           childList.each(function(index, elem){
               var child = $(this);
               var height = child.height();
               if(child.hasClass("fr-three-box")){
                   var aElem = child.find("a.fresco");
                   var imgElem = child.find(".item-img > img");
                   var hasLazyClass = imgElem.hasClass("lazy");
                   var src = "";
                   if(hasLazyClass){
                     src = encodeURI(imgElem.attr("data-src-web"));
                   }else{
                     src = encodeURI(imgElem.attr("src"));
                   }
                   var urlStr = "url(" + src + ")";
                   aElem.attr("href", src);
                   aElem.css({'background-image':urlStr});
               }
               var hasClass = child.hasClass
               if(height >= maxHeight){
                   maxHeight = height;
               }
           });
           childList.css({'height': maxHeight});
       });
   }

/* ----------------------------------------------------------------------------- */
/* ------------------------- COLUMN EQUAL HEIGHT - END ------------------------- */
/* ----------------------------------------------------------------------------- */




/* ----------------------------------------------------------------------------- */
/* ------------------------- CLEARFIX - START ------------------------- */
/* ----------------------------------------------------------------------------- */
function addClearfixHandler(){
   $(".row.clearfix-sm-2").each(function(index, element) {
        var count = 0;
      var elem = $(this);
        var childList = elem.children("div");
      var clearfixHTML = "<div class='clearfix custom-visible-sm custom-visible-md custom-visible-lg'></div>";
      childList.each(function(index, element){
            count++;
            var child = $(this);
            if((count>=1) && (count%2==0)){
                $(clearfixHTML).insertAfter(child);
            }
        });
    });
   $(".row.clearfix-md-3").each(function(index, element) {
      var elem = $(this);
        var childList = elem.children("div");
      var clearfixHTML = "<div class='clearfix custom-visible-md custom-visible-lg'></div>";
      childList.each(function(index, element){
            var child = $(this);
            if((index>=1) && (index%3==0)){
                $(clearfixHTML).insertAfter(child);
            }
        });
    });
   $(".row.clearfix-md-4").each(function(index, element) {
      var elem = $(this);
        var childList = elem.children("div");
      var clearfixHTML = "<div class='clearfix custom-visible-md custom-visible-lg'></div>";
        childList.each(function(index, element){
            var child = $(this);
            if((index>=1) && (index%3==0)){
                $(clearfixHTML).insertAfter(child);
            }
        });
    });
}
$(document).ready(function(e) {
    addClearfixHandler();
});
/* ----------------------------------------------------------------------------- */
/* ------------------------- CLEARFIX - END ------------------------- */
/* ----------------------------------------------------------------------------- */


/* ----------------------------------------------------------------------------- */
/* ------------------------- LYTEBOX-RESIZE-START ------------------------- */
/* ----------------------------------------------------------------------------- */

function initResizeHandler(){
   lyteboxResizeHandler();
}
$(window).load(function(){
   lyteboxResizeHandler();
});
$(window).resize(function(){
   lyteboxResizeHandler();
});
function lyteboxResizeHandler(){
   var mainBox = $("#lbMain");
   var winWidth = $(window).width();
   var winHeight = $(window).height();
   if(mainBox.length){
      var outerContainer = $("#lbOuterContainer");
      var topContainer = $("#lbTopContainer");
      var bottomContainer = $("#lbBottomContainer");
      var leftOffset = (winWidth - 970) / 2;
      var leftPos = (leftOffset <= 0) ? 0 : leftOffset;
      var topPos =  (winHeight - 250) / 2;
      if(topContainer.css('display') == "block"){
         bottomContainer.css('display', 'none');
      }
      outerContainer.css({'width':winWidth, left:leftPos, top:topPos});
   }
}

/* ----------------------------------------------------------------------------- */
/* ------------------------- LYTEBOX-RESIZE-END ------------------------- */
/* ----------------------------------------------------------------------------- */



/* ----------------------------------------------------------------------------- */
/* ------------------------- RESPONSIVE-HEIGHT-BASIS-START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(window).load(function(){
   responsiveHeightBasisHandler();
});
$(window).resize(function(){
   responsiveHeightBasisHandler();
});
function responsiveHeightBasisHandler(){
   var winWidth = $(window).width();
   var winHeight = $(window).height();
   var headerHeight = $(".main-header").height();
   var restHeight = winHeight - headerHeight;

   $(".custom-responsive-height-wrapper").each(function(index, element) {
        var wrapper = $(this);
      var itemList = $(".custom-responsive-height-item", wrapper);
      itemList.css({'height':'auto'});
      itemList.each(function(index, element) {
         var itemElem = $(this);
         var elemHeight = itemElem.height();
         if(elemHeight >= restHeight){
            itemElem.css({'height':restHeight});
         }
      });
    });
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- RESPONSIVE-HEIGHT-BASIS-END ------------------------- */
/* ----------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- */
/* ------------------------- RESPONSIVE-MOBILE-NAV-START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(window).load(function(){
   responsiveMobileNavHeightHandler();
});
$(window).resize(function(){
   responsiveMobileNavHeightHandler();
});
function responsiveMobileNavHeightHandler(){
   var winWidth = $(window).width();
   var winHeight = $(window).height();
    var restHeight = winHeight - 70;
   var mainNav = $(".main-nav");
    var defaultHeight = mainNav.css("height","auto");

    if(winWidth <= 767){
      mainNav.height(restHeight);
    }else{
      mainNav.height(defaultHeight);
    }
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- RESPONSIVE-MOBILE-NAV-END ------------------------- */
/* ----------------------------------------------------------------------------- */

/* ----------------------------------------------------------------------------- */
/* -------------------------LOADER-START ------------------------- */
/* ----------------------------------------------------------------------------- */
/*$(window).load(function() {
     // Animate loader off screen
     $(".page-loader").fadeOut("slow");
 });*/

/* ----------------------------------------------------------------------------- */
/* -------------------------LOADER-END ------------------------- */
/* ----------------------------------------------------------------------------- */

function scrollToBlog(index) {
    setTimeout(function(){
       $('html, body').animate({
               'scrollTop' :$("#loadMoreTopics").offset().top
            });
    }, 1000);

}

/* ----------------------------------------------------------------------------- */
/* ------------------------- MORPH BUTTON - START ------------------------- */
/* ----------------------------------------------------------------------------- */
$(document).ready(function(e) {
    updateMorphButtonPosition();
});
$(window).resize(function(){
   updateMorphButtonPosition();
});
function updateMorphButtonPosition(){
   var morphButtonSidebar = $(".morph-button-sidebar");
   var winHeight = $(window).height();
   var morphButtonHeight = $(".morph-button-sidebar > button").height();
   var buttonPos = (winHeight - morphButtonHeight) * 0.5;
   buttonPos = (buttonPos <= 0) ? 0 : buttonPos;
   morphButtonSidebar.css({bottom:buttonPos});
}
/* ----------------------------------------------------------------------------- */
/* ------------------------- MORPH BUTTON - END ------------------------- */
/* ----------------------------------------------------------------------------- */