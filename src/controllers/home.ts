import { Request, Response } from "express";
import userService from "../models/User";

/**
 * GET /
 * Home page.
 */
export const index = (req: Request, res: Response) => {
  res.render("index", {
    title: "ejs"
  });
};

export const failure = (req: Request, res: Response) => {
  res.redirect("error.html");
};

export const success = (req: Request, res: Response) => {
  console.log(JSON.stringify(req.session.userdata.user));

  // let reqip = ((req.headers["x-forwarded-for"] || "") as string).split(",")[0].trim() || req.connection.remoteAddress;
  // if (reqip.substr(0, 7) == "::ffff:") {
  //   reqip = reqip.substr(7);
  // }
  // UserModel.findOne({userId: req.session.user.userId}, (err, doc) => {
  //   if (err) {
  //     return res.redirect('/error.html?err=' + err.message);
  //   }
  //   if (doc) {
  //     req.session.user = doc;
  //     return res.redirect('/update_ip.html');      
  //   }
  //   const user = new UserModel(req.session.user);
  //     user.upsert().then(() => {
  //       req.session.user = user;
  //       res.redirect('/update_ip.html');
  //     }).catch(e => {
  //       res.redirect('/error.html?err=' + e.message);
  //     });
  // });
  // const user = new UserModel(req.session.userdata.user);
  // console.log(JSON.stringify(user));
  // user.upsert();
};
