import React, { Component } from 'react'
import Navbar from './Navbar'
import VideoList from './VideoList'

export class Home extends Component {
    render() {
        return (
            <div>
                <Navbar/>
                this is home

                <VideoList location={'home'}/>
            </div>
        )
    }
}

export default Home
