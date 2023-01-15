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
      this.collectionContentSelectors = Object.values({
        products: '.content-for-layout .shopify-section > [class*="__product-grid"]',
        tabBar: '.content-for-layout .collection-tabs .tab-bar',
        titleAndDescription: '.content-for-layout .collection-hero__text-wrapper'
      });
      this.links = this.querySelectorAll('a');
      this.select = this.querySelector('select');
      this.state = {
        title: document.title,
        url: this.dataset.collectionUrl
      };

      window.addEventListener('pageshow', this.onHistoryChangeHandler.bind(this));

      // Grab all matching links on the page to let them benefit from the
      // non-reloading functionality too

      if (!!(this.links) && this.links.length > 0) {
        this.links.forEach((link) => {
          this.allLinks = this.allLinks.concat([...document.querySelectorAll(`a[href*="${link.getAttribute('href')}"]`)]);
        });

        this.allLinks.forEach((link) => {
          link.removeEventListener('click', this.onLinkClickHandler.bind(this));
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

    // Checks the state of the tab bar component to see if a collection should load
    onHistoryChangeHandler() {
      if (location.href.indexOf(this.state.url) == -1) {
        this.switchCollection(this.state.url, false);
      }
    }

    onLinkClickHandler(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const link = event.currentTarget;

      if (link.href.indexOf(this.dataset.collectionHandle) > -1) {
        // Do nothing, already on collection page
      } else {
        this.switchCollection(link.getAttribute('href'), true);
      }
    }

    onSelectChangeHandler(event) {
      this.switchCollection(event.currentTarget.value, true);
    }

    setLoadingState(loading) {
      if (loading) {
        document.getElementById('ProductGridContainer')?.querySelector('.collection')?.classList.add('loading');
      } else {
        document.getElementById('ProductGridContainer')?.querySelector('.collection')?.classList.remove('loading');
      }
    }

    // Updates the content on the collection page and replaces the current URL
    switchCollection(url, pushState) {
      this.setLoadingState(true);

      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          this.collectionContentSelectors.forEach((selector) => {
            document.querySelector(selector).innerHTML = this.getContentFromHTML(data, selector);
          });

          this.state = {
            title: this.getContentFromHTML(data, 'title')?.replace(/\n/g, '').trim(),
            url
          };

          if (pushState) {
            history.pushState(this.state, this.state.title, this.state.url);
          }

          document.title = this.state.title;

          this.setLoadingState(false);
        })
        .catch((error) => {
          console.error(error)
          this.setLoadingState(false);
        });
    }
  });
}