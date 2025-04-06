const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
  }],
  acceptedBid: {  // Kabul edilen teklifss
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid',
    default: null,
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'closed'],
    default: 'open',
  },
}, {
  timestamps: true,
});

const Project = mongoose.model('Project', projectSchema);
module.exports = Project;
