if (!customElements.get('tab-bar')) {
  customElements.define('tab-bar', class TabBar extends HTMLElement {
    constructor() {
      super();

      this.buttons = this.querySelectorAll('button');
      this.select = this.querySelector('select');

      if (!!(this.buttons) && this.buttons.length > 0) {
        this.buttons.forEach((button) => {
          if (button.dataset.collectionHandle == this.dataset.collectionHandle) {
            button.setAttribute('data-selected', '')
          }

          button.addEventListener('click', this.onButtonClickHandler.bind(this));
        });
      }

      if (!!(this.select)) {
        this.select.addEventListener('change', this.onSelectChangeHandler.bind(this));
      }
    }

    onButtonClickHandler(event) {
      const button = event.currentTarget;

      if (this.dataset.collectionHandle == button.dataset.collectionHandle) {
        // Do nothing, already on collection page
      } else {
        this.switchCollection(button.dataset.collectionUrl);
      }
    }

    onSelectChangeHandler(event) {
      const select = event.currentTarget;

      this.switchCollection(select.value);
    }

    switchCollection(url) {
      fetch(url)
        .then((response) => response.text())
        .then((data) => {
          
        })
        .catch((error) => console.error(error));
    }
  });
}