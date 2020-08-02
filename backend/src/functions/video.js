const CLOUD_BUCKET = 'youtube_clone_bucket';

const userFunc = require('./user')
const Video = require('../models/video');

const { Storage } = require('@google-cloud/storage');
const user = require('../models/user');

const storage = new Storage({ projectId: CLOUD_BUCKET, keyFilename: '/app/config/storage_config.json' });
const bucket = storage.bucket(CLOUD_BUCKET);

module.exports = {
    upload: (req, res, next) => {
        const { user } = req.query;

        const userJson = JSON.parse(user);

        if (req.files.length == 0) {
            res.send('No files uploaded.')
            return;
        }

        const timestamp = new Date().getTime();
        let promises = [];
        req.files.forEach((file, index) => {
            const promise = new Promise((resolve, reject) => {
                const type = file.mimetype.substring(0, file.mimetype.indexOf('/'));
                const name = `${userJson.uid}/${timestamp}/${type}`;
                const bucket_filename = bucket.file(name);

                const stream = bucket_filename.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    }
                })

                stream.on('error', (error) => {
                    req.files[index].cloudStorageError = error;
                    reject(error);
                })

                stream.on('finish', async () => {
                    try {

                        req.files[index].cloudStorageObject = name;
                        if (type == 'image') {
                            await bucket_filename.makePublic();
                        }
                        req.files[index].cloudStoragePublicUrl = `https://storage.googleapis.com/${CLOUD_BUCKET}/${name}`
                        resolve();
                    } catch (error) {
                        reject(error)
                    }
                })

                stream.end(file.buffer)
            })
            promises.push(promise)
        })

        Promise.all(promises)
            .then(() => {
                promises = [];
                next();
            })
            .catch(next)
    },

    save: (description, name, files, user, idToken) => new Promise((resolve, reject) => {
        userFunc.verifyAccount(user, idToken)
            .then(result => {
                const mVideo = new Video();

                mVideo.name = name;
                mVideo.description = description;
                mVideo.image = files[1].cloudStoragePublicUrl;
                mVideo.video = files[0].cloudStorageObject;
                mVideo.creator = result._id;
                console.log(mVideo)
                mVideo.save().then(result => {
                    resolve(result);
                }).catch(error => {
                    reject(error);
                })
            }).catch(error => {
                reject(error);
            })
    }),

    list: () => new Promise((resolve, reject) => {
        Video
            .find()
            .populate('creator')
            .exec()
            .then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
    }),

    getByUser: (id) => new Promise((resolve, reject) => {
        console.log(id)
        Video
            .find({ creator: id })
            .populate('creator')
            .exec()
            .then(result => {
                resolve(result);
            }).catch(error => {
                reject(error);
            })
    }),

    getBySubscriptions: (id) => new Promise((resolve, reject) => {
        user.findOne({ firebase_id: id }).then((result) => {
            Video
                .find({ creator: result.subscriptions })
                .populate('creator')
                .exec()
                .then(result => {
                    resolve(result);
                }).catch(error => {
                    reject(error);
                })
        })

    }),


    getById: (id) => new Promise((resolve, reject) => {
        Video
            .findById(id)
            .populate('creator')
            .exec()
            .then(video => {
                module.exports.generateSignedUrl(video.video).then(result => {
                    video.video = result;
                    resolve(video);
                }).catch(error => {
                    reject(error);
                })
            }).catch(error => {
                reject(error);
            })
    }),

    generateSignedUrl: (filename) => new Promise((resolve, reject) => {
        const date = new Date();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate() + 1;
        const year = date.getUTCFullYear();

        const expires = month + '-' + day + '-' + year;
        const file = bucket.file(filename);
        file.getSignedUrl({
            action: 'read',
            expires
        }).then(result => {
            resolve(result[0]);
        })
            .catch(error => {
                reject(error);
            })
    })


}