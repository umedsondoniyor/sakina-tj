import React, { useState } from "react";
import { AboutTeam } from "../ui/types";

interface Props {
  initial: AboutTeam;
  onSave: (payload: Partial<AboutTeam>) => void;
}

const TeamForm: React.FC<Props> = ({ initial, onSave }) => {
  const [name, setName] = useState(initial.name);
  const [position, setPosition] = useState(initial.position);
  const [description, setDescription] = useState(initial.description);
  const [image_url, setImage] = useState(initial.image_url);
  const [order, setOrder] = useState(initial.order ?? 10);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial.id, name, position, description, image_url, order });
      }}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Имя</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Должность</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
            required
          />
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
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium mb-1">Фото (URL)</label>
          <input
            className="w-full rounded border px-3 py-2"
            value={image_url}
            onChange={(e) => setImage(e.target.value)}
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

export default TeamForm;
