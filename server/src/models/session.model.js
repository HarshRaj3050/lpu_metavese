const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const sessionSchema = new Schema({
    socketId: {
        type: String,
        unique: true,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    username: {
        type: String,
        required: true
    },
    position: {
        type: [Number],
        default: [0, 0, 0]
    },
    hairColor: String,
    topColor: String,
    bottomColor: String,
    isOnline: {
        type: Boolean,
        default: true
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const sessionModel = mongoose.model('sessions', sessionSchema);

module.exports = sessionModel;
