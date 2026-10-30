// check if person is logged in

const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    res.status(401).json({ message: "You must be logged in" });
  }

  next();
};

module.exports = requireAuth
