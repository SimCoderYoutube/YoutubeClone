const router = require('express').Router();
const userFunc = require('./functions/user')
const videoFunc = require('./functions/video')

const multer = require('multer')

const upload = multer().array('files')

router.route('/').get(function (req, res) {
    res.json("Backend Connected");
});


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


router.route('/api/video/list').get(function (req, res) {
    videoFunc.list()
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});
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


