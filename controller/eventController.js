import slugify from "slugify";
import Events from "../model/eventModel.js";
import fs from "fs";

export const createEvent = async (req, res) => {
  try {
    const { name, description, location, eventDate, eventTime, published } =
      req.fields;
    const { image } = req.files;
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
      case !published.trim():
        return res.json({ error: "Event Published is required" });
      case image && image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }
    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    const event = new Events({
      ...req.fields,
      eventDate: parsedEventDate,
      slug: slugify(name),
    });

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
    const { name, description, location, eventDate, eventTime, published } =
      req.fields;
    const { image } = req.files;
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
      case !published.trim():
        return res.json({ error: "Event Published is required" });
      case image && image.size > 1000000:
        return res.json({ error: "Image size should not be more than 1MB" });
    }

    const parsedEventDate = new Date(eventDate);
    if (isNaN(parsedEventDate)) {
      return res.json({ error: "Invalid Event Date" });
    }

    const event = await Events.findByIdAndUpdate(req.params.eventId, {
      ...req.fields,
      eventDate: parsedEventDate,
      slug: slugify(name),
    });

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
