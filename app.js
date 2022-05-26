const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const databasePath = Path.join(__dirname, "twitterClone.db");

const app = express();
app.use(express.json());

let database = null;

const initializerDBAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializerDBAndServer();

const convertUserDBObjectToResponsiveObject = (dbObject) => {
  return {
    userId: dbObject.user_id,
    name: dbObject.name,
    userName: dbObject.user_name,
    password: dbObject.password,
    gender: dbObject.gender,
  };
};

const convertFollowerDBObjectToresponsiveObject = (dbObject) => {
  return {
    followerId: dbObject.follower_id,
    followerUserId: dbObject.follower_user_id,
    followingUserId: dbObject.following_user_id,
  };
};

const convertTweetDBObjectToResponsiveObject = (dbObject) => {
  return {
    tweetId: dbObject.tweet_id,
    tweet: dbObject.tweet,
    userId: dbObject.user_id,
    dateTie: dbObject.date_time,
  };
};

const convertReplyDBObjectToResponsiveObject = (dbObject) => {
  return {
    replyId: dbObject.reply_id,
    tweetId: dbObject.tweet_id,
    reply: dbObject.tweet,
    userId: dbObject.user_id,
    dateTime: dbObject.date_time,
  };
};

const convertLikeDBObjectToResponsiveObject = (dbObject) => {
  return {
    likeId: dbObject.like_id,
    tweetId: dbObject.tweet_id,
    userId: dbObject.user_id,
    dateTime: dbObject.date_time,
  };
};

const authenticateToken = (request,response,next) => {
    let jwtToken,
    const authHeader = request.headers["authorization"];
    if (autHeader !== undefined){
        jwtToken = authHeader.split(" ")[1]
    }
    if (jwtToken === undefined){
        response.status(401)
        response.send("Invalid Access Token")
    }else{
        jwt.verify(jwtToken, "MY_SECRET_TOKEN", async(error, user) => {
            if(error){
                response.status(401)
                response.send("Invalid JWT Token")
            }else{
                next()
            }
        })
    }
}

const validatePassword = (password) => {
    return password.length > 6
}

// API 1
app.post("/register/", async(request,response) => {
    const {username, password, name, gender} = request.body
    const hashedPassword = await bcrypt.hash(password, 10);
    const selectUserQuery = `SELECT * FROM user WHERE username = '${username}';`;
    const databaseUser = await database.get(selectUserQuery);
    if( databaseUser === undefined){
        const  createUserQuery = `
        INSERT INTO
            user(username, password, name, gender)
        VALUES
            ('${username}', '${password}', '${name}', '{gender}')`
        if (validatePassword(password)) {
        await database.run(createUserQuery);
        response.send("User created successfully");
        } else {
         response.status(400);
        response.send("Password is too short");
         }
     } else {
     response.status(400);
     response.send("User already exists");
  }
})