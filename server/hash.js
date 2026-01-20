import bcrypt from 'bcryptjs';

const password = 'admin@123';
const saltRounds = 10;

const hashPassword = async () => {
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  console.log(hashedPassword);
};

hashPassword();
