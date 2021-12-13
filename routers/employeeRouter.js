const employeeRouter = require("express").Router();
const employeeController = require("../controllers/employeeController");
const auth = require("../middleware/auth");

/** User SignUp Api's Routing */
employeeRouter.post("/signUp", employeeController.signUp);
employeeRouter.put("/otpVerify", employeeController.otpVerify);
employeeRouter.get("/emailVerify/:_id", employeeController.emailVerify);
employeeRouter.put("/reSendOtp", employeeController.reSendOtp);
employeeRouter.put("/forgotPassword", employeeController.forgotPassword);
employeeRouter.put("/resetPassword", employeeController.resetPassword);
employeeRouter.post("/logIn", employeeController.logIn);
employeeRouter.get("/listEmployee", employeeController.listEmployee);
employeeRouter.get("/getProfile", auth.tokenVerify, employeeController.getProfile);
employeeRouter.put("/editProfile", auth.tokenVerify, employeeController.editProfile);

module.exports = employeeRouter;