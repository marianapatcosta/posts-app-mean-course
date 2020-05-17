const express = require('express');
const checkAuth = require("../middleware/check-auth");
const extractFile = require("../middleware/file");
const PostsController = require('../controllers/posts');

const router = express.Router();

router.post('', checkAuth, extractFile, PostsController.createPost);

// we could also use app.use because if we add a POST request, the code above will be executed and that code below do not
router.get("", PostsController.getPosts);

router.put("/:id", checkAuth, extractFile, PostsController.updatePosts);

router.get("/:id", PostsController.getPost);

router.delete("/:id", checkAuth, PostsController.deletePost);

module.exports = router;

