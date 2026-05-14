import { useState } from "react";
import FilterPills from "./FilterPills";
import { categories, brands } from "../data/filters";

export default function POSFilters({ onCategoryChange, onBrandChange }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeBrand, setActiveBrand] = useState("all");

  return (
    <div className="space-y-4">
      {/* CATEGORY */}
      <FilterPills
        items={categories}
        active={activeCategory}
        onChange={(id) => {
          setActiveCategory(id);
          onCategoryChange(id);
        }}
      />

      {/* BRAND */}
      <FilterPills
        items={brands}
        active={activeBrand}
        onChange={(id) => {
          setActiveBrand(id);
          onBrandChange(id);
        }}
      />
    </div>
  );
}
