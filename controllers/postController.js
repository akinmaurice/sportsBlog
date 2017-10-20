const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const promisify = require('es6-promisify');
//Controller to get the home Page
exports.homePage = async (req, res) => {
    res.render('index', {title: 'Home Page'})
}
//Controller to get post by slug
exports.getPostBySlug = async (req, res) => {
    res.json(req.params)
}