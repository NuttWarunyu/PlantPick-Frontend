import React from "react";

export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
    >
      {children}
    </button>
  );
}
