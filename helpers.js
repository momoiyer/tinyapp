
//find existing user by email
function getUserByEmail(email, userDatabase) {
  let result = {};
  const userValues = Object.values(userDatabase);
  userValues.forEach(user => {
    if (user.email === email) {
      result = user;
    }
  });
  return Object.keys(result).length > 0 ? result : null;
}

module.exports = {
  getUserByEmail,
};