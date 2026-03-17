# -*- coding: utf-8 -*-

from flask import Flask, render_template, request, jsonify
import json
from fuzzywuzzy import fuzz

# Create Flask app
app = Flask(__name__)

# Load FAQ JSON
with open("faq.json", "r", encoding="utf-8") as f:
    faq = json.load(f)

# ----------- FUZZY SEARCH + KEYWORD MATCH ----------
def find_answer(user_msg):
    user_msg = user_msg.lower()

    best_score = 0
    best_answer = None

    for key, item in faq.items():
        for kw in item["keywords"]:
            kw = kw.lower()

            # Fuzzy match
            score = fuzz.partial_ratio(user_msg, kw)
            score2 = fuzz.token_set_ratio(user_msg, kw)

            final = max(score, score2)

            # 70% threshold
            if final > best_score and final >= 70:
                best_score = final
                best_answer = item["answer"]

    if best_answer:
        return best_answer

    return "Sorry, I don't have information about that."


# ------------ ROUTES ---------------
@app.route("/")
def home():
    return render_template("index.html")


@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json(silent=True)

    if not data or "message" not in data:
        return jsonify({"reply": "Error: No message received by server."})

    user_input = data["message"]
    response = find_answer(user_input)
    return jsonify({"reply": response})


# ⭐ FIXED FEEDBACK ROUTE
@app.route("/feedback", methods=["POST"])
def feedback():
    data = request.get_json()
    rating = data.get("rating")
    feedback_msg = data.get("feedback")

    entry = {
        "rating": rating,
        "feedback": feedback_msg
    }

    with open("feedback.json", "a", encoding="utf-8") as f:
        f.write(json.dumps(entry, ensure_ascii=False) + "\n")

    return jsonify({"message": "Thanks for your feedback!"})


if __name__ == "__main__":
    print("🚀 Flask server running successfully...")
    app.run(debug=True)
