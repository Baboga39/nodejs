const Notification = require('../models/notificationModel')
const Blog = require('../models/Blog/blogModel')
const User = require('../models/usermodel')

class NotificationService{
    static notifyComment = async (blogId, userAuthentication)=>{
        const blog  = await Blog.findById(blogId)
        const notification = new Notification({
            sender: userAuthentication._id,
            target: blogId,
            type: 'Comment',
            recipient: blog.user._id,
        });
        return notification.save();
    }
    static notifyFollow = async (userId, userAuthentication)=>{
        const user = await User.findById(userId);
        const userAuthenticated = await User.findById(userAuthentication);
        const notification = new Notification({
            sender: userAuthenticated._id,
            target: null,
            type: 'Follow',
            recipient: user._id,
        });
        return notification.save();
    }
    static notifyLike = async (blogId, userId) =>{
        const blog = await Blog.findById(blogId);
        const user = await User.findById(userId);
        const notification = new Notification({
            sender: user._id,
            target: blogId,
            type: 'Like',
            recipient: blog.user._id,
        });
        return notification.save();
    }
    static notifyInvite = async (userIds, userAuthentication) => {
        const userAuthenticated = await User.findById(userAuthentication._id);
        const notifications = userIds.map(async (userId) => {
            const user = await User.findById(userId);
            return new Notification({
                sender: userAuthenticated._id,
                target: null,
                type: 'Invite',
                recipient: user._id,
            }).save();
        });
    
        return Promise.all(notifications);
    }
    static listNotifyByUser = async (userId) =>{
        const user = await User.findById(userId);
        if(!user)  return 1;
        const notification = await Notification.find({recipient: user._id});
        return notification;
    }
    static checkIsRead = async (notifyId) =>{
        const notification = await Notification.findById(notifyId);
        if(!notification) return null;
        notification.isRead = true;
        await notification.save();
        return notification;
    }
}

module.exports = NotificationService;