const { router, verifyToken, verifyShortlink } = require("../config");

const GetUrl = require("./GetUrl");
const GetUserUrl = require("./GetUserUrl");
const GetClickInf = require("./GetClickInf");
const GetUserData = require("./GetUserData");
const CheckIfPass = require("./CheckIfPass");

const AddUser = require("./AddUser");
const AddClick = require("./AddClick");
const CreateNewLink = require("./CreateNewLink");

const EditLink = require("./EditLink");
const EditWebhook = require("./EditWebhook");
const ResetPassword = require("./ResetPassword");

const DeleteLink = require("./DeleteLink");
const DeleteUser = require("./DeleteUser");

router.get("/getUrl", verifyShortlink, GetUrl);
router.get("/getUserUrl", verifyToken, GetUserUrl);
router.get("/getClickInfo", verifyToken, verifyShortlink, GetClickInf);
router.get("/getUserData", verifyToken, GetUserData);
router.get("/checkIfPassord", verifyShortlink, CheckIfPass);

router.post("/addUser", AddUser);
router.post("/createNewLink", verifyToken, verifyShortlink, CreateNewLink);
router.post("/addClick", verifyShortlink, AddClick);

router.patch("/editLink", verifyToken, verifyShortlink, EditLink);
router.patch("/editWebhook", verifyToken, EditWebhook);
router.patch("/resetPassword", verifyToken, verifyShortlink, ResetPassword);

router.delete("/deleteLink", verifyToken, verifyShortlink, DeleteLink);
router.delete("/deleteUser", verifyToken, DeleteUser);

router.use("*", (req, res, next) => {
  res.status(404).json({ error: "Not Found" });
});

module.exports = router;
