var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');

/* GET home page. */
router.get('/',postController.homePage);

/* GET get blog post by slug. */
router.get('/post/:slug',postController.getPostBySlug);

/* GET get user Login page. */
router.get('/login',userController.getLogin);

/* GET get user Register page. */
router.get('/register',userController.getRegister);

/* GET Register user */
router.post('/register', userController.validateRegister, userController.registerUser);

module.exports = router;
