const express = require("express");
const app = express();
const port = 4040;

//importing Body Parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//importing employee router
const employeeRout = require("./routers/employeeRouter");
app.use("/employee", employeeRout);

//importing Admin router
const companyRout = require("./routers/companyRouter");
app.use("/company", companyRout);

//importing DB Router
const db = require("./dbConnection/dbConnection");

app.get("/", (req, res)=>{
    res.send("I'm coming form server....");
});

app.listen(port, (error, result)=>{
    if(error){
        console.log(`Server is not listening on port "${port}"`);
    } else{
        console.log(`Server is listening on port "${port}"`);
    }
});