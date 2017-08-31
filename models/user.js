var mongoose = require ("mongoose");
var Schema = mongoose.Schema;
var bcrypt = require ("bcrypt-nodejs");

var userSchema = new Schema ({
    username: {type: String, required: true},
    password: {type: String, required: true},
    email: {type:String},
    postNum: {type: [String]},
    pageNum: {type: [String]},
    threadsPost: {type: [String]},
    comments: {type: [String]},
    threadid: {type: [String]},
    articlesPost: {type: [String]},
    articleComments: {type: [String]},
    articleid: {type: [String]},
    articlesWritten: {type: [String]},
    articlesWrittenid: {type: [String]},
    profilePic: {type: String, default:"/images/default-avatar.jpg"},
    description: {type: String},
    enable: {type: Boolean, default: false},
    allowedToUploadArticles: {type: Boolean, default: false},
    admin: {type: Boolean, default: false},
    banned: {type: Boolean, default:false}
});

userSchema.methods.encryptPassword = function (password) {
  return bcrypt.hashSync (password, bcrypt.genSaltSync (5), null);
};

userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync (password, this.password);
};

module.exports = mongoose.model ("User", userSchema);