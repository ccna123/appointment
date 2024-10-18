const express = require("express")
const router = express.Router()

router.post("/tokens", (req, res) => {
    const { idToken, accessToken, refreshToken } = req.body

    res.cookie('idToken', idToken, {
        httpOnly: true,
        secure: true,    // Set to true in production (requires HTTPS)
        sameSite: 'Lax'  // Prevent CSRF
    });

    res.cookie('accessToken', accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });

    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'Lax'
    });

    res.status(200).json({ message: 'Tokens set in cookies' });

})

module.exports = router