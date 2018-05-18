import React from 'react'
import ReactDOM from 'react-dom'

import './stylus/priority/critical.styl'
import './stylus/style.styl'

import registerServiceWorker from './registerServiceWorker'
import App from './components/App'

ReactDOM.render(<App />,document.getElementById('root'))
registerServiceWorker()
