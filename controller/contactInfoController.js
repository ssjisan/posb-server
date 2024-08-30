import ContactInfo from "../model/contactModal.js";

// Get Contact Info
export const getContactInfo = async (req, res) => {
    try {
      const contactInfo = await ContactInfo.findOne().exec();
      if (!contactInfo) {
        return res.status(404).json({ error: "No contact info found" });
      }
      res.json(contactInfo); // Ensure this is returning { phoneNumber, whatsapp }
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  };
  

// Create or Update Contact Info
export const UpdateContactInfo = async (req, res) => {
    try {
      const { phoneNumber, whatsapp } = req.body;
  
      // Validation
      if (!phoneNumber || !whatsapp) {
        return res.status(400).json({ error: "Phone number and WhatsApp number are required" });
      }
  
      // Check if contact info already exists
      const existingContact = await ContactInfo.findOne().exec();
      if (existingContact) {
        // Update existing contact info
        existingContact.phoneNumber = phoneNumber;
        existingContact.whatsapp = whatsapp;
        await existingContact.save();
        res.json(existingContact);
      } else {
        // Create new contact info
        const newContact = new ContactInfo({ phoneNumber, whatsapp });
        await newContact.save();
        res.json(newContact);
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ error: err.message });
    }
  };
  