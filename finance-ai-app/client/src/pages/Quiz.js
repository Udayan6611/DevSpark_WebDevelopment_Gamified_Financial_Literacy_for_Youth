import React, { useState } from "react";

function Quiz() {
  const [answers, setAnswers] = useState({ q1: "", q2: "" });

  const onChange = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = (event) => {
    event.preventDefault();
    // Hook this to POST /api/quiz/submit
    console.log("Quiz answers", answers);
  };

  return (
    <div>
      <h1>Quiz</h1>
      <form onSubmit={onSubmit}>
        <div>
          <p>Q1: Best habit for monthly money?</p>
          <label>
            <input
              type="radio"
              name="q1"
              value="save"
              checked={answers.q1 === "save"}
              onChange={(e) => onChange("q1", e.target.value)}
            />
            Save first
          </label>
          <label>
            <input
              type="radio"
              name="q1"
              value="spend"
              checked={answers.q1 === "spend"}
              onChange={(e) => onChange("q1", e.target.value)}
            />
            Spend first
          </label>
        </div>

        <div>
          <p>Q2: Long-term growth usually comes from?</p>
          <label>
            <input
              type="radio"
              name="q2"
              value="invest"
              checked={answers.q2 === "invest"}
              onChange={(e) => onChange("q2", e.target.value)}
            />
            Invest
          </label>
          <label>
            <input
              type="radio"
              name="q2"
              value="borrow"
              checked={answers.q2 === "borrow"}
              onChange={(e) => onChange("q2", e.target.value)}
            />
            Borrow
          </label>
        </div>

        <button type="submit">Submit Quiz</button>
      </form>
    </div>
  );
}

export default Quiz;
