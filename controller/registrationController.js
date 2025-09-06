import Registration from "../model/registrationModel.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import { paymentReceivedMail } from "../middlewares/paymentReceivedMail.js";

import Events from "../model/eventModel.js";
import dotenv from "dotenv";
dotenv.config();

export const createRegistration = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      designation,
      workplace,
      course,
      senderNumber,
      transactionId,
    } = req.body;

    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // ✅ Decide status based on payment info
    let status = "applied";
    if (senderNumber && transactionId) {
      status = "payment-submitted";
    }

    const newRegistration = new Registration({
      name,
      email,
      phone,
      designation,
      workplace,
      course,
      senderNumber,
      transactionId,
      status,
    });

    const savedRegistration = await newRegistration.save();
    const registrationId = savedRegistration.registrationId;
    const registrationURL = `${process.env.FRONTEND_URL}/registration-tracker/${registrationId}`;

    const courseData = await Events.findById(course);
    const courseName = courseData ? courseData.name : "the course";

    // Send confirmation email
    await sendEmail({
      to: email,
      subject: "Registration Confirmation",
      name,
      registrationId,
      courseName,
      registrationURL,
    });

    res.status(201).json({
      success: true,
      registrationId,
      registration: savedRegistration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save registration." });
  }
};

export const getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;

    const registration = await Registration.findOne({
      registrationId,
    }).populate("course");
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({
      success: true,
      registration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registration." });
  }
};

export const updatePaymentInfo = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { senderNumber, transactionId } = req.body;

    if (!senderNumber || !transactionId) {
      return res.status(400).json({
        message: "Both Bkash number and Transaction ID are required.",
      });
    }

    const registration = await Registration.findOne({
      registrationId,
    }).populate("course");
    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.status !== "applied") {
      return res
        .status(400)
        .json({ message: "Payment info cannot be updated at this stage." });
    }

    // ✅ Update payment info
    registration.senderNumber = senderNumber;
    registration.transactionId = transactionId;
    registration.status = "payment-submitted";
    await registration.save();

    // ✅ Send "payment received" mail
    await paymentReceivedMail({
      to: registration.email,
      name: registration.name,
      registrationId: registration.registrationId,
      courseName: registration.course?.name || "the course",
    });

    res.status(200).json({
      success: true,
      message: "Payment info submitted successfully. Confirmation email sent.",
      registration,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update payment info." });
  }
};
export const getAllRegistrations = async (req, res) => {
  try {
    const { course } = req.query; // optional filter by course

    let query = {};
    if (course) query.course = course; // filter by course _id if provided

    // Fetch all registrations without populating
    const registrations = await Registration.find(query).sort({
      createdAt: -1,
    });

    res.status(200).json({ success: true, registrations });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
};
