const router = require('express').Router();
const userFunc = require('./functions/user')

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


module.exports = router;


