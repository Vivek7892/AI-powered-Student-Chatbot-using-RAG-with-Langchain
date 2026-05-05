const getCurrentUser = async (req, res) => {
  try {
    return res.json({
      id: req.user._id,
      email: req.user.email,
      phoneNumber: req.user.phoneNumber,
      semester: req.user.semester
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to get user data' });
  }
};

module.exports = {
  getCurrentUser
};
