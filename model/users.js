const { mongoose, Schema } = require('mongoose');
const { schemaContacts } = require('./contact');


// Schema
const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true // Username unik untuk setiap pengguna
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
    },
    contacts: [schemaContacts],
    createdAt: {
        type: Date,
        default: Date.now // Secara otomatis menyimpan waktu pembuatan
    }
});

// Model
const User = mongoose.model('User', userSchema);

module.exports = User;
