const categories = ["All", "Electronics", "Fashion", "Accessories"];

function ProductFilters({
  category,
  setCategory,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  sort,
  setSort,
}) {
  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>

        <button
          type="button"
          onClick={() => {
            setCategory("All");
            setMinPrice("");
            setMaxPrice("");
            setSort("newest");
          }}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Clear all
        </button>
      </div>

      {/* Category */}
      <div className="mb-7">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Category</h3>

        <div className="space-y-3">
          {categories.map((item) => (
            <label
              key={item}
              className="flex cursor-pointer items-center gap-3 text-sm text-slate-600"
            >
              <input
                type="radio"
                name="category"
                checked={category === item}
                onChange={() => setCategory(item)}
                className="h-4 w-4 accent-blue-600"
              />

              {item}
            </label>
          ))}
        </div>
      </div>

      {/* Price */}
      <div className="mb-7">
        <h3 className="mb-3 text-sm font-semibold text-slate-800">
          Price Range (₹)
        </h3>

        <div className="flex gap-2">
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />

          <input
            type="number"
            min="0"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Sorting */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-800">Sort By</h3>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500"
        >
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
}

export default ProductFilters;