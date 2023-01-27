//--------------//
//HELPER FUNCTIONS

//generate 6 char long string for unique userID
function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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

//find the owner of shortend urls
function urlsForUser(user, urlDatabase) {
  let result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      result[url] = urlDatabase[url].longURL;
    }
  }
  return result;
}


//create error objects to display on error web page
function createErrorObj(code, message, user = undefined) {
  return {
    user: user,
    errorCode: code,
    errorMessage: message
  };
}

//append http in url
function appendHttp(url) {
  let result = url;
  if (!url.startsWith("http")) {
    result = 'http://' + url;
  }
  return result;
}

module.exports = {
  getUserByEmail,
  urlsForUser,
  createErrorObj,
  appendHttp,
  generateRandomString,
};