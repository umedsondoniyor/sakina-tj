import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Image as ImageIcon, Users, AlertCircle } from "lucide-react";

import { iconMap } from "./ui/icons";
import {
  AboutSettings,
  AboutStat,
  AboutValue,
  AboutTimeline,
  AboutTeam,
} from "./ui/types";
import Modal from "./ui/Modal";

import SettingsForm from "./forms/SettingsForm";
import StatForm from "./forms/StatForm";
import ValueForm from "./forms/ValueForm";
import TimelineForm from "./forms/TimelineForm";
import TeamForm from "./forms/TeamForm";

const AdminAbout: React.FC = () => {
  // loading
  const [loading, setLoading] = useState(true);

  // datasets
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [values, setValues] = useState<AboutValue[]>([]);
  const [timeline, setTimeline] = useState<AboutTimeline[]>([]);
  const [team, setTeam] = useState<AboutTeam[]>([]);

  // modal states
  const [openSettings, setOpenSettings] = useState(false);

  const [editingStat, setEditingStat] = useState<AboutStat | null>(null);
  const [openStatModal, setOpenStatModal] = useState(false);

  const [editingValue, setEditingValue] = useState<AboutValue | null>(null);
  const [openValueModal, setOpenValueModal] = useState(false);

  const [editingTimeline, setEditingTimeline] = useState<AboutTimeline | null>(
    null
  );
  const [openTimelineModal, setOpenTimelineModal] = useState(false);

  const [editingTeam, setEditingTeam] = useState<AboutTeam | null>(null);
  const [openTeamModal, setOpenTeamModal] = useState(false);

  // Delete confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'stat' | 'value' | 'timeline' | 'team';
    id: string;
    name?: string;
  } | null>(null);

  // ---------- LOAD DATA ----------
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);

        const [settingsRes, statsRes, valuesRes, timelineRes, teamRes] =
          await Promise.all([
            supabase.from("about_settings").select("*").limit(1).maybeSingle(),
            supabase
              .from("about_stats")
              .select("*")
              .order("order", { ascending: true }),
            supabase
              .from("about_values")
              .select("*")
              .order("order", { ascending: true }),
            supabase
              .from("about_timeline")
              .select("*")
              .order("order", { ascending: true }),
            supabase
              .from("about_team")
              .select("*")
              .order("order", { ascending: true }),
          ]);

        if (settingsRes.error) throw settingsRes.error;
        if (statsRes.error) throw statsRes.error;
        if (valuesRes.error) throw valuesRes.error;
        if (timelineRes.error) throw timelineRes.error;
        if (teamRes.error) throw teamRes.error;

        setSettings(settingsRes.data || null);
        setStats((statsRes.data || []) as AboutStat[]);
        setValues((valuesRes.data || []) as AboutValue[]);
        setTimeline((timelineRes.data || []) as AboutTimeline[]);
        setTeam((teamRes.data || []) as AboutTeam[]);
      } catch (e) {
        console.error(e);
        toast.error("Не удалось загрузить контент страницы 'О нас'");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- SETTINGS ----------
  const upsertSettings = async (payload: Partial<AboutSettings>) => {
    try {
      const current = settings || {};
      const toSave = {
        ...current,
        ...payload,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("about_settings")
        .upsert(toSave as any)
        .select("*")
        .single();
      if (error) throw error;
      setSettings(data as AboutSettings);
      toast.success("Настройки сохранены");
      setOpenSettings(false);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить настройки");
    }
  };

  // ---------- HELPERS ----------
  const addOrUpdateRow = <T extends { id: string }>(
    list: T[],
    setList: (v: T[]) => void,
    item: T
  ) => {
    const idx = list.findIndex((x) => x.id === item.id);
    if (idx >= 0) {
      const copy = [...list];
      copy[idx] = item;
      setList(copy);
    } else {
      setList([...list, item].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
    }
  };

  const removeRow = <T extends { id: string }>(
    list: T[],
    setList: (v: T[]) => void,
    id: string
  ) => setList(list.filter((x) => x.id !== id));

  const nextOrder = (arr: { order: number }[]) =>
    (Math.max(0, ...arr.map((x) => x.order ?? 0)) || 0) + 10;

  // ---------- CRUD ACTIONS ----------
  const saveStat = async (payload: Partial<AboutStat>) => {
    try {
      const { data, error } = await supabase
        .from("about_stats")
        .upsert(payload as any)
        .select("*")
        .single();
      if (error) throw error;
      addOrUpdateRow(stats, setStats, data as AboutStat);
      setOpenStatModal(false);
      setEditingStat(null);
      toast.success("Статистика сохранена");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить статистику");
    }
  };

  const deleteStat = async (id: string) => {
    const stat = stats.find(s => s.id === id);
    setDeleteConfirm({ type: 'stat', id, name: stat?.label });
  };

  const confirmDeleteStat = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'stat') return;
    try {
      const { error } = await supabase.from("about_stats").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      removeRow(stats, setStats, deleteConfirm.id);
      toast.success("Статистика удалена");
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить статистику");
      setDeleteConfirm(null);
    }
  };

  const saveValue = async (payload: Partial<AboutValue>) => {
    try {
      const { data, error } = await supabase
        .from("about_values")
        .upsert(payload as any)
        .select("*")
        .single();
      if (error) throw error;
      addOrUpdateRow(values, setValues, data as AboutValue);
      setOpenValueModal(false);
      setEditingValue(null);
      toast.success("Ценность сохранена");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить ценность");
    }
  };

  const deleteValue = async (id: string) => {
    const value = values.find(v => v.id === id);
    setDeleteConfirm({ type: 'value', id, name: value?.title });
  };

  const confirmDeleteValue = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'value') return;
    try {
      const { error } = await supabase.from("about_values").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      removeRow(values, setValues, deleteConfirm.id);
      toast.success("Ценность удалена");
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить ценность");
      setDeleteConfirm(null);
    }
  };

  const saveTimelineItem = async (payload: Partial<AboutTimeline>) => {
    try {
      const { data, error } = await supabase
        .from("about_timeline")
        .upsert(payload as any)
        .select("*")
        .single();
      if (error) throw error;
      addOrUpdateRow(timeline, setTimeline, data as AboutTimeline);
      setOpenTimelineModal(false);
      setEditingTimeline(null);
      toast.success("Элемент временной шкалы сохранен");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить элемент временной шкалы");
    }
  };

  const deleteTimelineItem = async (id: string) => {
    const item = timeline.find(t => t.id === id);
    setDeleteConfirm({ type: 'timeline', id, name: item?.title });
  };

  const confirmDeleteTimeline = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'timeline') return;
    try {
      const { error } = await supabase
        .from("about_timeline")
        .delete()
        .eq("id", deleteConfirm.id);
      if (error) throw error;
      removeRow(timeline, setTimeline, deleteConfirm.id);
      toast.success("Элемент временной шкалы удален");
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить элемент временной шкалы");
      setDeleteConfirm(null);
    }
  };

  const saveTeam = async (payload: Partial<AboutTeam>) => {
    try {
      const { data, error } = await supabase
        .from("about_team")
        .upsert(payload as any)
        .select("*")
        .single();
      if (error) throw error;
      addOrUpdateRow(team, setTeam, data as AboutTeam);
      setOpenTeamModal(false);
      setEditingTeam(null);
      toast.success("Участник команды сохранен");
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить участника команды");
    }
  };

  const deleteTeam = async (id: string) => {
    const member = team.find(t => t.id === id);
    setDeleteConfirm({ type: 'team', id, name: member?.name });
  };

  const confirmDeleteTeam = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'team') return;
    try {
      const { error } = await supabase.from("about_team").delete().eq("id", deleteConfirm.id);
      if (error) throw error;
      removeRow(team, setTeam, deleteConfirm.id);
      toast.success("Участник команды удален");
      setDeleteConfirm(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить участника команды");
      setDeleteConfirm(null);
    }
  };

  const getDeleteConfirmMessage = () => {
    if (!deleteConfirm) return '';
    const messages = {
      stat: 'статистику',
      value: 'ценность',
      timeline: 'элемент временной шкалы',
      team: 'участника команды'
    };
    return messages[deleteConfirm.type];
  };

  // ---------- RENDER ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-teal-600" />
          <span className="text-gray-600">Загрузка контента...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* SETTINGS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">О нас — Главный экран / Настройки</h2>
          <button
            onClick={() => setOpenSettings(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
            aria-label="Редактировать настройки"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Редактировать
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 space-y-4">
          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="text-lg font-semibold mb-2">
                {settings?.hero_title || "—"}
              </div>
              <div className="text-gray-600">{settings?.hero_subtitle || "—"}</div>
            </div>
            <div className="w-48 h-28 bg-gray-100 rounded overflow-hidden border flex-shrink-0">
              {settings?.hero_image_url ? (
                <img
                  src={settings.hero_image_url}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-400">
                  <ImageIcon className="w-6 h-6" />
                </div>
              )}
            </div>
          </div>
          <div className="pt-4 border-t">
            <div className="text-sm font-medium text-gray-500 mb-1">Текст миссии:</div>
            <div className="text-gray-700 min-h-[3rem]">
              {settings?.mission_text || <span className="text-gray-400 italic">Текст миссии не добавлен</span>}
            </div>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Статистика</h2>
          <button
            onClick={() => {
              setEditingStat({
                id: crypto.randomUUID(),
                number: "",
                label: "",
                icon: "Clock",
                order: nextOrder(stats),
              });
              setOpenStatModal(true);
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
            aria-label="Добавить статистику"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить статистику
          </button>
        </div>

        {stats.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Статистика не добавлена. Нажмите "Добавить статистику" для создания.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.map((s) => {
              const Icon = iconMap[s.icon as keyof typeof iconMap];
              return (
                <div
                  key={s.id}
                  className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="font-semibold">{s.number}</div>
                      <div className="text-sm text-gray-600">{s.label}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        setEditingStat(s);
                        setOpenStatModal(true);
                      }}
                      className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                      aria-label="Редактировать статистику"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteStat(s.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      aria-label="Удалить статистику"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* VALUES */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Ценности</h2>
          <button
            onClick={() => {
              setEditingValue({
                id: crypto.randomUUID(),
                title: "",
                description: "",
                icon: "Heart",
                order: nextOrder(values),
              });
              setOpenValueModal(true);
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
            aria-label="Добавить ценность"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить ценность
          </button>
        </div>

        {values.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Ценности не добавлены. Нажмите "Добавить ценность" для создания.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((v) => {
              const Icon = iconMap[v.icon as keyof typeof iconMap];
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-lg shadow p-4 flex flex-col gap-3 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="font-semibold">{v.title}</div>
                  </div>
                  <div className="text-gray-600 text-sm">{v.description}</div>
                  <div className="flex items-center gap-3 justify-end">
                    <button
                      onClick={() => {
                        setEditingValue(v);
                        setOpenValueModal(true);
                      }}
                      className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                      aria-label="Редактировать ценность"
                      title="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteValue(v.id)}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      aria-label="Удалить ценность"
                      title="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      {/* TIMELINE */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Временная шкала</h2>
          <button
            onClick={() => {
              setEditingTimeline({
                id: crypto.randomUUID(),
                year: "",
                title: "",
                description: "",
                order: nextOrder(timeline),
              });
              setOpenTimelineModal(true);
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
            aria-label="Добавить элемент временной шкалы"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить элемент
          </button>
        </div>

        {timeline.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Элементы временной шкалы не добавлены. Нажмите "Добавить элемент" для создания.
          </div>
        ) : (
          <div className="space-y-3">
            {timeline.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-lg shadow p-4 flex items-center justify-between hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="text-teal-600 font-semibold">{t.year}</div>
                  <div className="font-semibold">{t.title}</div>
                  <div className="text-gray-600 text-sm">{t.description}</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTimeline(t);
                      setOpenTimelineModal(true);
                    }}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                    aria-label="Редактировать элемент временной шкалы"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTimelineItem(t.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    aria-label="Удалить элемент временной шкалы"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      {/* TEAM */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Команда</h2>
          <button
            onClick={() => {
              setEditingTeam({
                id: crypto.randomUUID(),
                name: "",
                position: "",
                description: "",
                image_url: "",
                order: nextOrder(team),
              });
              setOpenTeamModal(true);
            }}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-brand-turquoise text-white hover:bg-brand-navy transition-colors"
            aria-label="Добавить участника команды"
          >
            <Plus className="w-4 h-4 mr-2" />
            Добавить участника
          </button>
        </div>

        {team.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            Участники команды не добавлены. Нажмите "Добавить участника" для создания.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.map((m) => (
              <div key={m.id} className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow">
                <div className="relative mb-3">
                  {m.image_url ? (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-40 h-40 rounded-full object-cover mx-auto"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = '<div class="w-40 h-40 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400"><svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div>';
                        }
                      }}
                    />
                  ) : (
                    <div className="w-40 h-40 rounded-full bg-gray-100 mx-auto flex items-center justify-center text-gray-400">
                      <Users className="w-10 h-10" />
                    </div>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-semibold">{m.name}</div>
                  <div className="text-sm text-teal-600">{m.position}</div>
                  <div className="text-sm text-gray-600 mt-2">{m.description}</div>
                </div>
                <div className="mt-3 flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditingTeam(m);
                      setOpenTeamModal(true);
                    }}
                    className="p-2 text-teal-600 hover:text-teal-800 hover:bg-teal-50 rounded transition-colors"
                    aria-label="Редактировать участника команды"
                    title="Редактировать"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTeam(m.id)}
                    className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                    aria-label="Удалить участника команды"
                    title="Удалить"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* (Stats, Values, Timeline, and Team sections remain unchanged — your logic there is fine) */}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Подтвердите удаление
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Вы уверены, что хотите удалить {getDeleteConfirmMessage()}
                  {deleteConfirm.name && ` "${deleteConfirm.name}"`}? Это действие нельзя отменить.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      if (deleteConfirm.type === 'stat') confirmDeleteStat();
                      else if (deleteConfirm.type === 'value') confirmDeleteValue();
                      else if (deleteConfirm.type === 'timeline') confirmDeleteTimeline();
                      else if (deleteConfirm.type === 'team') confirmDeleteTeam();
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* -------- MODALS -------- */}
      <Modal
        title="Редактировать главный экран / Настройки"
        isOpen={openSettings}
        onClose={() => setOpenSettings(false)}
      >
        <SettingsForm
          initial={
            settings || {
              id: crypto.randomUUID(),
              hero_title: "",
              hero_subtitle: "",
              hero_image_url: "",
              mission_text: "",
              mission_section_title: "",
              timeline_section_title: "",
              timeline_section_description: "",
              team_section_title: "",
              team_section_description: "",
              cta_title: "",
              cta_description: "",
            }
          }
          onSave={upsertSettings}
        />
      </Modal>

      <Modal
        title={editingStat?.id ? "Редактировать статистику" : "Добавить статистику"}
        isOpen={openStatModal}
        onClose={() => {
          setOpenStatModal(false);
          setEditingStat(null);
        }}
      >
        {editingStat && <StatForm initial={editingStat} onSave={saveStat} />}
      </Modal>

      <Modal
        title={editingValue?.id ? "Редактировать ценность" : "Добавить ценность"}
        isOpen={openValueModal}
        onClose={() => {
          setOpenValueModal(false);
          setEditingValue(null);
        }}
      >
        {editingValue && <ValueForm initial={editingValue} onSave={saveValue} />}
      </Modal>

      <Modal
        title={editingTimeline?.id ? "Редактировать временную шкалу" : "Добавить элемент временной шкалы"}
        isOpen={openTimelineModal}
        onClose={() => {
          setOpenTimelineModal(false);
          setEditingTimeline(null);
        }}
      >
        {editingTimeline && (
          <TimelineForm initial={editingTimeline} onSave={saveTimelineItem} />
        )}
      </Modal>

      <Modal
        title={editingTeam?.id ? "Редактировать участника команды" : "Добавить участника команды"}
        isOpen={openTeamModal}
        onClose={() => {
          setOpenTeamModal(false);
          setEditingTeam(null);
        }}
      >
        {editingTeam && <TeamForm initial={editingTeam} onSave={saveTeam} />}
      </Modal>
    </div>
  );
};

export default AdminAbout;
