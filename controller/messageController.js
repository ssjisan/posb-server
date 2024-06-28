import Message from "../model/messageModel.js"; // Import your message model

export const messageUpload = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: "Name and email are required fields" });
    }

    // Create a new message document
    const newMessage = new Message({
      name,
      email,
      subject,
      message,
    });

    // Save the message to the database
    await newMessage.save();

    // Send the created message as a response
    res.status(201).json(newMessage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error uploading message" });
  }
};

export const listAllMessages = async (req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }); // Sort by createdAt descending
      res.status(200).json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ error: "Error fetching messages" });
    }
  };

  export const markAllMessagesRead = async (req, res) => {
    try {
      // Update all messages to set 'read' field to true
      await Message.updateMany({}, { $set: { read: true } });
  
      res.status(200).json({ message: "All messages marked as read." });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark all messages as read." });
    }
  };
  
  export const markMessageAsRead = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Update the specific message to set 'read' field to true
      const updatedMessage = await Message.findByIdAndUpdate(id, { $set: { read: true } }, { new: true });
  
      if (!updatedMessage) {
        return res.status(404).json({ error: "Message not found" });
      }
  
      res.status(200).json(updatedMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to mark the message as read." });
    }
  };