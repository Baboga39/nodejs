// controllers/userController.js
const userService = require('../services/UserService');
const bcryptjs = require('bcryptjs');
const User = require('../models/usermodel');
const AuthService = require('../services/authService');
const ProfileDTO = require('../dto/request/ProfileUserDTO')
const Service = require('../services/index')
const getUserInfo = async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId){
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
        result: null,
      });
    }
    const user = await userService.getUserInfo(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
        result: null,
      });
    }
    return res.status(200).json({
      success: false,
      statusCode: 200,
      message: 'User information',
      result: user,
    });
  } catch (error) {
     return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      result: error.message,
    });
  }
};
const updatedUserInfo = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    const inputProfileDTO = ProfileDTO.fromRequest(req.body);
    console.log(inputProfileDTO);
    const userUpdate= await userService.updateUserInfo(authenticatedUser, inputProfileDTO,res)
  } catch (error) {
    console.log('Error updating user')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      result: error.message,
    });
  }
}
const updateAvatar = async (req,res) => {
  try {
    const authenticatedUser = req.user;
    const fileData  = req.file;
    console.log(fileData);
    const userUpdate= await userService.uploadAvatar(authenticatedUser, fileData)
    
    console.log('Updated Avatar successfully')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Change avatar updated successfully',
      result: userUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      result: error.message,
    });
  }
}
const removeAvatar= async(req,res) =>{
  try {
    const authenticatedUser = req.user;
    const userUpdate= await userService.removeAvatar(authenticatedUser)
    console.log('Remove Avatar successfully')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Remove avatar updated successfully',
      result: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'Internal server error',
      result: error.message,
    });
  }
}

const newPassword = async (req, res) => {
  const authenticatedUser = req.user;
  const { oldPassword, password, confirmPassword } = req.body;
  const email = authenticatedUser.user.email;
  if (!oldPassword || !password || !confirmPassword) {
    console.log('Not found information')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Please enter full information',
      result: null,
    });
  }

  if (password!== confirmPassword) {
    console.log('Password do not match')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Passwords do not match. Try again',
      result: null,
    });
  }
  const user = await User.findOne({email});
  const isOldPasswordValid = await bcryptjs.compare(oldPassword,String(user.password).trim());
  if (!isOldPasswordValid) {
    console.log('Old password do not match')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Old password do not match. Try again',
      result: null,
    });
  }
  if (!user) {
    console.log('Not found user in database')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(401).json({
      success: false,
      statusCode: 400,
      message: 'Not found. Please try again',
      result: null,
    });
  }
  await AuthService.resetPassword(user, password)
  console.log('Reset password successfully')
  console.log('--------------------------------------------------------------------------------------------------------------------')
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Reset password successfully',
    result: null,
  });
} 

//--------------------------------------------------------INTERACT WITH BLOG --------------------------------------------------------

const likeBlog = async (req, res) => {
  const authenticatedUser = req.user;
  const blogId = req.params.blogId;
  if (blogId==':blogId') {
    console.log('BlogId is missing');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'BlogId is missing',
      result: null,
    });
  }
  try {
    const blog = await Service.userService.likeBlog(authenticatedUser.user, blogId);
    if (!blog) {
      console.log('Blog not found');
      console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Blog not found',
        result: null,
      });
    }
    if(!blog.isLiked)
    {
      console.log('--------------------------------------------------------------------------------------------------------------------')
      console.log('Dislike Blog successfully');
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Dislike Blog successfully',
        result: blog,
      });
    }
    console.log('--------------------------------------------------------------------------------------------------------------------')
    console.log('Like Blog successfully');
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Like Blog successfully',
      result: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'MongoDB Error: ' + error.message,
      result: null,
    });
  }
};
const saveBlog = async (req, res) => {
  const authenticatedUser = req.user;
  const blogId = req.params.blogId;
  if (blogId==':blogId') {
    console.log('BlogId is missing');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'BlogId is missing',
      result: null,
    });
  }
  try {
    const blog = await Service.userService.saveBlog(authenticatedUser.user, blogId);
    if (!blog) {
      console.log('Blog not found');
      console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'Blog not found',
        result: null,
      });
    }
    if(!blog.isSave)
    {
      console.log('--------------------------------------------------------------------------------------------------------------------')
      console.log('Unsave Blog successfully');
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Unsave Blog successfully',
        result: blog,
      });
    }
    console.log('--------------------------------------------------------------------------------------------------------------------')
    console.log('Save Blog successfully');
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Save Blog successfully',
      result: blog,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      statusCode: 500,
      message: 'MongoDB Error: ' + error.message,
      result: null,
    });
  }
};
const addComment = async (req, res) => {
 try {
  const authenticatedUser = req.user;
  const {blogId,replyToCommentId,content} = req.body
  if (!blogId) {
    console.log('BlogId is missing');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'BlogId is missing',
      result: null,
    });
  }
  if(!content) {
    console.log('Content is missing');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
     
     
      message: 'Content is missing',
      result: null,
    });
  }
  const comment = await Service.commentService.addComment(blogId,authenticatedUser.user_id,content,replyToCommentId);
  if(comment == null){
    console.log('Not found Parent Category ID');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Not found Parent Category ID',
      result: null,
    });
  }
  if(comment == 1){
    console.log('Not found blog');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Not found blog',
      result: null,
    });
  }
  console.log('Add Comment Success');
  console.log('--------------------------------------------------------------------------------------------------------------------')
  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Add Comment Success',
    result: comment,
  });
 } catch (error) {
  console.log('Server Internal Error');
  console.log('--------------------------------------------------------------------------------------------------------------------')
  return res.status(500).json({
    success: true,
    statusCode: 500,
    message: 'Server Internal Error',
    result: error.message,
  });
 }
};
const deleteComment = async (req, res) => {
  try {
    const authenticatedUser = req.user;
    const {commentId,blogId} = req.params.commentId;
    const comment = await Service.commentService.deleteComment(commentId,authenticatedUser.user._id,blogId);
    if(comment===1)
    {
      console.log('Not found comment');
      console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(400).json({
        success:false,
        statusCode: 400,
        message: 'Not found comment',
        result: null,
      });
    }
    if(comment===2)
    {
      console.log('Not found blog');
      console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(400).json({
        success:false,
        statusCode: 400,
        message: 'Not found blog',
        result: null,
      });
    }
    if(comment===3){
      console.log('User do not have permission');
      console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(401).json({
        success:false,
        statusCode: 401,
        message: 'User do not have permission',
        result: null,
      });
    }
  } catch (error) {
    console.log('Server Internal Error');
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(500).json({
      success: true,
      statusCode: 500,
      message: 'Server Internal Error',
      result: error.message,
    });
  }
};
module.exports = {
  getUserInfo,
  updatedUserInfo,
  updateAvatar,
  removeAvatar,
  newPassword,
  likeBlog,
  saveBlog,
  addComment,
  deleteComment,
}