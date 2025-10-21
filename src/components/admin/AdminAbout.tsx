import React, { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import {
  Plus, Pencil, Trash2, Image as ImageIcon,
  Users, Award, Target, Heart, Clock, Globe,
} from "lucide-react";

type IconName = "Clock" | "Users" | "Award" | "Globe" | "Heart" | "Target";
const iconMap = { Clock, Users, Award, Globe, Heart, Target };
const iconOptions = Object.keys(iconMap) as IconName[];

type AboutSettings = {
  id: string;
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_image_url: string | null;
  updated_at?: string | null;
};
type AboutStat = { id: string; number: string; label: string; icon: IconName; order: number };
type AboutValue = { id: string; title: string; description: string; icon: IconName; order: number };
type AboutTimeline = { id: string; year: string; title: string; description: string; order: number };
type AboutTeam = { id: string; name: string; position: string; description: string; image_url: string; order: number };

/* -------------------- Reusable UI -------------------- */
const Modal: React.FC<{
  title: string; isOpen: boolean; onClose: () => void;
  children: React.ReactNode; widthClass?: string;
}> = ({ title, isOpen, onClose, children, widthClass = "max-w-xl" }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg w-full ${widthClass} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const FormField: React.FC<{
  label: string;
  children: React.ReactNode;
}> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    {children}
  </div>
);

const FormActions: React.FC<{ loading?: boolean }> = ({ loading }) => (
  <div className="pt-3 flex justify-end">
    <button
      type="submit"
      disabled={loading}
      className="px-4 py-2 rounded bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-60"
    >
      {loading ? "Saving..." : "Сохранить"}
    </button>
  </div>
);

/* -------------------- Helper -------------------- */
const handleError = (action: string, e: any) => {
  console.error(e);
  toast.error(`Failed to ${action}`);
};
const success = (msg: string) => toast.success(msg);
const nextOrder = (arr: { order: number }[]) =>
  (Math.max(0, ...arr.map((x) => x.order ?? 0)) || 0) + 10;

/* -------------------- Main Component -------------------- */
const AdminAbout: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<AboutSettings | null>(null);
  const [stats, setStats] = useState<AboutStat[]>([]);
  const [values, setValues] = useState<AboutValue[]>([]);
  const [timeline, setTimeline] = useState<AboutTimeline[]>([]);
  const [team, setTeam] = useState<AboutTeam[]>([]);

  const [modals, setModals] = useState({
    settings: false, stat: false, value: false, timeline: false, team: false,
  });
  const [edit, setEdit] = useState<any>(null);

  const toggleModal = useCallback(
    (key: keyof typeof modals, value: boolean) =>
      setModals((prev) => ({ ...prev, [key]: value })),
    []
  );

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [s, st, v, tl, tm] = await Promise.all([
          supabase.from("about_settings").select("*").limit(1).maybeSingle(),
          supabase.from("about_stats").select("*").order("order"),
          supabase.from("about_values").select("*").order("order"),
          supabase.from("about_timeline").select("*").order("order"),
          supabase.from("about_team").select("*").order("order"),
        ]);
        if (s.error || st.error || v.error || tl.error || tm.error) throw new Error("Load error");
        setSettings(s.data);
        setStats(st.data || []);
        setValues(v.data || []);
        setTimeline(tl.data || []);
        setTeam(tm.data || []);
      } catch (e) {
        handleError("load content", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const upsert = async <T,>(
    table: string,
    payload: Partial<T>,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    list: T[],
    successMsg: string
  ) => {
    try {
      const { data, error } = await supabase.from(table).upsert(payload as any).select("*").single();
      if (error) throw error;
      const updated = list.some((x: any) => x.id === data.id)
        ? list.map((x: any) => (x.id === data.id ? data : x))
        : [...list, data].sort((a: any, b: any) => a.order - b.order);
      setter(updated);
      success(successMsg);
    } catch (e) {
      handleError("save " + table, e);
    }
  };

  const del = async <T,>(
    table: string,
    id: string,
    setter: React.Dispatch<React.SetStateAction<T[]>>,
    list: T[]
  ) => {
    if (!confirm("Delete this item?")) return;
    try {
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      setter(list.filter((x: any) => x.id !== id));
      success("Deleted");
    } catch (e) {
      handleError("delete " + table, e);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );

  /* ----------- Sections ----------- */
  return (
    <div className="p-6 space-y-10">
      {/* HERO */}
      <Section
        title="About — Hero / Settings"
        onAdd={() => toggleModal("settings", true)}
        addLabel="Edit"
      >
        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-6">
          <div className="flex-1">
            <div className="text-lg font-semibold">{settings?.hero_title || "—"}</div>
            <div className="text-gray-600">{settings?.hero_subtitle || "—"}</div>
          </div>
          <div className="w-48 h-28 bg-gray-100 rounded overflow-hidden border">
            {settings?.hero_image_url ? (
              <img src={settings.hero_image_url} className="w-full h-full object-cover" />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <ImageIcon className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </Section>

      {/* STATS */}
      <EntitySection
        title="Stats"
        icon="Clock"
        items={stats}
        setItems={setStats}
        onEdit={(item) => { setEdit(item); toggleModal("stat", true); }}
        onAdd={() => {
          setEdit({
            id: crypto.randomUUID(), number: "", label: "", icon: "Clock", order: nextOrder(stats),
          }); toggleModal("stat", true);
        }}
        onDelete={(id) => del("about_stats", id, setStats, stats)}
      />

      {/* VALUES */}
      <EntitySection
        title="Values"
        icon="Heart"
        items={values}
        setItems={setValues}
        onEdit={(v) => { setEdit(v); toggleModal("value", true); }}
        onAdd={() => {
          setEdit({
            id: crypto.randomUUID(), title: "", description: "", icon: "Heart", order: nextOrder(values),
          }); toggleModal("value", true);
        }}
        onDelete={(id) => del("about_values", id, setValues, values)}
      />

      {/* TIMELINE */}
      <EntitySection
        title="Timeline"
        items={timeline}
        setItems={setTimeline}
        onEdit={(t) => { setEdit(t); toggleModal("timeline", true); }}
        onAdd={() => {
          setEdit({
            id: crypto.randomUUID(), year: "", title: "", description: "", order: nextOrder(timeline),
          }); toggleModal("timeline", true);
        }}
        onDelete={(id) => del("about_timeline", id, setTimeline, timeline)}
      />

      {/* TEAM */}
      <EntitySection
        title="Team"
        items={team}
        setItems={setTeam}
        onEdit={(m) => { setEdit(m); toggleModal("team", true); }}
        onAdd={() => {
          setEdit({
            id: crypto.randomUUID(), name: "", position: "", description: "", image_url: "", order: nextOrder(team),
          }); toggleModal("team", true);
        }}
        onDelete={(id) => del("about_team", id, setTeam, team)}
      />

      {/* -------- MODALS -------- */}
      <Modal title="Edit Hero / Settings" isOpen={modals.settings} onClose={() => toggleModal("settings", false)}>
        <SettingsForm initial={settings || { id: crypto.randomUUID(), hero_title: "", hero_subtitle: "", hero_image_url: "" }} onSave={(p) => upsert("about_settings", p, setSettings as any, [settings!], "Saved")} />
      </Modal>

      <Modal title="Stat" isOpen={modals.stat} onClose={() => toggleModal("stat", false)}>
        {edit && <StatForm initial={edit} onSave={(p) => upsert("about_stats", p, setStats, stats, "Stat saved")} />}
      </Modal>

      <Modal title="Value" isOpen={modals.value} onClose={() => toggleModal("value", false)}>
        {edit && <ValueForm initial={edit} onSave={(p) => upsert("about_values", p, setValues, values, "Value saved")} />}
      </Modal>

      <Modal title="Timeline" isOpen={modals.timeline} onClose={() => toggleModal("timeline", false)}>
        {edit && <TimelineForm initial={edit} onSave={(p) => upsert("about_timeline", p, setTimeline, timeline, "Timeline saved")} />}
      </Modal>

      <Modal title="Team" isOpen={modals.team} onClose={() => toggleModal("team", false)}>
        {edit && <TeamForm initial={edit} onSave={(p) => upsert("about_team", p, setTeam, team, "Team saved")} />}
      </Modal>
    </div>
  );
};

/* -------------------- Subcomponents -------------------- */
const Section: React.FC<{ title: string; onAdd?: () => void; addLabel?: string; children: React.ReactNode }> = ({ title, onAdd, addLabel = "Add", children }) => (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      {onAdd && (
        <button
          onClick={onAdd}
          className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          {addLabel}
        </button>
      )}
    </div>
    {children}
  </section>
);

const EntitySection = <T extends { id: string; order?: number; icon?: string; title?: string; name?: string; label?: string }>(
  { title, icon, items, setItems, onEdit, onAdd, onDelete }: {
    title: string; icon?: IconName; items: T[]; setItems: React.Dispatch<React.SetStateAction<T[]>>;
    onEdit: (item: T) => void; onAdd: () => void; onDelete: (id: string) => void;
  }
) => (
  <Section title={title} onAdd={onAdd}>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => {
        const Icon = iconMap[(item.icon as IconName) || (icon as IconName)] || Clock;
        return (
          <div key={item.id} className="bg-white rounded-lg shadow p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className="font-semibold">{item.title || (item as any).number || (item as any).name}</div>
                <div className="text-sm text-gray-600">{(item as any).label || (item as any).position}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => onEdit(item)} className="p-2 text-blue-600 hover:text-blue-800">
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => onDelete(item.id)} className="p-2 text-red-600 hover:text-red-800">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  </Section>
);

export default AdminAbout;
