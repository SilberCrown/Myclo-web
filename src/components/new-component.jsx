"use client";
import React from "react";

function NewComponent({ onClick, className, children, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

function NewComponentStory() {
  return (
    <div>
      <NewComponent onClick={() => {}} className="">
        キャンセル
      </NewComponent>
    </div>
  );
}

export default NewComponent;