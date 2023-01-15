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
      this.links;
      this.select;
      this.state = {
        handle: this.dataset.collectionHandle,
        title: document.title,
        url: this.dataset.collectionUrl
      };

      window.addEventListener('load', this.onLoadHandler.bind(this));
      window.addEventListener('popstate', this.onHistoryChangeHandler.bind(this));

      this.init();
    }

    // Returns content from the provided HTML filtered by a selector
    getContentFromHTML(html, selector) {
      return new DOMParser()
        .parseFromString(html, 'text/html')
        ?.querySelector(selector)?.innerHTML;
    }

    init() {
      this.links = this.querySelectorAll('a');
      this.select = this.querySelector('select');

      // Grab all matching links on the page to let them benefit from the
      // non-reloading functionality too

      if (!!(this.links) && this.links.length > 0) {
        if (this.allLinks.length > 0) {
          this.links.forEach((link) => {
            link.addEventListener('click', this.onLinkClickHandler.bind(this));
          });
        } else {
          this.links.forEach((link) => {
            this.allLinks = this.allLinks.concat([...document.querySelectorAll(`a[href*="${link.getAttribute('href')}"]`)]);
          });

          this.allLinks.forEach((link) => {
            link.addEventListener('click', this.onLinkClickHandler.bind(this));
          });
        }
      }

      if (!!(this.select)) {
        this.select.addEventListener('change', this.onSelectChangeHandler.bind(this));
      }
    }

    // Checks the state of the history event to see if a collection should load
    onHistoryChangeHandler(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if (event.state.url !== this.state.url) {
        this.switchCollection(event.state.url, false);
      }
    }

    onLinkClickHandler(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      const url = event.currentTarget.getAttribute('href');

      if (url == this.dataset.collectionUrl) {
        // Do nothing, already on collection page
      } else {
        if (!!(this.links) && this.links.length > 0) {
          this.links.forEach((link) => {
            if (link.getAttribute('href') == url) {
              link.setAttribute('aria-current', 'page');
              link.setAttribute('data-selected', '');
            } else {
              link.removeAttribute('data-selected');
              link.removeAttribute('aria-current');
            }
          });
        }

        this.switchCollection(url, true);
      }
    }

    onLoadHandler() {
      this.state.title = document.title;

      history.replaceState(this.state, this.state.title, location.href);
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
    switchCollection(url = location.href, pushState) {
      this.setLoadingState(true);

      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          this.collectionContentSelectors.forEach((selector) => {
            document.querySelector(selector).innerHTML = this.getContentFromHTML(data, selector);
          });

          let handle = url?.split('/')?.pop();

          if (url?.indexOf('?') > -1) {
            handle = url.split('?')[0]?.split('/')?.pop();
          }

          this.state = {
            handle,
            title: this.getContentFromHTML(data, 'title')?.replace(/\n/g, '').trim(),
            url
          };

          if (pushState) {
            history.pushState(this.state, this.state.title, url);
          } else {
            history.replaceState(this.state, this.state.title, url);
          }

          document.title = this.state.title;

          this.dataset.collectionHandle = this.state.handle;
          this.dataset.collectionUrl = this.state.url;

          this.init();
          this.setLoadingState(false);
        })
        .catch((error) => {
          console.error(error)
          this.setLoadingState(false);
        });
    }
  });
}