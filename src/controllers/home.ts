import { Request, Response } from "express";
import DBUtils from "../util/dbhelper";

/**
 * GET /
 * Home page.
 */
export let index = (req: Request, res: Response) => {
  res.render("index", {
    title: "ejs"
  });
};

export let success = (req: Request, res: Response) => {

  console.log(JSON.stringify(req.session.userdata.user));

  const userData = req.session.userdata.user;
  let reqip = ((req.headers["x-forwarded-for"] || "") as string).split(",")[0].trim() || req.connection.remoteAddress;
  if (reqip.substr(0, 7) == "::ffff:") {
    reqip = reqip.substr(7);
  }
  const user = {
    userid: userData.id,
    email: userData.email,
    username: userData.userName,
    trustLevel: userData.trustLevel,
    strategy: userData.strategy,
    ip: reqip
  };
  console.log(JSON.stringify(user));
  new DBUtils().saveNetworkUser(JSON.stringify(user));

  res.render("success", {
    title: "Success"
  });
};
