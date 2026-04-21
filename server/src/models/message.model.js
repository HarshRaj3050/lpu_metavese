const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    senderName: {
        type: String,
        required: true
    },
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    text: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    roomId: {
        type: String,
        default: 'global'
    }
});

const messageModel = mongoose.model('messages', messageSchema);

module.exports = messageModel;
