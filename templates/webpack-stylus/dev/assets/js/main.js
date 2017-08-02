//import $ from 'jquery';
let $ = document.querySelector.bind(document);

export default (() => {

let APP = {

  cache: {
    ttl: $('.header__ttl')
  },

  bind: () => {
    APP.funcs.helloWorld();
  },

  funcs: {

    helloWorld: () => {
      APP.cache.ttl.textContent = 'Performance is Usability, Performance is UX';
    }

  },

  plugins: () => {

  },

  init: () => {
    APP.plugins();
    APP.funcs;
    APP.bind();
  }
};

APP.init();

})();
