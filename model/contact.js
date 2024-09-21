const { mongoose, Schema } = require('mongoose');


//Schema
const schemaContacts = new Schema({
    nama: {
        type: String,
        required: true
    },
    noHp: {
        type: String,
        required: true
    },
    email: {
        type: String
    }
});

//model
// const Contact = mongoose.model('contact', schemaContacts)


module.exports = { schemaContacts }