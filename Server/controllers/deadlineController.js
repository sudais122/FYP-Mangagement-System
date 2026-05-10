import Deadline from "../Models/deadline.js";



// CREATE DEADLINE
export const createDeadline = async (req, res) => {
  try {
    const {
      deadlineType,
      customDeadlineName,
      description,
      dueDate,
    } = req.body;

    // Convert selected date into real Date
    const finalDate = new Date(dueDate);

    // Automatically set time to 11:59 PM
    finalDate.setHours(23, 59, 0, 0);

    // Create new deadline
    const deadline = await Deadline.create({
      deadlineType,
      customDeadlineName,
      description,
      dueDate: finalDate,
    });

    res.status(201).json({
      success: true,
      message: "Deadline created successfully",
      deadline,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};



// GET ALL DEADLINES
export const getDeadlines = async (req, res) => {
  try {

    // Get all deadlines sorted by nearest date
    const deadlines = await Deadline.find().sort({
      dueDate: 1,
    });

    res.status(200).json({
      success: true,
      deadlines,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

export const deleteDeadline = async (req, res) => {
  try {

    const deadline = await Deadline.findById(req.params.id);

    // Check if deadline exists
    if (!deadline) {
      return res.status(404).json({
        success: false,
        message: "Deadline not found",
      });
    }

    await deadline.deleteOne();

    res.status(200).json({
      success: true,
      message: "Deadline deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};