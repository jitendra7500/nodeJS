const mongoose = require("mongoose");
const bcryptJs = require("bcryptjs");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;
const employeeSchema = new Schema({
    firstName: {
        type: String
    },
    lastName: {
        type: String
    },
    phoneNumber: {
        type: String
    },
    email: {
        type: String
    },
    userName: {
        type: String
    },
    countryCode: {
        type: String
    },
    password: {
        type: String
    },
    address: {
        type: String
    },
    dateOfBirth: {
        type:String
    },
    otp: {
        type: String
    },
    otpTime: {
        type: String
    },
    otpVerify: {
        type: Boolean,
        default: false
    },
    emailVerify: {
        type: Boolean,
        default: false
    },
    companyId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "company"
    },
    permission: {
        employeeManagement: { type: Boolean, default: false }
    },
    userType: {
        type: String,
        enum: ["ADMIN", "EMPLOYEE"],
        default: "EMPLOYEE"
    },
    status: {
        type: String,
        enum: ["ACTIVE", "DELETE", "BLOCK"],
        default: "ACTIVE"
    }
}, {timestamps: true});
employeeSchema.plugin(mongoosePaginate);
const employeeModel = mongoose.model("employee", employeeSchema);
module.exports = employeeModel;
employeeModel.findOne({userType: "ADMIN"}, (findError, findResult)=>{
    if(findError){
        console.log("Internal server error");
    } else if(findResult){
        console.log("ADMIN is already exist....");
    } else{
        let obj = {
            firstName: "Jitendra",
            lastName: "Singh",
            phoneNumber: "9999999991",
            email: "no-jitendra@mobiloitte.com",
            countryCode: "+91",
            userName: "jitendra7500",
            password: bcryptJs.hashSync("1234"),
            address: "Bulandshahr",
            dateOfBirth: "01/01/2021",
            userType: "ADMIN",
            otpVerify: "true",
            emailVerify: "true",
            permission: {
                employeeManagement: true
            },
            status: "ACTIVE"
        }
        employeeModel(obj).save((saveError, saveResult)=>{
            if(saveError){
                console.log("Internal server error: Admin is not created yet....");
            } else{
                console.log("Admin has been created successfully...."+ saveResult);
            }
        });
    }
});