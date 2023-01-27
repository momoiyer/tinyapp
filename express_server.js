const cookieSession = require("cookie-session");
const express = require("express");
const bcrypt = require("bcryptjs");
const { urlDatabase, users } = require("./tempDatabase");
const {
  getUserByEmail,
  urlsForUser,
  createErrorObj,
  appendHttp,
  generateRandomString
} = require("./helpers");

const app = express();
const PORT = 8080;
app.set('view engine', 'ejs');


//Empty object for future errors
let errors = {};

//--------------//
//MIDDLEWARE CALLS

app.use(express.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
}));


//--------------//
//HTTP GET METHODS

app.get("/u/:id", (req, res) => {
  const longURL = `/urls/${req.params.id}`;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    errors = createErrorObj(401, "Please login first to see your shortened URLs");
    return res.redirect("/error");
  }

  const templateVars = {
    user: users[userId],
    urls: urlsForUser(userId, urlDatabase)
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.redirect("/login");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    errors = createErrorObj(401, "Please login first to see your shortened URLs");
    return res.redirect("/error");
  }

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  if (!urlInfo) {
    errors = createErrorObj(404, "Requested URL doesn't exists!", users[userId]);
    return res.redirect("/error");
  }

  if (urlInfo.userID !== userId) {
    errors = createErrorObj(401, "You are not authorized to view this URL!", users[userId]);
    return res.redirect("/error");
  }

  const longURL = urlInfo.longURL;
  const templateVars = {
    user: users[userId],
    longURL,
    id
  };

  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    return res.redirect("/urls");
  }

  const templateVars = {
    user: users[userId],
  };
  res.render("urls_login", templateVars);
});

app.get("/error", (req, res) => {
  return res.render("urls_errorPage", errors);
});


//--------------//
//HTTP POST METHODS

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    return res.status(401).send("Only registered users are allowed to shorten the URL");
  }
  const shortURL = generateRandomString();
  const longURL = appendHttp(req.body.longURL);
  urlDatabase[shortURL] = { longURL: longURL, userID: userId };
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    errors = createErrorObj(401, "Please login first to delete your shortened URLs!");
    return res.redirect("/error");
  }

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  if (!urlInfo) {
    errors = createErrorObj(404, "Requested URL doesn't exists!", users[userId]);
    return res.redirect("/error");
  }

  if (urlInfo.userID !== userId) {
    errors = createErrorObj(401, "You are not authorized to delete this URL!", users[userId]);
    return res.redirect("/error");
  }

  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    errors = createErrorObj(401, "Please login first to update your shortened URLs!");
    return res.redirect("/error");
  }

  const id = req.params.id;
  const urlInfo = urlDatabase[id];
  if (!urlInfo) {
    errors = createErrorObj(404, "Requested URL doesn't exists!", users[userId]);
    return res.redirect("/error");
  }

  if (urlInfo.userID !== userId) {
    errors = createErrorObj(401, "You are not authorized to update this URL!", users[userId]);
    return res.redirect("/error");
  }

  const longURL = appendHttp(req.body.newURL);
  urlDatabase[id] = { longURL: longURL, userID: userId };
  return res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    errors = createErrorObj(400, "Email and password cannot be empty!");
    return res.redirect("/error");
  }


  const user = getUserByEmail(email, users);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    errors = createErrorObj(403, "Enter valid email and password!");
    return res.redirect("/error");
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    errors = createErrorObj(400, "Email and password cannot be empty!");
    return res.redirect("/error");
  }

  if (getUserByEmail(email, users)) {
    errors = createErrorObj(400, "Email already registered!");
    return res.redirect("/error");
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  const userRandomID = generateRandomString();
  users[userRandomID] = { id: userRandomID, email, password: hashedPassword };
  req.session.user_id = userRandomID;
  res.redirect('/urls');
});


//--------------//

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
