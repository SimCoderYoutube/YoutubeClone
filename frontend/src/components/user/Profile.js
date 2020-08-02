import React, { Component } from 'react'
import axios from 'axios'
import VideoList from '../VideoList'
import Navbar from '../Navbar'
import firebase from 'firebase'

export class Profile extends Component {
    constructor(props) {
        super(props);

        this.state = {
            user: null
        }

        this.handleSubscribe = this.handleSubscribe.bind(this);
    }

    componentDidMount() {
        let that = this;
        axios.get('http://127.0.0.1:6200/api/user/get', { params: { id: this.props.match.params.id } })
            .then((response) => {
                that.setState({
                    user: response.data
                })
            })
            .catch((error) => {
                console.log(error);
            })
    }

    handleSubscribe() {

        let that = this;

        firebase.auth().currentUser.getIdToken(true).then((idToken) => {
            axios.post('http://127.0.0.1:6200/api/user/subscribe', null,
                {
                    params:
                    {
                        user: firebase.auth().currentUser,
                        idToken,
                        id: this.props.match.params.id
                    }
                }).then((result) => {
                    console.log(result);
                }).catch((error) => {
                    console.log(error);
                })
        })
    }
    render() {
        const { user } = this.state;

        if (user == null) {
            return (<></>)
        }

        return (
            <div>
                <Navbar />
                <div className="container">
                    <h1>{user.name}</h1>
                    <button onClick={this.handleSubscribe}>Subscribe</button>

                    <VideoList location={'profile'} id={this.props.match.params.id} />
                </div>
            </div>

        )
    }
}

export default Profile
