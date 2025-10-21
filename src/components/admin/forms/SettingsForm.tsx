import React, { useState } from "react";
import { AboutSettings } from "../ui/types";

interface Props {
  initial: AboutSettings;
  onSave: (payload: Partial<AboutSettings>) => void;
}

const SettingsForm: React.FC<Props> = ({ initial, onSave }) => {
  const [hero_title, setTitle] = useState(initial.hero_title ?? "");
  const [hero_subtitle, setSubtitle] = useState(initial.hero_subtitle ?? "");
  const [hero_image_url, setImage] = useState(initial.hero_image_url ?? "");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ id: initial.id, hero_title, hero_subtitle, hero_image_url });
      }}
    >
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={hero_title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Подзаголовок</label>
        <textarea
          className="w-full rounded border px-3 py-2"
          value={hero_subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Hero Image URL</label>
        <input
          className="w-full rounded border px-3 py-2"
          value={hero_image_url}
          onChange={(e) => setImage(e.target.value)}
        />
      </div>

      <div className="pt-2 flex justify-end">
        <button type="submit" className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700">
          Сохранить
        </button>
      </div>
    </form>
  );
};

export default SettingsForm;
