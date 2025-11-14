import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Summary {
  total: number;
  positive: number;
  neutral: number;
  negative: number;
  topIssues: {issue: string, count: number}[];
  suggestions: string[];
}

interface FeedbackState {
  summary: Summary | null;
}

const initialState: FeedbackState = {
  summary: null,
};

const feedbackSlice = createSlice({
  name: "feedback",
  initialState,
  reducers: {
    setFeedbackResults: (
      state,
      action: PayloadAction<{
        summary: Summary;
      }>
    ) => {
      state.summary = action.payload.summary;
    },
    clearFeedback: (state) => {
      state.summary = null;
    },
  },
});

export const { setFeedbackResults, clearFeedback } = feedbackSlice.actions;
export default feedbackSlice.reducer;
