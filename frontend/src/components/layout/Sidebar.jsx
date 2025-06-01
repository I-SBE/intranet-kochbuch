import { useState } from "react";

import "../../styles/Sidebar.css";

//--------------------------------------------------------------------------

function Sidebar({ onFilterChange }) {

  const [filters, setFilters] = useState({
    search: "",
    category: "",
    duration: "",
    difficulty: ""
  });

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const handleChange = (field, value) => {
    const newFilters = { ...filters, [field]: value };
    setFilters(newFilters);
    onFilterChange(cleanFilters(newFilters));
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  const cleanFilters = (f) => {
    return Object.fromEntries(Object.entries(f).filter(([_, v]) => v));
  };

  //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="sidebar me-4">
      <input
        type="text"
        placeholder="Suche"
        className="form-control mb-3 search-input"
        value={filters.search}
        onChange={(e) => handleChange("search", e.target.value)}
      />

      <div className="sidebar-section mt-4">
        <div className="sidebar-title">Kategorie</div>
        <select
          className="form-select"
          value={filters.category}
          onChange={(e) => handleChange("category", e.target.value)}
        >
          <option value="">Alle</option>
          <option value="breakfast">Frühstück</option>
          <option value="lunch">Mittagessen</option>
          <option value="dinner">Abendessen</option>
          <option value="dessert">Desserts</option>
        </select>
      </div>

      <div className="sidebar-section mt-4">
        <div className="sidebar-title">Dauer</div>
        <select
          className="form-select"
          value={filters.duration}
          onChange={(e) => handleChange("duration", e.target.value)}
        >
          <option value="">Alle</option>
          <option value="Unter 15 Min">Unter 15 Min</option>
          <option value="15–30 Min">15–30 Min</option>
          <option value="Über 30 Min">Über 30 Min</option>
        </select>
      </div>

      <div className="sidebar-section mt-4">
        <div className="sidebar-title">Schwierigkeit</div>
        <select
          className="form-select"
          value={filters.difficulty}
          onChange={(e) => handleChange("difficulty", e.target.value)}
        >
          <option value="">Alle</option>
          <option value="easy">Einfach</option>
          <option value="medium">Mittel</option>
          <option value="hard">Schwer</option>
        </select>
      </div>
    </div>
  );
}

//--------------------------------------------------------------------------

export default Sidebar;