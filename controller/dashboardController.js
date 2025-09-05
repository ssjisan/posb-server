// controllers/dashboardController.js
import Notice from "../model/noticeModel.js";
import Albums from "../model/albumModel.js";
import Members from "../model/memberModel.js";
import Events from "../model/eventModel.js";

export const getDashboardData = async (req, res) => {
  try {
    // Use Promise.all for better performance (runs queries in parallel)
    const [noticeCount, albumCount, memberCount, eventCount] = await Promise.all([
      Notice.countDocuments(),
      Albums.countDocuments(),
      Members.countDocuments(),
      Events.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      data: {
        notices: noticeCount,
        albums: albumCount,
        members: memberCount,
        events: eventCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching dashboard data",
      error: error.message,
    });
  }
};
