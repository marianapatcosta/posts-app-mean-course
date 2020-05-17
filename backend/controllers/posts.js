const Post = require("../models/post");

/* exports.createPost = (req, res, next) => {
  const url = req.protocol + '://' + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    // file property of req is provided by multer
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });
  post.save().then(createdPost => {
    res.status(201).json({
      message: 'Post added successfully.',
      post: {
        ...createdPost,
        id: createdPost._id,
        /* title: createdPost.title,
        content: createdPost.content,
        imagePath: createdPost.imagePath
      }
    })
  })
  .catch(error => {
    res.status(500).json({
      message: "Creating the post failed!"
    })
  });
} */

exports.createPost = async (req, res, next) => {
  const url = req.protocol + "://" + req.get("host");
  const post = new Post({
    title: req.body.title,
    content: req.body.content,
    // file property of req is provided by multer
    imagePath: url + "/images/" + req.file.filename,
    creator: req.userData.userId
  });

  try {
    const createdPost = await post.save();

    res.status(201).json({
      message: "Post added successfully.",
      post: {
        ...createdPost,
        id: createdPost._id
        /* title: createdPost.title,
          content: createdPost.content,
          imagePath: createdPost.imagePath */
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Creating the post failed!"
    });
  }
  // here we don't call next() because we are already sending a response and so,
  // the code that follows this method will not be executed when a post request is done
};

exports.updatePosts = async (req, res, next) => {
  let imagePath = req.body.imagePath;
  if (req.file) {
    const url = req.protocol + "://" + req.get("host");
    imagePath = url + "/images/" + req.file.filename;
  }
  const post = new Post({
    _id: req.body.id,
    title: req.body.title,
    content: req.body.content,
    imagePath: imagePath,
    creator: req.userData.userId
  });

  try {
    //only updates the post if it matches post id and creator id
    const updateResult = await Post.updateOne(
      { _id: req.params.id, creator: req.userData.userId },
      post
    );

    // check if we found any posts matching the conditions
    if (updateResult.n > 0) {
      res.status(200).json({
        message: "Updated successfully!"
      });
    } else {
      res.status(401).json({
        message: "Not authorized!"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Could not update post!"
    });
  }
};

/* exports.getPosts = (req, res, next) => {
  /* const posts = [
    {
      id: "fewtttet",
      title: "First server-side post",
      content: "This is coming from the server."
    },
    {
      id: "etrunyti",
      title: "Second server-side post",
      content: "This is coming from the server!"
    }
  ];
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  //Post.find() will not be immediately executed, only when we call then()
  const postQuery = Post.find();
  let fetchedPosts;

  // if we have QP, other methods will be chained to specify de DB query
  if (pageSize && currentPage) {
    // the abovementioned approach may be inefficient for very large DBs
    postQuery
      //mongoose skip() means that we will not retrieve all the posts, skip the 1st n posts
      .skip(pageSize * (currentPage - 1))
      // limits the items to display
      .limit(pageSize);
  }

  postQuery
    .then(documents => {
      fetchedPosts = documents;
      // return another query that will count the posts found
      return Post.count();
      /*
       });
    })
    .then(count => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts: fetchedPosts,
        maxPosts: count
      });
    })
    .catch(error => {
      res.status(500).json({
        message: "Fetching posts failed!"
      });
    });
}; */

exports.getPosts = async (req, res, next) => {
  /* const posts = [
    {
      id: "fewtttet",
      title: "First server-side post",
      content: "This is coming from the server."
    },
    {
      id: "etrunyti",
      title: "Second server-side post",
      content: "This is coming from the server!"
    }
  ]; */
  const pageSize = +req.query.pageSize;
  const currentPage = +req.query.page;
  try {
    //Post.find() will not be immediately executed, only when we call then() or await
    const postQuery = Post.find();

    // if we have QP, other methods will be chained to specify de DB query
    if (pageSize && currentPage) {
      // the abovementioned approach may be inefficient for very large DBs
      postQuery
        //mongoose skip() means that we will not retrieve all the posts, skip the 1st n posts
        .skip(pageSize * (currentPage - 1))
        // limits the items to display
        .limit(pageSize);
    }
    const fetchedPosts = await postQuery;
    const count = await Post.count();
    res.status(200).json({
      message: "Posts fetched successfully!",
      posts: fetchedPosts,
      maxPosts: count
    });
  } catch (error) {
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  }
};

exports.getPost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(404).json({
        message: "Post not found!"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  }
};

exports.deletePost = async (req, res, next) => {
  try {
    const deletedPost = await Post.deleteOne({
      _id: req.params.id,
      creator: req.userData.userId
    });

    if (deletedPost.n > 0) {
      res.status(200).json({
        message: "Post deleted!"
      });
    } else {
      res.status(401).json({
        message: "Not authorized!"
      });
    }
  } catch (error) {
    res.status(500).json({
      message: "Fetching posts failed!"
    });
  }
};
