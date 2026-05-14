export function generateVariants(selected) {
  const values = Object.values(selected).filter((v) => v.length);
  if (!values.length) return [];

  return values.reduce(
    (a, b) => a.flatMap((d) => b.map((e) => [].concat(d, e))),
    [[]]
  );
}
