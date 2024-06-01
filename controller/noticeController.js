import Notice from "../model/noticeModel.js";

export const createNotice = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user._id; // Assuming req.user contains the logged-in user's data

    if (!title) {
      return res.status(400).json({ error: "Title is required" });
    }

    const newNotice = new Notice({
      title,
      description,
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
