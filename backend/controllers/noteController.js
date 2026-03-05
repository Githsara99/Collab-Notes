const Note = require('../models/Note');
const User = require('../models/User');

// Helper: check if user can access note
const canAccess = (note, userId, requireWrite = false) => {
  if (note.owner.toString() === userId.toString()) return true;
  const collab = note.collaborators.find(c => c.user.toString() === userId.toString());
  if (!collab) return false;
  if (requireWrite) return collab.permission === 'write';
  return true;
};

// GET /api/notes
exports.getNotes = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, tag, pinned, archived } = req.query;
    const userId = req.user._id;

    let query = {
      $or: [{ owner: userId }, { 'collaborators.user': userId }],
      isArchived: archived === 'true' ? true : { $ne: true }
    };

    if (search) {
      query.$text = { $search: search };
    }
    if (tag) query.tags = tag.toLowerCase();
    if (pinned === 'true') query.isPinned = true;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      populate: [
        { path: 'owner', select: 'name email avatar' },
        { path: 'collaborators.user', select: 'name email avatar' }
      ],
      sort: { isPinned: -1, updatedAt: -1 }
    };

    const result = await Note.paginate(query, options);
    res.json({
      notes: result.docs,
      totalPages: result.totalPages,
      currentPage: result.page,
      total: result.totalDocs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/notes/:id
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id)
      .populate('owner', 'name email avatar')
      .populate('collaborators.user', 'name email avatar');
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    if (!canAccess(note, req.user._id)) return res.status(403).json({ error: 'Access denied.' });
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const { title, content, tags, color, isPinned } = req.body;
    const note = await Note.create({ title, content, tags, color, isPinned, owner: req.user._id });
    await note.populate('owner', 'name email avatar');
    res.status(201).json({ note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PUT /api/notes/:id
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    if (!canAccess(note, req.user._id, true)) return res.status(403).json({ error: 'Write permission required.' });

    const { title, content, tags, color, isPinned, isArchived } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (color !== undefined) note.color = color;
    if (isPinned !== undefined) note.isPinned = isPinned;
    if (isArchived !== undefined) note.isArchived = isArchived;

    await note.save();
    await note.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'collaborators.user', select: 'name email avatar' }
    ]);
    res.json({ note });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Only owner can delete.' });
    await note.deleteOne();
    res.json({ message: 'Note deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notes/:id/collaborators
exports.addCollaborator = async (req, res) => {
  try {
    const { email, permission = 'read' } = req.body;
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Only owner can add collaborators.' });

    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ error: 'User not found with that email.' });
    if (userToAdd._id.toString() === req.user._id.toString()) return res.status(400).json({ error: 'Cannot add yourself as collaborator.' });

    const existing = note.collaborators.find(c => c.user.toString() === userToAdd._id.toString());
    if (existing) {
      existing.permission = permission;
    } else {
      note.collaborators.push({ user: userToAdd._id, permission });
    }

    await note.save();
    await note.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'collaborators.user', select: 'name email avatar' }
    ]);
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE /api/notes/:id/collaborators/:userId
exports.removeCollaborator = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Note not found.' });
    if (note.owner.toString() !== req.user._id.toString()) return res.status(403).json({ error: 'Only owner can remove collaborators.' });

    note.collaborators = note.collaborators.filter(c => c.user.toString() !== req.params.userId);
    await note.save();
    await note.populate([
      { path: 'owner', select: 'name email avatar' },
      { path: 'collaborators.user', select: 'name email avatar' }
    ]);
    res.json({ note });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
