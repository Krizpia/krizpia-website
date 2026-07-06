(function () {
  'use strict';

  function parseBreadcrumbData() {
    var scripts = document.querySelectorAll('script[type="application/ld+json"]');
    for (var i = 0; i < scripts.length; i += 1) {
      var raw = scripts[i].textContent.trim();
      if (!raw) continue;

      try {
        var data = JSON.parse(raw);
        var candidates = Array.isArray(data) ? data : [data];
        if (data['@graph']) candidates = candidates.concat(data['@graph']);

        for (var j = 0; j < candidates.length; j += 1) {
          if (candidates[j] && candidates[j]['@type'] === 'BreadcrumbList') {
            return candidates[j].itemListElement || [];
          }
        }
      } catch (error) {
        // Ignore non-JSON snippets and keep looking for breadcrumb schema.
      }
    }

    return [];
  }

  function createStyle() {
    if (document.getElementById('visual-breadcrumbs-style')) return;

    var style = document.createElement('style');
    style.id = 'visual-breadcrumbs-style';
    style.textContent = [
      '.visual-breadcrumbs{background:linear-gradient(90deg,#fff8e8,#ffffff);border-bottom:1px solid #ead8b8;color:#4b3a16;font-family:Arial,sans-serif}',
      '.visual-breadcrumbs__inner{max-width:1150px;margin:0 auto;padding:12px 22px;display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;line-height:1.4}',
      '.visual-breadcrumbs__label{font-weight:800;color:#7a5a10;margin-right:2px}',
      '.visual-breadcrumbs a{color:#064e3b;text-decoration:none;font-weight:800;border-bottom:1px solid transparent}',
      '.visual-breadcrumbs a:hover,.visual-breadcrumbs a:focus{color:#b7791f;border-bottom-color:currentColor}',
      '.visual-breadcrumbs__separator{color:#c28a24;font-weight:800}',
      '.visual-breadcrumbs__current{font-weight:900;color:#111}',
      '@media (max-width:640px){.visual-breadcrumbs__inner{padding:10px 16px;font-size:13px}.visual-breadcrumbs__label{width:100%;margin-bottom:2px}}'
    ].join('');
    document.head.appendChild(style);
  }

  function buildBreadcrumbs(items) {
    var nav = document.createElement('nav');
    nav.className = 'visual-breadcrumbs';
    nav.setAttribute('aria-label', 'Breadcrumb');

    var inner = document.createElement('div');
    inner.className = 'visual-breadcrumbs__inner';

    var label = document.createElement('span');
    label.className = 'visual-breadcrumbs__label';
    label.textContent = 'You are here:';
    inner.appendChild(label);

    items.forEach(function (entry, index) {
      var isLast = index === items.length - 1;
      var name = entry.name || 'Page';
      var item = entry.item || '#';

      if (index > 0) {
        var separator = document.createElement('span');
        separator.className = 'visual-breadcrumbs__separator';
        separator.setAttribute('aria-hidden', 'true');
        separator.textContent = '›';
        inner.appendChild(separator);
      }

      if (isLast) {
        var current = document.createElement('span');
        current.className = 'visual-breadcrumbs__current';
        current.setAttribute('aria-current', 'page');
        current.textContent = name;
        inner.appendChild(current);
      } else {
        var link = document.createElement('a');
        link.href = item;
        link.textContent = name;
        inner.appendChild(link);
      }
    });

    nav.appendChild(inner);
    return nav;
  }

  function insertBreadcrumbs() {
    if (document.querySelector('.visual-breadcrumbs')) return;

    var items = parseBreadcrumbData();
    if (items.length < 2) return;

    createStyle();
    var breadcrumbs = buildBreadcrumbs(items);
    var header = document.querySelector('body > header');
    if (header && header.parentNode) {
      header.insertAdjacentElement('afterend', breadcrumbs);
      return;
    }

    var main = document.querySelector('main');
    if (main && main.parentNode) {
      main.parentNode.insertBefore(breadcrumbs, main);
      return;
    }

    document.body.insertBefore(breadcrumbs, document.body.firstChild);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', insertBreadcrumbs);
  } else {
    insertBreadcrumbs();
  }
})();
