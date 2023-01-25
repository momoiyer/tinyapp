const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;

//--------------//
//TEMPORARY DATABASE SYSTEM

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "bU6Tx2",
  },
};


const users = {
  aJ48lW: {
    id: "aJ48lW",
    email: "test@mail.com",
    password: "test",
  },
  bU6Tx2: {
    id: "bU6Tx2",
    email: "test2@mail.com",
    password: "test",
  },
};

// set the view engine to ejs
app.set('view engine', 'ejs');

//--------------//
//MIDDLEWARE CALLS

//The body-parser library will convert the request body from a Buffer into string that we can read
//It will then add the data to the req(request) object under the key body
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


//--------------//
//HTTP GET METHODS

app.get("/u/:id", (req, res) => {
  const longURL = `/urls/${req.params.id}`;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    const templateVars = createErrorObj(
      401,
      "Please login first to see your shortened URLs",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }
  const templateVars = {
    user: users[userId],
    urls: urlsForUser(userId)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {

  const userId = req.cookies["user_id"];
  if (!userId) {
    const templateVars = createErrorObj(
      401,
      "Please login first to see your shortened URLs",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  if (!urlInfo) {
    const templateVars = createErrorObj(
      404,
      "Requested URL doesn't exists!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  if (urlInfo.userID !== userId) {
    const templateVars = createErrorObj(
      401,
      "You are not authorized to view this URL!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  const longURL = urlInfo.longURL;
  const currentUserID = req.cookies["user_id"];
  const templateVars = {
    user: users[currentUserID],
    longURL,
    id
  };

  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});


//--------------//
//HTTP POST METHODS

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (!userId) {
    return res.status(401).send("Only registered users are allowed to shorten the URL");
  }
  const shortURL = generateRandomString();
  const longURL = appendHttp(req.body.longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {

  const userId = req.cookies["user_id"];
  if (!userId) {
    const templateVars = createErrorObj(
      401,
      "Please login first to delete your shortened URLs",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  if (!urlInfo) {
    const templateVars = createErrorObj(
      404,
      "Requested URL doesn't exists!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  if (urlInfo.userID !== userId) {
    const templateVars = createErrorObj(
      401,
      "You are not authorized to delete this URL!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const userId = req.cookies["user_id"];
  const id = req.params.id;
  const longURL = appendHttp(req.body.newURL);
  urlDatabase[id] = { longURL: longURL, userID: userId };
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = getUserByEmail(email);
  if (!email || !password) {
    // return res.status(400).send("Email and password cannot be empty!");
    const templateVars = createErrorObj(
      400,
      "Email and password cannot be empty!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  if (!user || user.password !== password) {
    // return res.status(403).end("Enter valid email and password!");
    const templateVars = createErrorObj(
      403,
      "Enter valid email and password!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    // return res.status(400).send("Email and password cannot be empty!");
    const templateVars = createErrorObj(
      400,
      "Email and password cannot be empty!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }

  if (getUserByEmail(email)) {
    // return res.status(400).send("Email already registered!");
    const templateVars = createErrorObj(
      400,
      "Email already registered!",
      users[req.cookies["user_id"]]);

    return res.render("urls_errorPage", templateVars);
  }


  const userRandomID = generateRandomString();
  users[userRandomID] = { id: userRandomID, email, password };
  console.log("users: ", users);
  res.cookie('user_id', userRandomID);
  res.redirect('/urls');
});


//--------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


//--------------//
//HELPER FUNCTIONS

//generate 6 char long string for unique userID
function generateRandomString() {
  // const randomString = Math.random().toString(36);
  // return randomString.slice(randomString.length - 6);

  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

//helper function to append http in url
function appendHttp(url) {
  let result = url;
  if (!url.startsWith("http")) {
    result = 'http://' + url;
  }
  return result;
}

function getUserByEmail(email) {
  let result = {};
  const userValues = Object.values(users);
  userValues.forEach(user => {
    if (user.email === email) {
      result = user;
    }
  });
  return Object.keys(result).length > 0 ? result : null;
}

function createErrorObj(code, message, user) {
  const errorObj = {
    user: user,
    errorCode: code,
    errorMessage: message
  };
  return errorObj;
}

function urlsForUser(user) {
  let result = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === user) {
      result[url] = urlDatabase[url].longURL;
    }
  }
  return result;
}
