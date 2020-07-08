import React, { Component } from 'react'
import axios from 'axios';
import { LazyLoadImage } from 'react-lazy-load-image-component'
import {Link} from 'react-router-dom'

export class VideoList extends Component {
    constructor(props) {
        super(props);

        this.state = {
            videoList: []
        }
    }
    componentDidMount() {
        let that = this
        axios.get('http://127.0.0.1:6200/api/video/list')
            .then(result => {
                that.setState({ videoList: result.data });
                console.log(that.state.videoList);
            })
    }
    render() {
        return (
            <div className="container">
                <div className="row">
                    {this.state.videoList.map(currentVideo => {
                        if (currentVideo.creator == null) {
                            return;
                        }
                        return (
                            <Link className="col-md-3" to={`/display/${currentVideo._id}`}>
                                <LazyLoadImage className="col-md-12 video-list-img" src={currentVideo.image} />
                                <p>{currentVideo.name}</p>
                                <p>{currentVideo.creator.name}</p>
                            </Link>
                        )
                    })}

                </div>
            </div>

        )
    }
}

export default VideoList
