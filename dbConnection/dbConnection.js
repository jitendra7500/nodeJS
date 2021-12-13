const mongoose = require("mongoose");
const dbName = "companyDB";
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {useNewUrlParser: true, useUnifiedTopology: true}, (connectionError, connectionResult)=>{
    if(connectionError){
        console.log(`DB "${dbName}" is not connected yet...`);
    } else{
        console.log(`DB "${dbName}" has been connected successfully....`);
    }
});