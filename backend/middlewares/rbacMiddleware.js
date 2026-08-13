export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Access Denied: Insufficient authorization level for role ' + (req.user ? req.user.role : 'GUEST')
      });
    }
    next();
  };
};

export const enforceBaseScope = (req, res, next) => {
  // Admins & Logistics Officers with global scope can see all bases;
  // Base Commanders are restricted to their assigned baseId
  if (req.user && req.user.role === 'BASE_COMMANDER') {
    if (req.user.baseId) {
      req.query.baseId = req.user.baseId;
      if (req.body) {
        req.body.baseId = req.user.baseId;
      }
    }
  }
  next();
};
