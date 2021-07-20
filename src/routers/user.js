const express = require('express')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account')
const router = express.Router()
router.get('/test', (req, res) => {
    res.send('From a new router file')
})
// router.post('/users', (req,res) => {
//     console.log(req.body)
//     const user = new User(req.body)
//     user.save().then(() => {
//         res.status(201).send(user)
//     }).catch((error) => {
//         res.status(400).send(error)
//     })
// })


router.post('/users', async (req,res) => {
    const user = new User(req.body)
    try {
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})

router.post('/users/login', async (req,res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken() 
        // res.send( { user: user.getPublicProfile() , token} )
        res.send( { user , token} )
    } catch (error) {
        res.status(400).send({ error })
    }
})

router.post('/users/logout', auth, async (req,res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req,res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

// router.get('/users', (req,res) => {
//     User.find({}).then((users) => {
//         res.send(users)
//     }).catch((error) => {
//         res.status(500).send()
//     })
// })
// Commenting for not displaying users data to all
// router.get('/users', auth, async (req,res) => {
//     try {
//         const users = await User.find({})
//         res.send(users)
//     } catch (error) {
//         res.status(500).send()
//     }
// })

router.get('/users/me', auth, async (req,res) => {
    res.send(req.user)
})

// router.get('/users/:id', (req,res) => {
//     const _id = req.params.id
//     User.findById(_id).then((user) => {
//         if (!user) 
//             return res.status(404).send()
//         res.send(user)
//     }).catch((error) => {
//         res.status(500).send()
//     })
// })

// router.get('/users/:id', async (req,res) => {
//     const _id = req.params.id
//     try {
//         const user = await User.findById(_id)
//         if (!user)
//             return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(500).send()
//     }
// })

// router.patch('/users/:id', async (req,res) => {
//     const updates = Object.keys(req.body)
//     const allowedUpdates = ['name', 'email', 'password', 'age']
//     const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

//     if (!isValidOperation) {
//         return res.status(400).send({ error: 'Invalid updates!' })
//     }

//     try {
//         // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
//         const user = await User.findById(req.params.id)
//         updates.forEach((update) => user[update] = req.body[update])
//         await user.save()
//         if (!user)
//             return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(400).send()
//     }
// })

router.patch('/users/me', auth, async (req,res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    try {
        // const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()
        res.send(req.user)
    } catch (error) {
        res.status(400).send()
    }
})

// router.delete('/users/:id', async (req,res) => {
//     try {
//         const user = await User.findByIdAndDelete(req.params.id)
//         if (!user)
//             return res.status(404).send()
//         res.send(user)
//     } catch (error) {
//         res.status(500).send()
//     }
// })

router.delete('/users/me', auth, async (req,res) => {
    try {
        await req.user.remove()
        sendCancellationEmail(req.user.email, req.user.name)
        res.send(req.user)
    } catch (error) {
        res.status(500).send()
    }
})

const upload = multer({
    // dest: 'avatars', //local destination to store avatar
    limits: {
        fileSize: 1000000 //in bytes 1MB
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error('Please upload a jpg/jpeg/png file'))
        }
        cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    //req.user.avatar = req.file.buffer
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height:250} ).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message } )
})


router.delete('/users/me/avatar', auth, async (req,res) => {
    try {
        req.user.avatar = undefined //This will remove the avatar field
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send()
    }
})

router.get('/users/:id/avatar', async (req,res) => {
    try {
        const user = await User.findById(req.params.id)
        if (!user || !user.avatar)
            throw new Error()
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (error) {
        res.status(404).send()
    }
})

module.exports = router