function generateRandomString(length = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const generateRegistrationId = () => {
  const prefix = "REG";
  const uniquePart = generateRandomString(6); // 6-char random
  return `${prefix}-${uniquePart}`;
};

export default generateRegistrationId;
