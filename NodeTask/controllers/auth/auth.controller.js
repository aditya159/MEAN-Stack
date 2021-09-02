const ErrorResponse = require('../../utils/errorResponse');
const asyncHandler = require('../../middleware/async');
const User = require('../../models/User');


// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {

  // const { userName, email, password} = req.body;
  const userData = new User({
    userName: req.body.userName,
    email: req.body.email,
    password: req.body.password
  })


  // if (req.body.email && req.body.userName) {
    // const s = new User();
    var existUser = await User.findOne({$or:[{email: req.body.email},{userName: req.body.userName}] });
    if (existUser) {
      return next(new ErrorResponse('Already Exist in System', 400));
    }
    const user = await userData.save();
    if (!user) {
      return next(new ErrorResponse('record not saved', 500));
    }

    res.send({ success: true, message: `Registeration Sucess for user: ${user._id}`, status: 200 });

  // }

});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { userNameorEmail, password } = req.body;

  // Validate emil & password
  if (!userNameorEmail || !password) {
    return next(new ErrorResponse('Please provide an email and password', 400));
  }

    // Check for user
    const user = await User.findOne({ $or:[{userName:userNameorEmail},{email:userNameorEmail}]}).select('+password');

    if (!user) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return next(new ErrorResponse('Invalid credentials', 401));
    }
    sendTokenResponse(user, 200, res);
  

});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
};
