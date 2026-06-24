import User from '../models/user.model';

const suggestFriend = async () => {
    const { username, email, userId } = req.body;

    const user = await User.findById(userId);

    
}