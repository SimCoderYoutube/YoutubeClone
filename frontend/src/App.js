import React, { Component } from 'react'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import firebase from 'firebase'
import axios from 'axios'


import Home from './components/Home'
import Subscriptions from './components/Subscriptions'
import Login from './components/user/Login'
import Upload from './components/user/Upload'
import VideoDisplay from './components/VideoDisplay'
import Profile from './components/user/Profile'
import 'bootstrap/dist/css/bootstrap.css';

import './styles.css';



export class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      loaded: false
    }
  }

  componentDidMount(){
    firebase.auth().onAuthStateChanged(user => {
      if(!user){
        this.setState({loaded: true});
      }
      else{
        firebase.auth().currentUser.getIdToken(true)
        .then(idToken =>{
          axios.post('http://127.0.0.1:6200/api/user/verify', null, {
            params: {
              user: firebase.auth().currentUser,
              idToken
            }
          }).then(result => {
            console.log(result)
          })
        })
        
        this.setState({loaded: true});
      }
    })
  }
  render() {
    if(this.state.loaded){
      return (
        <Router>
          <Route path="/" exact component={Home} />
          <Route path="/subscriptions" exact component={Subscriptions} />
          <Route path="/login" exact component={Login} />
          <Route path="/upload" exact component={Upload} />
          <Route path="/display/:id" exact component={VideoDisplay} />
          <Route path="/profile/:id" exact component={Profile} />
        </Router>
      )
    }

    return(
      <div>
        Loading . . . 
      </div>
    )
   

  }
}

export default App
