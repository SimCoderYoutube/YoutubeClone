const CLOUD_BUCKET = 'youtube_clone_bucket';

const userFunc = require('./user')
const Video = require('../models/video');

const { Storage } = require('@google-cloud/storage');
const user = require('../models/user');

const storage = new Storage({ projectId: CLOUD_BUCKET, keyFilename: '/app/config/storage_config.json' });
const bucket = storage.bucket(CLOUD_BUCKET);

module.exports = {

    /**
     * Upload files to the google cloud storage, only returns when every promise (for each file) has been fulfilled
     * 
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @param {Function} next - Express next middleware function
     */
    upload: (req, res, next) => {
        const { user } = req.query;

        //parse the json into an object
        const userJson = JSON.parse(user);

        //in case no files have been uploaded then return the function
        if (req.files.length == 0) {
            res.send('No files uploaded.')
            return;
        }

        // Gets current timestamp wich will be the id of the file
        const timestamp = new Date().getTime();
        let promises = [];

        // Loop over every file (image and video)
        req.files.forEach((file, index) => {
            //create a promise for current file iteration
            const promise = new Promise((resolve, reject) => {
                //get type of file (video, image)
                const type = file.mimetype.substring(0, file.mimetype.indexOf('/'));
                //builds the name of the file to upload
                const name = `${userJson.uid}/${timestamp}/${type}`;
                //get the bucket object
                const bucket_filename = bucket.file(name);

                //create write stream for the file to be uploaded
                const stream = bucket_filename.createWriteStream({
                    metadata: {
                        contentType: file.mimetype,
                    }
                })

                //on error reject the promise of the file
                stream.on('error', (error) => {
                    req.files[index].cloudStorageError = error;
                    reject(error);
                })

                //on finish treat the file and save the name to the file object
                stream.on('finish', async () => {
                    try {

                        // save the cloud storage object name to the file object
                        req.files[index].cloudStorageObject = name;

                        // if file is image then make it publicly accessible 
                        if (type == 'image') {
                            await bucket_filename.makePublic();
                        }
                        req.files[index].cloudStoragePublicUrl = `https://storage.googleapis.com/${CLOUD_BUCKET}/${name}`
                        resolve();
                    } catch (error) {
                        reject(error)
                    }
                })

                //end stream
                stream.end(file.buffer)
            })
            promises.push(promise)
        })

        // called when every promise has been fulfilled
        Promise.all(promises)
            .then(() => {
                promises = [];
                next();
            })
            .catch(next)
    },

    
    /**
     * Saves a video object in the database, usually called after upload(req, res, next) succseeds
     * 
     * @param {String} descritpion - description of the video
     * @param {String} name - name of the video
     * @param {String[]} files - array with the files of the video (image and video)
     * @param {Object} user - user to be validated' object
     * @param {String} idToken - Session token of the user
     * 
     * @returns {Promise} Promise object represents the video object and, in case of failure, returns an error
     */
    save: (description, name, files, user, idToken) => new Promise((resolve, reject) => {

        //validate the user
        userFunc.verifyAccount(user, idToken)
            .then(result => {

                //Build the video object
                const mVideo = new Video();

                mVideo.name = name;
                mVideo.description = description;
                mVideo.image = files[1].cloudStoragePublicUrl;
                mVideo.video = files[0].cloudStorageObject;
                mVideo.creator = result._id;

                // store it in the ddatabase
                mVideo.save().then(result => {
                    resolve(result);
                }).catch(error => {
                    reject(error);
                })
            }).catch(error => {
                reject(error);
            })
    }),

    /**
     * Gets a list of every video in the database
     * 
     * @returns {Promise} Promise object represents the list of videos and, in case of failure, returns an error
     */
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

    /**
     * Gets a list of videos of a user
     * 
     * @param {String} id - id of the user to fetch the videos of.
     * 
     * @returns {Promise} Promise object represents the list of videos and, in case of failure, returns an error
     */
    getByUser: (id) => new Promise((resolve, reject) => {
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


    /**
     * Gets a list of videos according to the user's subscriptions
     * 
     * @param {String} id - id of the user to fetch the subscribers of.
     * 
     * @returns {Promise} Promise object represents the list of videos and, in case of failure, returns an error
     */
    getBySubscriptions: (id) => new Promise((resolve, reject) => {
        //get user object
        user.findOne({ firebase_id: id }).then((result) => {
            // Get all videos that contains ids that exist in the user's subscribers' list
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


    /**
     * Gets a object of a video by id
     * 
     * @param {String} id - id of the video to fetch the object of.
     * 
     * @returns {Promise} Promise object represents the use object and, in case of failure, returns an error
     */
    getById: (id) => new Promise((resolve, reject) => {
        Video
            .findById(id)
            .populate('creator')
            .exec()
            .then(video => {
                //generate the signed url and add it to the video object
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

    /**
     * Generates a signed url for google storage bucket with a validity of 1 day
     * 
     * @param {String} filename - name of the file to generate the url of.
     * 
     * @returns {Promise} Promise object represents the url String of the google storage object , in case of failure, returns an error 
     */
    generateSignedUrl: (filename) => new Promise((resolve, reject) => {

        //get the current date and add one day to it
        const date = new Date();
        const month = date.getUTCMonth() + 1;
        const day = date.getUTCDate() + 1;
        const year = date.getUTCFullYear();

        const expires = month + '-' + day + '-' + year;
        const file = bucket.file(filename);

        //gets signed url using the google storage function
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