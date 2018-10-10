import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import path from "path";
import mongoose from "mongoose";
import expressValidator from "express-validator";
import bluebird from "bluebird";

import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import discourseRouter from "./auth/discourse";
import WebSocketServer from "./WebSocketServer";
import * as homeController from "./controllers/home";
import { getClientIp, updateIpFile } from "./util/Helpers";
import userService from "./services/userservice";
import connectionLogService from "./services/connectionlogservice";

const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)

// Create Express server
const app = express();

console.log(MONGODB_URI);
// Connect to MongoDB
(<any>mongoose).Promise = bluebird;
mongoose.connect(MONGODB_URI, { useMongoClient: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: SESSION_SECRET,
  store: new MongoStore({
    url: MONGODB_URI,
    autoReconnect: true
  })
}));
// app.use(passport.initialize());
// app.use(passport.session());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
// app.use((req, res, next) => {
//   res.locals.user = req.user;
//   next();
// });

app.use(
  express.static(path.join(__dirname, "public"))
);

app.get("/test", async (req, res) => {
  try {
    await userService.upsert({
      userId: 11,
      userName: "krishna",
      ip: "",
      trustLevel: 1,
      email: "email",
      strategy: "discourse"
    });
    const list = await userService.list();
    res.send(list);
  } catch (e) {
    res.send(e);
  }
});

/**
 * Primary app routes.
 */
app.get("/", function (req, res) {
  res.redirect("index.html");
});
app.use("/auth/discourse", discourseRouter);
app.get("/auth/success", homeController.success);

app.get("/api/profile", async (req, res) => {
  try {
    if (!req.session && !req.session.user) {
      return res.sendStatus(401);
    }
    const user = await userService.findbyId(req.session.user.userId);
    req.session.user.cip = getClientIp(req);
    req.session.user.ip = user.ip || "";
    res.send(req.session.user);
  }
  catch (e) {
    res.send(e);
  }
});

app.get("/api/updateIp", async (req, res) => {
  try {
    if (!req.session && !req.session.user) {
      return res.sendStatus(401);
    }
    const user = req.session.user;
    await userService.upsert({
      userId: user.userId,
      userName: user.userName,
      ip: getClientIp(req),
      trustLevel: user.trustLevel,
      email: user.email,
      strategy: user.strategy
    });
    await updateIpFile();
    res.sendStatus(200);
  } catch (e) {
    res.send(e);
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    if (req.query.startdate && req.query.enddate) {
      const startDate = new Date(req.query.startdate);
      const endDate = new Date(req.query.enddate);
      const list = await connectionLogService.listBetweenDates(startDate, endDate);
      res.send(list);
    }
    else if (req.query.pageNo) {
      const pageNo = parseInt(req.query.pageNo);
      const size = parseInt(req.query.size);
      const list = await connectionLogService.paginate(size, pageNo);
      res.send(list);
    }
    else {
      const list = await connectionLogService.list();
      res.send(list);
    }
  } catch (e) {
    res.send(e);
  }
});

// app.get("/auth/failure", homeController.failure);

const wsServer = new WebSocketServer();
wsServer.start();

export default app;
