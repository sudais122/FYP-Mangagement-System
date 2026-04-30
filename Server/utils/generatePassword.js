// Generates a strong random temporary password for supervisors
const generatePassword = () => {
  const upper  = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower  = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "@#!$";
  const all = upper + lower + digits + special;

  let password =
    upper[Math.floor(Math.random() * upper.length)] +
    lower[Math.floor(Math.random() * lower.length)] +
    digits[Math.floor(Math.random() * digits.length)] +
    special[Math.floor(Math.random() * special.length)];

  for (let i = 0; i < 6; i++) {
    password += all[Math.floor(Math.random() * all.length)];
  }

  // Shuffle
  return password.split("").sort(() => Math.random() - 0.5).join("");
};

export default generatePassword;