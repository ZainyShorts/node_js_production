const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");
const generateToken = require("../config/generateToken");

//@description     Get or Search all users
//@route           GET /api/user?search=
//@access          Public
const allUsers = asyncHandler(async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword).find({ _id: { $ne: req.user._id } });
  res.send(users);
});

//@description     Register new user
//@route           POST /api/user/
//@access          Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, pic,isAdmin } = req.body;
  if (!name || !email || !password || !pic ) {
    res.status(400);
    throw new Error("Please Enter all the Feilds");
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }


  const user = await User.create({
    name,
    email,
    password,
    pic,
    isAdmin:isAdmin?true:false
  });
  if(isAdmin!=true)
  {
    const admins = await User.find({isAdmin:true});
    admins.forEach(async (element)=> {
        var chatData = {
          users: [user._id, element._id],
        };
        await Chat.create(chatData);
      });
  }

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("User not found");
  }
});

//@description     Auth the user
//@route           POST /api/users/login
//@access          Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  
  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      pic: user.pic,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error("Invalid Email or Password");
  }
});
const editProfile = asyncHandler(async (req, res) => {
    try{
      let user = await User.findOne({_id:req.user._id});
      if(!user)
      {
        res.status(401).send({error:'User not found'});
      }
      await User.findByIdAndUpdate({_id:req.user._id},{
        name:req.body.name
      });
      
      user = await User.findOne({_id:req.user._id});

      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });
    }catch(e)
    {
      res.status(401);
      throw new Error("Invalid Email or Password");
    }
});

const userById = asyncHandler(async (req, res) => {
    try{
      
      const user = await User.findOne({_id:req.user._id})
      if(!user)
      {
        res.status(400).send({error:'User not found'})
      }
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        pic: user.pic,
        token: generateToken(user._id),
      });

    }catch(e)
    {
      res.status(500).send({error:'server error'});
    }
});

const changeStatus = asyncHandler(async(req,res)=>{
  try
  {
    console.log('Hit')
    await User.updateOne({_id:req.user._id},{$set:{'online':false}})
    res.status(200).send(true);
  }
  catch(e)
  {
    res.status(500).send(false);
  }
})



module.exports = { allUsers, registerUser, authUser,editProfile,userById,changeStatus };
