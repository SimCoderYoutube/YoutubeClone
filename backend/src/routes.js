const router = require('express').Router();
const userFunc = require('./functions/user')
const videoFunc = require('./functions/video')

const multer = require('multer')

const upload = multer().array('files')

router.route('/').get(function (req, res) {
    res.json("Backend Connected");
});


router.route('/api/user/verify').post(function (req, res) {
    const {user, idToken} = req.query;
    userFunc.verifyAccount(user, idToken)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});

router.route('/api/video/upload').post(upload, videoFunc.upload, function (req, res) {
    const {description, name, user} = req.query;

    console.log("asdasd")
    videoFunc.save(description, name, req.files, user)
        .then(result => {
            res.json(result);
        })
        .catch(error => {
            res.json(error);
        })
});


module.exports = router;


