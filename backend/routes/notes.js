const router = require('express').Router();
const { protect } = require('../middleware/auth');
const {
  getNotes, getNote, createNote, updateNote, deleteNote,
  addCollaborator, removeCollaborator
} = require('../controllers/noteController');

router.route('/').get(protect, getNotes).post(protect, createNote);
router.route('/:id').get(protect, getNote).put(protect, updateNote).delete(protect, deleteNote);
router.route('/:id/collaborators').post(protect, addCollaborator);
router.route('/:id/collaborators/:userId').delete(protect, removeCollaborator);

module.exports = router;
