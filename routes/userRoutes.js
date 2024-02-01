const express = require("express");
const {
  registerUser,
  authUser,
  allUsers,
  editProfile,
  userById,
  changeStatus,
} = require("../controllers/userControllers");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.route("/").get(protect, allUsers);
router.route("/edit").patch(protect,editProfile);
router.route("/").post(registerUser);
router.post("/login", authUser);
router.route("/status").get(protect,changeStatus)
router.route("/userByToken").get(protect,userById);

module.exports = router;
