const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate");
const Schema = mongoose.Schema;
const companySchema = new Schema({
    companyName: {
        type: String
    },
    companyOwnerName: {
        type: String
    },
    number_of_empl: {
        type: Number,
        default: 0
    }
}, {timestamps: true});
companySchema.plugin(mongoosePaginate);
const companyModel = mongoose.model("company", companySchema);
module.exports = companyModel;