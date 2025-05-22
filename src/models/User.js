const mongoose = require('mongoose');

// Definindo o schema do usuário
const UserSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  spotifyLink: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', UserSchema);
