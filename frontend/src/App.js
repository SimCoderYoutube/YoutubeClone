import React, { Component } from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'


import Home from './components/Home'
import Login from './components/user/Login'
import 'bootstrap/dist/css/bootstrap.css';

import './styles.css';



export class App extends Component {
  render() {
    return (
      
      <Router>
        <Route path="/" exact component={Home} />
        <Route path="/login" exact component={Login} />

      </Router>
    )

  }
}

export default App
