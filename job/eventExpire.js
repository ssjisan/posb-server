import cron from 'node-cron';
import Events from '../model/eventModel.js';

// Schedule the job to run daily at midnight
cron.schedule('0 0 * * *', async () => {
  try {
    const currentDate = new Date();
    await Events.updateMany(
      { eventDate: { $lt: currentDate } },
      { $set: { eventExpired: true } }
    );
    console.log("Updated expired events successfully.");
  } catch (err) {
    console.error("Error updating expired events:", err);
  }
});
