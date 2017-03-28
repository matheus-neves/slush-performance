import Hello from '../Helpers/Hello';

export default class Controller {

  constructor(){

    let $ = document.querySelector.bind(document),
        hello = new Hello('Performance is Usability, Performance is UX');

    $('.header__ttl').textContent = hello.message;
  }


}
