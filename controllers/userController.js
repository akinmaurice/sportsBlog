const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
//Controller to get login page
exports.getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
}
//Controller to get register page
exports.getRegister = (req, res) => {
    res.render('editUser', { title: 'Register' });
}
//MiddleWare to validate user data submitted to register
exports.validateRegister = (req, res, next) => {
    req.checkBody('name', 'Name field cannot be empty').notEmpty();
    req.checkBody('email', 'That Email is not valid').isEmail().notEmpty();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    });
    req.checkBody('password', 'Password cannot be Blank!').notEmpty();
    req.checkBody('password-confirm', 'COnfirm Password cannot be empty!').notEmpty();
    req.checkBody('password-confirm', 'Your Passwords do not match').equals(req.body.password);
    const errors = req.validationErrors();
    if (errors) {
        req.flash('danger', errors.map(err => err.msg));
        res.render('editUser', { title: 'Register', body: req.body, flashes: req.flash() });
        //STop fn from running
        return;
    }
    next();
}
//Middle ware Controller to regsiter user
exports.registerUser = async (req, res, next) => {
    const user = new User({email: req.body.email, name: req.body.name});
    const registerWithPromise = promisify(User.register, User);
    await registerWithPromise(user, req.body.password);
    next();
}
//controller to get User account
exports.account = async(req, res) => {
    res.render('account', {title: 'My Account'});
}