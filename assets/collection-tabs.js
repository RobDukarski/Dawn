/**
 * @fileoverview collection-tabs.js defines the tab-bar custom element.
 * @author Rob Dukarski <rob@dukar.ski>
 * @version 1.0.0
 */

if (!customElements.get('tab-bar')) {
  customElements.define('tab-bar', class TabBar extends HTMLElement {
    constructor() {
      super();

      this.allLinks = [];
      this.collectionContentSelectors = {
        "titleAndDescription": ".content-for-layout .collection-hero__text-wrapper",
        "tabBar": ".content-for-layout .collection-tabs",
        "products": ".content-for-layout .product-grid-container"
      };
      this.links = this.querySelectorAll('a');
      this.select = this.querySelector('select');

      // Grab all matching links on the page to let them benefit from the
      // non-reloading functionality too.

      if (!!(this.links) && this.links.length > 0) {
        this.links.forEach((link) => {
          this.allLinks.concat([...document.querySelectorAll(`a[href*="${link.href}]`)]);
        });

        this.allLinks.forEach((link) => {
          link.addEventListener('click', this.onLinkClickHandler.bind(this));
        });
      }

      if (!!(this.select)) {
        this.select.addEventListener('change', this.onSelectChangeHandler.bind(this));
      }
    }

    // Returns content from the provided HTML filtered by a selector
    getContentFromHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        ?.querySelector(selector)?.innerHTML;
    }

    onLinkClickHandler(event) {
      event.preventDefault();

      const link = event.currentTarget;

      if (link.href.indexOf(this.dataset.collectionHandle) > -1) {
        // Do nothing, already on collection page
      } else {
        this.switchCollection(link.href);
      }
    }

    onSelectChangeHandler(event) {
      const select = event.currentTarget;

      this.switchCollection(select.value);
    }

    // Updates the content on the collection page and replaces the current URL
    switchCollection(url) {
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          Object.values(this.collectionContentSelectors).forEach((selector) => {
            document.querySelector(selector).innerHTML = this.getContentFromHTML(data, selector);
          });

          history.pushState({}, '', url);
        })
        .catch((error) => console.error(error));
    }
  });
}