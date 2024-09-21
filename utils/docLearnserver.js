const { mongoose, Schema } = require('mongoose');



// cek koneksi url/database
mongoose.connect('mongodb://127.0.0.1:27017/dataContacs')

// 2. JIKA PAKE SCHEMA
// Membuat skema untuk collection 'contacts'
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

// // Membuat model berdasarkan skema, ==> MONGODB OTOMATIS MEMBUAT --> mahasiswas
// const Contact = mongoose.model('mahasiswa', schemaContacts)

//1. Contoh membuat dan menyimpan dokumen baru dengan constructor
// const newContact = new Contact({
//     nama: 'andi permadi',
//     noHp: '08121378123',
//     email: "andi@gmail.com"
// })

// newContact.save()
//     .then((result) => {
//         console.log(result)
//         mongoose.connection.close()
//     })
//     .catch(err => {
//         Object.values(err.errors).map(error => {
//             console.log(error.message)
//             mongoose.connection.close()
//         });
//     }
//     )

// //2. Contoh membuat dan menyimpan dokumen baru dengan .create
// const Contact = mongoose.model('mahasiswa', schemaContacts)
// Contact.create({
//     nama: 'dimas',
//     noHp: '08121378123',
//     email: "andi@gmail.com"
// })
//     .then((result) => {
//         console.log(result)
//         mongoose.connection.close()
//     })
//     .catch(err => {
//         Object.values(err.errors).map(error => {
//             console.log(error.message)
//             mongoose.connection.close()
//         });
//     }
//     )

//3. deleteOne
// const Contact = mongoose.model('mahasiswa', schemaContacts)
// Contact.deleteOne({ nama: 'andi'})
//     .then((result) => {
//         console.log(result)
//         mongoose.connection.close()
//     })
//     .catch(err => {
//         Object.values(err.errors).map(error => {
//             console.log(error.message)
//             mongoose.connection.close()
//         });
//     }
//     )

//4. findByIdAndDelete()
// const Contact = mongoose.model('mahasiswa', schemaContacts)
// Contact.findByIdAndDelete('66c4be58b4129ff3ddd5c3d6')
//     .then((result) => {
//         console.log(result)
//         mongoose.connection.close()
//     })
//     .catch(err => {
//         Object.values(err.errors).map(error => {
//             console.log(error.message)
//             mongoose.connection.close()
//         });
//     }
//     )














//1.  jika pake monggose.model
// param1 itu nama collection, param2 itu fieldnya
// const Contacts = mongoose.model('Contacts',
//     {
//         name: {
//             type: String,
//             required: true
//         },
//         noHp: {
//             type: String,
//             required: true
//         },
//         email: {
//             type: String
//         }

//     });

// //sama kaya insertOne
// const contac1 = new Contacts({

//     email: 'dimas@gmail.com'
// });

// contac1.save()
//     .then((result) => console.log(result))
//     .catch(err => {
//         Object.values(err.errors).map(error => {
//             console.log(error.message)
//         });
//     }
//     )

