"use client";

import { RootState } from "@/store/store";
import {
  AlertCircle,
  CheckCircle,
  MessageSquare,
  MinusCircle,
} from "lucide-react";
import { useState } from "react";
import { useSelector } from "react-redux";

export default function DashboardPage() {
  const { summary } = useSelector((state: RootState) => state.feedback);

  const total = Number(summary?.total ?? 0);
  const positive = Number(summary?.positive ?? 0);
  const neutral = Number(summary?.neutral ?? 0);
  const negative = Number(summary?.negative ?? 0);

  // ✅ Fix operator precedence and ratios
  const positiveRatio = total > 0 ? positive / total : 0;
  const neutralRatio = total > 0 ? neutral / total : 0;
  const negativeRatio = total > 0 ? negative / total : 0;

  console.log({
    positiveRatio,
    neutralRatio,
    negativeRatio,
    sum: positiveRatio + neutralRatio + negativeRatio,
  });

  const [tab, setTab] = useState<"dashboard" | "insights">("dashboard");

  const circumference = 502; // ~2πr (r=80)

  return (
    <div className="min-h-screen bg-gray-50 py-5">
      {/* ---------------- Dashboard Section ---------------- */}
        <div className="max-w-7xl mx-auto px-4" id="dashboard">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard & Insights
            </h1>
            <p className="text-gray-600">
              Real-time sentiment analysis and trends
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {[
              {
                label: "Total Feedback",
                value: summary?.total ?? 0,
                color: "blue",
                icon: <MessageSquare className="w-5 h-5 text-blue-500" />,
              },
              {
                label: "Positive",
                value: positive,
                color: "green",
                ratio: positiveRatio,
                icon: <CheckCircle className="w-5 h-5 text-green-500" />,
              },
              {
                label: "Neutral",
                value: neutral,
                color: "gray",
                ratio: neutralRatio,
                icon: <MinusCircle className="w-5 h-5 text-gray-400" />,
              },
              {
                label: "Negative",
                value: negative,
                color: "red",
                ratio: negativeRatio,
                icon: <AlertCircle className="w-5 h-5 text-red-500" />,
              },
            ].map((card, i) => (
              <div
                key={i}
                className={`bg-white rounded-xl shadow-md p-6 border-l-4 border-${card.color}-500`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-600 text-sm font-medium">
                    {card.label}
                  </span>
                  {card.icon}
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {card.value}
                </div>
                {card.ratio !== undefined && (
                  <div className="text-xs text-gray-500 mt-1">
                    {Math.round(card.ratio * 100)}% of total
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Charts & Top Issues */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Sentiment Chart */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sentiment Distribution
              </h3>
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <svg viewBox="0 0 200 200" className="w-48 h-48">
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="40"
                      strokeDasharray={`${positiveRatio * circumference} ${
                        circumference
                      }`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#6b7280"
                      strokeWidth="40"
                      strokeDasharray={`${neutralRatio * circumference} ${
                        circumference
                      }`}
                      strokeDashoffset={`-${positiveRatio * circumference}`}
                      transform="rotate(-90 100 100)"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="80"
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="40"
                      strokeDasharray={`${negativeRatio * circumference} ${
                        circumference
                      }`}
                      strokeDashoffset={`-${
                        (positiveRatio + neutralRatio) * circumference
                      }`}
                      transform="rotate(-90 100 100)"
                    />
                  </svg>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Positive: {Math.round(positiveRatio * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Neutral: {Math.round(neutralRatio * 100)}%
                      </span>
                    </div>
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-sm text-gray-600">
                        Negative: {Math.round(negativeRatio * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Issues */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Top Issues (Negative Feedback)
              </h3>
              <div className="space-y-4">
                {summary?.topIssues && summary.topIssues.length > 0 ? (
                  summary.topIssues.map((item, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 font-medium">
                          {item.issue}
                        </span>
                        <span className="text-gray-600">
                          {item.count} mentions
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        {/* <div
                          className="bg-red-500 h-2 rounded-full"
                          style={{
                            width: `${item.percentage ?? 0}%`,
                          }}
                        ></div> */}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">
                    No issues identified yet.
                  </p>
                )}
              </div>
            </div>

             
          </div>
          <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                AI Generated Insights
              </h3>
              <div className="flex items-center h-auto">
                <div>
           {summary?.suggestions && summary.suggestions.length > 0 ? (
  summary.suggestions.map((suggestion, i) => (
    <div
      key={i}
      className="flex items-start gap-3 p-4 my-4 border border-blue-300 bg-blue-50 rounded-xl shadow-sm hover:bg-blue-100 transition-all duration-200"
    >
      <span className="text-blue-500 text-lg">💡</span>
      <p className="text-gray-700 leading-relaxed">{suggestion}</p>
    </div>
  ))
) : (
  <div className="flex flex-col items-center justify-center text-center">
    <p className="text-gray-500 text-sm">No suggestions</p>
  </div>
)}



                </div>
              </div>
            </div>
        </div>
    </div>
  );
}
