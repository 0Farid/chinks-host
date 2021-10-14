const mongoose = require("/../mongoUtil");

const UserSchema = mongoose.Schema({
    username: String,
    created: Date,
    Uid: Int32,
});

module.exports = mongoose.model("users", UserSchema);
