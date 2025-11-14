import { NextRequest, NextResponse } from "next/server";
import { performAnalysis } from "../upload/route";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { feedback } = body;
    
    if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
      return NextResponse.json(
        { error: 'Feedback text is required' },
        { status: 400 }
      );
    }
    
    // Analyze single feedback
    const result = await performAnalysis([feedback]);
    
    console.log("Result: ", result)

    return NextResponse.json({
      success: true,
      ...result,
    });
    
  } catch (error) {
    console.error('Manual analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze feedback' },
      { status: 500 }
    );
  }
}