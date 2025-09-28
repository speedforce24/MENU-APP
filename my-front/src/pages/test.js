"use client";
import ReactStars from "react-stars";

export default function TestStars() {
  return (
    <div className="h-screen flex justify-center items-center bg-gray-100">
      <ReactStars
        count={5}
        value={3}
        size={40}
        activeColor="#ffd700"
        onChange={(newRating) => {
          console.log("⭐ New Rating:", newRating);
        }}
      />
    </div>
  );
}
