import React, { Component } from 'react'
import {Link} from "react-router-dom"
import firebase from 'firebase'

export class Navbar extends Component {

    onSignOut() {
        firebase.auth().signOut().catch(error =>{
            console.log(error)
        })
    }
    render() {
        return (
            <div className="navbar">
                <Link to={{ pathname: "/login"}}>Login</Link>
                <Link to={{ pathname: "/upload"}}>Upload</Link>
                <Link to={{ pathname: "/subscriptions"}}>Subscriptions</Link>
                <button onClick={this.onSignOut}>Logout</button>
            </div>
        )
    }
}

export default Navbar
