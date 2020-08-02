const router = require('express').Router();
const userFunc = require('./functions/user')
const videoFunc = require('./functions/video')

const multer = require('multer')

const upload = multer().array('files')

router.route('/').get(function (req, res) {
    res.json("Backend Connected");
});

/**
 * @api {post} /api/user/verify verify user session token
 * @apiName verifyUser
 * @apiGroup User
 *
 * @apiParam {Object} user - firebase user object.
 * @apiParam {String} idToken - session id token.
 *
 * @apiSuccess {Object} user object.
 * @apiError {Error} error object.
 */
router.route('/api/user/verify').post(function (req, res) {
    const { user, idToken } = req.query;
    userFunc.verifyAccount(user, idToken)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

/**
 * @api {get} /api/user/get Request User information
 * @apiName getUser
 * @apiGroup User
 *
 * @apiParam {String} id - user's id.
 *
 * @apiSuccess {Object} user object.
 * @apiError {Error} error object.
 */
router.route('/api/user/get').get(function (req, res) {
    const { id } = req.query;
    userFunc.getById(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

/**
 * @api {post} /api/user/subscribe subscribe user to another user
 * @apiName subscribeUser
 * @apiGroup User
 *
 * @apiParam {Object} user - firebase user object.
 * @apiParam {String} idToken - session id token.
 * @apiParam {String} id - user id to (un)subscribe.
 *
 * @apiSuccess {String} subscription status.
 * @apiError {Error} error object.
 */
router.route('/api/user/subscribe').post(function (req, res) {
    const { user, idToken, id } = req.query;
    userFunc.handleSubscribe(user, idToken, id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

/**
 * @api {post} /api/video/upload upload video with all the relevant info
 * @apiName uploadVideo
 * @apiGroup Video
 *
 * @apiParam {Object} user - firebase user object.
 * @apiParam {String} idToken - session id token.
 * @apiParam {String} description - description of the video.
 * @apiParam {String} name - name of the video.
 *
 * @apiSuccess {Object} video object.
 * @apiError {Error} error object.
 */
router.route('/api/video/upload').post(upload, videoFunc.upload, function (req, res) {
    const { description, name, user, idToken } = req.query;

    videoFunc.save(description, name, req.files, user, idToken)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});


/**
 * @api {post} /api/video/list List every video in the database.
 * @apiName listVideo
 * @apiGroup Video
 *
 * @apiSuccess {Object[]} list of video objects.
 * @apiError {Error} error object.
 */
router.route('/api/video/list').get(function (req, res) {
    videoFunc.list()
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

/**
 * @api {get} /api/video/user get every video of a user.
 * @apiName listUserVideo
 * @apiGroup Video
 * 
 * @apiParam {String} id - user id to get the videos of.
 * 
 * @apiSuccess {Object[]} list of video objects.
 * @apiError {Error} error object.
 */
router.route('/api/video/user').get(function (req, res) {
    const { id } = req.query;
    videoFunc.getByUser(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

/**
 * @api {get} /api/video/subscriptions get every video of a user subscriptions.
 * @apiName listSubscritpionsVideo
 * @apiGroup Video
 * 
 * @apiParam {String} id - user id to get the subscriptions' videos of.
 * 
 * @apiSuccess {Object[]} list of video objects.
 * @apiError {Error} error object.
 */
router.route('/api/video/subscriptions').get(function (req, res) {
    const { id } = req.query;
    videoFunc.getBySubscriptions(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});



/**
 * @api {get} /api/video/get Fetches a video by id.
 * @apiName getVideo
 * @apiGroup Video
 * 
 * @apiParam {String} id - id of the video to get.
 * 
 * @apiSuccess {Object video object.
 * @apiError {Error} error object.
 */
router.route('/api/video/get').get(function (req, res) {
    const {id} = req.query

    videoFunc.getById(id)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

module.exports = router;


