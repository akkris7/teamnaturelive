// Ajax Pagination

ajaxify = function(settings) {
  settings = settings || {}
  // Change the default selectors here
  var linkParent = settings.linkParent || '.pagination' // Class of pagination container
  var parentContainer = settings.parentContainer || '#MainContent' // All of the content selector used to detect scroll bottom distance
  var endlessScrollContainer = settings.endlessScrollContainer || '.EndlessScroll' // Selector for endless scroll pages
  var endlessClickContainer = settings.endlessClickContainer || '.EndlessClick' // Class of pagination container
  var endlessOffset = settings.endlessOffset || 0 // Offset the distance from the bottom of the page
  var ajaxinateContainer = settings.ajaxinateContainer || '.Ajaxinate' // ID Selector for ajax pagination pages
  var ajaxinateLink = settings.ajaxinateLink || '.page a' // Class Selector for ajax pagination links
  var fade = settings.fade || 'fast' // fade speed
  var textChange = settings.textChange || 'Loading' // Text whilst loading content

  var linkElem;
  var contentContainer;
  var pageNumber;
  var pageType;
  var action;
  var moreURL;

  $.loadMore = function() {
    if (moreURL.length){
      $.ajax({
        type: 'GET',
        dataType: 'html',
        url: moreURL,
        success: function(data) {
          
          if (pageType == 'ajax') {
            $(ajaxinateContainer).not('[data-page="'+pageNumber+'"]').hide();
            history.pushState({}, pageNumber, moreURL);
          } else {
            $(linkElem).fadeOut(fade);
          }
          var filteredData = $(data).find(contentContainer);
          $(filteredData).appendTo( $(contentContainer).parent() ).hide().fadeIn(fade);
          if (pageType == 'endlessScroll') {
            $.endlessScroll();
          } else if (pageType == 'ajax') {
            $.ajaxinationClick();
          } else if (pageType == 'endlessClick') {
            $.endlessClick();
          }
          $(window).scroll(function() {
            if ($(this).scrollTop() >= 36) {
              $('.header.header-fixed').addClass('stickytop');
            }
            else {
              $('.header.header-fixed').removeClass('stickytop');
            }
          });
          //GALLERY PRODUCT
          $('.product-card__gallery .item-img').on("mouseover touchstart", function (e) {
            $(this).addClass('thumb-active').siblings().removeClass('thumb-active');
            var thumb_src = $(this).attr("data-src");
            $(this).closest('.product-item-container').find('.img-responsive.s-img').attr("src",thumb_src);
          });
          if ($(".spr-badge").length > 0) {
            return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
          };
        }
      });
    }
  }

  // Check whether the page is at the bottom
  $.endlessScroll = function() {
    action = 'scroll load resize';
    $(window).on( action, function() {
      contentContainer = endlessScrollContainer;
      moreURL = $(contentContainer+':last-of-type '+linkElem).attr('href');
      pageType = 'endlessScroll';
      $(linkElem).text(textChange);
      if ($(contentContainer+':last-of-type '+linkElem).length){
        var bottom = $( parentContainer ).outerHeight();
        var docTop = ($(document).scrollTop() + $(window).height() + endlessOffset);
        if( docTop > bottom ) {
          $(window).off(action);
          $.loadMore();
        }
      }
      
      $(window).scroll(function() {
    if ($(this).scrollTop() >= 36) {
      $('.header.header-fixed').addClass('stickytop');
    }
    else {
      $('.header.header-fixed').removeClass('stickytop');
    }
  });
      //GALLERY PRODUCT
      $('.product-card__gallery .item-img').on("mouseover touchstart", function (e) {
        $(this).addClass('thumb-active').siblings().removeClass('thumb-active');
        var thumb_src = $(this).attr("data-src");
        $(this).closest('.product-item-container').find('.img-responsive.s-img').attr("src",thumb_src);
      });
    });
  }

  //Endless click function
  $.endlessClick = function() {
    $(linkElem).on( 'click', function(e) {
      e.preventDefault();
      action = 'click';
      contentContainer = endlessClickContainer;
      moreURL = $(this).attr('href');
      pageType = 'endlessClick';
      $(linkElem).text(textChange);
      $(linkElem).off(action);
      $.loadMore();
    });
  }

  //Ajaxination click function
  $.ajaxinationClick = function() {
    $(linkElem).on( 'click', function(e) {
      e.preventDefault();
      action = 'click';
      contentContainer = ajaxinateContainer;
      moreURL = $(this).attr('href');
      pageNumber = $(this).attr('data-number');
      pageType = 'ajax';
      if( $(contentContainer+'[data-page="'+pageNumber+'"]').length ) {
        $(contentContainer).not('[data-page="'+pageNumber+'"]').hide();
        $(contentContainer+'[data-page="'+pageNumber+'"]').fadeIn(fade);
        history.pushState({}, pageNumber, moreURL);
      } else {
        $(linkElem).off(action);
        $.loadMore();
      }
      $('html, body').animate({ scrollTop: $(parentContainer).offset().top }, 300 );
      //GALLERY PRODUCT
      $('.product-card__gallery .item-img').on("mouseover touchstart", function (e) {
        $(this).addClass('thumb-active').siblings().removeClass('thumb-active');
        var thumb_src = $(this).attr("data-src");
        $(this).closest('.product-item-container').find('.img-responsive.s-img').attr("src",thumb_src);
      });
    });
  }

  // Detect whether the pagination types exist
  // Endless Click Initialize
  if ( $( endlessClickContainer ).length ) {
    linkElem = linkParent+' a';
    $.endlessClick();
  }
  // Ajaxination Click Initialize
  if ( $( ajaxinateContainer ).length ) {
    linkElem = ajaxinateLink;
    $.ajaxinationClick();
  }
  // Endless Scroll Initialize
  if ( $( endlessScrollContainer ).length ) {
    linkElem = linkParent+' a';
    $.endlessScroll();
  }

}