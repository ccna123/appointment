const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

COGNITO_ISSUER = `https://cognito-idp.${process.env.AWS_REGION}.amazonaws.com/${process.env.COGNITO_USER_POOL_ID}`;

JWKS_URL = `${COGNITO_ISSUER}/.well-known/jwks.json`;

const client = jwksClient({
  jwksUri: `${JWKS_URL}`,
});

//get signing key from JWKS
function getKey(header, callback) {
  try {
    client.getSigningKey(header.kid, (err, key) => {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

//middleware to verify access token
const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.access_token;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }
    jwt.verify(
      token,
      getKey,
      {
        algorithms: ["RS256"],
      },
      (err, decoded) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        req.user = decoded;
        next();
      }
    );
  } catch (error) {
    return res.status(500).json({ error });
  }
};

module.exports = verifyToken;
