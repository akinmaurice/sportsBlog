const mongoose = require('mongoose');
const Comment = mongoose.model('Comment');
//Post COmment
exports.postComment = async (req, res) => {
    req.body.article = req.params.id;
    const comment = await (new Comment(req.body)).save();
    req.flash('success', 'COmment Posted');
    res.redirect(`/post/${req.body.post_slug}`);

    //res.json(req.body);
}
