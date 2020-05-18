const request = require('supertest')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/User')
const Task = require('../../src/models/Task')

const userOneId = new mongoose.Types.ObjectId()
const userTwoId = new mongoose.Types.ObjectId()

const userOne = {
    _id: userOneId,
    name: 'userOne',
    email: 'userOne@gmail.com',
    password: 'userOne@123',
    tokens: [{
        token: jwt.sign({ _id: userOneId.toString() }, process.env.JWT_SECRET, { expiresIn: '1 h' })
    }]
}

const userTwo = {
    _id: userTwoId,
    name: 'userTwo',
    email: 'userTwo@gmail.com',
    password: 'userTwo@123',
    tokens: [{
        token: jwt.sign({ _id: userTwoId.toString() }, process.env.JWT_SECRET, { expiresIn: '1 h' })
    }]
}

const taskOne = {
    _id: mongoose.Types.ObjectId(),
    description: 'taskOne',
    completed: true,
    owner: userOneId
}

const taskTwo = {
    description: 'taskTwo',
    completed: false,
    owner: userOneId
}

const taskThree = {
    description: 'taskThree',
    completed: true,
    owner: userTwoId
}

databaseSetup = async () => {
    await User.deleteMany();
    await Task.deleteMany();

    await new User(userOne).save()
    await new User(userTwo).save()

    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
}

module.exports = {
    userOne,
    userTwo,
    taskOne,
    databaseSetup
}