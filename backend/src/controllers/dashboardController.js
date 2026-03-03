const UserDashboard = require('../models/UserDashboard');
const AdminNote = require('../models/AdminNote');
const Timetable = require('../models/Timetable');
const ImportantNote = require('../models/ImportantNote');
const MCQTest = require('../models/MCQTest');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const userSemester = req.user.semester;
    
    console.log(`Dashboard request for user: ${req.user.email}, semester: ${userSemester}`);
    
    let dashboard = await UserDashboard.findOne({ userId }).populate('userId', 'email semester');
    
    if (!dashboard) {
      // Create dashboard if it doesn't exist
      dashboard = new UserDashboard({
        userId,
        personalizedContent: {
          welcomeMessage: `Welcome, ${req.user.email.split('@')[0]}!`,
          learningGoals: [`Master ${req.user.semester} semester concepts`]
        }
      });
      await dashboard.save();
      dashboard = await UserDashboard.findOne({ userId }).populate('userId', 'email semester');
    }

    // Fetch semester-specific content with flexible matching
    const semesterNumber = userSemester?.replace(/[^0-9]/g, ''); // Extract number only
    const semesterQuery = {
      $or: [
        { semester: userSemester }, // Exact match
        { semester: semesterNumber }, // Number only
        { semester: `${semesterNumber}th` }, // With 'th'
        { semester: `${semesterNumber}nd` }, // With 'nd'
        { semester: `${semesterNumber}rd` }, // With 'rd'
        { semester: `${semesterNumber}st` } // With 'st'
      ]
    };
    
    console.log('Semester query:', JSON.stringify(semesterQuery, null, 2));
    
    const [notes, timetables, importantNotes, mcqTests] = await Promise.all([
      AdminNote.find(semesterQuery).populate('uploadedBy', 'name').sort({ createdAt: -1 }).limit(5),
      Timetable.find(semesterQuery).populate('createdBy', 'name').sort({ createdAt: -1 }).limit(3),
      ImportantNote.find(semesterQuery).populate('createdBy', 'name').sort({ createdAt: -1 }).limit(5),
      MCQTest.find(semesterQuery).sort({ createdAt: -1 }).limit(5)
    ]);

    console.log(`Found content: notes=${notes.length}, timetables=${timetables.length}, importantNotes=${importantNotes.length}, mcqTests=${mcqTests.length}`);

    // Add semester content to dashboard response
    const dashboardWithContent = {
      ...dashboard.toObject(),
      semesterContent: {
        notes,
        timetables,
        importantNotes,
        mcqTests
      }
    };

    res.json(dashboardWithContent);
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({ error: 'Failed to load dashboard' });
  }
};

const updateDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, increment = 1 } = req.body;
    
    const updateField = {};
    switch (type) {
      case 'document':
        updateField['stats.documentsUploaded'] = increment;
        break;
      case 'chat':
        updateField['stats.chatSessions'] = increment;
        break;
      case 'quiz':
        updateField['stats.quizzesCompleted'] = increment;
        break;
      case 'plan':
        updateField['stats.studyPlansCreated'] = increment;
        break;
      default:
        return res.status(400).json({ error: 'Invalid stat type' });
    }

    const dashboard = await UserDashboard.findOneAndUpdate(
      { userId },
      { $inc: updateField },
      { new: true }
    );

    res.json(dashboard);
  } catch (error) {
    console.error('Update dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to update dashboard stats' });
  }
};

const addActivity = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type, title, description } = req.body;

    const dashboard = await UserDashboard.findOneAndUpdate(
      { userId },
      { 
        $push: { 
          'recentActivity': { 
            $each: [{ type, title, description }], 
            $position: 0,
            $slice: 10 // Keep only last 10 activities
          } 
        } 
      },
      { new: true }
    );

    res.json(dashboard);
  } catch (error) {
    console.error('Add activity error:', error);
    res.status(500).json({ error: 'Failed to add activity' });
  }
};

module.exports = {
  getDashboard,
  updateDashboardStats,
  addActivity
};