const mongoose = require('mongoose');

const VideoSchema = new mongoose.Schema({
    name: {type: String, default: ''},
    description: {type: String, default: ''},
    video: {type: String},
    image: {type: String},
    creator: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
})

module.exports = mongoose.model('Video', VideoSchema)