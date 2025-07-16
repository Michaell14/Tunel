const express = require('express');
const User = require('../models/User');

const router = express.Router();


router.get('/search', async (req, res) => {
  const { q, limit = 10 } = req.query;
  const users = await User.find({
    $or: [
      { spotifyId: { $regex: q, $options: 'i' } },
      { displayName: { $regex: q, $options: 'i' } }
    ]
  }).limit(limit);
  console.log("users: ", users);
  res.json(users);
});

router.post('/create-or-update', async (req, res) => {
  const { spotifyId, displayName, email, avatar } = req.body;
  
  let user = await User.findOne({ spotifyId });
  if (!user) {
    user = new User({ spotifyId, displayName, email, avatar });
    await user.save();
  } else {
    user.displayName = displayName || user.displayName;
    user.email = email || user.email;
    user.avatar = avatar || user.avatar;
    await user.save();
  }

  res.json(user);
});

module.exports = router; 