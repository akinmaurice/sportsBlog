var express = require('express');
var router = express.Router();
const userController = require('../controllers/userController');
const postController = require('../controllers/postController');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const { catchErrors } = require('../handlers/errorHandlers');

/* GET home page. */
router.get('/', catchErrors(postController.homePage));

/* GET get blog post by slug. */
router.get('/post/:slug', catchErrors(postController.getPostBySlug));

/* GET get user Login page. */
router.get('/login', userController.getLogin);

/* GET get user Register page. */
router.get('/register',userController.getRegister);

/* GET Register user */
router.post('/register', userController.validateRegister, userController.registerUser, authController.login);

/* Rouute to Login User */
router.post('/login', authController.login);

/* Rouute to Logout User */
router.get('/logout', authController.logout);

/* Rouute to get the page to add new post */
router.get('/add', authController.isLoggedIn, catchErrors(postController.getNewPost));

/* Rouute to create new blog post */
router.post('/add', authController.isLoggedIn, catchErrors(postController.newPost));

/* Rouute to get posts by tags */
router.get('/tags/:tag', catchErrors(postController.getPostsByTag));

/* Rouute to post comment for articles */
router.post('/post/:id/comment', catchErrors(commentController.postComment));

/* Route to get user account page*/
router.get('/account', authController.isLoggedIn, catchErrors(userController.account));

/*API End POINTS */
router.get('/api/search', catchErrors());
module.exports = router;
