var theme = (function(t, $) {
    t.forms = {
        init: function() {
            t.forms.loadingText();
            t.forms.currencySwitcher();
        },
        
        loadingText: function() {
            $(document.body).on('submit', 'form', function(){
                var form = $(this);
                if ($(":invalid", form).length === 0) {
                    var button = form.find('button');
                    if (button){
                        var dataLoadingText = button.attr("data-loading-text");
                        button.text(dataLoadingText);
                    }
                }
            });
        },
        currencySwitcher: function() {
            $('select[name="currency"]').on('change', function(e) {
                e.preventDefault();
                $('form[id="set-currency"]').submit();
            });
        }
    };
    t.search = {
        init: function() {
            t.search.selector = {
                searchWrapper: '.store_search',
                searchVisible: 'store_search-visible',
                searchOpen: '.store_search-icon',
                searchClose: '.store_search-close'
            }
            t.search.searchActions(
                t.search.selector.searchWrapper,
                t.search.selector.searchOpen, 
                t.search.selector.searchClose
            );
        },
        searchActions: function(target, openTrigger, closeTrigger) {
            var sInput = document.querySelector("#id_q");
            $(openTrigger).on( 'click', function() {
            $(target).addClass(t.search.selector.searchVisible);
              setTimeout( function() {
                    $( sInput ).focus();
                }, 200);
            });
            $(closeTrigger).on( 'click', function() {
                $(target).removeClass(t.search.selector.searchVisible);
            });
          }
    };
    t.product = {
        init: function(options) {
            t.product.options = options;
            t.product.selector = {
                sliderWrapper: '.slider-for',
                sliderNav: '.slider-nav',
                prices: '.catalogue_product-price',
                salePrice: 'data-product-price',
                retailPrice: 'data-product-price-retail',
                productData: 'product-data',
                addToCartForm: 'add-to-cart',
                productBuyOptions: 'catalogue_product-option',
                subscriptionOptionInputName: 'subscription-option',
                onetimeOptionID: '#product-one-time',
                subcriptionOptionID: '#product-subscribe',
                subscriptionOptions: '#product-subscribe-options',
                productReviewsTab: '#catalogue_product-reviews-tab',
                productReviewsAboutTab: '#catalogue_product-about-tab'
            }

            t.product.initImageSlider();
            t.product.handleSubscriptionOption();

            var productData = document.getElementById(t.product.selector.productData);
            
            if (!productData || !productData.innerHTML.length) {
                return;
            }

            t.product.productObject = JSON.parse(productData.innerHTML);
            if (t.product.productObject.structure !== 'parent') {
                return;
            }
            t.product.handleVariantSelect();
            $("[name*='attr_']").on("change", t.product.handleVariantSelect);          
            
        },
        getSelectAttributeValues: function() {
            var attributeValues = [];
            document.querySelectorAll("[name*='attr_']").forEach(function(ele) {
                if (ele.type === 'radio') {
                    if (ele.checked) {
                        attributeValues.push({
                            name: ele.getAttribute('name').replace("attr_", ""),
                            value: ele.value
                        });
                    }
                } else {
                    attributeValues.push({
                        name: ele.getAttribute('name').replace("attr_", ""),
                        value: ele.value
                    });
                }
            });
            return attributeValues;
        },
        getVariantFromProductObject: function() {
            var selectedAttributes = t.product.getSelectAttributeValues();
            var children = t.product.productObject.children;
            var found = children.find(function(variant) {
                var isMatch = [];
                selectedAttributes.forEach(function(selectedAttribute) {
                    for (let i = 0; i < variant.variant_attribute_values.length; i++) {
                        if (variant.variant_attribute_values[i].code === selectedAttribute.name) {
                            isMatch.push(variant.variant_attribute_values[i].id === parseInt(selectedAttribute.value));
                            break;
                        }
                    }
                });
                return isMatch.every(Boolean);
            });

            return found;
        },
        updatePrice: function(variant) {
            if (!variant) {
                $(`[${t.product.selector.salePrice}]`).html('');
                $(`[${t.product.selector.retailPrice}]`).html('');
                return;
            }
            $('input[name=' + t.product.selector.subscriptionOptionInputName + ']').click(function() {
                if ($(t.product.selector.subcriptionOptionID).is(":checked")) {
                    $(`[${t.product.selector.salePrice}]`).html(variant.purchase_info.subscription.format);

                } else {
                    $(`[${t.product.selector.salePrice}]`).html(variant.purchase_info.price.format);
                    $(`[${t.product.selector.retailPrice}]`).html(variant.purchase_info.price_retail.format);
                }
            });
            $(`[${t.product.selector.salePrice}]`).html(variant.purchase_info.price.format);
            $(`[${t.product.selector.retailPrice}]`).html(variant.purchase_info.price_retail.format);

        },
        updateForm: function(variant) {
            var selector = `#${t.product.selector.addToCartForm}`;
            var buyOpt = `.${t.product.selector.productBuyOptions}`;
            if (!variant || variant.purchase_info.availability === 'outofstock' || variant.purchase_info.availability === 'unavailable') {
                $(selector).find("button").prop('disabled', true);
                $(buyOpt).find("input").prop('disabled', true);
                $(selector).find("button").text(t.product.options.unavailable_msg);
                return;
            }
            $(selector).find("button").prop('disabled', false);
            $(buyOpt).find("input").prop('disabled', false);
            $(selector).find("button").text(t.product.options.add_to_cart_msg);
            var addProductUrl = $(selector).attr('action').replace(/(cart\/add\/)\d+/, `$1${variant.id}`);
            $(selector).attr('action', addProductUrl);

        },
        initImageSlider: function() {
            $(t.product.selector.sliderWrapper).slick({
                slidesToShow: 1,
                slidesToScroll: 1,
                arrows: false,
                fade: false,
                asNavFor: t.product.selector.sliderNav
            });
            $(t.product.selector.sliderNav).slick({
                slidesToShow: 5,
                slidesToScroll: 1,
                asNavFor: t.product.selector.sliderWrapper,
                dots: false,
                arrows: false,
                focusOnSelect: true
            });
            $(t.product.selector.sliderWrapper).slickLightbox();
        },
        updateImage: function(variant) {
            if (!variant || (variant.images && !variant.images.length)) {
                return;
            }
            var slideno = (variant.images[0].id);
            var slideIndex = $(t.product.selector.sliderNav).find('#' + slideno).data('slick-index');

            $(t.product.selector.sliderNav).slick('slickGoTo', slideIndex);
        },
        handleVariantSelect: function() {
            var found = t.product.getVariantFromProductObject();
            t.product.updatePrice(found);
            t.product.updateForm(found);
            t.product.updateImage(found);
            $(t.product.selector.subscriptionOptions).hide();
            $(t.product.clearIntervalValue);
            $(t.product.selector.subcriptionOptionID).prop("checked", false);
            $(t.product.selector.onetimeOptionID).prop("checked", true);
        },
        handleSubscriptionOption: function() {
            $('input[name=' + t.product.selector.subscriptionOptionInputName + ']').click(function() {
                if ($(t.product.selector.subcriptionOptionID).is(":checked")) {
                    $(t.product.selector.subscriptionOptions).show();
                    $(t.product.setIntervalValue);
                    $(`[${t.product.selector.salePrice}]`).html(t.product.productObject.purchase_info.subscription.format);
                } else {
                    $(`[${t.product.selector.salePrice}]`).html(t.product.productObject.purchase_info.price.format);
                    $(t.product.selector.subscriptionOptions).hide();
                    $(t.product.clearIntervalValue)
                }
            });
            $("#product-subscribe-options-select").on("click", "input", t.product.setOptionToHiddenField);
        },
        setOptionToHiddenField: function() {
            var b = $(this).val(),
                a = $(this).attr("interval");
            $("#id_interval").val(a), $("#id_interval_count").val(b);
        },
        setIntervalValue: function() {
            $("#product-subscribe-options-select input[type=radio]:first").prop("checked", true);
            $("#id_interval").val($("#product-subscribe-options-select input[type='radio']").first().attr("interval"));
            $("#id_interval_count").val($("#product-subscribe-options-select input[type='radio']").first().val());
        },
        clearIntervalValue: function() {
            $("#product-subscribe-options-select input[type=radio]").prop("checked", false);
            $("#id_interval").val(""), $("#id_interval_count").val("");
        }
        
    };

    // global init
    t.init = function(options) {
        t.forms.init();
        t.search.init();
    };

    return t;

})(theme || {}, jQuery);