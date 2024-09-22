const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const { body, validationResult, check } = require('express-validator')
const methodOverride = require('method-override')
const bcrypt = require('bcrypt')


// //connect db
require('./utils/db')
// const { Contact } = require('./model/contact')
const User = require('./model/users')



const app = express()
const port = 3000



//SETUP METHOD-OVERRIDE
app.use(methodOverride('_method'))

//SETUP EJS
const path = require('path');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/main-layout');


// app.set('view engine', 'ejs')
// app.use(expressLayouts)
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))

//FLASH DLL
const session = require('express-session')
const cookieParser = require('cookie-parser')
const flash = require('connect-flash')



//KONFIGURASI SESSION

// Muat variabel lingkungan dari file .env
require('dotenv').config();

// Konfigurasi cookie-parser jika diperlukan
app.use(cookieParser());

// Konfigurasi express-session
app.use(session({
    secret: process.env.SESSION_SECRET, // Kunci rahasia untuk menandatangani ID sesi
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 jam
}));

// Routes dan logika lainnya


app.use(flash())


//USER HARUS LOGIN
function isAuthenticated(req, res, next) {
    if (req.session.user) {
        next(); // Jika user sudah login, lanjutkan ke rute yang diminta
    } else {
        res.redirect('/login'); // Jika belum login, arahkan ke halaman login
    }
}


// HALAMAN HOME
app.get('/', (req, res) => {
    res.render('index', {
        nama: "andi",
        title: "Halaman Home",
        layout: 'layouts/main-layout',
        msg: req.flash('msg')
    })
})


// JIKA TOMBOL REGISTER DI KLIK
app.get('/register', async (req, res) => {
    res.render('register', {
        title: "Daftar Akun",
        layout: 'layouts/main-layout',
    })
})

// PROSES REGISTER
app.post('/register', [
    //cek jika username sudah terdaftar
    body('username').custom(async (value) => {
        const duplikat = await User.findOne({ username: value })
        if (duplikat) {
            //error dikirimkan ke dalam validationResult
            throw new Error(`Usernam sudah terdaftar !!`)
        }
        return true
    }),

    check('email', 'Email tidak valid').isEmail()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('register', {
            title: "Daftar Akun",
            layout: 'layouts/main-layout',
            errors: errors.array()
        })
    } else {
        const { username, password, email } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);
        //create user
        await User.create({
            username,
            password: hashedPassword,
            email
        })

        req.flash('msg', 'akun berhasil dibuat')
        res.redirect('/')
    }

})

// HALAMAN LOGIN
app.get('/login', async (req, res) => {
    res.render('login', {
        title: "Login Akun",
        layout: 'layouts/main-layout',
        msg: req.flash('msg')
    })
})

//PROSES LOGIN
app.post('/login', [
    // Validasi username
    body('username').custom(async (value) => {
        const user = await User.findOne({ username: value });
        if (!user) {
            throw new Error('Username dan password salah!');
        }
        return true;
    }),
    // Validasi password
    body('password').custom(async (value, { req }) => {
        const user = await User.findOne({ username: req.body.username });
        if (!user) {
            throw new Error('Username dan password salah!');
        }

        const match = await bcrypt.compare(value, user.password);
        if (!match) {
            throw new Error('Username dan password salah!');
        }

        // Jika password benar, simpan user ke dalam request object untuk digunakan di middleware berikutnya
        req.user = user;
        return true;
    })
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Render kembali halaman login dengan pesan error
        res.render('login', {
            title: "Login",
            layout: 'layouts/main-layout',
            errors: errors.array()
        });
    } else {
        // Jika validasi berhasil, simpan data user ke dalam session
        req.session.user = {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email,
            contacts: req.user.contacts
        };



        res.redirect('/dasboard')


    }
});

//HALAMAN DASBOARD
app.get(`/dasboard`, isAuthenticated, async (req, res) => {

    res.render('dasboard', {
        title: "Dashboard",
        username: req.session.user.username,
        email: req.session.user.email,
        layout: 'layouts/user-layout',

    })

})

// // HALAMAN CONTACT
app.get(`/contact`, isAuthenticated, async (req, res) => {
    const user = await User.findById(req.session.user.id)
    const contacts = user.contacts

    res.render('contact', {
        title: "Contact Page",
        username: req.session.user.username,
        email: req.session.user.email,
        layout: 'layouts/user-layout',
        contacts,
        msg: req.flash('msg'),
    })

})

//LOGOUT
app.get(`/logout`, isAuthenticated, async (req, res) => {
    req.session.destroy()
    res.redirect('/')

})

// HALAMAN ABOUT
app.get('/about', (req, res) => {
    res.render('about', {
        title: "About Page",
        layout: 'layouts/main-layout'
    })
})

//JIKA TOMMBOL TAMBAH DATA DI KLIK
app.get('/contact/add', isAuthenticated, async (req, res) => {
    res.render('add-contact', {
        username: req.session.user.username,
        email: req.session.user.email,
        title: "Tambah Contact",
        layout: 'layouts/user-layout',
    })
})

//PROSES FORM TAMBAH DATA
// //proses data contact
app.post('/contact', isAuthenticated, [
    //cek nama jika duplikat
    body('nama').custom(async (value, { req }) => {

        const user = await User.findById(req.session.user.id)
        const contacts = user.contacts
        const duplikat = contacts.find((data) => data.nama === value)

        if (duplikat) {
            //error dikirimkan ke dalam validationResult
            throw new Error(`Nama contact sudah digunakan !!`)
        }
        return true
    }),


    //'email' --> didapat pada atribut name='email' di form
    check('noHp', 'no HP tidak valid').isMobilePhone('id-ID'),
    check('email', 'Email tidak valid').isEmail()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // return res.status(400).json({ errors: errors.array() });
        res.render('add-contact', {
            username: req.session.user.username,
            email: req.session.user.email,
            title: "Tambah Contact",
            layout: 'layouts/user-layout',
            errors: errors.array()
        })
    } else {
        const user = await User.findById(req.session.user.id)
        const contacts = user.contacts

        contacts.push(req.body)
        await user.save()

        req.flash('msg', 'Data contact berhasil ditambahkan')
        res.redirect('/contact')
    }
})



// PROSES DELETE CONTACT
app.delete('/contact', isAuthenticated, async (req, res) => {
    try {
        const findId = await User.findById(req.session.user.id);

        if (findId != null) {
            // Filter kontak yang tidak sesuai dengan req.body._id
            findId.contacts = findId.contacts.filter(contact => contact._id.toString() !== req.body._id);

            // Simpan perubahan ke database
            await findId.save();

            // req.flash('msg', 'Data contact berhasil dihapus');
            res.redirect('/contact');
            return false;
        }

        res.sendStatus(404);



    } catch (err) {
        res.sendStatus(404)
        res.send('eror di catch')
    }
})


//JIKA TOMBOL EDIT DI KLIK
app.get('/contact/edit/:nama', isAuthenticated, async (req, res) => {
    try {
        const contactUser = await User.findById(req.session.user.id);
        const contacts = contactUser.contacts
        const contact = contacts.find(contact => contact.nama === req.params.nama);
        if (!contact) {
            res.sendStatus(404)
            res.send('404')
        } else {
            res.render('edit-form-contact', {
                username: req.session.user.username,
                email: req.session.user.email,
                title: "Form ubah data",
                layout: "layouts/user-layout",
                contact
            })

        }
    } catch (err) {
        return err
    }

})

// PROSES UPDATE DATA
app.put(
    '/contact', isAuthenticated, [
    //cek nama jika duplikat
    body('nama').custom(async (value, { req }) => {
        const user = await User.findById(req.session.user.id);

        const duplikat = user.contacts.find(contact => contact.nama === value);

        if (value !== req.body.oldName && duplikat) {
            //error dikirimkan ke dalam validationResult
            throw new Error(`Nama contact sudah digunakan !!`)
        }
        return true
    }),


    //'email' --> didapat pada atribut name='email' di form
    check('noHp', 'no HP tidak valid').isMobilePhone('id-ID'),
    check('email', 'Email tidak valid').isEmail()

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('edit-form-contact', {
            title: "Form Ubah Data Contact",
            username: req.session.user.username,
            email: req.session.user.email,
            layout: 'layouts/user-layout',
            errors: errors.array(),
            contact: req.body
        })
    } else {
        try {
            //cari user
            const user = await User.findById(req.session.user.id);

            // cari contacts yang mau update
            const contact = user.contacts.find(contact => contact._id.toString() === req.body._id);

            contact.nama = req.body.nama || contact.nama;
            contact.noHp = req.body.noHp || contact.noHp;
            contact.email = req.body.email || contact.email;

            await user.save();

            req.flash('msg', 'Data contact berhasil diubah')
            res.redirect('/contact')

            // const updateData = req.body

            // await Contact.findOneAndUpdate(
            //     {
            //         _id: req.body._id
            //     }, updateData,
            //     {
            //         // new: true mengembalikan dokumen yang diperbarui, bukan yang lama
            //         new: true,
            //         upsert: false
            //     }
            // )

        } catch (err) {
            console.log(err)
        }


    }
})



//JIKA TOMBOL DETAILS DI KLIK
app.get(`/contact/:nama`, isAuthenticated, async (req, res) => {
    try {
        const contactUser = await User.findById(req.session.user.id);
        const contacts = contactUser.contacts
        const contact = contacts.find(contact => contact.nama === req.params.nama);


        res.render('details', {
            title: "Detaiils Contact",
            username: req.session.user.username,
            email: req.session.user.email,
            layout: 'layouts/user-layout',
            contacts,
            contact,

        })
    } catch (err) {
        return err
    }
})




app.use('/', (req, res) => {
    res.sendStatus(404)
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})