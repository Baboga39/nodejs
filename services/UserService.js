// services/userService.js
const UserModel = require('../models/usermodel')
const cloudinary = require('cloudinary').v2;
const Category = require('../models/Blog/categoryModel')
const Blog = require('../models/Blog/blogModel')
const UserRequest = require('../models/Blog/userRequestModel')
const Follow = require('../models/followModel');
const usermodel = require('../models/usermodel');
class UserService {
static getUserInfo = async (userId) => {
  const user = await UserModel.findById(userId);
  if (!user) {
    return null;
  }
  return user;
};
static updateUserInfo = async (authenticatedUser, profileDTO,res ) =>{

    const user_id = authenticatedUser.user._id
    const user = await UserModel.findById(user_id);
    const existingUser = await UserModel.findOne({ email: profileDTO.email });
    const existingUsername = await UserModel.findOne({ username : profileDTO.username});
    if (existingUser && existingUser._id.toString() !== user_id.toString()) {
      console.log('Email already exists')
      console.log('--------------------------------------------------------------------------------------------------------------------')
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Email already exists',
          result: null,
        });
    }
    if (existingUsername && existingUsername._id.toString() !== user_id.toString()) {
    console.log('Username already exists')
    console.log('--------------------------------------------------------------------------------------------------------------------')
      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Username already exists',
        result: null,
      });
  }
    // Update user information with data from the profileDTO
    user.name = profileDTO.name;
    user.phone = profileDTO.phone;
    user.secondName = profileDTO.secondName;
    user.gender = profileDTO.gender;
    user.descriptions = profileDTO.descriptions;
    user.address = profileDTO.address;
    user.username = profileDTO.username;
    // Save the updated user to the database
    await user.save();
    console.log('Updated user info successfully')
    console.log('--------------------------------------------------------------------------------------------------------------------')
    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User information updated successfully',
      result: user,
    });
}
static uploadAvatar = async(authenticatedUser, fileData) =>{
  try {
    const user = await UserModel.findById(authenticatedUser.user._id);
    if (user.avatar!=null)
    {
      cloudinary.uploader.destroy(user.avatar.publicId);
    }
    user.avatar.url = fileData.path; 
    user.avatar.publicId = fileData.filename;
    await user.save();
    return user.avatar;
    
  } catch (error) {
    console.error(error);
    throw error;
  }
}
static removeAvatar = async(authenticatedUser) =>{
  const user = await UserModel.findById(authenticatedUser.user._id);
  if (user.avatar!=null)
  {
    cloudinary.uploader.destroy(user.avatar.publicId);
  }
  user.avatar.publicId = null;
  user.avatar.url = null;
  user.save();
}
static newPassword = async(req, res) =>{

  const { password, confirmPassword, email } = req.body;

  if (!password || !confirmPassword || !email) {
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


//////////////////////////////// Interaction with Categories //////////////////////////////////////////////////////////////////
static leaveCategory = async (authenticatedUser, categoryId) => { 
  const category = await Category.findById(categoryId);
  if(!category)
  {
    return null;
  }
  await category.removeUsers(authenticatedUser._id);
  const userCount = await UserModel.countDocuments({ _id: { $in: category.users } });
  category.sumUser = userCount;
  return await category.save();
}
static requestJoin = async (userId, categoryId) =>{
  const user = await UserModel.findById(userId);
  const category = await Category.findById(categoryId);
  const userRequestFind = await UserRequest.findOne({Category: category})
  if (!user) {
    console.log('-------------------------------------------------------------------------------------------------');
    console.log('Not found user');
    return 1;
  }
  if (!category) {
    console.log('-------------------------------------------------------------------------------------------------');
    console.log('Not found category');
    return 2;
  }
  if(userRequestFind){
    if (!userRequestFind.Users.some(userId => userId.equals(user._id))) {
      userRequestFind.Users.push(user._id);
      await userRequestFind.save();
  } else {
      const userIndex = userRequestFind.Users.findIndex(userId => userId.equals(user._id));
      if (userIndex !== -1) {
          userRequestFind.Users.splice(userIndex, 1);
          await userRequestFind.save();
          return 5;
      }
  }
    return userRequestFind;
  }
  const userRequest = new UserRequest({
      Users: [user._id],
      Category: category._id
  });
  await userRequest.save();
  return userRequest;
}
static listUserRequest = async(categoryId) =>{
  console.log(categoryId);
  const category = await Category.findById(categoryId);
  if (!category) {
    console.log('Not found category');
    return 1;
  }
  const userRequest = await UserRequest.findOne({Category: category});
  if(userRequest==null) {
    return 2;
  }
  if(userRequest.Users==null){
    console.log('This category do not have any users request');
    return 2;
  }
  return userRequest;
}






//////////////////////////////// Interaction with blog //////////////////////////////////////////////////////////////////
static likeBlog = async (authenticatedUser, blogId) => {
  const blog = await Blog.findById(blogId);
  const user = await UserModel.findById(authenticatedUser._id);
  
  if (!blog || !user) {
    return null;
  }
  const isLikedBefore = blog.listUserLikes.some(likedUser => likedUser.equals(user._id));
  if (!isLikedBefore) {
    blog.listUserLikes.push(user);
    blog.likes += 1;
    blog.isLiked = true;
  } else {
    blog.listUserLikes = blog.listUserLikes.filter(likedUser => !likedUser.equals(user._id));
    blog.isLiked = false;
    blog.likes -= 1;
  }
  await blog.save();

  return blog;
}
static saveBlog = async (authenticatedUser, blogId) => {
  const blog = await Blog.findById(blogId);
  const user = await UserModel.findById(authenticatedUser._id);
  
  if (!blog || !user) {
    return null;
  }

  const isSavedBefore = blog.savedBy.some(savedUser => savedUser.equals(user._id));
  if (!isSavedBefore) {
    blog.savedBy.push(user);
    blog.isSave = true;
  } else {
    blog.savedBy = blog.savedBy.filter(savedUser => !savedUser.equals(user._id));
    blog.isSave = false;
  }
  await blog.save();

  return blog;
}
static listBlogSaveByUser(authenticatedUser) {
  return Blog.find({savedBy: authenticatedUser._id}).select('savedBy')
  .populate('savedBy');;
}


//////////////////////////////// Interaction with User //////////////////////////////////////////////////////////////////
static followUser = async (user_id, authenticatedUser) => {
  try {
    const userToFollow = await usermodel.findById(user_id);
    const user = await UserModel.findById(user_id);
    const userAuthentication = await UserModel.findById(authenticatedUser._id)
    if (!userToFollow) {
        return 1;
    }
      let follow = await Follow.findOne({ user: authenticatedUser._id });
      let following = await Follow.findOne({ user: user_id});
      if(!following)
      {
        following = new Follow({ 
          user: user_id, 
          follower: [],
          following: [] 
      });
      }
      if (!follow) {          
        follow = new Follow({ 
              user: authenticatedUser._id, 
              follower: [],
              following: [] 
          });
      }
      const alreadyFollowing = follow.following.some(userId => userId.equals(userToFollow._id));
      if (alreadyFollowing) {
          follow.following.pull(user_id);
          following.follower.pull(authenticatedUser._id)
          user.totalFollower -= 1;
          userAuthentication.totalFollowing-=1;
          await user.save();
          await userAuthentication.save();
          await following.save();
          await follow.save();
          return 2;
      } else {
          follow.following.push(user_id);
          following.follower.push(authenticatedUser._id)
          user.totalFollower += 1;
          userAuthentication.totalFollowing +=1;
          await user.save();
          await userAuthentication.save();
          await follow.save();
          await following.save();
          return follow;
      }
  } catch (error) {
      throw new Error(error.message);
  }
}
static isUserFollowedByAuthenticatedUser = async (user_id, authenticatedUser_id) => {
  try {
      const follow = await Follow.findOne({ user: authenticatedUser_id }); 
      if (!follow) {
          return false;
      }
      const isFollowed = follow.following.some(userId => userId.equals(user_id));
      return isFollowed;
  } catch (error) {
      throw new Error(error.message);
  }
}
static listUserFollower = async (user_id, authenticatedUser) => {
  try {
      const follow = await Follow.findOne({ user: user_id });
      if (!follow) {
          return 1;
      }
      const followers = follow.follower;
      for (let i = 0; i < followers.length; i++) {
          const followerId = followers[i];
          const user = await usermodel.findById(followerId);
          if (!user) {
              throw new Error(`User with id ${followerId} not found`);
          }
          const isFollowed = await this.isUserFollowedByAuthenticatedUser(user._id, authenticatedUser._id);
          user.isfollow = isFollowed;
      }
      return followers;
  } catch (error) {
      throw new Error(error.message);
  }
}
static listUserFollowing = async (user_id, authenticatedUser) => {
  try {
      const follow = await Follow.findOne({ user: user_id });
      if (!follow) {
          return 1;
      }
      const followers = follow.following;
      for (let i = 0; i < followers.length; i++) {
          const followerId = followers[i];
          const user = await usermodel.findById(followerId);
          if (!user) {
              throw new Error(`User with id ${followerId} not found`);
          }
          const isFollowed = await this.isUserFollowedByAuthenticatedUser(user._id, authenticatedUser._id);
          user.isfollow = isFollowed;
      }
      return followers;
  } catch (error) {
      throw new Error(error.message);
  }
}
static getWallUser = async (userId, authenticatedUser)=>{
  const user = await UserModel.findById(userId);  
  if(!user)
  {
    return 1;
  }
  user.isfollow =  await this.isUserFollowedByAuthenticatedUser(user._id, authenticatedUser._id);
  return user;
}
}
module.exports = UserService