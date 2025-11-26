const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Token tidak ditemukan' });
    }

    jwt.verify(token, JWT_SECRET, (err, decodedPayload) => {
        if (err) {
            console.error('JWT verification error:', err.message);
            return res.status(403).json({ error: 'Token tidak valid' }); // Jika token tidak valid, kirim 403
        }
        req.user = decodedPayload.user;
        next();
    });
}

module.exports = authenticateToken; // Simpan payload yang sudah didecode ke req.user