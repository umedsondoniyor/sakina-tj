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
  const [mission_text, setMissionText] = useState(initial.mission_text ?? "");
  const [mission_section_title, setMissionSectionTitle] = useState(initial.mission_section_title ?? "");
  const [timeline_section_title, setTimelineSectionTitle] = useState(initial.timeline_section_title ?? "");
  const [timeline_section_description, setTimelineSectionDescription] = useState(initial.timeline_section_description ?? "");
  const [team_section_title, setTeamSectionTitle] = useState(initial.team_section_title ?? "");
  const [team_section_description, setTeamSectionDescription] = useState(initial.team_section_description ?? "");
  const [cta_title, setCtaTitle] = useState(initial.cta_title ?? "");
  const [cta_description, setCtaDescription] = useState(initial.cta_description ?? "");

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ 
          id: initial.id, 
          hero_title, 
          hero_subtitle, 
          hero_image_url, 
          mission_text,
          mission_section_title,
          timeline_section_title,
          timeline_section_description,
          team_section_title,
          team_section_description,
          cta_title,
          cta_description,
        });
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
      <div>
        <label className="block text-sm font-medium mb-1">Текст миссии</label>
        <textarea
          className="w-full rounded border px-3 py-2"
          value={mission_text}
          onChange={(e) => setMissionText(e.target.value)}
          rows={4}
          placeholder="Мы верим, что качественный сон — это основа здоровой и счастливой жизни..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Этот текст отображается в разделе "Наша миссия" над ценностями компании
        </p>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-semibold mb-4">Заголовки и описания разделов</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Заголовок раздела "Миссия"</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={mission_section_title}
              onChange={(e) => setMissionSectionTitle(e.target.value)}
              placeholder="Наша миссия"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Заголовок раздела "История"</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={timeline_section_title}
              onChange={(e) => setTimelineSectionTitle(e.target.value)}
              placeholder="История развития"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание раздела "История"</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              value={timeline_section_description}
              onChange={(e) => setTimelineSectionDescription(e.target.value)}
              rows={2}
              placeholder="Путь от небольшой мастерской до ведущего производителя товаров для сна"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Заголовок раздела "Команда"</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={team_section_title}
              onChange={(e) => setTeamSectionTitle(e.target.value)}
              placeholder="Наша команда"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание раздела "Команда"</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              value={team_section_description}
              onChange={(e) => setTeamSectionDescription(e.target.value)}
              rows={2}
              placeholder="Профессионалы, которые делают ваш сон лучше каждый день"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Заголовок CTA секции</label>
            <input
              className="w-full rounded border px-3 py-2"
              value={cta_title}
              onChange={(e) => setCtaTitle(e.target.value)}
              placeholder="Готовы улучшить качество вашего сна?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Описание CTA секции</label>
            <textarea
              className="w-full rounded border px-3 py-2"
              value={cta_description}
              onChange={(e) => setCtaDescription(e.target.value)}
              rows={2}
              placeholder="Свяжитесь с нами для персональной консультации и подбора идеального матраса"
            />
          </div>
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

export default SettingsForm;
