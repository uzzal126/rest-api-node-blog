import jwt from "jsonwebtoken";

const createJsonWebToken = async (payload) => {
  return await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
};

export default createJsonWebToken;
