// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

interface FeedbackAnalysis {
  sentiment: 'positive' | 'neutral' | 'negative';
  text: string;
  score: number;
}

interface AnalysisResult {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  topIssues: Array<{ issue: string; count: number }>;
  suggestions: string[];
  feedbacks: FeedbackAnalysis[];
}

// Helper function to detect feedback column
function detectFeedbackColumn(data: any[]): string | null {
  if (data.length === 0) return null;
  
  const firstRow = data[0];
  const columns = Object.keys(firstRow);
  
  // Keywords that likely indicate feedback column
  const feedbackKeywords = [
    'feedback ', 'comment ', 'review ', 'opinion ', 'message ', 
    'text ', 'description ', 'note ', 'remarks ', 'response '
  ];
  
  // Check for exact or partial matches
  for (const col of columns) {
    const lowerCol = col.toLowerCase();
    if (feedbackKeywords.some(keyword => lowerCol.includes(keyword))) {
      return col;
    }
  }
  
  // If no match, use the column with longest average text length
  let maxAvgLength = 0;
  let selectedCol = columns[0];
  
  for (const col of columns) {
    const avgLength = data.reduce((sum, row) => {
      const val = String(row[col] || '');
      return sum + val.length;
    }, 0) / data.length;
    
    if (avgLength > maxAvgLength) {
      maxAvgLength = avgLength;
      selectedCol = col;
    }
  }
  
  return selectedCol;
}

// Free sentiment analysis using multiple methods
async function analyzeSentiment(text: string): Promise<{ sentiment: 'positive' | 'neutral' | 'negative'; score: number }> {
  // Method 1: Try Hugging Face Inference API (free, no key required)
  try {
    const response = await fetch(
      'https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          inputs: text.substring(0, 500), // Limit text length
          options: { wait_for_model: true }
        }),
      }
    );
    
    if (response.ok) {
      const result = await response.json();
      if (result && result[0] && Array.isArray(result[0])) {
        const sentiments = result[0];
        const topSentiment = sentiments.reduce((prev: any, current: any) => 
          (current.score > prev.score) ? current : prev
        );
        
        let sentiment: 'positive' | 'neutral' | 'negative' = 'neutral';
        if (topSentiment.label.toLowerCase().includes('pos')) sentiment = 'positive';
        else if (topSentiment.label.toLowerCase().includes('neg')) sentiment = 'negative';
        
        return { sentiment, score: topSentiment.score };
      }
    }
  } catch (error) {
    console.log('HF API unavailable, using fallback');
  }
  
  // Method 2: Advanced keyword-based analysis (always works)
  return advancedKeywordAnalysis(text);
}

// Advanced keyword-based sentiment analysis with scoring
function advancedKeywordAnalysis(text: string): { sentiment: 'positive' | 'neutral' | 'negative'; score: number } {
  const lowerText = text.toLowerCase();
  
  // Expanded sentiment dictionaries
  const positiveWords = [
    'excellent', 'amazing', 'wonderful', 'fantastic', 'great', 'good', 'best',
    'outstanding', 'superb', 'brilliant', 'awesome', 'perfect', 'love',
    'incredible', 'exceptional', 'fabulous', 'terrific', 'marvelous',
    'satisfied', 'happy', 'pleased', 'delighted', 'impressed', 'recommended',
    'quality', 'efficient', 'helpful', 'friendly', 'fast', 'easy', 'smooth'
  ];
  
  const negativeWords = [
    'terrible', 'horrible', 'awful', 'bad', 'worst', 'poor', 'disappointing',
    'disappointed', 'hate', 'useless', 'broken', 'defective', 'failure',
    'pathetic', 'disgusting', 'frustrating', 'annoying', 'waste', 'never',
    'angry', 'upset', 'unhappy', 'dissatisfied', 'uncomfortable', 'rude',
    'slow', 'expensive', 'complicated', 'difficult', 'confusing', 'problem'
  ];
  
  const neutralWords = [
    'okay', 'ok', 'average', 'decent', 'fine', 'acceptable', 'moderate'
  ];
  
  // Negation words that flip sentiment
  const negations = ['not', 'no', 'never', 'neither', 'nobody', 'nothing', 'dont', "don't"];
  
  let positiveScore = 0;
  let negativeScore = 0;
  let neutralScore = 0;
  
  const words = lowerText.split(/\s+/);
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i].replace(/[^\w]/g, '');
    const prevWord = i > 0 ? words[i - 1].replace(/[^\w]/g, '') : '';
    
    const isNegated = negations.includes(prevWord);
    
    if (positiveWords.includes(word)) {
      if (isNegated) {
        negativeScore += 1.5; // "not good" is negative
      } else {
        positiveScore += 2;
      }
    }
    
    if (negativeWords.includes(word)) {
      if (isNegated) {
        positiveScore += 1; // "not bad" is somewhat positive
      } else {
        negativeScore += 2;
      }
    }
    
    if (neutralWords.includes(word)) {
      neutralScore += 1;
    }
  }
  
  // Check for intensifiers
  const intensifiers = ['very', 'extremely', 'really', 'absolutely', 'completely', 'totally'];
  for (const intensifier of intensifiers) {
    if (lowerText.includes(intensifier)) {
      positiveScore *= 1.2;
      negativeScore *= 1.2;
    }
  }
  
  // Check for exclamation marks (usually indicate strong sentiment)
  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 0) {
    positiveScore *= (1 + exclamationCount * 0.1);
    negativeScore *= (1 + exclamationCount * 0.1);
  }
  
  // Determine sentiment
  const totalScore = positiveScore + negativeScore + neutralScore;
  
  if (totalScore === 0) {
    return { sentiment: 'neutral', score: 0.5 };
  }
  
  const posRatio = positiveScore / totalScore;
  const negRatio = negativeScore / totalScore;
  
  if (posRatio > negRatio + 0.15) {
    return { sentiment: 'positive', score: Math.min(0.95, 0.6 + posRatio * 0.4) };
  } else if (negRatio > posRatio + 0.15) {
    return { sentiment: 'negative', score: Math.min(0.95, 0.6 + negRatio * 0.4) };
  } else {
    return { sentiment: 'neutral', score: 0.6 };
  }
}

// Extract issues from negative feedback
function extractIssues(feedbacks: FeedbackAnalysis[]): Array<{ issue: string; count: number }> {
  const negativeFeedbacks = feedbacks.filter(f => f.sentiment === 'negative');
  const issueKeywords: { [key: string]: string[] } = {
    'Customer Service': ['service', 'staff', 'support', 'employee', 'representative', 'help', 'rude', 'unhelpful', 'customer', 'agent'],
    'Product Quality': ['quality', 'broken', 'defective', 'damaged', 'poor', 'cheap', 'faulty', 'durability', 'materials'],
    'Delivery & Shipping': ['delivery', 'shipping', 'late', 'delayed', 'arrive', 'received', 'package', 'tracking', 'carrier'],
    'Pricing': ['price', 'expensive', 'cost', 'overpriced', 'value', 'money', 'refund', 'charge'],
    'User Experience': ['difficult', 'confusing', 'complicated', 'hard', 'interface', 'use', 'navigate', 'unintuitive'],
    'Performance': ['slow', 'crash', 'bug', 'error', 'freeze', 'lag', 'glitch', 'loading', 'speed'],
    'Features': ['missing', 'lack', 'limited', 'feature', 'functionality', 'options', 'capability'],
  };
  
  const issueCounts: { [key: string]: number } = {};
  
  for (const feedback of negativeFeedbacks) {
    const lowerText = feedback.text.toLowerCase();
    for (const [issue, keywords] of Object.entries(issueKeywords)) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        issueCounts[issue] = (issueCounts[issue] || 0) + 1;
      }
    }
  }
  
  return Object.entries(issueCounts)
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

// Generate suggestions based on top issues
function generateSuggestions(topIssues: Array<{ issue: string; count: number }>): string[] {
  const suggestionMap: { [key: string]: string } = {
    'Customer Service': 'Invest in comprehensive customer service training and expand support team capacity to reduce response times',
    'Product Quality': 'Implement rigorous quality control processes and conduct regular product testing before release',
    'Delivery & Shipping': 'Partner with reliable logistics providers and implement real-time tracking systems for transparency',
    'Pricing': 'Review pricing strategy to ensure competitive positioning and communicate value proposition more clearly',
    'User Experience': 'Conduct usability testing with real users and redesign interface based on feedback for intuitive navigation',
    'Performance': 'Optimize code and infrastructure for faster performance and establish regular maintenance schedules',
    'Features': 'Prioritize feature development based on user requests and communicate product roadmap transparently',
  };
  
  return topIssues
    .map(({ issue }) => suggestionMap[issue])
    .filter(Boolean)
    .slice(0, 3);
}

// Main analysis function
export async function performAnalysis(feedbacks: string[]): Promise<AnalysisResult> {
  const analyzedFeedbacks: FeedbackAnalysis[] = [];
  
    console.log("Analyzing Sentiment...")
  // Analyze each feedback
  for (const text of feedbacks) {
    if (!text || text.trim().length === 0) continue;

    
    const result = await analyzeSentiment(text.trim());
    analyzedFeedbacks.push({
      ...result,
      text: text.trim()
    });
    // Small delay to avoid overwhelming free API
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  console.log("Sentiments Analyzed")
  const positive = analyzedFeedbacks.filter(f => f.sentiment === 'positive').length;
  const negative = analyzedFeedbacks.filter(f => f.sentiment === 'negative').length;
  const neutral = analyzedFeedbacks.filter(f => f.sentiment === 'neutral').length;
  
  const topIssues = extractIssues(analyzedFeedbacks);
  const suggestions = generateSuggestions(topIssues);
  
  return {
    total: analyzedFeedbacks.length,
    positive,
    neutral,
    negative,
    topIssues,
    suggestions,
    feedbacks: analyzedFeedbacks,
  };
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    console.log(file.name)
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }
    
    const buffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);
    
    // Parse file based on type
    let workbook: XLSX.WorkBook;
    
    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder().decode(uint8Array);
      workbook = XLSX.read(text, { type: 'string' });
    } else {
      workbook = XLSX.read(uint8Array, { type: 'array' });
    }
    
    // Get first sheet
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'File is empty' },
        { status: 400 }
      );
    }

    console.log("File parsed")
    
    // Detect feedback column
    const feedbackColumn = detectFeedbackColumn(data);

    console.log("Feddback Column: ", feedbackColumn)
    
    if (!feedbackColumn) {
      return NextResponse.json(
        { error: 'Could not detect feedback column' },
        { status: 400 }
      );
    }
    
    // Extract feedbacks
    const feedbacks = data
      .map((row: any) => String(row[feedbackColumn] || ''))
      .filter(text => text.trim().length > 0);

      console.log("Feedbacks: ", feedbacks)
    
    if (feedbacks.length === 0) {
      return NextResponse.json(
        { error: 'No valid feedbacks found' },
        { status: 400 }
      );
    }

    console.log("Performing analysis...")
    
    // Perform analysis
    const result = await performAnalysis(feedbacks);

    console.log(result)
    
    return NextResponse.json({
      success: true,
      detectedColumn: feedbackColumn,
      ...result,
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}

// // app/api/manual/route.ts (add this as a separate file)
