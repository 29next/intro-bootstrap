# Next Commerce Theme — Claude AI Guide

This file provides Claude with context about this project so it can assist theme developers effectively.

- **Theme:** Intro Bootstrap (Bootstrap 5 starter theme)
- **Platform docs:** https://developers.nextcommerce.com/docs/storefront/
- **Theme Kit docs:** https://developers.nextcommerce.com/docs/storefront/themes/theme-kit/

> Local install, `ntk` CLI commands, and API key setup live in [README.md](README.md) and the platform docs above.

---

## Theme Directory Structure

Theme files live at the **repo root** (no `theme/` parent folder):

```
├── assets/         # Static files: CSS, JS, images, fonts
├── configs/        # settings_schema.json and settings_data.json
├── layouts/        # Base layout templates
├── locales/        # Translation JSON files (en.default.json, de.json, etc.)
├── partials/       # Reusable snippets ({% include "partials/foo.html" %})
├── sass/           # Sass source files (compiled locally to assets/)
├── templates/      # Page-specific templates
└── manifest.json   # Theme name and version
```

### Existing templates

```
templates/
├── index.html              ← Homepage
├── cart.html               ← Cart page
├── search.html             ← Search results
├── 403.html / 404.html / 500.html  ← Error pages
├── catalogue/
│   ├── index.html          ← All products listing
│   ├── category.html       ← Product category listing
│   └── product.html        ← Product detail page
├── blog/
│   ├── index.html          ← Blog listing
│   └── post.html           ← Blog post detail
├── pages/
│   └── page.html           ← Generic content page
├── reviews/
│   ├── index.html          ← Reviews listing
│   ├── review.html         ← Single review
│   └── form.html           ← Review submission form
└── support/
    ├── index.html          ← Help centre index
    ├── category.html       ← Help category listing
    └── article.html        ← Help article detail
```

---

## Template Language

Jinja2-style syntax — **not React/Vue, no JSX**.

```html
{{ variable }}              {# output #}
{{ product.title }}         {# dot notation #}
{{ price|floatformat:2 }}   {# filter #}
{% if customer %}...{% endif %}
{% for p in products %}...{% endfor %}
{% extends "layouts/base.html" %}
{% block content %}...{% endblock %}
{% include "partials/footer.html" %}
```

### Template inheritance — extends & block

All templates should extend `layouts/base.html` and override only the blocks they need. **Always prefer extending over copying** — try not to duplicate the base layout boilerplate into a new template.

```html
{% extends "layouts/base.html" %}

{% block title %}My Page — {{ store.name }}{% endblock %}

{% block content %}
  <div class="container">...</div>
{% endblock %}

{% block extrascripts %}
  <script src="{{ 'js/my-page.js'|asset_url }}"></script>
{% endblock %}
```

#### Available blocks in `layouts/base.html`

| Block | Default | Use for |
|---|---|---|
| `title` | Store meta title + tagline | Page-specific `<title>` |
| `seo` | `{% seo %}` | Override SEO meta tags |
| `html_class` | _(empty)_ | Class on `<html>` element |
| `body_id` | _(empty)_ | ID on `<body>` |
| `body_class` | _(empty)_ | Class on `<body>` for page-specific styling |
| `extrastyles` | _(empty)_ | Template-specific `<style>` or `<link>` tags |
| `extrahead` | _(empty)_ | Extra `<head>` tags (meta, preload, etc.) |
| `tracking` | _(empty)_ | Tracking/analytics scripts in `<head>` |
| `announcement_bar` | Announcement bar partial | Override or suppress the announcement bar |
| `nav_header` | Full navbar | Override or suppress the nav |
| `mini_cart` | Cart icon in nav | Override the mini cart |
| `breadcrumbs` | _(empty)_ | Breadcrumb navigation |
| `content` | _(empty)_ | **Main page content — override this in every template** |
| `content_wrapper` | Wraps breadcrumbs + content | Override the full content area |
| `footer` | Footer partial | Override or suppress the footer |
| `modals` | _(empty)_ | Modal dialogs |
| `scripts` | jQuery, Bootstrap, theme.js | Override core scripts (rarely needed) |
| `extrascripts` | _(empty)_ | Template-specific JS files |
| `onbodyload` | _(empty)_ | jQuery `$(function(){...})` code |
| `layout` | Full body layout | Override the entire page layout (rarely needed) |

### Global template objects

Available on every template:

| Object | Description |
|---|---|
| `request` | Current request: `request.host`, `request.path`, `request.country`, `request.currency`, `request.language` |
| `store` | Store info: address, branding, contact details, SEO metadata |
| `settings` | Theme settings values from `configs/settings_data.json` |
| `menus` | Access nav menus by code: `menus["main-nav"].items` |
| `products` | Global product list |
| `product_categories` | All product categories |
| `posts` | Blog posts |
| `post_categories` | Blog post categories |
| `currencies` | Available currencies (for switcher) |
| `languages_active_storefront` | Active languages (for switcher) |
| `storefront_geos` | Configured markets/geos |
| `privacy_policy` | Legal page content |
| `terms_and_conditions` | Legal page content |

### Page-specific objects

| Object | Key attributes |
|---|---|
| `product` | `title`, `price`, `images`, `variants`, `description`, `reviews` |
| `product_category` | `name`, `products`, `children` |
| `page` | `title`, `content` |
| `post` | `title`, `content`, `author`, `published_at` |
| `user` | `name`, `email`, `addresses` |
| `paginator` / `page_obj` | Pagination controls |

### Key template tags

| Tag | Usage |
|---|---|
| `{% purchase_info_for_product product as info %}` | Get product pricing in user's currency; exposes `info` object |
| `{% where products category=product_category as filtered %}` | Query/filter store objects |
| `{% url 'view-name' %}` | Generate URLs for named views |
| `{% image_thumbnail image "300x300" crop="center" as thumb %}` | Resize/crop images dynamically |
| `{% seo product %}` | Render SEO metadata for a product/page |
| `{% app_hook "global_header" %}` | Injection point for installed apps (use in layout) |
| `{% csrf_token %}` | Adds CSRF token to a POST form — platform JS auto-replaces it in cached pages, but avoid using it in custom templates; prefer the Storefront GraphQL API instead |
| `{% t "key" %}` | Output translated string from locale files |
| `{% now "Y" %}` | Current date/time with format string |

### Key template filters

| Filter | Example |
|---|---|
| `asset_url` | `{{ 'main.css'\|asset_url }}` — full CDN URL for an asset |
| `floatformat` | `{{ price\|floatformat:2 }}` — format decimal places |
| `date` | `{{ post.published_at\|date:"d M Y" }}` |
| `default` | `{{ value\|default:"Fallback" }}` |
| `default_if_none` | `{{ value\|default_if_none:"" }}` |
| `truncatewords_html` | `{{ content\|truncatewords_html:30 }}` |
| `add` / `minus` / `times` | `{{ price\|add:10 }}` — arithmetic |
| `slugify` | `{{ title\|slugify }}` |
| `linebreaks` | `{{ text\|linebreaks }}` — converts `\n` to `<p>` |
| `json_script` | `{{ data\|json_script:"element-id" }}` — safe JS data embedding |

---

## Theme Settings

- `configs/settings_schema.json` — defines the settings form in the theme editor
- `configs/settings_data.json` — stores saved values
- Access in templates via the `settings` object: `{{ settings.primary_color }}`

---

## Sass / Bootstrap Architecture

This theme uses Bootstrap 5. Edit the right file for the right change:

```
sass/
├── _user-bootstrap-variables.scss  ← 1st choice: override Bootstrap variables (colors, spacing, etc.)
├── _user-bootstrap-mixins.scss     ← Custom Sass mixins
├── _user-bootstrap-utilities.scss  ← Additional utility classes
├── _bootstrap-theme-overrides.scss ← Component-level overrides (when variables aren't enough)
├── _navigation.scss                ← Navigation styles
├── _cart.scss / _basket.scss       ← Cart/basket styles
├── _custom.scss                    ← Fully custom non-Bootstrap styles
└── main.scss                       → compiled to assets/main.css
```

Always prefer `_user-bootstrap-variables.scss` for Bootstrap customisation over `_custom.scss` to avoid specificity issues.

---

## JavaScript Libraries

Available globally via `assets/js/`:

| Library | Global | Notes |
|---|---|---|
| jQuery 3.6.0 | `$` | |
| Bootstrap 5 Bundle | `bootstrap` | Includes Popper.js; use data attributes or JS API |
| Slick Carousel | `$.fn.slick` | Used for product carousels |
| Slick Lightbox | `$.fn.slickLightbox` | Used for product image lightboxes |
| `theme.js` | — | Custom theme JS — add new behaviour here |

---

## Guides

### Custom page templates

Add files to `templates/pages/` following the naming pattern `page.<custom>.html`. They automatically appear as options in the dashboard page settings under **Theme Template**.

Extend the default rather than starting from scratch:

```html
{% extends "templates/pages/page.html" %}
{% block content %}
  {# custom content #}
{% endblock %}
```

### Custom product templates

Same pattern but in `templates/catalogue/` — name them `product.<custom>.html`. Assign per-product in the dashboard.

```html
{% extends "templates/catalogue/product.html" %}
{% block content %}
  {# custom content #}
{% endblock %}
```

### Product metadata

Define metadata fields in the dashboard (**Products > Metadata**) with an object type of "Product" and a key. Access the value in templates:

```html
{{ product.metadata.tagline }}
```

### Product variants

Two objects are available on product templates:

- **`variant_form`** — template form object; loop over it to render variant attribute selectors
- **`product.data`** — JSON object with full variant info (images, attributes, prices, availability)

The recommended pattern is to expose `product.data` to JS and update the add-to-cart form when the user changes variant selections:

```html
{# In template — expose variant data to JS #}
{{ product.data|json_script:"product-data" }}
```

```js
// In JS — read and react to variant selection
const productData = JSON.parse(document.getElementById('product-data').textContent);
// Map selected attributes → variant product ID → update form
```

See `templates/catalogue/product.html` and `assets/js/theme.js` for the existing implementation.

---

## Storefront GraphQL API

The store exposes a GraphQL API for use in theme JavaScript (e.g. `theme.js`). It is only accessible within the storefront context (in-browser) — not from external services.

- **Endpoint:** `https://<storedomain>/api/graphql/`
- **Explorer:** Visit the endpoint in a browser for the GraphiQL IDE

### Queries

| Query | Args | Description |
|---|---|---|
| `products` | `pk`, `title`, `ids`, `pks`, `first`, `last`, `offset`, `before`, `after` | List/filter products with pagination |
| `product` | `id!` | Single product by ID |
| `cart` | `id!` | Get a cart by ID |
| `me` | — | Current logged-in user |

### Mutations

**Cart**

| Mutation | Key inputs | Description |
|---|---|---|
| `createCart` | `lines` (productPk, quantity), `vouchers`, `attribution`, `metadata` | Create a new cart |
| `addCartLines` | `cartId`, `lines` (productPk, quantity, subscription) | Add lines to a cart |
| `updateCartLines` | `cartId`, `lines` (lineId, quantity) | Update quantities |
| `removeCartLines` | `cartId`, `lineIds` | Remove lines from a cart |
| `emptyCart` | `cartId` | Remove all lines from a cart |
| `addVoucher` | `cartId`, `vouchers` | Apply a voucher code |
| `removeVoucher` | `cartId`, `vouchers` | Remove a voucher code |
| `updateCartAttribution` | `cartId`, `attribution` (utmSource, utmMedium, utmCampaign, gclid, affiliate, etc.) | Set UTM/affiliate tracking |
| `updateCartMetadata` | `cartId`, `metadata` | Set arbitrary metadata on a cart |

**Account**

| Mutation | Key inputs | Description |
|---|---|---|
| `register` | `email`, `password`, `firstName`, `lastName`, `phoneNumber`, `acceptsMarketing`, `language` | Register a new user |
| `updateAccount` | `email`, `firstName`, `lastName`, `phoneNumber`, `acceptsMarketing`, `language` | Update the current user's profile |
| `tokenAuth` | `email`, `password` | Obtain a JWT for the user |
| `verifyToken` | `token` | Verify a JWT |

### Example: add a product to cart

```js
const response = await fetch('/api/graphql/', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `mutation AddToCart($input: AddCartLinesInput!) {
      addCartLines(input: $input) {
        cart { id lines { edges { node { quantity product { title } } } } }
      }
    }`,
    variables: { input: { cartId: cartId, lines: [{ productPk: productPk, quantity: 1 }] } }
  })
});
```

---

## Translations / i18n

- `locales/en.default.json` is the source of truth — add new translation keys here
- Use `{% t "key" %}` in templates to output translated strings
- Other locale files (e.g. `de.json`, `fr.json`) must be translated and updated manually — editing `en.default.json` does not automatically update them
- `crowdin.yml` is used by Next Commerce to manage translations for this base theme repo and is not relevant to developers using the theme on their own store

---

## Key Reminders

- **Never commit `config.yml`** — it contains the API key
- Theme files are at the **repo root** — paths like `partials/footer.html`, not `theme/partials/footer.html`
- Jinja2-style templates only — no JSX, no components
- Sass must be compiled locally (`ntk watch` handles this)
- Use `{% purchase_info_for_product %}` to get currency-correct pricing — do not output `product.price` directly
- Avoid custom templates that require `{% csrf_token %}` — use the Storefront GraphQL API instead for form submissions
- Use `{% app_hook "global_header" %}` and `{% app_hook "global_footer" %}` in the base layout for app integrations
