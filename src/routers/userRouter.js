const express = require('express')
const sharp = require('sharp')
const auth = require('../middleware/auth')
const User = require('../models/User')
const { sendWelcomeMail, sendAccountTerminationMail } = require('../emails/account')

const router = new express.Router()


router.get('/users/me', auth, async (req, res) => {
    res.send({ profile: req.user })
})


router.post('/users', async (req, res) => {
    const user = new User(req.body)

    try {
        await user.save()
        const token = await user.generateAuthToken()

        sendWelcomeMail(user.email, user.name)

        res.status(201).send({ data: user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.patch('/users/me', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValid = updates.every(update => allowedUpdates.indexOf(update) >= 0)

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const _id = req.params.id

    try {
        const user = req.user

        updates.forEach(update => user[update] = req.body[update])

        await user.save()

        res.send(user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {

    try {
        req.user.remove()

        sendAccountTerminationMail(req.user.email, req.user.name)

        res.send(req.user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/login', async (req, res) => {

    try {
        const email = req.body.email
        const password = req.body.password

        const user = await User.findByCredentials(email, password)

        const token = await user.generateAuthToken()

        res.send({ user, token })
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logout', auth, async (req, res) => {

    try {
        req.user.tokens = req.user.tokens.filter(token => token.token !== req.token)

        await req.user.save()

        res.status(200).send();
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {

    try {
        req.user.tokens = []
        await req.user.save()

        res.status(200).send();
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})


const multer = require('multer')
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        console.log(file.originalname)
        if (file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(undefined, true)
        }
        cb(new Error('Invalid file'))
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    try {
        const buffer = await sharp(req.file.buffer).resize(250, 250).png().toBuffer()
        req.user.avatar = buffer
        await req.user.save()


        res.send();
    } catch (e) {
        res.status(400).send()
    }
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.avatar = undefined
        await req.user.save()

        res.send();
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        console.log(req.params.id, user)
        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/jpg')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

//Admin urls
router.get('/users', async (req, res) => {

    try {
        const users = await User.find({})
        res.status(200).send(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.get('/users/:id', async (req, res) => {

    const _id = req.params['id']

    try {
        const user = await User.findById(_id)
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

router.patch('/users/:id', async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'email', 'password', 'age']

    const isValid = updates.every(update => allowedUpdates.indexOf(update) >= 0)

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const _id = req.params.id

    try {
        const user = await User.findById(_id)

        updates.forEach(update => user[update] = req.body[update])

        await user.save()
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        if (!user) {
            return res.status(404).send()
        }
        res.send(user)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/users/:id', async (req, res) => {

    try {
        const user = await User.findByIdAndDelete(req.params.id)

        if (!user) {
            return res.status(404).send()
        }

        res.send(user)
    } catch (e) {
        res.status(400).send()
    }
})


module.exports = router