import express from "express";
import compression from "compression";  // compresses requests
import session from "express-session";
import bodyParser from "body-parser";
import lusca from "lusca";
import dotenv from "dotenv";
import mongo from "connect-mongo";
import flash from "express-flash";
import path from "path";
import mongoose from "mongoose";
import passport from "passport";
import expressValidator from "express-validator";
import bluebird from "bluebird";
import { MONGODB_URI, SESSION_SECRET } from "./util/secrets";
import * as WebSocket from "ws";
import discourseRouter from "./auth/discourse";
const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)
import * as homeController from "./controllers/home";


// API keys and Passport configuration
import * as passportConfig from "./config/passport";
import NetworkUser from "./models/NetworkUser";
import DBUtils from "./util/dbhelper";
import ConnectionLog from "./models/ConnectionLog";

// Create Express server
const app = express();

// Connect to MongoDB
const mongoUrl = MONGODB_URI;
(<any>mongoose).Promise = bluebird;
mongoose.connect(mongoUrl, { useMongoClient: true }).then(
  () => { /** ready to use. The `mongoose.connect()` promise resolves to undefined. */ },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  process.exit();
});

// Express configuration
app.set("port", process.env.PORT || 3000);

// app.set("views", path.join(__dirname, "../views"));
// app.engine("html", require("ejs").renderFile);
// app.set("view engine", "html");

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
    url: mongoUrl,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(lusca.xframe("SAMEORIGIN"));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use((req, res, next) => {
  // After successful login, redirect back to the intended page
  if (!req.user &&
    req.path !== "/login" &&
    req.path !== "/signup" &&
    !req.path.match(/^\/auth/) &&
    !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  } else if (req.user &&
    req.path == "/account") {
    req.session.returnTo = req.path;
  }
  next();
});

app.use(
  express.static(path.join(__dirname, "public"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
app.get("/", function (req, res) {
  res.redirect("index.html");
});


app.get("/ips", function (req: any, res: any, next: any) {
  const query = NetworkUser.find({}).distinct("ip");
  query.exec(function (err, value) {
    if (err) return next(err);
    res.send(value);
  });
});

app.use("/auth/discourse", discourseRouter);

app.get("/success", homeController.success);

app.get("/getstats", function (req: any, res: any, next: any) {
  const query = ConnectionLog.find({});
  query.exec(function (err, value) {
    if (err) return next(err);
    res.send(value);
  });
});

const dbUtility = new DBUtils();

// initialize a simple http server
const server = require("http").createServer(this.app);

// initialize the WebSocket server instance
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws: WebSocket) => {
  // send immediatly a feedback to the incoming connection
  ws.send("user connected");

  ws.on("error", function (e) {
    console.log(e);
  });

  // connection is up, let's add a simple simple event
  ws.on("message", (message: string) => {
    console.log(`Received -> ${message}`);

    if (message.includes("ConnectionId")) {
      dbUtility.saveConnectionLog(message);

      wss.clients.forEach(function each(client) {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }

  });
});

wss.on("error", function (e) {
  console.log(e);
});

// start our server
server.listen(process.env.PORT || 44444, () => {
  console.log(`Server started on port 44444 :)`);
});

export default app;
