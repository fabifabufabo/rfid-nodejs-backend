const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
uid: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
},
name: {
    type: String,
    required: true,
    trim: true,
},
spotifyLink: {
    type: String,
    required: true,
    trim: true,
}
}, {
 timestamps: true
});

module.exports = mongoose.model('User', userSchema);
