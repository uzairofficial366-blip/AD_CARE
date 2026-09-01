"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Filter, RotateCcw, Pill } from "lucide-react";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface BrandOption {
  id: string;
  name: string;
  slug: string;
}

interface ProductFiltersProps {
  categories: CategoryOption[];
  brands: BrandOption[];
  selectedCategory?: string;
  selectedBrand?: string;
  selectedRx?: string;
  minPrice?: string;
  maxPrice?: string;
  inStockOnly?: boolean;
  sortBy?: string;
}

export function ProductFilters({
  categories,
  brands,
  selectedCategory = "",
  selectedBrand = "",
  selectedRx = "all",
  minPrice = "",
  maxPrice = "",
  inStockOnly = false,
  sortBy = "featured",
}: ProductFiltersProps) {
  const router = useRouter();
  const [category, setCategory] = useState(selectedCategory);
  const [brand, setBrand] = useState(selectedBrand);
  const [rx, setRx] = useState(selectedRx);
  const [minP, setMinP] = useState(minPrice);
  const [maxP, setMaxP] = useState(maxPrice);
  const [inStock, setInStock] = useState(inStockOnly);
  const [sort, setSort] = useState(sortBy);

  const buildUrl = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();
    const vals = { category, brand, rx, minPrice: minP, maxPrice: maxP, inStock: String(inStock), sort, ...overrides };

    if (vals.category) params.set("category", vals.category);
    if (vals.brand) params.set("brand", vals.brand);
    if (vals.rx && vals.rx !== "all") params.set("rx", vals.rx);
    if (vals.minPrice) params.set("minPrice", vals.minPrice);
    if (vals.maxPrice) params.set("maxPrice", vals.maxPrice);
    if (vals.inStock === "true") params.set("inStock", "true");
    if (vals.sort && vals.sort !== "featured") params.set("sort", vals.sort);

    const qs = params.toString();
    router.push(`/products${qs ? `?${qs}` : ""}`);
  };

  const applyFilters = () => buildUrl();

  const resetFilters = () => {
    setCategory("");
    setBrand("");
    setRx("all");
    setMinP("");
    setMaxP("");
    setInStock(false);
    setSort("featured");
    router.push("/products");
  };

  return (
    <aside className="w-full lg:w-64 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-6 shrink-0">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center">
          <Filter className="w-4 h-4 mr-2 text-teal-600" />
          Filter Products
        </h3>
        <button
          onClick={resetFilters}
          className="text-xs text-slate-500 hover:text-teal-600 flex items-center"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Reset
        </button>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Sort By
        </label>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            buildUrl({ sort: e.target.value });
          }}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="featured">Featured / Popular</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest Arrivals</option>
        </select>
      </div>

      {/* Prescription Requirement Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Prescription Type
        </label>
        <div className="space-y-1.5 text-xs">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="rx_filter"
              checked={rx === "all"}
              onChange={() => { setRx("all"); buildUrl({ rx: "all" }); }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>All Products</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="rx_filter"
              checked={rx === "otc"}
              onChange={() => { setRx("otc"); buildUrl({ rx: "otc" }); }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span>OTC (No Prescription Required)</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer text-amber-900 font-medium">
            <input
              type="radio"
              name="rx_filter"
              checked={rx === "rx"}
              onChange={() => { setRx("rx"); buildUrl({ rx: "rx" }); }}
              className="text-teal-600 focus:ring-teal-500"
            />
            <span className="flex items-center">
              <Pill className="w-3 h-3 mr-1 text-amber-600" />
              Prescription Required (Rx)
            </span>
          </label>
        </div>
      </div>

      {/* Categories Filter */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Category
        </label>
        <select
          value={category}
          onChange={(e) => { setCategory(e.target.value); buildUrl({ category: e.target.value }); }}
          className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Brands Filter */}
      {brands.length > 0 && (
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
            Brand
          </label>
          <select
            value={brand}
            onChange={(e) => { setBrand(e.target.value); buildUrl({ brand: e.target.value }); }}
            className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-teal-500 focus:outline-none"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.slug}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Price Range */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">
          Price Range ($)
        </label>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            placeholder="Min"
            value={minP}
            onChange={(e) => setMinP(e.target.value)}
            className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <span className="text-slate-400 text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxP}
            onChange={(e) => setMaxP(e.target.value)}
            className="w-1/2 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* In Stock Only Toggle */}
      <div>
        <label className="flex items-center space-x-2 cursor-pointer text-xs">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => { setInStock(e.target.checked); buildUrl({ inStock: String(e.target.checked) }); }}
            className="rounded text-teal-600 focus:ring-teal-500"
          />
          <span className="font-medium text-slate-700">In Stock Items Only</span>
        </label>
      </div>

      <button
        onClick={applyFilters}
        className="w-full py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
      >
        Apply Filters
      </button>
    </aside>
  );
}
