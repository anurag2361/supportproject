var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ticketSchema = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    mobile: { type: Number, required: true },
    ticketNo: { type: String, index: true },
    queryTitle: { type: String, required: true },
    queryDetail: { type: String, required: true },
    message: [{ sender: String, queryText: String, created: { type: Date, default: Date.now(), index: true } }],
    ticketStatus: { type: String, default: "Open" },
    created: { type: Date, default: Date.now(), index: true },
    updated: { type: Date, default: Date.now(), index: true }
});

mongoose.model('Ticket', ticketSchema);