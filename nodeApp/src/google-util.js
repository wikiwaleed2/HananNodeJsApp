const NodeGoogleLogin = require('node-google-login');
const nodeFbLogin = require('node-fb-login');

module.exports.getGoogleAccountFromCode = getGoogleAccountFromCode;
module.exports.getFbAccountFromCode = getFbAccountFromCode;

/*******************/
/** Google **/
/*******************/
const configGoogle = {
  clientID:"1029775309973-gfl61vqsdvnki7fc5l4261einf0rd67n.apps.googleusercontent.com",
  clientSecret: "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",
  redirectURL: "http://localhost:4000/callback/google",
  defaultScope: [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]
}
const googleLogin = new NodeGoogleLogin(configGoogle);
const authURL = googleLogin.generateAuthUrl()
console.log(authURL);
async function getGoogleAccountFromCode(req,res,next) {
  googleLogin.getUserProfile(req.query.code).then(userProfile => {
    console.log("userProfile", userProfile);
  }).catch(error => {
    console.log(error);
  })
}

/*******************/
/** FB **/
/*******************/
nodeFbLogin.generateAuthURL({
  fbAppID: "151106640567762",
  redirectURI: "http://localhost:4000/callback/facebook",
  scopes:["public_profile","email"]
}).then(URL=>{
  console.log(URL);
}).catch(error=>{
  console.log(error);
})

async function getFbAccountFromCode(req,res,next) {

  // Get the short-lived Access Token by passing the code recieved from the Auth URL
  nodeFbLogin.getAccessToken({
    code: "AUTH_CODE",
    fbAppID: "151106640567762",
    fbAppSecret: "834bf57dbf1d27f69e39d9545ef60244",
    redirectURI: "http://localhost:4000/callback/facebook"
  }).then(accessToken => {
    console.log(accessToken);
  }).catch(error => {
    console.log(error);
  });

  // Get the User profile by passing the Access Token
  nodeFbLogin.getUserProfile({
    accessToken:"ACCESS_TOKEN",
    fields: ["id","name","email"]
  }).then(user => {
    console.log(user);
  }).catch(error => {
    console.log(error);
  });

  // Get long-lived Access Token by passing the short-lived access token (Valid for 60 days)
  nodeFbLogin.getLongLivedAccessToken({
    fbAppID: "APP_ID",
    fbAppSecret: "APP_SECRET",
    accessToken: "ACCESS_TOKEN"
  }).then(accessToken => {
    console.log(accessToken);
  }).catch(error => {
    console.log(error);
  })
}
