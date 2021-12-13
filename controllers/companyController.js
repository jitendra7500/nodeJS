const companyModel = require("../models/companyModel");
const employeeModel = require("../models/employeeModel");
module.exports = {
    /************************ (1) Create company ********************/
    createCompany: (req, res)=>{
        try{
            let query = {
                $and: [{_id: req.employeeId}, {userType: "ADMIN"}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Admin does't exist"});
                } else{
                    companyModel.findOne({companyName: req.body.companyName}, (findError1, findResult1)=>{
                        if(findError1){
                            return res.send({responseCode: 500, responseMessage: "Imnternal server error"});
                        } else if(findResult1){
                            return res.send({responseCode: 409, responseMessage: "Company Name is already exist..."});
                        } else{
                            new companyModel(req.body).save((saveError, saveResult)=>{
                                if(saveError){
                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                } else{
                                    return res.send({responseCode: 200, responseMessage: "Company created successfully....", responseResult: saveResult});
                                }
                            });
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "Server Error", responseResult: error.message});
        }
    },
    /*************************** (3) Get all companies: sort the companies in descending order of number of employees ***************************/
    getCompanies: (req, res)=>{
        try{
            companyModel.find({sort: {number_of_empl: -1}}, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(findResult.length == null){
                    return res.send({responseCode: 404, responseMessage: "Company does't exist"});
                } else{
                    return res.send({responseCode: 200, responseMessage: "Companies name list out successfully....", responseResult: findResult});
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    /*********************** (5) search for a company name as path parameter and listout the matching companies *************************/
    searchCompany: (req, res)=>{
        try{
            companyModel.find({companyName: req.params.companyName}, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(findResult.length == 0){
                    return res.send({responseCode: 404, responseMessage: "Company does't exist"});
                } else{
                    return res.send({responseCode: 200, responseMessage: "Companies name list out successfully....", responseResult: findResult});
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    }    
}