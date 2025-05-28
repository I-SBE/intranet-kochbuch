import "./css/Sidebar.css";

//--------------------------------------------------------------------------


function Sidebar() {

  const sidebarData = {
    searchPlaceholder: "🔍 Suche",
    sections: [
        {
        title: "🍽 Kategorien",
        items: ["Frühstück", "Mittagessen", "Abendessen", "Desserts"]
        },
        {
        title: "🕒 Dauer",
        items: ["Unter 15 Min", "15–30 Min", "Über 30 Min"]
        },
        {
        title: "💪 Schwierigkeit",
        items: ["Einfach", "Mittel", "Schwer"]
        }
    ]
  };

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  return (
    <div className="sidebar me-4">
      <input
        type="text"
        placeholder={sidebarData.searchPlaceholder}
        className="form-control mb-3"
      />

      {sidebarData.sections.map((section, index) => (
        <div className="sidebar-section mt-4" key={index}>
          <h6 className="text-muted">{section.title}</h6>
          <ul className="list-unstyled">
            {section.items.map((item, idx) => (
              <li key={idx}><a href="#">{item}</a></li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

//--------------------------------------------------------------------------

export default Sidebar;