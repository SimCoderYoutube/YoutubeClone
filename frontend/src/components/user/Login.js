import React, { Component } from 'react'
import { Redirect } from 'react-router-dom'

import Navbar from '../Navbar'
import firebase from 'firebase'

export class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            email: "",
            password: ""
        }

        this.onSignIn = this.onSignIn.bind(this)
        this.onSignUp = this.onSignUp.bind(this)
    }

    onSignUp() {
        firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
            console.log(error)
          });
    }

    onSignIn() {
        firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password).catch(function(error) {
            console.log(error)
          });
    }

    render() {
        if(firebase.auth().currentUser == undefined){
            return (
                <div>
                    <Navbar />
                    <div className="container">
                        <input
                            placeholder="email"
                            className="col-md-12"
                            type="email"
                            value={this.state.email}
                            onChange={e => this.setState({ email: e.target.value })} />
                        <input
                            placeholder="password"
                            className="col-md-12 mb-3"
                            type="password"
                            value={this.state.password}
                            onChange={e => this.setState({ password: e.target.value })} />
                        <button className="col-md-6" onClick={this.onSignIn}>Login</button>
                        <button className="col-md-6" onClick={this.onSignUp}>Register</button>
                    </div>
                </div>
            )
        }
        

        return(
            <Redirect push to="/"/>
        )
        
    }
}

export default Login
