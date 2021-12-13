const companyRouter = require("express").Router();
const companyController = require("../controllers/companyController");
const auth = require("../middleware/auth");

companyRouter.post("/createCompany", auth.tokenVerify, companyController.createCompany);
companyRouter.get("/getCompanies", companyController.getCompanies);
companyRouter.get("/searchCompany/:companyName", companyController.searchCompany);

module.exports = companyRouter;