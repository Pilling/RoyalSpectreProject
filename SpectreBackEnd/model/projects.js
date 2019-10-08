const mongoose= require('mongoose');

const projectsSchema = mongoose.Schema({
    id_user: { type: String, required: true },
    user_name: { type: String, required: true },
    image_url: { type: String, required: true },
    target_fund: { type: Number, required: true },
    score_comment_react: { type: Number, required: true, default: 0 },
    current_fund: { type: Number, required: true, default: 0 },
    status: { type: String, required: true }
});

module.exports = mongoose.model('projects', projectsSchema);