import { useEffect, useState } from "react";
import axios from "axios";
import { FaRegSmileBeam, FaRegPaperPlane } from "react-icons/fa";
import { BsStars } from "react-icons/bs";
import { PiExam } from "react-icons/pi";
import RubricInput from "./RubricInput"; 

const PORT = import.meta.env.VITE_BACKEND_PORT || 5000;

type Props = {
  darkMode: boolean;
};

interface Evaluation 
{
  _id: string;
  exam: {
    _id: string;
    title: string;
    numQuestions: number;
    maxMarks: number[];
    questions: string[];
  };
  submissionId: string | null;
  pdfUrl: string | null;
  answerKeyUrl?: string | null;
}

const pastelColors = [
  "bg-gradient-to-br from-blue-100 to-blue-50",
  "bg-gradient-to-br from-purple-100 to-purple-50",
  "bg-gradient-to-br from-pink-100 to-pink-50",
  "bg-gradient-to-br from-yellow-100 to-yellow-50",
  "bg-gradient-to-br from-green-100 to-green-50",
  "bg-gradient-to-br from-orange-100 to-orange-50",
];

const PeerEvaluationsPending = ({ darkMode }: Props) => {
  const [pending, setPending] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState<string | null>(null);
  
  const [openEval, setOpenEval] = useState<any>({
    _id: "manual-123",
    exam: { title: "Manual Design Preview", numQuestions: 0 }
  });

  const [rubricScores, setRubricScores] = useState({
    cooperation: 0,
    conceptual: 0,
    practical: 0,
    workEthic: 0
  });

  const [feedback, setFeedback] = useState("");
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [answerKeyUrl, setAnswerKeyUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchPending = async () => {
      setError(null);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`http://localhost:${PORT}/api/student/pending-evaluations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPending(res.data.evaluations || []);
      } catch (err: any) {
        console.log("Database fetch failed (expected for manual check)");
      }
    };
    fetchPending();
  }, []);

  const handleScoreChange = (category: string, value: number) => {
    setRubricScores(prev => ({ ...prev, [category]: value }));
  };

  const openEvaluation = async (ev: Evaluation) => {
    setOpenEval(ev);
    setRubricScores({ cooperation: 0, conceptual: 0, practical: 0, workEthic: 0 });
    setFeedback("");
    setSubmitStatus("idle");
  };

  const isSubmitDisabled = 
    submitStatus === "submitting" || 
    Object.values(rubricScores).some(score => score === 0);

  const handleCloseModal = () => {
    setOpenEval(null);
    setFeedback("");
    setSubmitStatus("idle");
  };

  const handleSubmit = async () => {
    if (!openEval || isSubmitDisabled) return;
    setSubmitStatus("submitting");
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:${PORT}/api/student/submit-peer-evaluation`, {
        evaluationId: openEval._id,
        rubricScores: rubricScores,
        feedback,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubmitStatus("success");
      setPending(prev => prev.filter(ev => ev._id !== openEval._id));
      handleCloseModal();
    } catch {
      setSubmitStatus("error");
    }
  };

  return (
    <div className={`p-10 w-full max-w-5xl space-y-8 relative ${darkMode ? 'bg-gray-950 text-white' : 'bg-white text-gray-900'}`}>
      <div className="flex items-center gap-3 mb-4">
        <FaRegSmileBeam className="text-4xl text-blue-400" />
        <h2 className="text-3xl font-bold">Pending Peer Evaluations</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-50">
        <p>Your pending tasks will appear here once connected...</p>
      </div>

      {openEval && (
        <div className={`fixed inset-0 z-50 backdrop-blur-md flex items-center justify-center ${darkMode ? 'bg-black/80' : 'bg-white/40'}`}>
          <div className={`rounded-3xl shadow-2xl w-[90vw] h-[85vh] overflow-hidden flex ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-black'}`}>
            
            <div className="w-3/5 bg-gray-100 dark:bg-gray-800 p-4 grid grid-cols-2 gap-4">
              <div className="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
                Student Submission PDF
              </div>
              <div className="border-2 border-dashed border-gray-300 rounded-2xl flex items-center justify-center text-gray-400">
                Answer Key PDF
              </div>
            </div>

            <div className="w-2/5 p-8 overflow-y-auto space-y-6 flex flex-col justify-center">
              <div>
                <h3 className="text-2xl font-black text-purple-600 mb-1">Peer Rubric</h3>
                <p className="text-sm text-gray-500 mb-6">Select a score from 1 (Poor) to 7 (Excellent)</p>
              </div>

              <RubricInput 
                label="Cooperation & Teamwork" 
                value={rubricScores.cooperation} 
                onChange={(val) => handleScoreChange('cooperation', val)} 
              />
              <RubricInput 
                label="Conceptual Contribution" 
                value={rubricScores.conceptual} 
                onChange={(val) => handleScoreChange('conceptual', val)} 
              />
              <RubricInput 
                label="Practical Contribution" 
                value={rubricScores.practical} 
                onChange={(val) => handleScoreChange('practical', val)} 
              />
              <RubricInput 
                label="Work Ethic" 
                value={rubricScores.workEthic} 
                onChange={(val) => handleScoreChange('workEthic', val)} 
              />

              <div className="space-y-1">
                <label className="block font-bold text-sm text-gray-600">Additional Feedback</label>
                <textarea
                  className={`w-full px-4 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-purple-400 outline-none ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50'}`}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Tell your peer what they did well..."
                  rows={3}
                />
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={handleCloseModal} className="flex-1 py-3 text-gray-500 font-bold hover:text-gray-700">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitDisabled}
                  className={`flex-2 px-8 py-3 rounded-2xl font-bold text-white shadow-lg transition-all ${isSubmitDisabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:scale-105 active:scale-95'}`}
                >
                  {submitStatus === "submitting" ? "Saving..." : "Submit Review"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeerEvaluationsPending;