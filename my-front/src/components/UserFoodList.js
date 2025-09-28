import React, { useEffect, useState } from "react";
import axios from "axios";

const UserFoodList = ({ selectedRestaurant }) => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    if (!selectedRestaurant) return;

    axios
      .get(`/foods/${selectedRestaurant}`)
      .then((res) => {
        setFoods(res.data);
      })
      .catch((error) => {
        console.error("Error fetching food list:", error);
      });
  }, [selectedRestaurant]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {foods.length === 0 ? (
        <p className="text-gray-500">No food available</p>
      ) : (
        foods.map((food) => (
          <div
            key={food._id}
            className={
              "border p-4 rounded-lg flex flex-col items-center " +
              (food.active ? "" : "opacity-50 grayscale pointer-events-none")
            }
          >
            <img
              src={food.image}
              alt={food.foodName}
              className="w-24 h-24 rounded-full"
            />
            <h3 className="text-lg font-bold">{food.foodName}</h3>
            <p className="text-gray-600">${food.price}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default UserFoodList;
