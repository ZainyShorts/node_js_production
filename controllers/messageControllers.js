const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

//@description     Get all Messages
//@route           GET /api/Message/:chatId
//@access          Protected
const currentDate = new Date();

// Options for formatting the time
const timeOptions = {
  hour: 'numeric',
  minute: 'numeric',
  hour12: true
};

// Options for formatting the date
const dateOptions = {
  month: 'numeric',
  day: 'numeric',
  year: 'numeric'
};

// Generate the formatted time and date strings
const formattedTime = currentDate.toLocaleString('en-US', timeOptions);
const formattedDate = currentDate.toLocaleString('en-US', dateOptions);

// Combine the time and date strings in the desired order
const result = `${formattedTime} ${formattedDate}`;

const allMessages = asyncHandler(async (req, res) => {

    await Message.find({ chat: req.params.chatId })
      .populate("sender", "name pic email")
      .populate("chat").then(async (results) => {
        results = await User.populate(results, {
          path: "chat.users",
          select: "name pic email",
        });
        res.json(results);
      }).catch((e)=>{
        res.status(500);
        throw new Error(e.message);
      })
    });
 


//@description     Create New Message
//@route           POST /api/Message/
//@access          Protected
const sendMessage = asyncHandler(async (req, res) => {
  const {type, content, chatId } = req.body;

  if (!content || !chatId || !type) {
    // console.log("Invalid data passed into request");
    return res.status(400);
  }

  var newMessage = {
    sender: req.user._id,
    content: content,
    chat: chatId,
    time:result,
    type:type
  };

  try {
    var message = await Message.create(newMessage);

    message = await message.populate("sender", "name pic")
    .execPopulate();
    message = await message.populate("chat")
    .execPopulate();
    message = await User.populate(message, {
      path: "chat.users",
      select: "name pic email",
    });

    await Chat.findByIdAndUpdate(chatId, { latestMessage: message });

    res.json(message);
  } catch (error) {
    res.status(400);
    throw new Error(error.message);
  }
});

module.exports = { allMessages, sendMessage };
