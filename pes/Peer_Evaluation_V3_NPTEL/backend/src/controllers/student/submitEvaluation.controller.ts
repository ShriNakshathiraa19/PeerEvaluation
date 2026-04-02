import { Request, Response, NextFunction } from "express";
import { Evaluation } from "../../models/Evaluation.js";

interface AuthenticatedRequest extends Request {
  user?: {
    _id: string;
    role: string;
  };
}

export const submitEvaluation = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { evaluationId, rubricScores, feedback } = req.body;
    const studentId = req.user?._id;

    const evaluation = await Evaluation.findOne({
      _id: evaluationId,
      evaluator: studentId,
      status: "pending",
    });

    if (!evaluation) {
      res.status(404).json({ error: "Evaluation not found or already completed." });
      return;
    }

    if (rubricScores) {
      evaluation.rubricScores = {
        cooperation: rubricScores.cooperation || 0,
        conceptual: rubricScores.conceptual || 0,
        practical: rubricScores.practical || 0,
        workEthic: rubricScores.workEthic || 0,
      };
    }

    evaluation.feedback = feedback || "";
    evaluation.status = "completed";
    evaluation.submittedAt = new Date();

    await evaluation.save();

    res.json({ 
      message: "Evaluation submitted successfully!", 
      submittedAt: evaluation.submittedAt 
    });

  } catch (err) {
    console.error("Submission Error:", err);
    next(err);
  }
};