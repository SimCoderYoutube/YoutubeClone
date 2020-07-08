import React, { Component } from 'react'
import axios from 'axios';
import { DefaultPlayer as Video } from 'react-html5video'
import 'react-html5video/dist/styles.css'
import Navbar from './Navbar'

export class VideoDisplay extends Component {

    constructor(props) {
        super(props);

        this.state = {
            video: null
        }
    }

    componentDidMount() {
        axios.get('http://127.0.0.1:6200/api/video/get', {
            params: {
                id: this.props.match.params.id
            }
        }).then(result => {
            this.setState({ video: result.data });
        })
    }
    render() {
        const { video } = this.state


        if (video == null) {
            return (<></>)
        }


        return (
            <div>
                <Navbar/>

                <div className="container">
                    <Video key={video.video} poster={video.image} controls={['PalyPause', 'Seek', 'Time', 'Fullscreen']}>
                        <source src={video.video} type="video/mp4" />
                    </Video>

                    <p>{video.creator.name}</p>
                    <h3>{video.name}</h3>
                    <p>{video.description}</p>
                </div>
            </div>
        )
    }
}

export default VideoDisplay
