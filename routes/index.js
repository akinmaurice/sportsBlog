var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

/* GET home page. */
router.get('/',postController.homePage);

/* GET get blog post by slug. */
router.get('/post/:slug',postController.getPostBySlug);

/* GET get user Login page. */
router.get('/login',userController.getLogin);

/* GET get user Register page. */
router.get('/register',userController.getRegister);

/* GET Register user */
router.post('/register', userController.validateRegister, userController.registerUser, authController.login);

/* Rouute to Login User */
router.post('/login', authController.login);

/* Rouute to Logout User */
router.get('/logout', authController.logout);

/* Rouute to get the page to add new post */
router.get('/add', authController.isLoggedIn, postController.getNewPost);

/* Rouute to create new blog post */
router.post('/add', authController.isLoggedIn, postController.newPost);

/* Rouute to get posts by tags */
router.get('/tags/:tag', postController.getPostsByTag);

/* Rouute to post comment for articles */
router.post('/post/:id/comment', commentController.postComment);

module.exports = router;
