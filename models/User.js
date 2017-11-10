var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    password: { type: String, required: true }
});

userSchema.methods.generateHash = function (password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

userSchema.methods.compareHash = function (password) {
    return bcrypt.compareSync(password, this.password);
};

mongoose.model('User', userSchema);