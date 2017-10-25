const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const multer = require('multer');
//Import package to resize
const jimp = require('jimp');
//packege for uniqure identifier to rename images
const uuid = require('uuid');
//Set up multer options
const multerOptions = {
    storage: multer.memoryStorage(),
    //Check the file type if its okay or not
    fileFilter(req, file, next) {
        const isPhoto = file.mimetype.startsWith('image/');
        if (isPhoto) {
            next(null, true);
        } else {
            next({ message: 'That file type is not allowed!' }, false);
        }
    }
};
//Controller to handle the file upload using multer save to memory
exports.upload = multer(multerOptions).single('photo');

//image resize function here
exports.resize = async (req, res, next) => {
    //Check if there is no file to resize
    if (!req.file) {
        next();//Skip to next middleware
        return;
    }
    const extension = req.file.mimetype.split('/')[1];
    req.body.photo = `${uuid.v4()}.${extension}`;
    //Resize now
    const photo = await jimp.read(req.file.buffer);
    await photo.resize(800, jimp.AUTO);
    await photo.write(`./public/uploads/${req.body.photo}`);
    //Photo saved to folder here Continue to the next middleware
    next();
}
//Controller to get the home Page and display all posts
exports.homePage = async (req, res) => {
    //CHeck page number from the params sent in the url or set to 1
    const page = req.params.page || 1;
    //SET LIMIT OF number of posts to return
    const limit = 5;
    //SET THE NUMBER OF POSTS TO SKIP BASED ON PAGE NUMBER
    const skip = (page * limit) - limit;
    //Query the Database for all the Posts in the DB
    const postsPromise = await Post.find().sort({ created: -1 }).populate('author').skip(skip).limit(limit);
    const countPromise = await Post.count();
    const [posts, count] = await Promise.all([postsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    if (!posts.length && skip) {
        res.redirect(`/posts/page/${pages}`);
    } else {
        res.render('index', { title: 'Home Page', posts, page, pages, count })
    }
}
//Controller to get post by slug
exports.getPostBySlug = async (req, res) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author comments');
    if (!post) {
        res.redirect('/error'); //Send them to 404 page!
        return;
    }
    res.render('blog', { title: post.title, post });
}
//Controller to get new post form page
exports.getNewPost = (req, res) => {
    res.render('editPost', { title: 'New Blog Post' });
}

/* Controller to create post
using async await, error is handled by the catch error function.
always wrap routes in error catcher when using async await
in the erorr handler file. called function when setting up
route to the create postfunction.
used flash to display the error.
*/
exports.newPost = async (req, res) => {
    req.body.author = req.user._id;
    const post = await (new Post(req.body)).save();
    req.flash('success', `Successfully Created ${post.title}.`);
    res.redirect(`/post/${post.slug}`);
    //res.redirect('/');
}

//Controller to get posts by tag
exports.getPostsByTag = async (req, res) => {
    //CHeck page number from the params sent in the url or set to 1
    const page = req.params.page || 1;
    //SET LIMIT OF number of posts to return
    const limit = 5;
    //SET THE NUMBER OF POSTS TO SKIP BASED ON PAGE NUMBER
    const skip = (page * limit) - limit;
    const tag = req.params.tag;
    const tagQuery = tag || { $exists: true };
    const tagsPromise = await Post.getTagsList();
    const postsPromise = await Post.find({ tags: tagQuery }).sort({ created: -1 }).populate('author').skip(skip).limit(limit);
    const countPromise = await Post.find({ tags: tagQuery }).count();
    const [tags, posts, count] = await Promise.all([tagsPromise, postsPromise, countPromise]);
    const pages = Math.ceil(count / limit);
    if (!posts.length && skip) {
        res.redirect(`/posts/page/${pages}`);
    } else {
        res.render('tags', { tags, title: `${tag} Articles`, posts, count, page, pages, tag });
    }
}

//Controller to get all uyser posts with pagination
exports.getUserPosts = async (req, res) => {
    const posts = await Post.find({ author: req.user._id }).sort({ created: -1 });
    res.render('userPosts', { title: 'My Posts', posts });
}

/*Search COntroller */
exports.searchPost = async (req, res) => {
    const searchTerm = req.query.q;
    const posts = await Post.find({
        $text: {
            $search: req.query.q
        }
    }, {
            score: { $meta: 'textScore' }
        }).sort({
            score: { $meta: 'textScore' }
        }).sort({ created: -1 }).populate('author');
    res.render('search', { title: `Search results for: ${searchTerm}`, searchTerm, posts });
    //res.json({posts, searchTerm});
}

//COnfirm Blog Post/Article owner
const confirmOwner = (post, user) => {
    if (!post.author.equals(user._id)) {
        throw Error('You connot Edit this store!');
    }
}

//Controller to edit a Blog Post/Article
exports.editPost = async (req, res) => {
    // fetch id sent from the url and query db for store
    const post = await Post.findOne({ _id: req.params.id });
    confirmOwner(post, req.user);
    res.render('editPost', { title: `Edit ${post.title}`, post });
}

//Controller to update a post
exports.updatePost = async (req, res) => {
    const post = await Post.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidatos: true }).exec();
    req.flash('success', `Successfully updated ${post.title}`);
    res.redirect(`/post/${post.id}/edit`);
}

//Controller to delete a post
exports.deletePost = async (req, res) => {
    // fetch id sent from the url and query db for store
    const post = await Post.findOne({ _id: req.params.id });
    confirmOwner(post, req.user);
    res.render('deletePost', { title: `Delete ${post.title}`, post });
}

//Controller to Remove a Post
exports.removePost = async (req, res) => {
    //Find and Delete the Article
    const post = await Post.findOneAndRemove({ _id: req.body.post_id }).exec();
    req.flash('success', `Successfully Deleted ${req.body.post_title}`);
    res.redirect(`/account/posts`);
}