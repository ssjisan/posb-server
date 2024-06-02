import Notice from "../model/noticeModel.js";

export const createNotice = async (req, res) => {
  try {
    const { title, description, link } = req.body;
    const userId = req.user._id; // Assuming req.user contains the logged-in user's data

    switch (true) {
      case !title.trim():
        return res.json({ error: "Title is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !link.trim():
        return res.json({ error: "Link is required" });
    }

    const newNotice = new Notice({
      title,
      description,
      link,
      author: userId,
    });

    await newNotice.save();
    res.json(newNotice);
  } catch (error) {
    console.error("Error creating notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const listOfNotice = async (req, res) => {
  try {
    const notices = await Notice.find().populate("author", "name email"); // Populate author field with user details
    res.json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const readNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const notice = await Notice.findById(noticeId).populate(
      "author",
      "name email"
    );

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    res.json(notice);
  } catch (error) {
    console.error("Error fetching notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const removeNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;

    const notice = await Notice.findByIdAndDelete(noticeId);

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateNotice = async (req, res) => {
  try {
    const { noticeId } = req.params;
    const { title, description, link } = req.body;
    const userId = req.user._id; // Assuming req.user contains the logged-in user's data

    // Validation
    switch (true) {
      case !title.trim():
        return res.json({ error: "Title is required" });
      case !description.trim():
        return res.json({ error: "Description is required" });
      case !link.trim():
        return res.json({ error: "Link is required" });
    }

    const notice = await Notice.findById(noticeId);

    if (!notice) {
      return res.status(404).json({ error: "Notice not found" });
    }

    if (notice.author.toString() !== userId.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    notice.title = title;
    notice.description = description;
    notice.link = link;

    await notice.save();
    res.json(notice);
  } catch (error) {
    console.error("Error updating notice:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
