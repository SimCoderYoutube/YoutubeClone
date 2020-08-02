import React, { Component } from 'react'
import Navbar from './Navbar'
import VideoList from './VideoList'

export class Subscriptions extends Component {
    render() {
        return (
            <div>
                <Navbar/>
                
                This are your subscriptions' videos

                <VideoList location={'subscriptions'}/>
            </div>
        )
    }
}

export default Subscriptions
