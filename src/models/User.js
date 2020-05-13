const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Task = require('../models/Task')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        validate(value) {
            if (value === 'password') {
                throw new Error('Inavalid password')
            }
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid')
            }
        }
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Negative age is not allowed.')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

userSchema.virtual('tasks', {
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this

    const object = user.toObject()

    delete object.password
    delete object.tokens
    delete object.avatar

    return object;
}

//created method on user object to generate token
userSchema.methods.generateAuthToken = async function () {

    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '2h' })
    user.tokens = user.tokens.concat({ token })
    user.save()

    return token
}

//Created new method to user by credentils
userSchema.statics.findByCredentials = async (email, password) => {

    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Failed to login, email not exists')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Failed to login, password not matching')
    }

    return user
}

//middleware to be run before save to hash password
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        const hashedPassword = await bcrypt.hash(user.password, 8)
        user.password = hashedPassword
        console.log('password updated')
    }

    next()
})

//Delete task before deleting user.
userSchema.pre('remove', async function (next) {

    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
});

const User = mongoose.model('User', userSchema)

module.exports = User