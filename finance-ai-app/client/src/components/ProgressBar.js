import React from "react";

function ProgressBar({ value = 0 }) {
  return (
    <div style={{ width: "100%", background: "#ddd", borderRadius: 8 }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: 10,
          background: "#6063ee",
          borderRadius: 8
        }}
      />
    </div>
  );
}

export default ProgressBar;
