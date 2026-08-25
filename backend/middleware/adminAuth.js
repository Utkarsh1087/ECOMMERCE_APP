import jwt from 'jsonwebtoken';

const adminAuth = async (req, res, next) => {
    try {
        let token = req.headers.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please login as Admin.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Support modern payload { role: 'admin', email } or legacy payload
        const isValidRole = (typeof decoded === 'object' && decoded.role === 'admin' && decoded.email === process.env.ADMIN_EMAIL);
        const isLegacyToken = (decoded === process.env.ADMIN_EMAIL + process.env.ADMIN_PASSWORD);

        if (!isValidRole && !isLegacyToken) {
            return res.status(403).json({ success: false, message: 'Access denied. Invalid Admin credentials.' });
        }

        req.isAdmin = true;
        next();
    } catch (error) {
        console.error('Admin Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Admin token is invalid or has expired.' });
    }
};

export default adminAuth;