const express = require('express');
const router = express.Router();

const userM = require('../models/user');
const Post = require('../models/post');
const favM = require('../models/favorite');
const checkAuth = require('../middleware/checkAuth');
const multer = require("multer");

const MIMIE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
}

const avatar_storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIMIE_TYPE_MAP[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid){
      error = null;
    }
    cb(error, "backend/images/avatar");
  },
  filename: (req, file, cb) => {
    const name = file.originalname.toLocaleLowerCase().split(' ').join('-');
    const ext = MIMIE_TYPE_MAP[file.mimetype];
    cb(null, name + '-' + Date.now() + '.' + ext);
  }
});

// router.post('/getOthers', checkAuth, (req, res) => {
//     const data = req.body;
//     try {
//         if (data.username === '' || data.username == null) {
//             res.status(400).send();
//             return;
//         }
//     }
//     catch (e) {
//         res.status(400).send();
//         return;
//     }

//get current user's uploaded posts from DB
router.get('', checkAuth, (req, res, next) =>{
  const current_user = req.body;
  console.log("getting my posts in profile for user: %s", req.query.username);
  Post.find({owner: req.query.username}).then(documents => {
    userM.findOne({username: req.query.username},(err, user) => {
      if (err) {
        console.log('the error is: ', err);
        res.status(500).send(err);
      }
      if (!user) {
        res.status(403).send('cannot find the user');
      } else {
        res.status(200).json({
          message: 'profile: post fetched',
          posts: documents,
          user: user
        });
      }
    })

  });
});

//delete post
router.delete("/delete/:id", checkAuth,(req, res, next) => {
  Post.deleteOne({ _id: req.params.id }).then(result => {
    console.log(result);
    res.status(200).json({ message: "Post deleted!" });
  });
});

//store profile avatar
router.post("/avatar-upload", multer({storage: avatar_storage}).single("image"), (req, res, next) => {
  const file = req.file;
  console.log("image %s received", file.filename);
  if(!file){
    console.log(" no images");
  }
  res.send("image stored");
});

module.exports = router;
