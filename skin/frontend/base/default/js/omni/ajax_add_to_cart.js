/**
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://opensource.org/licenses/osl-3.0.php
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@magentocommerce.com so we can send you a copy immediately.
 *
 * @category    Omni
 * @package     Omni_AjaxAddToCart
 * @copyright   Copyright (c) 2016 Omni Partners Oy (http://www.omnipartners.fi)
 * @license     http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
 */
 var OmniAddToCart = {
    minicart : null,
    // hijack the onclick hendler for add to cart buttons
    init: function() {
        jQuery('button.btn-cart').each(function(){
            var old = jQuery(this).attr('onclick');
            jQuery(this).attr('onclick','').data('oldclick', old).unbind('click').bind('click', function(e) {
                e.preventDefault();
                OmniAddToCart.onclick(jQuery(this));
            });
        });
    },

    onclick: function(el) {
        OmniAddToCart.showLoader();
        // Make sure onclick is empty before we start, valid specially on non simple products on product page
        if(el.attr('onclick')) { el.attr('onclick',''); }
        var isProductPage = el.parents("form#product_addtocart_form").length > 0 ? 1 : 0;
        var url = isProductPage ? jQuery('#product_addtocart_form').attr('action') : el.data('oldclick').replace('setLocation(\'','').replace('\')','');
        // Just redirect for anything other than real add to cart links ( configurable, bundle, grouped products )
        if (url.indexOf('checkout/cart/add') === -1) {
            setLocation(url);
            return false;
        }
        var origFormKey = url.split('/').filter(function(el) { return el.trim().length > 0; }).pop();
        var oldQty = parseInt(jQuery('div.header-minicart span.count').text());
        var addedQty = isProductPage ? parseInt(jQuery('#qty').val()) : 1;
        var newQty = oldQty + addedQty;
        var data = isProductPage ? jQuery('#product_addtocart_form').serialize() : null;
        var type = isProductPage ? "POST" : "GET";

        var request = jQuery.ajax({ type: type, url: url, data: data });

        request.done(function( data ) {
            var error = jQuery(data).find( "#messages_product_view .messages .error-msg");
            var notice = jQuery(data).find( "#messages_product_view .messages .notice-msg");
            var content = jQuery(data).find( "#header-cart .minicart-wrapper" );
            jQuery("#header-cart .minicart-wrapper").empty().append( content.html() );
            if (error.length) {
                OmniAddToCart.showError( error.find("ul li span").first().text(), origFormKey );
            } else if(notice.length) {
                OmniAddToCart.showError( notice.find("ul li span").first().text(), origFormKey );
            } else {
                OmniAddToCart.updateMinicart(origFormKey, newQty);
            }
            OmniAddToCart.hideLoader(); 
        });

        request.fail(function( jqXHR, textStatus ) {
            OmniAddToCart.showError( "Item adding failed!", origFormKey );
            OmniAddToCart.hideLoader();
        });
        
        return false;
    },

    showLoader: function() {
        jQuery('body').addClass('omni-ajax-backdrop');
    },

    hideLoader: function() {
        jQuery('body').removeClass('omni-ajax-backdrop');
        this.openMinicart();
    },

    showError: function(message, formkey) {
        if (!this.minicart) {
            this.minicart = new Minicart({formKey: formkey});
        }
        this.minicart.showError(message);
        jQuery('#minicart-success-message').fadeOut('slow');
    },

    updateMinicart: function(formkey, qty) {
        this.minicart = new Minicart({formKey: formkey});
        this.minicart.init();
        this.minicart.updateCartQty(qty);
        this.minicart.showSuccess( "Item was added successfully." );
        jQuery('#minicart-error-message').fadeOut('slow');
    },

    openMinicart: function() {
        var isSkipContentOpen = jQuery('#header-cart').hasClass('skip-active') ? 1 : 0;
        if (!isSkipContentOpen) {
            jQuery('#header-cart').addClass('skip-active');
        }
    }

};

jQuery(document).ready(function () {
    OmniAddToCart.init();
});