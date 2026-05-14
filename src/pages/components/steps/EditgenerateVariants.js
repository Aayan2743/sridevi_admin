
export function EditgenerateVariants(selected) {
  const groups = Object.values(selected).filter(
    (vals) => Array.isArray(vals) && vals.length > 0,
  );

  if (!groups.length) return [];

  const cartesian = groups.reduce(
    (acc, curr) => acc.flatMap((a) => curr.map((c) => [...a, c])),
    [[]],
  );

  return cartesian.map((combo) => {
    const ids = combo
      .map((v) => Number(v.id)) // 🔥 force number
      .sort((a, b) => a - b); // 🔥 numeric sort

    return {
      key: ids.join("_"), // ✅ MUST MATCH BACKEND
      label: combo.map((v) => v.value).join(" / "),
    };
  });
}
