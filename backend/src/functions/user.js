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
    })
}