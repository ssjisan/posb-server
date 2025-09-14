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

const uploadImageToCloudinary = async (imageBuffer, name) => {
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

const deleteFromCloudinary = async (public_id) => {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (err) {
    console.error("Error deleting image from Cloudinary:", err);
  }
};

// ********************************************** The Cloudinary upload function end here ********************************************** //

// ********************************************** The Create Event Function Start Here ********************************************** //

export const eventGeneration = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const {
      name,
      location,
      details,
      eventDate,
      eventTime,
      registrationRequired,
      registrationFees,
      registrationStartDate,
      registrationEndDate,
      paymentStartDate,
      paymentEndDate,
      coverPhotoRemoved,
    } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Event name is required" });
    }
    if (!eventDate || eventDate.trim() === "") {
      return res.status(400).json({ message: "Event date is required" });
    }
    if (!eventTime || eventTime.trim() === "") {
      return res.status(400).json({ message: "Event time is required" });
    }

    let event = null;

    if (eventId) {
      // ===== UPDATE =====
      event = await Events.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Update fields
      event.name = name;
      event.location = location;
      event.details = details || "";
      event.eventDate = eventDate;
      event.eventTime = eventTime;
      event.registrationRequired = registrationRequired;
      event.registrationFees = registrationFees || "";
      event.registrationStartDate = registrationStartDate || null;
      event.registrationEndDate = registrationEndDate || null;
      event.paymentStartDate = paymentStartDate || null;
      event.paymentEndDate = paymentEndDate || null;

      // Handle cover photo removal
      if (coverPhotoRemoved && event.coverPhoto) {
        await deleteFromCloudinary(event.coverPhoto.public_id);
        event.coverPhoto = null;
      }

      // Handle new image upload
      if (req.file) {
        // Delete old one if exists
        if (event.coverPhoto) {
          await deleteFromCloudinary(event.coverPhoto.public_id);
        }
        const uploadedImage = await uploadImageToCloudinary(req.file.buffer);
        event.coverPhoto = {
          url: uploadedImage.url,
          public_id: uploadedImage.public_id,
        };
      }

      await event.save();
      return res
        .status(200)
        .json({ message: "Event updated successfully", event });
    } else {
      // ===== CREATE =====
      let coverPhotoData = null;
      if (req.file) {
        const uploadedImage = await uploadImageToCloudinary(req.file.buffer);
        coverPhotoData = {
          url: uploadedImage.url,
          public_id: uploadedImage.public_id,
        };
      }

      event = new Events({
        name,
        location,
        details,
        eventDate,
        eventTime,
        registrationRequired,
        registrationFees,
        registrationStartDate,
        registrationEndDate,
        paymentStartDate,
        paymentEndDate,
        coverPhoto: coverPhotoData,
      });

      await event.save();
      return res
        .status(201)
        .json({ message: "Event created successfully", event });
    }
  } catch (error) {
    console.error("Error creating/updating event:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
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
    if (event.coverPhoto && event.coverPhoto.public_id) {
      try {
        const publicId = event.coverPhoto.public_id;
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
    event.registrationStartDate =
      registrationStartDate || event.registrationStartDate;
    event.registrationEndDate =
      registrationEndDate || event.registrationEndDate;

    // Handle cover photo update if a new file is provided
    if (coverPhoto) {
      // Remove old cover photo from Cloudinary (if exists)
      if (event.coverPhoto && event.coverPhoto.length > 0) {
        const publicId = event.coverPhoto[0].public_id;
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error("Error deleting old cover photo from Cloudinary:", err);
          return res
            .status(500)
            .json({ error: "Failed to delete old cover photo" });
        }
      }

      // Upload new cover photo to Cloudinary
      try {
        const uploadedImage = await uploadImageToCloudinary(coverPhoto.buffer);
        event.coverPhoto = [
          { url: uploadedImage.url, public_id: uploadedImage.public_id },
        ];
      } catch (err) {
        console.error("Error uploading new cover photo to Cloudinary:", err);
        return res
          .status(500)
          .json({ error: "Failed to upload new cover photo" });
      }
    }

    // Save the updated event or course
    await event.save();

    // Return the updated event or course in the response
    res.status(200).json(event);
  } catch (err) {
    console.error("Error updating event or course:", err);
    res.status(500).json({
      message: "An error occurred while updating the event or course",
    });
  }
};

// ********************************************** For Update Event Start Here ********************************************** //

export const getLatestEvent = async (req, res) => {
  try {
    const currentDate = new Date();

    // Find the nearest event after today
    const nearestEvent = await Events.findOne({
      eventDate: { $gte: currentDate },
    })
      .sort({ eventDate: 1 }) // Sort by nearest date (ascending)
      .exec();

    if (!nearestEvent) {
      // No future events found
      return res.status(404).json({ message: "No upcoming events found" });
    }

    // Respond with the nearest event
    res.status(200).json({ event: nearestEvent });
  } catch (err) {
    console.error("Error fetching the latest event:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getEventsByStatus = async (req, res) => {
  const currentDate = new Date();
  const startOfToday = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    currentDate.getDate()
  ); // Start of the current day (00:00:00)

  const { status } = req.query; // Extract status from query parameters

  try {
    // Build query based on status
    let query = {};
    if (status === "archived") {
      query = { endDate: { $lt: startOfToday } }; // Events before today
    } else if (status === "running") {
      query = { endDate: { $gte: startOfToday } }; // Events today or later
    }

    // Fetch data from the database
    const events = await Events.find(query).sort({ endDate: 1 }); // Sort by endDate
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getActiveEvents = async (req, res) => {
  try {
    const currentDate = new Date(); // Current date and time

    // Query to find events where eventDate has not passed yet
    const query = { eventDate: { $gte: currentDate } };

    // Fetch active events, sorted by sequence (ascending) and eventDate (ascending)
    const activeEvents = await Events.find(query).sort({
      sequence: 1,
      eventDate: 1,
    });

    // Respond with the active events
    res.status(200).json(activeEvents);
  } catch (error) {
    console.error("Error fetching active events:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getEventList = async (req, res) => {
  try {
    // Fetch only `_id` and `name` for all events
    const events = await Events.find({}, "_id name").sort({ createdAt: -1 });

    res.status(200).json(events);
  } catch (err) {
    console.error("Error fetching event list:", err);
    res.status(500).json({ message: "Failed to fetch event list." });
  }
};
