// components/products/CategoryFilter.jsx
const CATEGORIES = [
  "All",
  "Groceries",
  "Electronics",
  "Clothing",
  "Food & Drinks",
  "Health",
  "Home",
  "Sports",
  "Books",
];

const CategoryFilter = ({ selected, onChange }) => {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {CATEGORIES.map((cat) => {
        const value    = cat === "All" ? "" : cat;
        const isActive = selected === value;
        return (
          <button
            key={cat}
            onClick={() => onChange(value)}
            className={`flex-shrink-0 text-sm px-4 py-1.5 rounded-full border transition font-medium ${
              isActive
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-500"
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryFilter;