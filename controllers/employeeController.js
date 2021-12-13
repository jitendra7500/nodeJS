const employeeModel = require("../models/employeeModel");
const companyModel = require("../models/companyModel");
const commonFunction = require("../helper/commonFunction");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");

module.exports = {

                /********************************************* Employee SignUp Api's **********************************************/

    /************************************ (2) Create employee ******************************/
    signUp: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {status: {$ne: "DELETE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(findResult){
                    if(findResult.phoneNumber == req.body.phoneNumber){
                        return res.send({responseCode: 409, responseMessage: "Phone Number is already exist...."});
                    } else if(findResult.email == req.body.email){
                        return res.send({responseCode: 409, responseMessage: "Email is already exist...."});
                    }
                } else{
                    companyModel.findOne({companyName: req.body.companyName}, (findError1, findresult1)=>{
                        if(findError1){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else if(!findresult1){
                            return res.send({responseCode: 404, responseMessage: "Company does't exist...."});
                        } else{
                            req.body.otp = commonFunction.getOtp();
                            req.body.userName = req.body.firstName + req.body.phoneNumber.slice(-4);
                            req.body.password = bcryptjs.hashSync(req.body.password);
                            req.body.otpTime = new Date().getTime();
                            req.body.companyId = findresult1._id;
                            new employeeModel(req.body).save((saveError, saveResult)=>{
                                if(saveError){
                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                } else{
                                    let count = findresult1.number_of_empl + 1;
                                    companyModel.findByIdAndUpdate({_id: findresult1._id}, {$set: {number_of_empl: count}}, {new: true}, (updateError, updateResult)=>{
                                        if(updateError){
                                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                        } else{
                                            let subject = "verify your otp and email link";
                                            let text = `Dear ${req.body.firstName +" "+ req.body.lastName}, Please verify your otp: ${req.body.otp} and also verify your email link http://localhost:4040/employee/emailVerify/${saveResult._id},\notp and email link will expires in 3 minutes`;
                                            commonFunction.sendMail(req.body.email, subject, text, (sendMailError, sendMailResult)=>{
                                                if(sendMailError){
                                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                                } else{
                                                    return res.send({responseCode: 200, responseMessage: "SignUp successfully....", responseResult: saveResult});
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } catch(error){
            res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    otpVerify: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "EMPLOYEE"}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    if(findResult.otpVerify != true){
                        let otpTimeDifference = (new Date().getTime()) - findResult.otpTime;
                        if(otpTimeDifference <= (3 * 60 * 1000)){
                            if(findResult.otp == req.body.otp){
                                employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: {otpVerify: true}}, {new: true}, (updateError, updateResult)=>{
                                    if(updateError){
                                          return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                      } else{
                                          return res.send({responseCode: 202, responseMessage: "otp verify successfully....", responseResult: updateResult});
                                      }
                                  });
                            } else{
                                return res.send({responseCode: 404, responseMessage: "Invalid Otp"});
                            }
                        } else{
                            return res.send({responseCode: 403,responseMessage: "otp time has been expired: Please resend otp and try again...."});
                        }
                    } else{
                        return res.send({responseCode: 409, responseMessage: "otp already verified...."});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    emailVerify: (req, res)=>{
        try{
            let query = {
                $and: [{_id: req.params._id}, {userType: "EMPLOYEE"}, {$status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    if(findResult.emailVerify !=true){
                        employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: {emailVerify: true}}, {new: true}, (updateError, updateResult)=>{
                            if(updateError){
                                return res.send({responseCode: 500, responseMessage: "Internal server error"});
                            } else{
                                return res.send({responseCode: 200, responseMessage: "Email verified successfully", responseResult: updateResult});
                            }
                        });
                    } else{
                        return res.send({responseCode: 409, responseMessage: "Email link is already verified"});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    reSendOtp: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "EMPLOYEE"}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    let otp = commonFunction.getOtp();
                    let otpTime = new Date().getTime();
                    let subject = " verify your otp";
                    let text = `Dear ${findResult.firstName +" "+ findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult)=>{
                        if(sendMailError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else{
                            employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: {otp: otp, otpTime: otpTime, otpVerify: false}}, {new: true}, (updateError, updateResult)=>{
                                if(updateError){
                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                } else{
                                    return res.send({responseCode: 200, responseMessage: "otp sent successfully....", responseResult: updateResult});
                                }
                            });
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    forgotPassword: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "EMPLOYEE"}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    let otp = commonFunction.getOtp();
                    let otpTime = new Date().getTime();
                    let subject = " verify your otp";
                    let text = `Dear ${findResult.firstName +" "+ findResult.lastName}, Please verify your otp: ${otp},\notp will expires in 3 minutes`;
                    commonFunction.sendMail(findResult.email, subject, text, (sendMailError, sendMailResult)=>{
                        if(sendMailError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else{
                            employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: {otp: otp, otpTime: otpTime, otpVerify: false}}, {new: true}, (updateError, updateResult)=>{
                                if(updateError){
                                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                } else{
                                    return res.send({responseCode: 200, responseMessage: "Password forgot successfully....", responseResult: updateResult});
                                }
                            });
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    resetPassword: (req, res)=>{
        try{
            let query = {
                $and:[{$or:[{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {userType: "EMPLOYEE"}, {status: {$in:"ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    if(findResult.otpVerify != true){
                        if(findResult.otp == req.body.otp){
                            let otpTimeDifference = (new Date().getTime()) - findResult.otpTime;
                            if(otpTimeDifference <= (3 * 60 * 1000)){
                             if(req.body.newPassword == req.body.confirmPassword){
                                employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set:{otpVerify: true, password: bcryptjs.hashSync(req.body.newPassword)}}, {new: true}, (updateError, updateResult)=>{
                                        if(updateError){
                                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                        } else{
                                            return res.send({responseCode: 200, responseMessage: "Password reseted successfully....", responseResult: updateResult});
                                        }
                                    });
                                } else{
                                    return res.send({responseCode: 401, responseMessage: "Invalid credentials: Password and Confirm Password does't match"});
                                }
                            } else{
                                return res.send({responseCode: 403, responseMessage: "otp time has been expired, Please try again....."});
                            }
                        } else{
                            return res.send({responseCode: 400, responseMessage: "Invalid otp: try again...."});
                        }
                    } else{
                        return res.send({responseCode: 409, responseMessage: "Password already reset...."});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    logIn: (req, res)=>{
        try{
            let query = {
                $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {email: req.body.email}]}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "User does't exist...."});
                } else{
                    if(findResult.otpVerify == true && findResult.emailVerify==true){
                        let checkPassword = bcryptjs.compareSync(req.body.password, findResult.password);
                        if(checkPassword){
                          let token = jwt.sign({_id: findResult._id}, "jitendra", {expiresIn: "1d"});
                            return res.send({responseCode: 200, responseMessage: "Login successfully: Token has been generated....", responseResult: token});
                        } else{
                            return res.send({responseCode: 400, responseMessage: "Invalid Password: Please try again...."});
                        }
                    } else{
                        return res.send({responseCode: 400, responseMessage: "Your account is not verified yet, first verify your account...."});
                    }
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    /***********(4) Get the list of all employees for a particular company ************************/
    listEmployee: (req, res)=>{
        try{
            companyModel.findOne({companyName: req.body.companyName}, (findError, findResult)=>{
                console.log(findResult);
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Company does't exist"});
                } else{
                    employeeModel.find({companyId: findResult._id}).populate("companyId").exec((findError1, findResult1)=>{
                        if(findError1){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else if(findResult1.length == 0){
                            return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                        } else{
                            return res.send({responseCode: 200, responseMessage: "List employees successfully....", responseResult: findResult1});
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    getProfile: (req, res)=>{
        try{
            let query = {
                $and: [{_id: req.employeeId}, {userType: "EMPLOYEE"}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query, (findError, findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does't exist"});
                } else{
                    return res.send({responseCode: 200, responseMessage: "Employee viewed profile successfully....", responseResult: findResult});
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "server error"});
        }
    },
    editProfile: (req, res)=>{
        try{
            let query1 = {
                $and:[{_id: req.employeeId}, {userType: "EMPLOYEE"}, {status: {$in: "ACTIVE"}}]
            }
            employeeModel.findOne(query1, (findError,findResult)=>{
                if(findError){
                    return res.send({responseCode: 500, responseMessage: "Internal server error"});
                } else if(!findResult){
                    return res.send({responseCode: 404, responseMessage: "Employee does not exist"});
                } else{
                    let query2 = {
                        $and: [{$or: [{phoneNumber: req.body.phoneNumber}, {userName: req.body.userName}, {email: req.body.email}]}, {_id: {$ne: findResult._id}}, {status: {$ne: "DELETE"}}]
                    }
                    employeeModel.findOne(query2, (checkError, checkResult)=>{
                        if(checkError){
                            return res.send({responseCode: 500, responseMessage: "Internal server error"});
                        } else if(checkResult){
                            if(checkResult.phoneNumber == req.body.phoneNumber){
                                return res.send({responseCode: 409, responseMessage: "Phone Number is already exist"});
                            } else if(checkResult.email == req.body.email){
                                return res.send({responseCode: 409, responseMessage: "Email id is already exist...."});
                            } else if(checkResult.userName == req.body.userName){
                                return res.send({responseCode: 409, responseMessage: "User Name is already exist...."});
                            }
                        } else{
                            if(req.body.password){
                                employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: req.body, password: bcryptjs.hashSync(req.body.password)}, {new: true}, (updateError, updateResult)=>{
                                    if(updateError){
                                        return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                    } else{
                                        return res.send({responseCode: 200, responseMessage: "Profile update successfully....", responseResult: updateResult});
                                    }
                                });
                            } else{
                                employeeModel.findByIdAndUpdate({_id: findResult._id}, {$set: req.body}, {new: true}, (updateError, updateResult)=>{
                                    if(updateError){
                                        return res.send({responseCode: 500, responseMessage: "Internal server error"});
                                    } else{
                                        return res.send({responseCode: 200, responseMessage: "Profile update successfully....", responseResult: updateResult});
                                    }
                                });
                            }
                        }
                    });
                }
            });
        } catch(error){
            return res.send({responseCode: 500, responseMessage: "Server error"});
        }
    }
}