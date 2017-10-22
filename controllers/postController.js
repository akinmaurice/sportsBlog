const mongoose = require('mongoose');
const Post = mongoose.model('Post');
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
        res.render('tags', { tags, title: `${tag} Articles`, posts, count, page, pages,tag });
    }
}

//Controller to get all uyser posts with pagination
exports.getUserPosts = async (req, res) => {
    res.render('userPosts', {title: 'My Posts'});
}

/*Search COntroller */
exports.searchPost = async (req, res) => {
    const posts = await Post.find({
        $text: {
            $search: req.query.q
        }
    }, {
            score: { $meta: 'textScore' }
        }).sort({
            score: { $meta: 'textScore' }
        }).limit(5);
    res.json(posts);
}