const User = require('../models/user');

const firebaseAdmin = require('firebase-admin');

const serviceAccount = require('../../config/config').serviceAccount;
const databaseURL = require('../../config/config').databaseURL;

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL
})

module.exports = {

    /**
     * validate token for a user
     * 
     * @param {Object} user - user to be validated' object
     * @param {String} idToken - Session token of the user
     * 
     * @returns {Promise} Promise object represents the user object and, in case of failure, returns an error
     */
    verifyAccount: (user, idToken) => new Promise((resolve, reject) => {
        if (user === undefined) {
            return reject(new Error('auth denied'));
        }

        //parse the json into an object
        const userJson = JSON.parse(user);

        // Validate the token with firebase
        firebaseAdmin.auth().verifyIdToken(idToken)
            .then(() => {
                //find a user that contains the firebase_id equal to that of the user object
                User.findOne({ firebase_id: userJson.uid })
                    .then(user => {
                        if (!user) { // if the user does not exist in the database then create a new entry
                            new User({
                                firebase_id: userJson.uid,
                                name: userJson.email,
                            }).save()
                                .then(user => {
                                    resolver(user)
                                })
                                .catch(error => {
                                    reject(new Error(error))
                                })
                        } else { //If the user exists then resolve the promise with the user's object
                            resolve(user)
                        }
                    })
            })
            .catch(error => { // called if the token validation fails
                reject(new Error(error))
            })
    }),


    /**
     * Gets a object of a user by id
     * 
     * @param {String} id - id of the user to fetch the object of.
     * 
     * @returns {Promise} Promise object represents the use object and, in case of failure, returns an error
     */
    getById: (id) => new Promise((resolve, reject) => {
        if (id != null) {
            User.findById(id)
                .then((result) => {
                    resolve(result);
                })
                .catch(error => {
                    reject(new Error(error))
                })
        } else {
            reject(new Error('id is null'))
        }
    }),

    /**
     * handles the (un)subscription of a user to another user
     * 
     * @param {Object} user - current user's object
     * @param {String} idToken - Session token of the user
     * @param {String} id - id of the user the current user wants to (un)subscribe to.
     * 
     * @returns {Promise} Promise object represents the use String of current subscription status and , in case of failure, returns an error
     */
    handleSubscribe: (user, idToken, id) => new Promise((resolve, reject) => {
        module.exports.verifyAccount(user, idToken)
            .then((result) => {
                User.findOne({ _id: result._id, subscriptions: { $in: [id] } }, function (error, user) {
                    if (user == null) { // if user is null then the user is not subscribed
                        // update the subscription array of the current user adding the "id" user from the list
                        User.updateOne({ _id: result._id }, { "$push": { subscriptions: id } }, { useFindAndModify: true }).then(() => {
                            // update the subscribers array of the "id" user adding the current user from the list
                            User.updateOne({ _id: id }, { "$push": { subscribers: result._id } }, { useFindAndModify: true }).then(() => {
                                resolve('user subscribed successfully');
                            })
                        })
                    } else {// if user not is null then the user is subscribed
                        // update the subscription array of the current user removing the "id" user from the list
                        User.updateOne({ _id: result._id }, { "$pull": { subscriptions: id } }, { useFindAndModify: true }).then(() => {
                            // update the subscribers array of the "id" user removing the current user from the list
                            User.updateOne({ _id: id }, { "$pull": { subscribers: result._id } }, { useFindAndModify: true }).then(() => {
                                resolve('user unsubscribed successfully');
                            })
                        })
                    }
                })

            }).catch(error => {
                reject(new Error(error))
            })
    })
}