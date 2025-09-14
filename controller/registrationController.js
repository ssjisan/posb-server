import Registration from "../model/registrationModel.js";
import { sendEmail } from "../middlewares/sendEmail.js";
import { paymentReceivedMail } from "../middlewares/paymentReceivedMail.js";
import generateRegistrationId from "../middlewares/generateRegistrationId.js";
import {
  sendApproveEmail,
  sendRejectEmail,
} from "../middlewares/registrationMail .js";
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

    // -------------------- 1️⃣ Validate required fields -------------------- //
    if (!name || !email || !phone || !course) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // -------------------- 2️⃣ Check if course exists -------------------- //
    const courseData = await Events.findById(course);
    if (!courseData) {
      return res.status(404).json({ message: "Course not found." });
    }

    // -------------------- 3️⃣ Find or create registration document for this course -------------------- //
    let courseRegistration = await Registration.findOne({ course });

    if (!courseRegistration) {
      courseRegistration = new Registration({
        course,
        registrationInfo: [],
      });
    }

    // -------------------- 4️⃣ Prevent duplicate registration (email only) -------------------- //
    const duplicate = courseRegistration.registrationInfo.some(
      (r) => r.email.toLowerCase() === email.toLowerCase()
    );

    if (duplicate) {
      return res.status(409).json({
        message: "You have already registered for this course with this email.",
      });
    }

    // -------------------- 5️⃣ Determine status -------------------- //
    let status = "applied";
    if (senderNumber && transactionId) {
      status = "payment-submitted";
    }

    // -------------------- 6️⃣ Create new registration object -------------------- //
    const newInfo = {
      name,
      email,
      phone,
      designation,
      workplace,
      senderNumber,
      transactionId,
      status,
      registrationId: generateRegistrationId(), // ✅ always generate unique ID here
    };

    // -------------------- 7️⃣ Push into array and save -------------------- //
    courseRegistration.registrationInfo.push(newInfo);
    await courseRegistration.save();

    // -------------------- 8️⃣ Grab saved registration -------------------- //
    const savedRegistration =
      courseRegistration.registrationInfo[
        courseRegistration.registrationInfo.length - 1
      ];

    const registrationURL = `${process.env.FRONTEND_URL}/registration-tracker/${savedRegistration.registrationId}`;

    // -------------------- 9️⃣ Send confirmation email -------------------- //
    await sendEmail({
      to: email,
      subject: "Registration Confirmation",
      name,
      registrationId: savedRegistration.registrationId,
      courseName: courseData.name,
      registrationURL,
    });

    // -------------------- 🔟 Return response -------------------- //
    res.status(201).json({
      success: true,
      registrationId: savedRegistration.registrationId,
      registration: savedRegistration,
    });
  } catch (err) {
    console.error("Error creating registration:", err);
    res.status(500).json({ message: "Failed to save registration." });
  }
};

// Get Registration Data by id Controller

export const getRegistrationById = async (req, res) => {
  try {
    const { registrationId } = req.params;

    // 1️⃣ Find the course document that contains this registration
    const courseDoc = await Registration.findOne({
      "registrationInfo.registrationId": registrationId,
    }).populate("course"); // optional, populates course details

    if (!courseDoc) {
      return res.status(404).json({ message: "Registration not found." });
    }

    // 2️⃣ Extract the specific registration from the array
    const registration = courseDoc.registrationInfo.find(
      (r) => r.registrationId === registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found." });
    }

    // 3️⃣ Send response
    res.status(200).json({
      success: true,
      course: courseDoc.course, // optional: include course details
      registration,
    });
  } catch (err) {
    console.error("Error fetching registration:", err);
    res.status(500).json({ message: "Failed to fetch registration." });
  }
};

// Update payment info Controller

export const updatePaymentInfo = async (req, res) => {
  try {
    const { registrationId } = req.params;
    const { senderNumber, transactionId } = req.body;

    if (!senderNumber || !transactionId) {
      return res.status(400).json({
        message: "Both Bkash number and Transaction ID are required.",
      });
    }

    // ---------------- Find the course document containing the registration ----------------
    const courseDoc = await Registration.findOne({
      "registrationInfo.registrationId": registrationId,
    }).populate("course");

    if (!courseDoc) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // ---------------- Find the specific registration inside the array ----------------
    const registration = courseDoc.registrationInfo.find(
      (r) => r.registrationId === registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (!["applied", "rejected"].includes(registration.status)) {
      return res.status(400).json({
        message: "Payment info cannot be updated at this stage.",
      });
    }

    // ---------------- Update payment info ----------------
    registration.senderNumber = senderNumber;
    registration.transactionId = transactionId;
    registration.status = "payment-submitted";

    await courseDoc.save();

    // ---------------- Send "payment received" mail ----------------
    await paymentReceivedMail({
      to: registration.email,
      name: registration.name,
      registrationId: registration.registrationId,
      courseName: courseDoc.course?.name || "the course",
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

// Get Registration Data  Controller

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

// Get by course id

export const getRegistrationsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    // Find the registration document for the course
    const courseRegistration = await Registration.findOne({
      course: courseId,
    }).populate("course");

    if (!courseRegistration) {
      return res
        .status(404)
        .json({ message: "No registrations found for this course." });
    }

    // Return only the registrationInfo array
    res.status(200).json({
      success: true,
      course: courseRegistration.course,
      registrations: courseRegistration.registrationInfo,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch registrations." });
  }
};

// Approve Registration Data Controller

export const approveRegistration = async (req, res) => {
  try {
    const { registrationId, courseId } = req.body;

    // 1️⃣ Fetch the course info
    const courseData = await Events.findById(courseId);
    const courseName = courseData ? courseData.name : "the course";

    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2️⃣ Find the registration inside the course document
    const courseRegistration = await Registration.findOne({ course: courseId });

    if (!courseRegistration) {
      return res
        .status(404)
        .json({ message: "Registration document not found for this course" });
    }

    // 3️⃣ Find the specific registration info
    const registration = courseRegistration.registrationInfo.find(
      (r) => r.registrationId === registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    if (registration.status !== "payment-submitted") {
      return res.status(400).json({
        message: "Only payment-submitted registrations can be confirmed",
      });
    }

    // 4️⃣ Update status
    registration.status = "confirmed";
    registration.remarks = "";
    // 5️⃣ Save the updated course registration document
    await courseRegistration.save();

    // 6️⃣ Send approval email
    await sendApproveEmail({
      to: registration.email,
      name: registration.name,
      registrationId: registration.registrationId,
      courseName,
      registrationURL: `${process.env.FRONTEND_URL}/registration-tracker/${registration.registrationId}}`,
    });

    res.json({ message: "Registration approved and email sent successfully" });
  } catch (error) {
    console.error("Error approving registration:", error);
    res.status(500).json({ message: "Error approving registration", error });
  }
};

// Reject Registration Data Controller

export const rejectRegistration = async (req, res) => {
  try {
    const { registrationId, courseId, remarks } = req.body;

    // 1️⃣ Fetch course info
    const courseData = await Events.findById(courseId);
    const courseName = courseData ? courseData.name : "the course";

    if (!courseData) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2️⃣ Fetch the course registration document
    const courseRegistration = await Registration.findOne({ course: courseId });
    if (!courseRegistration) {
      return res
        .status(404)
        .json({ message: "Registration document not found for this course" });
    }

    // 3️⃣ Find the specific registration info
    const registration = courseRegistration.registrationInfo.find(
      (r) => r.registrationId === registrationId
    );

    if (!registration) {
      return res.status(404).json({ message: "Registration not found" });
    }

    // 4️⃣ Update status and save remarks
    registration.status = "rejected";
    registration.remarks = remarks || "";

    // 5️⃣ Save updated course registration document
    await courseRegistration.save();

    // 6️⃣ Send rejection email
    await sendRejectEmail({
      to: registration.email,
      name: registration.name,
      registrationId: registration.registrationId,
      courseName,
      remarks,
      registrationURL: `${process.env.FRONTEND_URL}/registration-tracker/${registration.registrationId}`,
    });

    res.json({ message: "Registration rejected and email sent successfully" });
  } catch (error) {
    console.error("Error rejecting registration:", error);
    res.status(500).json({ message: "Error rejecting registration", error });
  }
};

export const getConfirmedRegistrationsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Validate courseId
    if (!courseId) {
      return res.status(400).json({ message: "Course ID is required." });
    }

    // Find the registration document for the course
    const courseRegistration = await Registration.findOne({
      course: courseId,
    }).populate("course");

    if (!courseRegistration) {
      return res
        .status(404)
        .json({ message: "No registrations found for this course." });
    }

    // ✅ Filter only confirmed registrations
    const confirmedRegistrations = courseRegistration.registrationInfo.filter(
      (r) => r.status === "confirmed"
    );

    // Return course info + confirmed registrations
    res.status(200).json({
      success: true,
      course: courseRegistration.course,
      registrations: confirmedRegistrations,
    });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch confirmed registrations." });
  }
};
