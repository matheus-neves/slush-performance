import $ from 'jquery';
import slick from 'slick-carousel';

export default class OrientationListener {

  constructor(width, el, config) {

    this.width = width;
    this.el = el;
    this.config = config;
  }

  checkResolution() {
    if($(window).width() < this.width) $(this.el).slick(this.config);
  }

  orientationChange() {

    window.addEventListener("orientationchange", () => {
      if(window.orientation != 0 && window.screen.width >= this.width) {
        $(this.el).slick('unslick');
      } else {
        $(this.el).slick(this.config);
      }
    }, false);

  }


}
