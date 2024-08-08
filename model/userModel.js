const DATABASE_URL = process.env.DATABASE_URL
const mongoose=require("mongoose");
mongoose.connect(`${DATABASE_URL}`);
const { Schema } = mongoose;


const userSchema = new Schema({
  name: {
    type: String,
    required: true,  
    trim: true       
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique:true,
  },
  password: {
    type: String,
    required: true, 
    trim: true, 
    minLength:5    
  },
  favorites: [{
    type: Schema.Types.ObjectId,
    ref: 'Doctor' // Reference to the Doctor model
  }],
});


const userModel = mongoose.model('userModel', userSchema);

module.exports = userModel;
