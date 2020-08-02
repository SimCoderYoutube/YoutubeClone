const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    firebase_id: {type: String, required: true, unique: true},
    name: {type: String, default: ''},
    subscriptions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
})

module.exports = mongoose.model('User', UserSchema)