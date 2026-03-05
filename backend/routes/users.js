const router = require('express').Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Search users by email (for adding collaborators)
router.get('/search', protect, async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query required.' });
    const users = await User.find({
      email: { $regex: email, $options: 'i' },
      _id: { $ne: req.user._id }
    }).select('name email avatar').limit(5);
    res.json({ users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update profile
router.put('/me', protect, async (req, res) => {
  try {
    const { name, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, avatar }, { new: true, runValidators: true });
    res.json({ user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
