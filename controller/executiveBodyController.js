import slugify from "slugify";
import ExecutiveBody from "../model/executiveBodyModal.js"; // Ensure the correct model import

export const createExecutiveBody = async (req, res) => {
  try {
    const { title, members } = req.body;

    // Validate the members array
    if (
      !Array.isArray(members) ||
      members.some((item) => !item.member || !item.position)
    ) {
      return res
        .status(400)
        .json({ error: "Each member must have a member ID and a position." });
    }
    // Check if a committee with the same title already exists
    const existingCommittee = await ExecutiveBody.findOne({ title });
    if (existingCommittee) {
      return res
        .status(400)
        .json({ error: "A committee with this name already exists." });
    }

    // Generate slug from title using slugify
    const slug = slugify(title, { lower: true, strict: true });

    // Format members array to ensure member ID is used
    const formattedMembers = members.map((item) => {
      const memberId = item.member; // Directly using item.member assuming it's already the ID
      return {
        member: memberId,
        position: item.position,
      };
    });

    // Create new ExecutiveBody document
    const executiveBody = new ExecutiveBody({
      title,
      slug, // Add slug to the document
      members: formattedMembers,
    });

    // Save to database
    await executiveBody.save();

    // Send response
    res.status(201).json(executiveBody);
  } catch (error) {
    console.error("Error creating executive body:", error);
    res.status(500).json({ error: "Failed to create executive body" });
  }
};


export const listExecutiveCommittee = async (req, res) => {
  try {
    const executiveBodies = await ExecutiveBody.find().populate('members.member').sort({ createdAt: -1 });;
    res.status(200).json(executiveBodies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch executive bodies" });
  }
};

export const deleteCommittee = async (req, res) => {
  const { committeeId } = req.params;
  try {
    const committee = await ExecutiveBody.findByIdAndDelete(committeeId);
    if (!committee) {
      return res.status(404).json({ message: "Committee not found" });
    }
    res.status(200).json({ message: "Committee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting committee" });
  }
};


export const readCommittee = async (req, res) => {
  try {
    const committee = await ExecutiveBody.findOne({ slug: req.params.slug }).populate('members.member');

    if (!committee) {
      return res.status(404).json({ message: 'Committee not found' });
    }

    res.status(200).json(committee);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching committee', error });
  }
};

export const updateExecutiveCommittee = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, members } = req.body;

    // Ensure members array has the correct format
    const formattedMembers = members.map(member => {
      if (!member.memberId || typeof member.memberId !== 'string' || member.memberId.trim() === '') {
        console.log(`Invalid memberId found: ${member.memberId}`);
        throw new Error('Invalid memberId');
      }
      return {
        member: member.memberId, // Ensure it's a string
        position: member.position
      };
    });

    const updatedCommittee = await ExecutiveBody.findByIdAndUpdate(
      id,
      { title, members: formattedMembers },
      { new: true, runValidators: true }
    ).populate('members.member');

    if (!updatedCommittee) {
      return res.status(404).json({ message: 'Committee not found' });
    }

    res.status(200).json(updatedCommittee);
  } catch (error) {
    console.error('Error updating committee:', error);
    res.status(500).json({ message: 'Error updating committee', error: error.message });
  }
};
