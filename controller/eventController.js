import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import Events from "../model/eventModel.js";

dotenv.config();

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    "Cloudinary configuration is missing. Check your environment variables."
  );
}

// ********************************************** The Cloudinary upload function start here ********************************************** //

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

const uploadImageToCloudinary = async (imageBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "posb/events", // Specify the folder name here
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
          });
        }
      }
    );
    stream.end(imageBuffer);
  });
};

// ********************************************** The Cloudinary upload function end here ********************************************** //

// ********************************************** The Create Event Function Start Here ********************************************** //

export const createEvent = async (req, res) => {
  try {
    let {
      name,
      details,
      eventDate,
      eventTime,
      location,
      registrationLink,
      registrationStartDate,
      registrationEndDate,
    } = req.body;
    const coverPhoto = req.file;

    // Validate required fields with improved checks
    if (!name || !name.trim())
      return res.status(400).json({ error: "Title is required" });
    if (!location || !location.trim())
      return res.status(400).json({ error: "Location is required" });
    if (!eventDate || !eventDate.trim())
      return res.status(400).json({ error: "Event Date is required" });
    if (!eventTime || !eventTime.trim())
      return res.status(400).json({ error: "Event Time is required" });
    if (!details || !details.trim())
      return res
        .status(400)
        .json({ error: "Details info about event or course is required" });

    // Validate if coverPhoto is provided
    if (!coverPhoto)
      return res.status(400).json({ error: "Cover photo is required" });
    // Upload the Event cover to Cloudinary if provided
    let uploadedImage = null;
    if (coverPhoto) {
      try {
        uploadedImage = await uploadImageToCloudinary(coverPhoto.buffer);
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return res
          .status(500)
          .json({ error: "Failed to upload profile photo" });
      }
    }

    // Create a new profile document based on the validated data
    const newEvent = new Events({
      coverPhoto: uploadedImage
        ? [{ url: uploadedImage.url, public_id: uploadedImage.public_id }]
        : [],
      name,
      location,
      eventDate,
      eventTime,
      details,
      registrationLink: registrationLink ? registrationLink.trim() : "",
      registrationStartDate, // Will be undefined if not provided
      registrationEndDate, // Will be undefined if not provided
    });

    // Save the new event or course document to the database
    await newEvent.save();

    // Respond with the created profile
    res.status(201).json(newEvent);
  } catch (err) {
    console.error("Error creating event:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ********************************************** The Create Course Event Function End Here ********************************************** //

// ********************************************** Fetching events with filters and pagination Start Here ********************************************** //

export const getFilteredEvents = async (req, res) => {
  try {
    // Extract query parameters
    const limit = parseInt(req.query.limit) || 5; // Default limit to 5
    const skip = parseInt(req.query.skip) || 0; // Default skip to 0
    const { status } = req.query; // Extract status (running, archived)

    const currentDate = new Date();
    let query = {}; // Default query fetches all events

    // Build query based on status
    if (status === "archived") {
      query = { eventDate: { $lt: currentDate } }; // Archived events
    } else if (status === "running") {
      query = { eventDate: { $gte: currentDate } }; // Running events
    }

    // Fetch filtered and paginated courses/events
    const events = await Events.find(query)
      .sort({ sequence: 1, createdAt: -1 }) // Sort by sequence first, then creation date
      .skip(skip)
      .limit(limit);

    // Check if there are more courses/events left to load
    const totalEvents = await Events.countDocuments(query); // Count documents matching the query
    const hasMore = skip + limit < totalEvents;

    // Respond with filtered and paginated data
    res.status(200).json({ events, hasMore });
  } catch (err) {
    console.error("Error fetching filtered events:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ********************************************** Fetching events with filters and pagination End Here ********************************************** //

// ********************************************** Update Sequence Start Here ********************************************** //

export const updateEventsSequence = async (req, res) => {
  try {
    const { reorderedEvent } = req.body; // Array of resources with updated sequences

    const bulkOps = reorderedEvent.map((resource, index) => ({
      updateOne: {
        filter: { _id: resource._id },
        update: { $set: { sequence: index + 1 } }, // Update the sequence field
      },
    }));

    await Events.bulkWrite(bulkOps);

    res.status(200).json({ message: "Event sequence updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error updating event sequence" });
  }
};

// ********************************************** Update Sequence Start Here ********************************************** //

// ********************************************** For Delete Event Start Here ********************************************** //

export const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Events.findByIdAndDelete(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Delete profile photo from Cloudinary
    if (event.coverPhoto && event.coverPhoto.length > 0) {
      try {
        const publicId = event.coverPhoto[0].public_id;
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        res.json({ message: error.message });
      }
    }
    res.status(200).json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ********************************************** For Delete Event Start Here ********************************************** //

// ********************************************** For Read Event Start Here ********************************************** //

export const readEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ********************************************** For Read Event End Here ********************************************** //


// ********************************************** For Update Event Start Here ********************************************** //

export const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params; // Assuming the ID parameter is 'eventId'
    let {
      name,
      details,
      eventDate,
      eventTime,
      location,
      registrationLink,
      registrationStartDate,
      registrationEndDate,
    } = req.body;
    const coverPhoto = req.file;

    // Find the event or course in the database
    const event = await Events.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event or course not found" });
    }

    // Update fields if provided in the request body
    event.name = name || event.name;
    event.details = details || event.details;
    event.eventDate = eventDate || event.eventDate;
    event.eventTime = eventTime || event.eventTime;
    event.eventTime = eventTime || event.eventTime;
    event.registrationLink = registrationLink || event.registrationLink;
    event.location = location || event.location;
    event.registrationStartDate = registrationStartDate || event.registrationStartDate;
    event.registrationEndDate = registrationEndDate || event.registrationEndDate;

    // Handle cover photo update if a new file is provided
    if (coverPhoto) {
      // Remove old cover photo from Cloudinary (if exists)
      if (event.coverPhoto && event.coverPhoto.length > 0) {
        const publicId = event.coverPhoto[0].public_id;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting old cover photo from Cloudinary:", err);
          return res.status(500).json({ error: "Failed to delete old cover photo" });
        }
      }

      // Upload new cover photo to Cloudinary
      try {
        const uploadedImage = await uploadImageToCloudinary(coverPhoto.buffer);
        event.coverPhoto = [{ url: uploadedImage.url, public_id: uploadedImage.public_id }];
      } catch (err) {
        console.error("Error uploading new cover photo to Cloudinary:", err);
        return res.status(500).json({ error: "Failed to upload new cover photo" });
      }
    }

    // Save the updated event or course
    await event.save();

    // Return the updated event or course in the response
    res.status(200).json(event);
  } catch (err) {
    console.error("Error updating event or course:", err);
    res.status(500).json({ message: "An error occurred while updating the event or course" });
  }
};

// ********************************************** For Update Event Start Here ********************************************** //
