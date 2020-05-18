const express = require('express')
const auth = require('../middleware/auth')
const Task = require('../models/Task')
const router = new express.Router()


router.post('/tasks', auth, async (req, res) => {
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })

    try {
        const data = await task.save()
        res.status(201).send(data)
    } catch (e) {
        console.log(e)
        res.status(400).send({ error: e })
    }
})

router.get('/tasks', auth, async (req, res) => {

    const match = {}
    if (req.query.completed) {
        match.completed = req.query.completed === 'true'
    }

    const sort = {}

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
    }

    try {
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }
        ).execPopulate()
        res.status(200).send(req.user.tasks)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params['id']

    try {
        console.log({ _id, owner: req.user._id })
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(500).send(e)
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {

    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']

    const isValid = updates.every(update => allowedUpdates.indexOf(update) >= 0)

    if (!isValid) {
        return res.status(400).send({ error: 'Invalid updates!' })
    }

    const _id = req.params.id

    try {
        const task = await Task.findOneAndUpdate({ _id: _id, owner: req.user._id }, req.body, { new: true, runValidators: true })
        if (!task) {
            return res.status(404).send()
        }
        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        console.log(e)
        res.status(400).send(e)
    }
})

module.exports = router