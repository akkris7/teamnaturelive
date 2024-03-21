(function($) {
  $(document).ready(function() {
    objss.init();
  });

  if ($(".block-layered-nav")) {
    History.Adapter.bind(window, 'statechange', function() {
      var State = History.getState();
      if (!objss.isFilterAjaxClick) {
        objss.shopifyParam();
        var newurl = objss.sidebarCreateUrl();
        objss.ajaxGetContent(newurl);
        objss.reActivateSidebar();
      }
      objss.isFilterAjaxClick = false;
    });
  }

  var objss = {
    isFilterAjaxClick: false,
    loadingtimeout: null,
    init: function() {
      this.shopifyParam();
      this.initSidebar();
      this.initToolbar();

      $('.filter-tags dd > ol').each(function() {
        if (!$(this).children().length) {
          $(this).parents('dd').css('display', 'none');
          $(this).parents('dd').prev().css('display', 'none');
        }
      })
    },
    initSidebar: function() {
      if ($(".block-layered-nav").length > 0) {
        objss.typeEvents();
        objss.filterClear();
        objss.sidebarModeView();
      }
    },
    
    shopifyParam: function() {
      Shopify.queryParams = {};
      if (location.search.length) {
        for (var aKeyValue, i = 0, aCouples = location.search.substr(1).split('&'); i < aCouples.length; i++) {
          aKeyValue = aCouples[i].split('=');
          if (aKeyValue.length > 1) {
            Shopify.queryParams[decodeURIComponent(aKeyValue[0])] = decodeURIComponent(aKeyValue[1]);
          }
        }
      }
    },

    
       
    
    
    
    initToolbar: function() {
      if (Shopify.queryParams.sort_by) {
        var sortValue = Shopify.queryParams.sort_by;
        $(".filters-toolbar__input--sort option[value='"+sortValue+"']").attr("selected","selected");
      }
    },
    sidebarModeView: function() {
      $(".filters-toolbar-wrapper .changeView").click(function(e) {
        if (!$(this).hasClass("active")) {
          var paging = $(".filter-show > button span").text();
          if ($(this).data("view") == 'list') {
            Shopify.queryParams.view = "list" + paging;
          }
          else {
            Shopify.queryParams.view = paging;
          }
          objss.ajaxClick();
          $(".filters-toolbar-wrapper .changeView").removeClass("active");
          $(this).addClass("active");
        }
        e.preventDefault();
      })
    },
    initSortbyEvent: function() {
      $(document).on('change', '.filters-toolbar .filters-toolbar__input--sort', function(e) {
        Shopify.queryParams.sort_by = $(this).val();
        objss.ajaxClick();
        $(".filters-toolbar__input--sort option[value='"+$(this).val()+"']").attr("selected","selected");
        e.preventDefault();
      });
    },
    initCountProduct: function() {

    },
    sidebarCreateUrl: function(baseLink) {
      var newQuery = $.param(Shopify.queryParams).replace(/%2B/g, '+');
      if (baseLink) {
        if (newQuery != "")
          return baseLink + "?" + newQuery;
        else
          return baseLink;
      }
      return location.pathname + "?" + newQuery;
    },
    typeEvents: function() {
      objss.filterByTags();
      objss.initSortbyEvent();
      objss.initCountProduct();
    },
    filterByTags: function() {
      $('.filter-tags dd ol li a:not(".clear"), .filter-tags dd ol li label').click(function(e) {
        var currentTags = [];
        if (Shopify.queryParams.constraint) {
          currentTags = Shopify.queryParams.constraint.split('+');
        }

        if (!window.enable_sidebar_multiple_choice && !$(this).prev().is(":checked")) {
          var otherTag = $(this).parent('.filter-tags').find("input:checked");
          if (otherTag.length > 0) {
            var tagName = otherTag.val();
            if (tagName) {
              var tagPos = currentTags.indexOf(tagName);
              if (tagPos >= 0) {
                currentTags.splice(tagPos, 1);
              }
            }
          }
        }

        var tagName = $(this).prev().val();
        if (tagName) {
          var tagPos = currentTags.indexOf(tagName);
          if (tagPos >= 0) {
            currentTags.splice(tagPos, 1);
          } else {
            currentTags.push(tagName);
          }
        }
        if (currentTags.length) {
          Shopify.queryParams.constraint = currentTags.join('+');
        } else {
          delete Shopify.queryParams.constraint;
        }
        objss.ajaxClick();
        e.preventDefault();
      });
    },
    ajaxClick: function(baseLink) {
      delete Shopify.queryParams.page;
      var newurl = objss.sidebarCreateUrl(baseLink);
      objss.isFilterAjaxClick = true;
      History.pushState({
        param: Shopify.queryParams
      }, newurl, newurl);
      objss.ajaxGetContent(newurl);
    },
    ajaxGetContent: function(newurl) {
      $.ajax({
        type: 'get',
        url: newurl,
        beforeSend: function() {
          objss.showLoading();
        },
        success: function(data) {
          objss.hideLoading();
          objss.pageData(data);
          objss.filterByTags();
          objss.filterClear();
		  
          $('.filter-tags dd > ol').each(function() {
            if (!$(this).children().length) {
              $(this).parents('dd').css('display', 'none');
              $(this).parents('dd').prev().css('display', 'none');
            }
          })
        },
        error: function(xhr, text) {
          objss.hideLoading();
        }
      });
    },
    pageData: function(data) {
      var current_class = $(".col-main .product-wrapper");
      var content = $(data).find(".col-main .products-listing");
      current_class.html(content);
	  ajaxify();
      
      //replace paging
      if ($(".padding").length > 0) {
        $(".padding").replaceWith($(data).find(".padding"));
      } else {
        $(".col-main").append($(data).find(".padding"));
      }
      //gallery product
      $('.product-card__gallery .item-img').on("mouseover touchstart", function (e) {
        $(this).addClass('thumb-active').siblings().removeClass('thumb-active');
        var thumb_src = $(this).attr("data-src");
        $(this).closest('.product-item-container').find('.img-responsive.s-img').attr("src",thumb_src);
      });
      var currentHeader = $(".collection_info");
      var dataHeader = $(data).find(".collection_info");
      if (currentHeader.find("h3.page-title").text() != dataHeader.find("h3.page-title").text()) {
        currentHeader.find("h3.page-title").replaceWith(dataHeader.find("h3.page-title"));
      }

      var currentDes = $(".collection-des");
      var dataDes = $(data).find(".collection-des");		
      if (currentDes.length) {
        if (dataDes.length) {
          currentDes.html(dataDes);
        } else {
          currentDes.hide();
        }
      } else {
        currentHeader.append('<div class="collection-des"></div>');
        currentDes.html(dataDes);
      }

      if (Shopify.queryParams.sort_by) {
        var sortValue = Shopify.queryParams.sort_by;
        $(".filters-toolbar__input--sort option[value='"+sortValue+"']").attr("selected","selected");
      }

      //replace tags
      $(".filter-tags").replaceWith($(data).find(".filter-tags"));

      //product review
      if ($(".spr-badge").length > 0) {
        return window.SPR.registerCallbacks(), window.SPR.initRatingHandler(), window.SPR.initDomEls(), window.SPR.loadProducts(), window.SPR.loadBadges();
      }
    },

    filterClear: function() {
      $(".filter-tags dd ol li").each(function() {
        var sidebarTag = $(this);
        if (sidebarTag.find("input:checked").length > 0) {
          //has active tag
          sidebarTag.parent().parent().prev().find(".clear").show().click(function(e) {
            var currentTags = [];
            if (Shopify.queryParams.constraint) {
              currentTags = Shopify.queryParams.constraint.split('+');
            }
            sidebarTag.find("input:checked").each(function() {
              var selectedTag = $(this);
              var tagName = selectedTag.val();
              if (tagName) {
                var tagPos = currentTags.indexOf(tagName);
                if (tagPos >= 0) {
                  //remove tag
                  currentTags.splice(tagPos, 1);
                }
              }
            });
            if (currentTags.length) {
              Shopify.queryParams.constraint = currentTags.join('+');
            } else {
              delete Shopify.queryParams.constraint;
            }
            objss.ajaxClick();
            e.preventDefault();
          });
        }
      });
    },
    reActivateSidebar: function() {
      $(".filter-category .active").removeClass("active");
      $(".filter-tags input:checked").attr("checked", false);

      //category
      var cat = location.pathname.match(/\/collections\/(.*)(\?)?/);
      if (cat && cat[1]) {
        $(".filter-category a[href='" + cat[0] + "']").addClass("active");
      }
    },
    showLoading: function() {
      $('.ss-loading').show();
    },
    hideLoading: function() {
      $('.ss-loading').hide();
    }
  }
  })(jQuery);