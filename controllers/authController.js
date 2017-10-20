const passport = require('passport');
//Login Controller
exports.login = passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: 'Failed Login!',
    successRedirect: '/',
    successFlash: 'You are now logged in!'
});
//Logout Controller
exports.logout = (req, res) => {
    req.logout();
    req.flash('success', 'you are now logged out');
    res.redirect('/');
}
//Middle ware to rrstrict page access
exports.isLoggedIn = (req, res, next) => {
    //Check if user is authenticated
    if (req.isAuthenticated()) {
        next();
        return;
    }
    req.flash('error', 'You must be logged in to do that!');
    res.redirect('/login');
}