import React, {Component} from 'react'

class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App__header">
          <img src={require('../images/svg/logo.svg')} className="App__logo" alt="logo" />
          <h1 className="App__ttl">Welcome to React</h1>
        </header>
        <p className="App__intro">
          To get started, edit <code>src/App.js</code> and save to reload.
        </p>
      </div>
    );
  }
}

export default App;
