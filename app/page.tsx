"use client"
import { BarChart3, Eye, MessageSquare, TrendingUp, Upload } from "lucide-react";
import Link from "next/link";



export default function HomePage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-4 px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
            AI-Powered Feedback Analysis
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Transform Customer Feedback into
            <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Actionable Insights</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Leverage advanced AI and NLP to analyze sentiment, identify trends, and make data-driven decisions that improve your products and services.
          </p>
          <div className="flex justify-center space-x-4">
            <button 
              className="px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <Link href={"/upload"} className="flex justify-center items-center gap-2">
              <Upload className="w-5 h-5" />
              <span>Get Started</span>
              </Link>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {[
            {
              icon: <MessageSquare className="w-8 h-8" />,
              title: 'Multi-Source Collection',
              description: 'Upload CSV/Excel files or manually input feedback for instant analysis'
            },
            {
              icon: <TrendingUp className="w-8 h-8" />,
              title: 'AI Sentiment Analysis',
              description: 'Advanced NLP models classify feedback with confidence scores'
            },
            {
              icon: <BarChart3 className="w-8 h-8" />,
              title: 'Visual Insights',
              description: 'Interactive dashboards with trends, breakdowns, and issue tracking'
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
              <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10K+', label: 'Feedback Analyzed' },
              { value: '95%', label: 'Accuracy Rate' },
              { value: '50+', label: 'Businesses' },
              { value: '24/7', label: 'AI Processing' }
            ].map((stat, idx) => (
              <div key={idx}>
                <div className="text-4xl font-bold bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )};