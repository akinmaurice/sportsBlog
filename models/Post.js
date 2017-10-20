const mongoose = require('mongoose');
//Use global promise for mongoose
mongoose.Promise = global.Promise;
const slug = require('slugs');

//Make Schema
const postSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        require: 'Please enter a Title for the blog post!'
    },
    slug: String,
    description: {
        type: String,
        trim: true,
        required: 'Enter a blog content'
    },
    tags: [String],
    created: {
        type: Date,
        default: Date.now
    },
    photo: String,
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: 'Blog Post Should have a valid User!'
    }
});
/*Auto generate slugs and pre-save before someone saves a post in the schema.
not needed for new post only stores with changed title*/
postSchema.pre('save', async function (next) {
    if (!this.isModified('title')) {
        next(); // Skip
        return; // stop this this function back to save
    }
    /* THis takes the title of the post, run it through the schema
    and get the slug field and assign it to the output */
    this.slug = slug(this.title);
    //find post with the same slug.
    const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
    const postWithSlug = await this.constructor.find({ slug: slugRegEx });
    if (postWithSlug.length) {
        this.slug = `${this.slug}-${postWithSlug.length + 1}`;
    }
    //Move to the next function. i.e continue to save the store
    next();
});


module.exports = mongoose.model('Post', postSchema);