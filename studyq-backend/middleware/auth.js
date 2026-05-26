const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    // Setting req.user to match typical JWT payloads. Our payload will be { sub: user_id }
    req.user = { id: decoded.sub || decoded.id };
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is invalid or expired' });
  }
};

module.exports = authMiddleware;
