import jwt from 'jsonwebtoken';

const authUser = async (req, res, next) => {
    try {
        let token = req.headers.token;
        
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ success: false, message: 'Not Authorized. Please login again.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        if (!decoded || !decoded.id) {
            return res.status(401).json({ success: false, message: 'Invalid token payload.' });
        }

        req.userId = decoded.id;
        if (!req.body) {
            req.body = {};
        }
        req.body.userId = decoded.id;

        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(401).json({ success: false, message: 'Token is invalid or has expired.' });
    }
};

export default authUser;