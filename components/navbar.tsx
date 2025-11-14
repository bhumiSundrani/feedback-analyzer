"use client"
import { clearFeedback } from "@/store/feedbackSlice";
import { AppDispatch } from "@/store/store";
import { ArrowLeftIcon, BarChart3, MoveLeft, Upload } from "lucide-react";
import Link from "next/link";
import { usePathname } from 'next/navigation';
import { useDispatch } from "react-redux";

export const Navigation = () => {
  const currentPath = usePathname()  
  const dispatch = useDispatch<AppDispatch>();

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href={"/"} onClick={() => dispatch(clearFeedback())} className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-linear-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">FeedbackIQ</span>            
          </Link>

          <div className="flex flex-wrap gap-2">
            {
              currentPath !== '/upload' && (
                   <Link 
          onClick={() => dispatch(clearFeedback())}
            href="/upload"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center flex-wrap justify-center gap-2"
          >
           <Upload className="w-5 h-5"/>
            <p className="hidden sm:block">Get Started</p>        
          </Link>
              )
              
            }
             {
              currentPath !== '/' && (
                <Link 
          onClick={() => dispatch(clearFeedback())}
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center flex-wrap justify-center gap-2"
          >
            <ArrowLeftIcon className="w-5 h-5"/>
            <p className="hidden sm:block">Back to Home</p>        
          </Link>
              )
             }
          </div>

          
        </div>
      </div>
    </nav>
  )};