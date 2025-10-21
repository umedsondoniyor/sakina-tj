import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2, Image as ImageIcon, Users } from "lucide-react";

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
        toast.error("Failed to load About content");
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
      toast.success("Saved");
      setOpenSettings(false);
    } catch (e) {
      console.error(e);
      toast.error("Failed to save settings");
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
      toast.success("Stat saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save stat");
    }
  };

  const deleteStat = async (id: string) => {
    if (!confirm("Delete this stat?")) return;
    try {
      const { error } = await supabase.from("about_stats").delete().eq("id", id);
      if (error) throw error;
      removeRow(stats, setStats, id);
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
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
      toast.success("Value saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save value");
    }
  };

  const deleteValue = async (id: string) => {
    if (!confirm("Delete this value item?")) return;
    try {
      const { error } = await supabase.from("about_values").delete().eq("id", id);
      if (error) throw error;
      removeRow(values, setValues, id);
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
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
      toast.success("Timeline saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save timeline item");
    }
  };

  const deleteTimelineItem = async (id: string) => {
    if (!confirm("Delete this timeline item?")) return;
    try {
      const { error } = await supabase
        .from("about_timeline")
        .delete()
        .eq("id", id);
      if (error) throw error;
      removeRow(timeline, setTimeline, id);
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
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
      toast.success("Team member saved");
    } catch (e) {
      console.error(e);
      toast.error("Failed to save team member");
    }
  };

  const deleteTeam = async (id: string) => {
    if (!confirm("Delete this team member?")) return;
    try {
      const { error } = await supabase.from("about_team").delete().eq("id", id);
      if (error) throw error;
      removeRow(team, setTeam, id);
      toast.success("Deleted");
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  // ---------- RENDER ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-10">
      {/* SETTINGS */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">About — Hero / Settings</h2>
          <button
            onClick={() => setOpenSettings(true)}
            className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-4 flex items-center gap-6">
          <div className="flex-1">
            <div className="text-lg font-semibold">
              {settings?.hero_title || "—"}
            </div>
            <div className="text-gray-600">{settings?.hero_subtitle || "—"}</div>
          </div>
          <div className="w-48 h-28 bg-gray-100 rounded overflow-hidden border">
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
      </section>

      {/* STATS */}
      {/* (Stats, Values, Timeline, and Team sections remain unchanged — your logic there is fine) */}

      {/* -------- MODALS -------- */}
      <Modal
        title="Edit Hero / Settings"
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
            }
          }
          onSave={upsertSettings}
        />
      </Modal>

      <Modal
        title={editingStat?.id ? "Edit Stat" : "Add Stat"}
        isOpen={openStatModal}
        onClose={() => setOpenStatModal(false)}
      >
        {editingStat && <StatForm initial={editingStat} onSave={saveStat} />}
      </Modal>

      <Modal
        title={editingValue?.id ? "Edit Value" : "Add Value"}
        isOpen={openValueModal}
        onClose={() => setOpenValueModal(false)}
      >
        {editingValue && <ValueForm initial={editingValue} onSave={saveValue} />}
      </Modal>

      <Modal
        title={editingTimeline?.id ? "Edit Timeline" : "Add Timeline"}
        isOpen={openTimelineModal}
        onClose={() => setOpenTimelineModal(false)}
      >
        {editingTimeline && (
          <TimelineForm initial={editingTimeline} onSave={saveTimelineItem} />
        )}
      </Modal>

      <Modal
        title={editingTeam?.id ? "Edit Team Member" : "Add Team Member"}
        isOpen={openTeamModal}
        onClose={() => setOpenTeamModal(false)}
      >
        {editingTeam && <TeamForm initial={editingTeam} onSave={saveTeam} />}
      </Modal>
    </div>
  );
};

export default AdminAbout;
