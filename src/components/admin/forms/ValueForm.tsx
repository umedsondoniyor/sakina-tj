import React, { useState } from "react";
import { AboutValue } from "../ui/types";
import { iconOptions } from "../ui/icons";

interface Props {
  initial: AboutValue;
  onSave: (payload: Partial<AboutValue>) => void;
}

const ValueForm: React.FC<Props> = ({ initial, onSave }) => {
  const [title, setTitle] = useState(initial.title);
  const [description, setDescription] = useState(initial.description);
  const [icon, setIcon] = useState(initial.icon || "Heart");
  const [order, setOrder] = useState(initial.order ?? 10);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial.id, title, description, icon, order });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Заголовок</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Описание</label>
          <textarea
            className="w-full rounded border px-3 py-2"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
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
        <button
          type="submit"
          className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700"
        >
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default ValueForm;
