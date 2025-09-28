const RestaurantSelector = ({ restaurants, selected, setSelected }) => {
  return (
    <div className="flex space-x-4">
      {restaurants.map((rest) => (
        <button
          key={rest._id} // ✅ Use _id as key
          onClick={() => setSelected(rest._id)} // ✅ Select by _id
          className={`p-2 ${selected === rest._id ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          {rest.name} {/* ✅ Display the name */}
        </button>
      ))}
    </div>
  );
};

// ✅ Ensure this is exported properly
export default RestaurantSelector;
