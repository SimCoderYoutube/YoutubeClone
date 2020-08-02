const User = require('../models/user');

const firebaseAdmin = require('firebase-admin');

const serviceAccount = require('../../config/config').serviceAccount;
const databaseURL = require('../../config/config').databaseURL;

firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
    databaseURL
})

module.exports = {
    verifyAccount: (user, idToken) => new Promise((resolve, reject) => {
        if (user === undefined) {
            return reject(new Error('auth denied'));
        }

        const userJson = JSON.parse(user);

        firebaseAdmin.auth().verifyIdToken(idToken)
            .then(decodedToken => {
                User.findOne({ firebase_id: userJson.uid })
                    .then(user => {
                        if (!user) {
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
                        } else {
                            resolve(user)
                        }
                    })
            })
            .catch(error => {
                reject(new Error(error))
            })
    }),

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

    handleSubscribe: (user, idToken, id) => new Promise((resolve, reject) => {
        module.exports.verifyAccount(user, idToken)
            .then((result) => {
                User.findOne({ _id: result._id, subscriptions: { $in: [id] } }, function (error, user) {
                    if (user == null) {
                        User.updateOne({ _id: result._id }, { "$push": { subscriptions: id } }, { useFindAndModify: true }).then(() => {
                            User.updateOne({ _id: id }, { "$push": { subscribers: result._id } }, { useFindAndModify: true }).then(() => {
                                resolve();
                            })
                        })
                    } else {
                        User.updateOne({ _id: result._id }, { "$pull": { subscriptions: id } }, { useFindAndModify: true }).then(() => {
                            User.updateOne({ _id: id }, { "$pull": { subscribers: result._id } }, { useFindAndModify: true }).then(() => {
                                resolve();
                            })
                        })
                    }
                })

            }).catch(error => {
                reject(new Error(error))
            })
    })
}