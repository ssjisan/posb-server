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
      linkExpireDate,
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

    // Parse eventDate and validate
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    // Determine event expiration
    const isExpired =
      new Date(parsedEventDate).setDate(parsedEventDate.getDate() + 1) <=
      new Date();
    // This sets the expiration to start at the end of the eventDate

    // Parse linkExpireDate if provided and ensure it's valid
    let parsedLinkExpireDate = null;
    if (registrationLink && linkExpireDate) {
      parsedLinkExpireDate = new Date(linkExpireDate);
      if (isNaN(parsedLinkExpireDate)) {
        return res.json({ error: "Invalid Link Expiry Date" });
      }
    }

    // Ensure registrationLink defaults to an empty string if not provided
    const event = new Events({
      name,
      description,
      location,
      eventDate: parsedEventDate,
      eventTime,
      registrationLink: registrationLink ? registrationLink.trim() : "",
      linkExpireDate: parsedLinkExpireDate, // Set normalized linkExpireDate
      slug: slugify(name),
      eventExpired: isExpired, // Set eventExpired status
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
    res.status(400).json({ error: err.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const {
      name,
      description,
      location,
      eventDate,
      eventTime,
      registrationLink,
      linkExpireDate,
    } = req.fields;
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
      case !location.trim():
        return res.json({ error: "Location is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !eventDate.trim():
        return res.json({ error: "Event Date is required" });
      case !eventTime.trim():
        return res.json({ error: "Event Time is required" });
      case !image && !event.image.data:
        return res.json({ error: "Event Cover is required" });
      case image && image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }

    // Parse and validate eventDate
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    // Determine event expiration (expiration starts at the end of the event date)
    const isExpired =
      new Date(parsedEventDate).setDate(parsedEventDate.getDate() + 1) <=
      new Date();

    // Parse linkExpireDate if provided and ensure it's valid
    let parsedLinkExpireDate = null;
    if (registrationLink && linkExpireDate) {
      parsedLinkExpireDate = new Date(linkExpireDate);
      if (isNaN(parsedLinkExpireDate)) {
        return res.json({ error: "Invalid Link Expiry Date" });
      }
    }

    // Update event fields
    event.name = name;
    event.description = description;
    event.location = location;
    event.eventDate = parsedEventDate;
    event.eventTime = eventTime;
    event.registrationLink = registrationLink ? registrationLink.trim() : "";
    event.linkExpireDate = parsedLinkExpireDate; // Use normalized linkExpireDate
    event.slug = slugify(name);
    event.eventExpired = isExpired; // Update eventExpired status

    // Handle image update
    if (image) {
      event.image.data = fs.readFileSync(image.path);
      event.image.contentType = image.type;
    }

    await event.save();
    res.json(event);
  } catch (err) {
    console.log(err);
    res.status(400).json({ error: err.message });
  }
};
export const listEvents = async (req, res) => {
  try {
    const events = await Events.find({})
      .select("-image")
      .sort({ eventExpired: 1, createdAt: -1 }) // Sort by eventExpired status first, then by creation date
      .limit(12);
    res.json(events);
  } catch (err) {
    console.log(err.message);
  }
};

export const activeEvents = async (req, res) => {
  try {
    const events = await Events.find({ eventExpired: false })
      .select("-image")
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .limit(12); // Adjust the limit as needed

    res.json(events);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Failed to fetch active events" });
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
