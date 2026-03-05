const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const collaboratorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  permission: { type: String, enum: ['read', 'write'], default: 'read' },
  addedAt: { type: Date, default: Date.now }
});

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 200 },
  content: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  collaborators: [collaboratorSchema],
  tags: [{ type: String, trim: true, lowercase: true }],
  color: { type: String, default: '#1e1e2e' },
  isPinned: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false }
}, { timestamps: true });

noteSchema.index({ title: 'text', content: 'text', tags: 'text' });
noteSchema.index({ owner: 1, updatedAt: -1 });
noteSchema.index({ 'collaborators.user': 1 });
noteSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Note', noteSchema);
