# python/nlp_service.py
import sys
import json
import traceback

try:
    # read entire stdin
    raw = sys.stdin.read()
    if not raw:
        # older fallback: read argv if provided
        if len(sys.argv) > 1:
            payload = {"feedback": sys.argv[1]}
        else:
            print(json.dumps({"sentiment": "neutral", "category": "other"}))
            sys.exit(0)
    else:
        payload = json.loads(raw)
    feedback = payload.get("feedback", "") or ""
    feedback = feedback.strip()
except Exception:
    print(json.dumps({"sentiment": "neutral", "category": "other"}))
    sys.exit(0)

# lazy imports to fail gracefully
try:
    from transformers import pipeline # type: ignore
except Exception as e:
    print(json.dumps({"sentiment": "neutral", "category": "other", "error": str(e)}))
    sys.exit(0)

try:
    # sentiment analyzer (cardiffnlp outputs POSITIVE/NEGATIVE/NEUTRAL)
    sentiment_analyzer = pipeline("sentiment-analysis", model="cardiffnlp/twitter-roberta-base-sentiment-latest")
except Exception:
    # fallback to a simpler model if not available
    sentiment_analyzer = pipeline("sentiment-analysis")

try:
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
except Exception:
    # fallback
    classifier = None

# candidate labels for zero-shot classification (map to app categories)
candidate_labels = ["UI", "Performance", "Feature", "Support", "Other", "Delivery", "Pricing", "Product quality"]

def safe_sentiment(text: str) -> str:
    try:
        out = sentiment_analyzer(text, truncation=True)
        label = out[0].get("label", "").lower()
        # normalize various label spellings
        if "pos" in label or "positive" in label:
            return "positive"
        if "neg" in label or "negative" in label:
            return "negative"
        if "neu" in label or "neutral" in label:
            return "neutral"
    except Exception:
        pass
    return "neutral"

def safe_category(text: str) -> str:
    # use zero-shot if available
    try:
        if classifier:
            result = classifier(text, candidate_labels, multi_label=False)
            label = result.get("labels", [None])[0]
            if label:
                # map label to normalized category lowercase single token
                normalized = label.lower().replace(" ", "_")
                # map broad categories used in app
                if "ui" in normalized:
                    return "ui"
                if "performance" in normalized:
                    return "performance"
                if "feature" in normalized:
                    return "feature"
                if "support" in normalized:
                    return "support"
                if "delivery" in normalized:
                    return "delivery"
                if "pricing" in normalized:
                    return "pricing"
                if "product" in normalized:
                    return "product_quality"
                return "other"
    except Exception:
        pass
    # fallback heuristic: simple keyword matching
    lower = text.lower()
    if any(k in lower for k in ["ui", "ux", "button", "layout", "design"]):
        return "ui"
    if any(k in lower for k in ["slow", "lag", "performance", "crash", "loading"]):
        return "performance"
    if any(k in lower for k in ["feature", "missing", "add", "would like"]):
        return "feature"
    if any(k in lower for k in ["support", "agent", "customer service", "helpful"]):
        return "support"
    if any(k in lower for k in ["deliver", "delivery", "late", "tracking"]):
        return "delivery"
    if any(k in lower for k in ["price", "pricing", "cost", "expensive", "refund"]):
        return "pricing"
    return "other"

def extract_issue(text: str) -> str:
    # crude short issue: pick first 6 words that look meaningful
    words = [w for w in text.split() if len(w) > 2]
    issue = " ".join(words[:6])
    return issue[:120] if issue else ""

try:
    sentiment = safe_sentiment(feedback)
    category = safe_category(feedback)
    issue = extract_issue(feedback) if feedback else ""
    output = {"sentiment": sentiment, "category": category, "issue": issue}
    print(json.dumps(output))
except Exception as e:
    tb = traceback.format_exc()
    print(json.dumps({"sentiment": "neutral", "category": "other", "error": str(e), "trace": tb}))
    sys.exit(0)
