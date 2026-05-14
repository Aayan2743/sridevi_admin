import { useState } from "react";

export default function TagInput() {
  const [tags, setTags] = useState([]);
  const [value, setValue] = useState("");

  const add = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (value.trim()) {
        setTags([...tags, value.trim()]);
        setValue("");
      }
    }
  };

  return (
    <div className="border rounded p-2 flex flex-wrap gap-2">
      {tags.map((t, i) => (
        <span key={i} className="bg-blue-100 px-2 py-1 rounded text-sm">
          {t}
        </span>
      ))}
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={add}
        placeholder="Type & Enter"
        className="flex-1 outline-none"
      />
    </div>
  );
}
