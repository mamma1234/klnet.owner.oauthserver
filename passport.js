let express = require('express');
let bodyParser = require('body-parser');
let app = express();
app.use(bodyParser.urlencoded({extended:false}));

let session = require('express-session');
app.use(session({
  resave:false,
  saveUninitialized:false,
  secret:'Secret Key'
}));

let passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());

let LocalStrategy = require('passport-local').Strategy;
let strategy = new LocalStrategy(function(username, password, done) {
  if (username==='user' && password === '1234') {
    let userinfo = {name:'사용자', email:"user@email.com"};
    done(null, userinfo);
  } else {
    done(null, false, '로그인 실패');
  }
});
passport.use(strategy);

passport.serializeUser(function(user, done) {
  console.log('세션에 기록하기');
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  console.log('세션에서 사용자 정보 읽기');
  done(null, user);
});

app.post('/login', passport.authenticate('local'), (req,res) => { res.send('success')});
app.get('/personal', showPersonal);
app.listen(3000);

function showPersonal(req, res) {
  let user = req.user;
  if ( user ) {
    res.send('Personal Page ' + user.name + ' Email: ' + user.email);
  } else {
    res.sendStatus(401);
  }
}
