export default class Hello {

  constructor(message) {
    this._message = message;
  }

  get message() {
    return this._message;
  }

}
