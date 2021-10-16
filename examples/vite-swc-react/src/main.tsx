import React from 'react'
import ReactDOM from 'react-dom'
import './index.css'
import App from './App'

import('react').then(console.log)
ReactDOM.render(
  <React.StrictMode>
    <div>hell</div>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
)
