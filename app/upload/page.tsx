"use client";

import { ChevronRight, MessageSquare, Upload } from "lucide-react";
import Link from "next/link";
import { useState, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios"
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { setFeedbackResults } from "@/store/feedbackSlice";

interface Feedback {
  id: number;
  text: string;
  timestamp: string;
  source: "manual";
}

const UploadPage: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [manualFeedback, setManualFeedback] = useState<string>("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [disableUpload, setDisableUpload] = useState<boolean>(false);
  const [disableManualButton, setDisableManualButton] = useState<boolean>(false);

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleFileSubmit = async () => {
    if(!uploadedFile){
      console.log("File not uploaded")
      return
    }   
    setDisableUpload(true)
    const formData = new FormData()
    formData.append("file", uploadedFile);

    try {
  const res = await axios.post("/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  dispatch(setFeedbackResults({summary: {positive: res.data.positive,
    negative: res.data.negative,
    total: res.data.total,
    neutral: res.data.neutral,
    suggestions: res.data.suggestions,
    topIssues: res.data.topIssues
  }}));
  if (res.status === 200) {
    router.push("/dashboard");
  }
  
  if (res.data.success) {
    router.push("/dashboard");
  }
} catch (error) {
  const axiosError = error as AxiosError<{ error: string }>;
  console.error("Upload failed:", axiosError.response?.data?.error || axiosError.message);
  // Optionally show error to user
  alert(axiosError.response?.data?.error || "Failed to upload file");
}finally{
  setDisableUpload(false)
}
}

  const handleManualSubmit = async () => {
    if (manualFeedback.trim()) {
      setDisableManualButton(true)
      try {
  const res = await axios.post("/api/manual", {feedback: manualFeedback.trim()}, );
  dispatch(setFeedbackResults({summary: {positive: res.data.positive,
    negative: res.data.negative,
    total: res.data.total,
    neutral: res.data.neutral,
    suggestions: res.data.suggestions,
    topIssues: res.data.topIssues
  }}));
  if (res.status === 200) {
    router.push("/dashboard");
  }
} catch (error) {
  const axiosError = error as AxiosError<{ error: string }>;
  console.error("Upload failed:", axiosError.response?.data?.error || axiosError.message);
  // Optionally show error to user
  alert(axiosError.response?.data?.error || "Failed to analyze input");
}
      setManualFeedback("");
      setDisableManualButton(false)
    }

    
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Upload Feedback
          </h1>
          <p className="text-gray-600">
            Choose your preferred method to submit customer feedback
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Bulk Upload Section */}
          <div className="bg-white rounded-xl shadow-md p-8 border-2 border-dashed border-gray-300 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Bulk Upload
              </h3>
              <p className="text-gray-600 mb-6">
                Upload CSV or Excel files with multiple feedback entries
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 items-center">
              <label className="block">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={disableUpload}
                />
                <div className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors cursor-pointer inline-block disabled:cursor-not-allowed disabled:bg-blue-200">
                  Choose File
                </div>
              </label>

              {
                uploadedFile && (
                  <>
                    <div className="text-gray-600">or</div>
                    <button 
                      className={`px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors cursor-pointer w-auto disabled:cursor-not-allowed disabled:bg-green-200`}
                      disabled={disableUpload}
                      onClick={() => handleFileSubmit()}
                    >
                      {disableUpload ? "Analyzing..." : "Upload File"}
                      
                    </button>
                  </>
                )
              }
              </div>

              {uploadedFile && (
                <div className="flex flex-col items-center gap-2">
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">✓ {uploadedFile.name}</p>
                </div>
                
                </div>

                
              )}

              <div className="mt-6 text-xs text-gray-500">
                Supported formats: CSV, XLSX, XLS
              </div>
            </div>
          </div>

          {/* Manual Entry Section */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Manual Entry
            </h3>
            <p className="text-gray-600 mb-6">
              Add individual feedback directly
            </p>

            <textarea
              value={manualFeedback}
              onChange={(e) => setManualFeedback(e.target.value)}
              placeholder="Enter customer feedback here..."
              className="w-full h-32 px-4 py-3 border border-gray-300 text-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />

            <button
              onClick={handleManualSubmit}
              disabled={!manualFeedback.trim() || disableManualButton}
              className="w-full mt-4 px-6 py-3 disabled: bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
            {disableManualButton ? "Analyzing..." : "Submit Feedback" }
            </button>
          </div>
        </div>

        {/* CSV Guidelines Section */}
        <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100">
          <h4 className="font-semibold text-gray-900 mb-3">
            CSV Format Guidelines:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
              <span>
                Include columns: feedback_text, date (optional), category
                (optional)
              </span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
              <span>UTF-8 encoding recommended for special characters</span>
            </li>
            <li className="flex items-start">
              <ChevronRight className="w-4 h-4 mt-0.5 mr-2 text-blue-600" />
              <span>Maximum file size: 10MB</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
