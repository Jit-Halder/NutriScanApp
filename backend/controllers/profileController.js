const { UserProfile, User } = require('../models');

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = await UserProfile.findOne({ where: { userId: req.user.id } });
        
        const profileData = profile ? profile.toJSON() : {};
        profileData.name = user.name;
        
        res.json(profileData);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { 
            phone, age, gender, healthConditions, 
            dietaryPreferences, allergies, weight, height, fitnessGoals 
        } = req.body;

        let profile = await UserProfile.findOne({ where: { userId: req.user.id } });

        if (!profile) {
            // Create if it doesn't exist (though it should be created on registration)
            profile = await UserProfile.create({
                userId: req.user.id,
                phone, age, gender, healthConditions, dietaryPreferences, allergies, weight, height, fitnessGoals
            });
            return res.status(201).json({ message: 'Profile created successfully', profile });
        }

        // Update existing profile
        await profile.update({
            phone: phone !== undefined ? phone : profile.phone,
            age: age !== undefined ? age : profile.age,
            gender: gender !== undefined ? gender : profile.gender,
            healthConditions: healthConditions !== undefined ? healthConditions : profile.healthConditions,
            dietaryPreferences: dietaryPreferences !== undefined ? dietaryPreferences : profile.dietaryPreferences,
            allergies: allergies !== undefined ? allergies : profile.allergies,
            weight: weight !== undefined ? weight : profile.weight,
            height: height !== undefined ? height : profile.height,
            fitnessGoals: fitnessGoals !== undefined ? fitnessGoals : profile.fitnessGoals
        });

        res.json({ message: 'Profile updated successfully', profile });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
