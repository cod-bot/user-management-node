const mongoose = require('mongoose');
mongoose.promise = global.promise;
const slug = require('slugs');

const storeSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    slug: String,
    description: String,
    tags: [String]
});

storeSchema.pre('save', function(next) {
    if(!this.isModified('name')) {
        next();
        return next();
    }
    this.slug = slug(this.name);
    next();
})

module.exports = mongoose.model('store', storeSchema);