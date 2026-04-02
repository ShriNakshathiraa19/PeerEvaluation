import { Schema, model, Document, Types } from "mongoose";

export interface IEvaluation extends Document {
  exam: Types.ObjectId;
  evaluator: Types.ObjectId;
  evaluatee: Types.ObjectId;
  marks: number[]; 
  rubricScores: {
    cooperation: number;
    conceptual: number;
    practical: number;
    workEthic: number;
  };
  feedback: string;
  status: 'pending' | 'completed';
  flagged: boolean;
  submittedAt?: Date;
}

const evaluationSchema = new Schema<IEvaluation>({
  exam: { type: Schema.Types.ObjectId, ref: 'Exam', required: true },
  evaluator: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  evaluatee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  marks: [{ type: Number, default: [] }], 
  rubricScores: {
    cooperation: { type: Number, default: 0 },
    conceptual: { type: Number, default: 0 },
    practical: { type: Number, default: 0 },
    workEthic: { type: Number, default: 0 }
  },
  feedback: { type: String, default: "" },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
  flagged: { type: Boolean, default: false },
  submittedAt: { type: Date }
}, { timestamps: true });

export const Evaluation = model<IEvaluation>('Evaluation', evaluationSchema);