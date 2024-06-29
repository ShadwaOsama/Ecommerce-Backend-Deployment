const mongoose = require('mongoose');

const formSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  street: {
    type: String,
    default: '',
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  building:{
    type: String,
    required: true,
  },
  landmark:{
    type: String,
    required: true,
  },

});


formSchema.virtual('id').get(function () {
        return this._id.toHexString();
     });
    
     formSchema.set('toJSON', {
         virtuals: true,
    });


exports.Form = mongoose.model('Form', formSchema);
exports.formSchemaSchema = formSchema;