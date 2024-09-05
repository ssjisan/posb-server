import cron from 'node-cron';
import Events from '../model/eventModel.js'; // Adjust path as necessary

// Schedule the job to run every 5 minutes
cron.schedule('0 0 * * *', async () => {
  try {
    const now = new Date();
    // Calculate the date 21 days ago from now
    const expireDate = new Date(now);
    expireDate.setDate(expireDate.getDate() - 21);

    // Find events where the registration link should expire
    await Events.updateMany(
      { 
        eventDate: { $lte: now }, 
        linkExpire: false 
      },
      { $set: { linkExpire: true } }
    );
    console.log('Expired event links updated successfully');
  } catch (error) {
    console.error('Error updating expired event links:', error);
  }
});
