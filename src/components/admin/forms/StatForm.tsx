import React, { useState } from "react";
import { AboutStat } from "../ui/types";
import { iconOptions } from "../ui/icons";

const StatForm: React.FC<{
  initial: AboutStat;
  onSave: (payload: Partial<AboutStat>) => void;
}> = ({ initial, onSave }) => {
  const [number, setNumber] = useState(initial.number);
  const [label, setLabel] = useState(initial.label);
  const [icon, setIcon] = useState(initial.icon || "Clock");
  const [order, setOrder] = useState(initial.order ?? 10);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial.id, number, label, icon, order });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Число</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Подпись</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Иконка</label>
          <select
            className="w-full rounded border px-3 py-2"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
          >
            {iconOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Порядок</label>
          <input
            type="number"
            className="w-full rounded border px-3 py-2"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value || "0", 10))}
          />
        </div>
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" className="px-4 py-2 rounded bg-brand-turquoise text-white hover:bg-brand-navy">
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default StatForm;
