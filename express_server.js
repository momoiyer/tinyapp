const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;

// set the view engine to ejs
app.set('view engine', 'ejs');

//--------------//
//TEMPORARY DATABASE SYSTEM

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};



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
  const templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (!longURL) {
    return res.redirect("/urls");
  }
  const currentUserID = req.cookies["user_id"];
  const templateVars = {
    user: users[req.cookies["user_id"]],
    longURL,
    id
  };
  res.render("urls_show", templateVars);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_login", templateVars);
});


//--------------//
//HTTP POST METHODS

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  let longURL = req.body.longURL;
  urlDatabase[shortURL] = appendHttp(longURL);
  res.redirect(`/urls/${shortURL}`);
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  return res.redirect("/urls");
});

app.post("/urls/:id/update", (req, res) => {
  const id = req.params.id;
  const newURL = req.body.newURL;
  urlDatabase[id] = appendHttp(newURL);
  return res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password || getUserByEmail(email)) {
    return res.status(400).end();
  }

  const userRandomID = generateRandomString();
  users[userRandomID] = { id: userRandomID, email, password };
  res.cookie('user_id', userRandomID);
  res.redirect('/urls');
});



//--------------//
//HELPER FUNCTIONS

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