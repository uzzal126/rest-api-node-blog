import bcrypt from "bcryptjs";

export const hashedPasswordHandler = (password) => {
  try {
    return bcrypt.hash(password, 10);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const hashedPasswordCompare = (password, hashedPassword) => {
  try {
    return bcrypt.compare(password, hashedPassword);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
