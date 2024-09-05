import slugify from "slugify";
import Events from "../model/eventModel.js";
import fs from "fs";

export const createEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      eventDate,
      eventTime,
      registrationLink,
    } = req.fields;
    const { image } = req.files;

    // Validation checks
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !location.trim():
        return res.json({ error: "Location is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !eventDate.trim():
        return res.json({ error: "Event Date is required" });
      case !eventTime.trim():
        return res.json({ error: "Event Time is required" });
      case !image:
        return res.json({ error: "Event Cover is required" });
      case image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    // Ensure registrationLink defaults to an empty string if not provided
    const event = new Events({
      name,
      description,
      location,
      eventDate: parsedEventDate,
      eventTime,
      registrationLink: registrationLink ? registrationLink.trim() : "", // Default to empty string
      linkExpire: false, // Always set to false initially
      slug: slugify(name),
    });

    // Handle image upload
    if (image) {
      event.image.data = fs.readFileSync(image.path);
      event.image.contentType = image.type;
    }

    await event.save();
    res.json(event);

  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};


export const updateEvent = async (req, res) => {
  try {
    const { name, description, location, eventDate, eventTime, registrationLink } = req.fields;
    const { image } = req.files;

    // Fetch the existing event from the database
    const event = await Events.findById(req.params.eventId);

    if (!event) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Validation checks
    switch (true) {
      case !name.trim():
        return res.json({ error: "Name is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !location.trim():
        return res.json({ error: "Location is required" });
      case !eventDate.trim():
        return res.json({ error: "Event Date is required" });
      case !eventTime.trim():
        return res.json({ error: "Event Time is required" });
      case !image && !event.image.data:
        return res.json({ error: "Event Cover is required" });
      case image && image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    // Check if the eventDate has been changed and update linkExpire accordingly
    if (parsedEventDate > new Date()) {
      // If eventDate is in the future, set linkExpire to false
      event.linkExpire = false;
    }

    // Update event fields
    event.name = name;
    event.description = description;
    event.location = location;
    event.eventDate = parsedEventDate;
    event.eventTime = eventTime;
    event.registrationLink = registrationLink ? registrationLink.trim() : ""; // Default to empty string
    event.slug = slugify(name);

    // Handle image update
    if (image) {
      event.image.data = fs.readFileSync(image.path);
      event.image.contentType = image.type;
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.log(err);
    res.status(400).json(err.message);
  }
};

export const listEvents = async (req, res) => {
  try {
    const event = await Events.find({})
      .select("-image")
      .limit(12)
      .sort({ createdAt: -1 });
    res.json(event);
  } catch (err) {
    console.log(err.message);
  }
};

export const imageOfEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.eventId).select("image");
    if (event.image.data) {
      res.set("Content-Type", event.image.contentType);
      return res.send(event.image.data);
    }
  } catch (err) {
    console.log(err);
  }
};

export const readEvent = async (req, res) => {
  try {
    const event = await Events.findOne({ slug: req.params.slug }).select(
      "-image"
    );
    res.json(event);
  } catch (err) {
    console.log(err);
  }
};
export const removeEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.eventId);
    res.json(event);
  } catch (err) {
    console.log(err);
  }
};
