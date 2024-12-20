function generateRandomOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = { generateRandomOTP };