import crypto from "crypto";
import express, { json } from "express";
import axios from "axios";
import generateNonce from "a-nonce-generator";
import queryString from "query-string";

const config = require("../config/app.json");
const cred = require("../config/cred.json");


if (!cred || !cred.discourseSecret) {
    throw new Error("cred file is not found");
}

const sign = (data: any, secret: any) => {
    const hmac = crypto.createHmac("sha256", secret);
    hmac.update(data);
    return hmac.digest("hex");
};

const returnUrl = "http://localhost:3000/auth/discourse/callback"; // config.authReturnUrl[(process.env.NODE_ENV || "prod").trim()];

const router = express.Router();

router.get("/login", function (req, res, next) {
    const nonce = new generateNonce().generate();
    const payload = `nonce=${nonce}&return_sso_url=${returnUrl}`;
    const base64Payload = new Buffer(payload).toString("base64");
    const urlEncodedPayload = encodeURIComponent(base64Payload);
    const signature = sign(base64Payload, cred.discourseSecret);
    res.redirect(`${config.discourseUrl}/session/sso_provider?sso=${urlEncodedPayload}&sig=${signature}`);
});
// [END authorize]

// [START callback]
router.get("/callback", async (req, res) => {
    try {
        const sso = req.query.sso;
        if (sign(sso, cred.discourseSecret) !== req.query.sig) {
            return res.redirect("/auth_response.html?err=Authorisation failed");
        }
        const data = queryString.parse(new Buffer(sso, "base64").toString());
        const userDetails = await axios.get(`${config.discourseUrl}/users/${data.username}.json`);
        req.session.userdata = {
            user: {
                id: data.external_id,
                email: data.email,
                userName: data.username.toLowerCase(),
                trustLevel: userDetails.data.user.trust_level,
                strategy: "discourse"
            }
        };
        res.redirect(config.authConfirmURL);
    } catch (e) {
        return res.redirect("/auth_response.html?err=Authorisation failed." + (e || ""));
    }
});
// [END callback]

const discourseRouter = router;
export default discourseRouter;