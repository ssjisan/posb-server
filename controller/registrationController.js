import Registration from "../model/registrationModel.js";
import {sendEmail} from "../middlewares/sendEmail.js";
export const createRegistration = async (req, res) => {
  try {
    const { name, email, phone, designation, workplace, course } = req.body;

    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const newRegistration = new Registration({
      name,
      email,
      phone,
      designation,
      workplace,
      course,
    });
    const savedRegistration = await newRegistration.save();

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Registration Confirmation",
      text: `Hi ${name},\n\nYou have successfully registered for the course.`,
      html: `<p>Hi <strong>${name}</strong>,</p><p>You have successfully registered for the course.</p>`,
    });

    res.status(201).json(savedRegistration);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save registration." });
  }
};
