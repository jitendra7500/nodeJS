const employeeModel = require("../models/employeeModel");
const jwt = require("jsonwebtoken");
module.exports = {
    tokenVerify: (req, res, next)=>{
        try{
            jwt.verify(req.headers.token, "jitendra", (tokenVerifyError, tokenVerifyResult)=>{
                if(tokenVerifyError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error: Token time has been expired...."});
                }else if(!tokenVerifyResult){
                    return res.send({responseCode: 404, responseMessage: "Invalid token: Token does't exist"});
                } else{
                    employeeModel.findOne({_id: tokenVerifyResult._id}, (findError, findResult)=>{
                        if(findError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else if(!findResult){
                            return res.send({responseCode: 404, responseMessage: "Invalid credentials: Data does't exist"});
                        } else{
                            if(tokenVerifyResult.status == "DELETE"){
                                return res.send({responseCode: 404, responseMessage: `${findResult.userType} has been Deleted....`});
                            } else if(tokenVerifyResult == "BLOCK"){
                                return res.send({responseCode: 404, responseMessage: `${findResult.userType} has been Blocked....`});
                            } else{
                                req.employeeId = tokenVerifyResult._id;
                                next();
                            }
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    }
}