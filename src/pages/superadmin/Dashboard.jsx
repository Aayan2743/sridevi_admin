export default function Dashboard() {
  const cards = [
    { title: "Total Admins", value: 12 },
    { title: "Active Modules", value: 8 },
    { title: "Roles Created", value: 5 },
    { title: "Projects", value: 3 },
  ];

  return (
    <div className="grid md:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className="bg-white/5 p-5 rounded-xl border border-white/10"
        >
          <h3 className="text-gray-400 text-sm">{card.title}</h3>
          <p className="text-2xl font-bold mt-2">{card.value}</p>
        </div>
      ))}
    </div>
  );
}