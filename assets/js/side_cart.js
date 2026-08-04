class SideCart {
    constructor(sidecart_msgs, max_cart_quantity_per_line) {
        this.SIDECART_MSGS = sidecart_msgs;
        this.STR_QUERY_GRAPHQL = {
            createCart: `mutation {
                createCart(input:{}){
                  success
                  errors
                  cart{
                    id
                    pk
                    currency
                    totalExclTax
                    totalExclTaxExclDiscounts
                    totalDiscount
                    numItems
                    numLines
                    voucherDiscounts {
                      name
                      description
                      amount
                      voucher{
                        name
                        code
                      }
                    }
                    lines {
                      pk
                      quantity
                      unitPriceExclTax
                      linePriceExclTax
                      linePriceExclTaxInclDiscounts
                      interval
                      intervalCount
                      properties{
                        key
                        value
                      }
                      product {
                        primaryImage {
                            thumbnail: url(transform: {
                              maxWidth: 150, maxHeight: 150, format: webp, crop: center
                            })
                          }
                        subscriptionInfo{
                            interval
                            intervalCount
                          }
                        title
                        url
                      }
                    }
                    subscriptionPreview {
                        totalGroupsExclTax
                        subscriptionRebills {
                          currency
                          frequency
                          interval
                          intervalCount
                          totalExclTax
                          lines {
                            pk
                            quantity
                            unitPriceExclTax
                            linePriceExclTax
                            linePriceExclTaxInclDiscounts
                            product {
                                title
                            }
                          }
                        }
                      }
                  }
                }
              }
            `,
            updateCartLines: `mutation updateCartLines($input: UpdateCartLinesInput!) {
                updateCartLines(input: $input) {
                  success
                  errors
                  cart {
                    pk
                    currency
                    totalExclTax
                    totalExclTaxExclDiscounts
                    totalDiscount
                    numItems
                    numLines
                    voucherDiscounts {
                      name
                      description
                      amount
                      voucher{
                        name
                        code
                      }
                    }
                    lines {
                      pk
                      quantity
                      unitPriceExclTax
                      linePriceExclTax
                      linePriceExclTaxInclDiscounts
                      interval
                      intervalCount
                      properties{
                        key
                        value
                      }
                      product {
                        primaryImage {
                            thumbnail: url(transform: {
                              maxWidth: 150, maxHeight: 150, format: webp, crop: center
                            })
                        }
                        subscriptionInfo{
                            interval
                            intervalCount
                          }
                        title
                        url
                      }
                    }
                    subscriptionPreview {
                        totalGroupsExclTax
                        subscriptionRebills {
                          currency
                          frequency
                          interval
                          intervalCount
                          totalExclTax
                          lines {
                            pk
                            quantity
                            unitPriceExclTax
                            linePriceExclTax
                            linePriceExclTaxInclDiscounts
                            product {
                                title
                            }
                          }
                        }
                      }
                  }
                }
              }
              
            `,
            removeCartLines: `mutation removeCartLines($input: RemoveCartLinesInput!) {
                removeCartLines(input: $input) {
                  success
                  errors
                  cart {
                    pk
                    currency
                    totalExclTax
                    totalExclTaxExclDiscounts
                    totalDiscount
                    numItems
                    numLines
                    voucherDiscounts {
                      name
                      description
                      amount
                      voucher{
                        name
                        code
                      }
                    }
                    lines {
                      pk
                      quantity
                      unitPriceExclTax
                      linePriceExclTax
                      linePriceExclTaxInclDiscounts
                      interval
                      intervalCount
                      properties{
                        key
                        value
                      }
                      product {
                        primaryImage {
                            thumbnail: url(transform: {
                              maxWidth: 150, maxHeight: 150, format: webp, crop: center
                            })
                        }
                        subscriptionInfo{
                            interval
                            intervalCount
                          }
                        title
                        url
                      }
                    }
                    subscriptionPreview {
                        totalGroupsExclTax
                        subscriptionRebills {
                          currency
                          frequency
                          interval
                          intervalCount
                          totalExclTax
                          lines {
                            pk
                            quantity
                            unitPriceExclTax
                            linePriceExclTax
                            linePriceExclTaxInclDiscounts
                            product {
                                title
                            }
                          }
                        }
                      }
                  }
                }
              }
            `,
        };
        this.max_cart_quantity_per_line = max_cart_quantity_per_line;
    }

    async queryGraphql(graphql_url, payload) {
        const fetch_conf = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };
        const response_data = await fetch(
            graphql_url,
            fetch_conf
        );
        return await response_data.json();
    }

    calculatePercentDiscount(full_price, discount_price) {
        if (full_price === discount_price) { return ""; }
        else {
            const discount = Math.round(100 - ((discount_price * 100) / full_price));
            let str_html = `<span class="text-success">(${discount}% ${this.SIDECART_MSGS.savings})</span>`;
            return str_html;
        }
    }

    choiceQuantity(postfix, default_value = 1, maximum = 5) {
        let opt = ``;
        for (let i = 1; i <= maximum; i++) {
            let el = ``;
            if (i === default_value) {
                el += `<option value="${i}" selected>${i}</option>`;
            } else {
                el += `<option value="${i}">${i}</option>`;
            }
            opt += el;
        }
        let element_str = `
            <select name="cart-form-${postfix}-quantity" class="form-control" id="id_cart-form-${postfix}-quantity">
                ${opt}
            </select>
            <span class="error-text" id="error-text-quantity-${postfix}"></span>
            `;
        return element_str;
    }

    intervalFormatter(interval, intervalCount) {
        return interval.charAt(0).toUpperCase() + interval.slice(1) + (intervalCount > 1 ? "s": "");
    }

    choiceSchedule(postfix, subscriptionInfo, value) {
        let opt = ``;
        if (value === {} || value.interval_count === "") {
            opt += `<option value="one-time" selected>One Time</option>`;
        } else {
            opt += `<option value="one-time">One Time</option>`;
        }
        for (let i = 0; i < subscriptionInfo.intervalCount.length; i++) {
            let el = ``;
            if (subscriptionInfo.intervalCount[i] === value.interval_count) {
                el += `<option value="${subscriptionInfo.intervalCount[i]}-${subscriptionInfo.interval}" selected>${subscriptionInfo.intervalCount[i]} ${this.intervalFormatter(subscriptionInfo.interval, subscriptionInfo.intervalCount[i])}</option>`;
            } else {
                el += `<option value="${subscriptionInfo.intervalCount[i]}-${subscriptionInfo.interval}">${subscriptionInfo.intervalCount[i]} ${this.intervalFormatter(subscriptionInfo.interval, subscriptionInfo.intervalCount[i])}</option>`;
            }
            opt += el;
        }
        let element_str = `
                <select name="cart-form-${postfix}-subscription_range" class="form-control" id="id_cart-form-${postfix}-subscription_range">
                    ${opt}
                </select>
                <span class="error-text" id="error-text-schedule-${postfix}"></span>
        `;
        return element_str;
    }

    getChoiceSchedule(hasSubscription, line_pk, subscriptionInfo, interval, intervalCount) {
        if (!hasSubscription) { return ""; }
        else {
            let value = {
                'interval': interval || '',
                'interval_count': intervalCount || ''
            };
            return `<label>${this.SIDECART_MSGS.schedule}</label>
                    ${this.choiceSchedule(line_pk, subscriptionInfo, value)}`;
        }
    }

    getLineTotalPriceHTML(line, currencyFormatter) {
        if (line.linePriceExclTax !== line.linePriceExclTaxInclDiscounts) {
            return `    <tr>
                            <td><span>${this.SIDECART_MSGS.regular}</span></td>
                            <td class="text-right">
                                <s>${currencyFormatter.format(line.linePriceExclTax)}</s>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>${this.SIDECART_MSGS.your_price}</strong></td>
                            <td class="text-right">
                                ${this.calculatePercentDiscount(line.linePriceExclTax, line.linePriceExclTaxInclDiscounts)}
                                ${currencyFormatter.format(line.linePriceExclTaxInclDiscounts)}
                            </td>
                        </tr>`;
        } else {
            return `    <tr>
                            <td><strong>${this.SIDECART_MSGS.your_price}</strong></td>
                            <td class="text-right">
                                ${this.calculatePercentDiscount(line.linePriceExclTax, line.linePriceExclTaxInclDiscounts)}
                                ${currencyFormatter.format(line.linePriceExclTaxInclDiscounts)}
                            </td>
                        </tr>`;
        }
    }

    getVoucherHTML(voucherDiscounts, currencyFormatter) {
        if (voucherDiscounts.length === 0) { return ""; }
        else {
            let str_html = "";
            for (let i = 0; i < voucherDiscounts.length; i++) {
                str_html += `
                        <tr class="voucher">
                            <td>${this.SIDECART_MSGS.applied_coupons} - <span class="coupon-code">${voucherDiscounts[i].voucher.code}</span></td>
                            <td></td>
                            <td class="text-right">-${currencyFormatter.format(voucherDiscounts[i].amount)} </td>
                        </tr>`;
            }
            return str_html;
        }
    }

    repl_tableSubscriptionLine(subscriptionRebills_lines, currencyFormatter) {
        let lines = ``;
        for (let j = 0; j < subscriptionRebills_lines.length; j++) {
            lines += `
                <tr>
                    <td>${subscriptionRebills_lines[j].product.title}</td>
                    <td>${subscriptionRebills_lines[j].quantity}</td>
                    <td>${currencyFormatter.format(subscriptionRebills_lines[j].unitPriceExclTax)}</td>
                </tr>
            `;
        }
        return lines;
    }

    repl_tableSubscription(subscriptionRebills, currencyFormatter) {
        return `<table class='table popover-table'>
                    <tbody>
                        <tr>
                            <td>${this.SIDECART_MSGS.product}</td>
                            <td>${this.SIDECART_MSGS.qty}</td>
                            <td>${this.SIDECART_MSGS.price}</td>
                        </tr>
                        ${this.repl_tableSubscriptionLine(subscriptionRebills.lines, currencyFormatter)}
                        <tr>
                            <td colspan='2'>${this.SIDECART_MSGS.shipping}</td>
                            <td>
                                <small>${this.SIDECART_MSGS.calculated_at_checkout}</small>
                            </td>
                        </tr>
                        <tr>
                            <td colspan='2'>${this.SIDECART_MSGS.subscription_total}</td>
                            <td>${currencyFormatter.format(subscriptionRebills.totalExclTax)}</td>
                        </tr>
                        <tr>
                            <td colspan='3'>
                            ${this.SIDECART_MSGS.subscription_renewal_message} ${subscriptionRebills.frequency}
                            </td>
                        </tr>
                    </tbody>
                </table>`;
    }

    getSubscriptionDetailPopOverHTML(subscriptionRebills, currencyFormatter) {
        let str_html_lines = "";
        for (let i = 0; i < subscriptionRebills.length; i++) {
            str_html_lines += this.repl_tableSubscription(subscriptionRebills[i], currencyFormatter);
            if (i < (subscriptionRebills.length - 1)) {
                str_html_lines += `<hr>`;
            }
        }
        let str_html = `
                <div class="cart-popover-wrapper">
                    <span class="help-icon"></span>
                    <div class="popover-content">
                        <p><strong>${this.SIDECART_MSGS.subscription_details}</strong></p>
                            ${str_html_lines}
                    </div>
                </div>
        `;
        return str_html;
    }

    getSubscriptionRebillHTML(subscriptionPreview, currencyFormatter) {
        if (subscriptionPreview.subscriptionRebills.length === 0) { return ""; }
        else {
            let subscription_num = 0;
            for (let i = 0; i < subscriptionPreview.subscriptionRebills.length; i++) {
                for (let j = 0; j < subscriptionPreview.subscriptionRebills[i].lines.length; j++) {
                    subscription_num = subscription_num + subscriptionPreview.subscriptionRebills[i].lines[j].quantity;
                }
            }
            let txt_sub_item = ``;
            if (subscription_num === 1) {
                txt_sub_item = this.SIDECART_MSGS.subscription_items_one;
            } else {
                let temp_txt = this.SIDECART_MSGS.subscription_items_other;
                txt_sub_item = temp_txt.replace("2", subscription_num.toString());
            }
            let str_html = `
                    <tr class="subscription-preview">
                        <td>
                            ${txt_sub_item}
                            ${this.getSubscriptionDetailPopOverHTML(subscriptionPreview.subscriptionRebills, currencyFormatter)}
                        </td>
                        <td></td>
                        <td class="text-right">
                            ${currencyFormatter.format(subscriptionPreview.totalGroupsExclTax)}
                        </td>
                    </tr>
                    `;
            return str_html;
        }
    }

    getPathName(location) {
        let targetURL;

        try {
            targetURL = new URL(location);
        } catch(_) {
            return location;
        }

        return targetURL.pathname;
    }

    repl_cartItem(line, currencyFormatter) {
        let subscription_info = line.product.subscriptionInfo;
        let hasSubscription = (subscription_info.intervalCount.length === 0) ? false : true;
        return `<div class="cart-item">
                    <div class="item-img">
                        <a class="product-thumb" href="${this.getPathName(line.product.url)}">
                            <img src="${line.product.primaryImage.thumbnail}" alt="Product">
                        </a>
                    </div>
                    <div class="item-details">
                        <button type="button" class="close" aria-label="Close" data-id="${line.pk}" data-behaviours="remove" >
                            <span data-id="${line.pk}" aria-hidden="false">&times;</span>
                        </button>
                        <span class="item-title">${line.product.title}</span>
                        <div class="item-description" style="align-items: inherit;">
                            <div class="basket-action select-submit">
                                <label>${this.SIDECART_MSGS.quantity}</label>
                                ${this.choiceQuantity(line.pk, line.quantity, this.max_cart_quantity_per_line)}
                            </div>
                            <div class="basket-action select-submit">
                                ${this.getChoiceSchedule(hasSubscription, line.pk, subscription_info, line.inverval, line.intervalCount)}
                            </div>
                        </div>
                        <table class="sidecart-table table-sm">
                            <tbody>
                                ${this.getLineTotalPriceHTML(line, currencyFormatter)}
                            </tbody>
                        </table>
                    </div>
                </div>`;
    }

    getLineCartHTML(numLines, lines, currencyFormatter) {
        let item_lines = "";
        for (let i = 0; i < numLines; i++) {
            try {
                let line = lines[i];
                item_lines += this.repl_cartItem(line, currencyFormatter);
            } catch (e) {
                console.error("ERROR:", e);
            }
        }
        return item_lines;
    }

    getTotalDiscountHTML(totalDiscount, currencyFormatter){
        if(totalDiscount === '0.00'){return "";}
        return `<tr class="discount">
                    <td class="text-success">${this.SIDECART_MSGS.discount}</td>
                    <td></td>
                    <td class="text-right">-${currencyFormatter.format(totalDiscount)}</td>
                </tr>`;
    }

    generateHTML(cart_data) {
        let base_template = '';
        if (cart_data.numLines === 0) {
            base_template = `
                    <div class="sidecart-header">
                        <button type="button" class="close sidecart-show" data-dismiss="side-cart" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="sidecart-title">${this.SIDECART_MSGS.your_order}</h4>
                    </div>
                    <div class="cart-empty">
                        <h3 class="text-center">${this.SIDECART_MSGS.your_cart_is_empty}</h3>
                        <p class="text-center">${this.SIDECART_MSGS.oops_You_have_nothing_here}</p>
                    </div>`;
        } else {
            const currencyFormatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: cart_data.currency,
            });

            base_template = `
                    <div class="sidecart-header">
                        <button type="button" class="close sidecart-show" data-dismiss="side-cart" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                        <h4 class="sidecart-title">${this.SIDECART_MSGS.your_order}</h4>
                    </div>
                    <div class="sidecart-body">
                        <div id="cart-messages"></div>
                        <div class="cart-items">
                            <input hidden>
                            ${this.getLineCartHTML(cart_data.numLines, cart_data.lines, currencyFormatter)}
                        </div>
                        <div class="cart-totals">
                            <table class="sidecart-table">
                                <tbody>
                                ${this.getVoucherHTML(cart_data.voucherDiscounts, currencyFormatter)}
                                ${this.getSubscriptionRebillHTML(cart_data.subscriptionPreview, currencyFormatter)}
                                    <tr class="subtotal">
                                        <td>${this.SIDECART_MSGS.cart_subtotal}</td>
                                        <td></td>
                                        <td class="text-right">
                                            ${currencyFormatter.format(cart_data.totalExclTaxExclDiscounts)}
                                        </td>
                                    </tr>
                                    ${this.getTotalDiscountHTML(cart_data.totalDiscount, currencyFormatter)}
                                    <tr class="shipping">
                                        <td>${this.SIDECART_MSGS.shipping}</td>
                                        <td></td>
                                        <td class="text-right">
                                            <small>${this.SIDECART_MSGS.calculated_at_checkout}</small>
                                        </td>
                                    </tr>
                                    <tr class="total">
                                        <td><strong>${this.SIDECART_MSGS.total}</strong></td>
                                        <td></td>
                                        <td class="text-right">
                                            <strong>
                                                ${currencyFormatter.format(cart_data.totalExclTax)}
                                            </strong>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="sidecart-footer">
                        <a class="cart-btn" href="/checkout/" data-dismiss="side-cart">${this.SIDECART_MSGS.proceed_to_checkout}</a>
                    </div>`;
        }
        return base_template;
    }
}

(function (s) {
    s.messages = {
        addMessage: (tag, msg) => {
            let msgHTML = `<div class="alert alert-${tag}">${msg}</div>`;
            let basket_message = document.getElementById('cart-messages');
            if(basket_message){
                basket_message.innerHTML = msgHTML;
            }
        },
        debug: (msg) => { s.messages.addMessage('debug', msg); },
        info: (msg) => { s.messages.addMessage('info', msg); },
        success: (msg) => { s.messages.addMessage('success', msg); },
        warning: (msg) => { s.messages.addMessage('warning', msg); },
        error: (msg) => { s.messages.addMessage('danger', msg); },
        
        clear: () => {
            let basket_message = document.getElementById('cart-messages');
            if(basket_message){
                basket_message.innerHTML = "";
            }
        },
        scrollTo: () => {
            let basket_message = document.getElementById('cart-messages');
            basket_message.scrollIntoView();
        }
    };

    s.basket = {
        init: async (options) => {
            s.basket.graphqlUrl = options.graphql_url;
            s.basket.modal_open = options.modal_open || false;

            s.handle = new SideCart(options.SIDECART_MSGS,  options.max_cart_quantity_per_line);

            let basket_modal = document.getElementById("cart-modal");

            basket_modal.addEventListener('change', async (e) => {
                await s.basket.handleBasketChange(e);
            });
        },
        showLoadingSign: () => {
            let basket_content = document.getElementById("cart-content");
            basket_content.innerHTML = '<div class="loader"><div class="loading"></div></div>';
        },
        getCookieCartID: () => {
            return PrimeCookies.get("storefront_cart_id") === undefined ? null : PrimeCookies.get("storefront_cart_id");
        },
        setCookieCartID: (cart_id) => {
            PrimeCookies.set("storefront_cart_id", cart_id);
        },
        reloadBasketData: async function () {
            s.basket.showLoadingSign();
            const query_str = {
                query: s.handle.STR_QUERY_GRAPHQL.createCart
            };
            const { data } = await s.handle.queryGraphql(s.basket.graphqlUrl, query_str);
            s.basket.setCookieCartID(data.createCart.cart.id);
            await s.basket.injectDataToHTML(data.createCart);
        },
        injectDataToHTML: async (data) => {
            let basket_count = document.querySelectorAll('#cart-count');
            basket_count.forEach((element) => { element.innerHTML = data.cart.numItems; });

            const side_cart_html = s.handle.generateHTML(data.cart);
            let basket_content = document.getElementById("cart-content");
            basket_content.innerHTML = side_cart_html;
        },
        handleBasketChange: async (e) => {
            if (typeof (extraData) === 'undefined') { extraData = []; }
            const { name, value } = e.target;
            const el_name = name.split("-").reverse()[0];
            if (el_name === 'quantity' || el_name === 'subscription_range') {
                s.basket.showLoadingSign();
                const line_id = name.split("-").reverse()[1];
                let cart_id = {id: s.basket.getCookieCartID()};
                let obj_line = { lineId: parseInt(line_id) };

                if (el_name === 'quantity') {
                    obj_line = { ...obj_line, quantity: parseInt(value) };
                }
                else if (el_name === 'subscription_range') {
                    if (value !== 'one-time') {
                        const subscription = value.split('-');
                        obj_line = {
                            ...obj_line, subscription: {
                                interval: subscription[1],
                                intervalCount: parseInt(subscription[0])
                            }
                        };
                    } else if (value === 'one-time') {
                        obj_line = {
                            ...obj_line, subscription: {
                                interval: null,
                                intervalCount: null
                            }
                        };
                    }
                }

                const varGraphql = {
                    cartId: cart_id.id,
                    lines: [obj_line]
                };

                const query_str = {
                    query: s.handle.STR_QUERY_GRAPHQL.updateCartLines,
                    variables: { input: varGraphql }
                };
                const { data } = await s.handle.queryGraphql(s.basket.graphqlUrl, query_str);
                if (data.updateCartLines.success) {
                    s.basket.injectDataToHTML(data.updateCartLines);
                    s.messages.clear();
                    s.messages.info("Your cart was updated successfully.");
                } else {
                    s.basket.injectDataToHTML(data.updateCartLines);
                    s.messages.clear();
                    for (let i = 0; i < data.updateCartLines.errors.nonFieldErrors.length; i++) {
                        if (data.updateCartLines.errors.nonFieldErrors[i].subscription_range !== undefined) {
                            let err_text = document.getElementById(`error-text-schedule-${line_id}`);
                            err_text.innerHTML = data.updateCartLines.errors.nonFieldErrors[i].subscription_range[0].message;
                            s.messages.error("Your cart couldn't be updated. Please correct any validation errors below.");
                        }
                        if (data.updateCartLines.errors.nonFieldErrors[i].quantity !== undefined) {
                            let err_text = document.getElementById(`error-text-quantity-${line_id}`);
                            err_text.innerHTML = data.updateCartLines.errors.nonFieldErrors[i].quantity[0].message;
                            s.messages.error("Your cart couldn't be updated. Please correct any validation errors below.");
                        }
                    }
                }
            }
        },
        removeBasketLine: async (line_id) => {
            let cart_id = {id: s.basket.getCookieCartID()};
            const varGraphql = {
                cartId: cart_id.id,
                lineIds: [parseInt(line_id)]
            };
            const query_str = {
                query: s.handle.STR_QUERY_GRAPHQL.removeCartLines,
                variables: { input: varGraphql }
            };

            s.basket.showLoadingSign();
            const { data } = await s.handle.queryGraphql(s.basket.graphqlUrl, query_str);
            if (data.removeCartLines !== undefined) {
                s.basket.injectDataToHTML(data.removeCartLines);
            } else {
                s.basket.injectDataToHTML(data);
            }

            s.messages.clear();
            s.messages.info("Your cart was updated successfully.");
        },
    };

    // allow to customize options(eg. next_url, editable)
    s.extraOptions = {};

    s.init = function (defaultOptions) {
        var options = Object.assign({}, defaultOptions, s.extraOptions);
        s.basket.init(options);
    };
    return s;
}(window.sidecart = window.sidecart || {}));