import React, { Component } from 'react';
import Navbar from '../Navbar';
import firebase from 'firebase';
import axios from 'axios';

export class Upload extends Component {
    constructor(props) {
        super(props);

        this.state = {
            name: '',
            description: '',
            video: '',
            image: ''
        }

        this.handleUpload = this.handleUpload.bind(this);
    }

    handleUpload() {
        if (this.state.video == null || this.state.video == null) {
            return;
        }

        const data = new FormData();
        data.append('files', this.state.video)
        data.append('files', this.state.image)

        const { description, name } = this.state

        firebase.auth().currentUser.getIdToken(true)
            .then(idToken => {
                axios.post('http://127.0.0.1:6200/api/video/upload', data, { params: { description, name, user: firebase.auth().currentUser, idToken } })
                    .then(result => {
                        console.log(result)
                    })
                    .catch(error => {
                        console.log(error)
                    })
            })
            .catch(error => {
                console.log(error)
            })
    }
    render() {
        return (
            <div>
                <Navbar />
                <input
                    placeholder="Name"
                    className="col-md-12"
                    value={this.state.name}
                    onChange={e => this.setState({ name: e.target.value })} />
                <input
                    placeholder="Description"
                    className="col-md-12"
                    value={this.state.description}
                    onChange={e => this.setState({ description: e.target.value })} />
                <input
                    placeholder="video"
                    className="col-md-12"
                    type="file"
                    value={this.state.video.filename}
                    onChange={e => this.setState({ video: e.target.files[0] })} />
                <input
                    placeholder="image"
                    className="col-md-12"
                    type="file"
                    value={this.state.image.filename}
                    onChange={e => this.setState({ image: e.target.files[0] })} />

                <button
                    className="col-md-12"
                    onClick={this.handleUpload}>
                    Upload
                </button>

            </div>
        )
    }
}

export default Upload
