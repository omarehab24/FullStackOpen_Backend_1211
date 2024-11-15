const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

require('dotenv').config();
const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB');
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message);
    });

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    number: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /^\+?\d{2,3}-\d{1,10}$/.test(v);
            },
            message: props => `${props.value} is not a valid phone number! Format should be [+]XX-XXXXXXXX or [+]XXX-XXXXXXX`
        }
    },
});

contactSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString();
        delete returnedObject._id;
        delete returnedObject.__v;
    }
});

module.exports = mongoose.model('Contact', contactSchema);