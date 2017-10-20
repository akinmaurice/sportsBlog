const mongoose = require('mongoose');
const Post = mongoose.model('Post');
//Controller to get the home Page and display all posts
exports.homePage = async (req, res) => {
     //Query the Database for all the Posts in the DB
    const posts = await Post.find();
    //res.render('stores', { title: 'Blog', stores });
    res.render('index', { title: 'Home Page' })
}
//Controller to get post by slug
exports.getPostBySlug = async (req, res) => {
    res.render('blog', {title: 'Blog Page'});
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