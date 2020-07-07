const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebase_id: {type: String, required: true, unique: true},
    name: {type: String, default: ''}
})

module.exports = mongoose.model('User', UserSchema)