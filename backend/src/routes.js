const router = require('express').Router();


router.route('/').get(function (req, res) {
    res.json("Backend Connected");
});


module.exports = router;


