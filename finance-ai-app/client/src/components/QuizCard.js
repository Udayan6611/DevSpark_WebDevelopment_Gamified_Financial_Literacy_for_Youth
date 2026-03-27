import React from "react";

function QuizCard({ title, children }) {
  return (
    <section>
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}

export default QuizCard;
