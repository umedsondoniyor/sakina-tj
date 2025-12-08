import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import toast from "react-hot-toast";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Modal from "./ui/Modal";
import {
  MattressPageSettings,
  MattressCollection,
  MattressType,
  MattressHardnessLevel,
  MattressPopularFilter,
  MattressFirstPurchaseArticle,
} from "./ui/types";

const AdminMattresses: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<MattressPageSettings | null>(null);
  const [collections, setCollections] = useState<MattressCollection[]>([]);
  const [types, setTypes] = useState<MattressType[]>([]);
  const [hardnessLevels, setHardnessLevels] = useState<MattressHardnessLevel[]>([]);
  const [popularFilters, setPopularFilters] = useState<MattressPopularFilter[]>([]);
  const [articles, setArticles] = useState<MattressFirstPurchaseArticle[]>([]);

  // Modal states
  const [openSettings, setOpenSettings] = useState(false);
  const [editingCollection, setEditingCollection] = useState<MattressCollection | null>(null);
  const [openCollectionModal, setOpenCollectionModal] = useState(false);
  const [editingType, setEditingType] = useState<MattressType | null>(null);
  const [openTypeModal, setOpenTypeModal] = useState(false);
  const [editingHardness, setEditingHardness] = useState<MattressHardnessLevel | null>(null);
  const [openHardnessModal, setOpenHardnessModal] = useState(false);
  const [editingFilter, setEditingFilter] = useState<MattressPopularFilter | null>(null);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<MattressFirstPurchaseArticle | null>(null);
  const [openArticleModal, setOpenArticleModal] = useState(false);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        settingsRes,
        collectionsRes,
        typesRes,
        hardnessRes,
        filtersRes,
        articlesRes,
      ] = await Promise.all([
        supabase.from("mattress_page_settings").select("*").limit(1).maybeSingle(),
        supabase
          .from("mattress_collections")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("mattress_types")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("mattress_hardness_levels")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("mattress_popular_filters")
          .select("*")
          .order("order_index", { ascending: true }),
        supabase
          .from("mattress_first_purchase_articles")
          .select("*")
          .order("order_index", { ascending: true }),
      ]);

      if (settingsRes.error) throw settingsRes.error;
      if (collectionsRes.error) throw collectionsRes.error;
      if (typesRes.error) throw typesRes.error;
      if (hardnessRes.error) throw hardnessRes.error;
      if (filtersRes.error) throw filtersRes.error;
      if (articlesRes.error) throw articlesRes.error;

      setSettings(settingsRes.data || null);
      setCollections((collectionsRes.data || []) as MattressCollection[]);
      setTypes((typesRes.data || []) as MattressType[]);
      setHardnessLevels((hardnessRes.data || []) as MattressHardnessLevel[]);
      setPopularFilters((filtersRes.data || []) as MattressPopularFilter[]);
      setArticles((articlesRes.data || []) as MattressFirstPurchaseArticle[]);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось загрузить данные");
    } finally {
      setLoading(false);
    }
  };

  // Settings
  const upsertSettings = async (payload: Partial<MattressPageSettings>) => {
    try {
      const current = settings || {};
      const toSave = {
        ...current,
        ...payload,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase
        .from("mattress_page_settings")
        .upsert(toSave as any)
        .select("*")
        .single();
      if (error) throw error;
      setSettings(data as MattressPageSettings);
      toast.success("Настройки сохранены");
      setOpenSettings(false);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить настройки");
    }
  };

  // Collections
  const saveCollection = async (payload: Partial<MattressCollection>) => {
    try {
      if (editingCollection?.id) {
        const { error } = await supabase
          .from("mattress_collections")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingCollection.id);
        if (error) throw error;
        toast.success("Коллекция обновлена");
      } else {
        const maxOrder = Math.max(0, ...collections.map((c) => c.order_index || 0));
        const { error } = await supabase.from("mattress_collections").insert([
          {
            ...payload,
            order_index: maxOrder + 10,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast.success("Коллекция добавлена");
      }
      await loadData();
      setOpenCollectionModal(false);
      setEditingCollection(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить коллекцию");
    }
  };

  const deleteCollection = async (id: string) => {
    if (!confirm("Удалить коллекцию?")) return;
    try {
      const { error } = await supabase.from("mattress_collections").delete().eq("id", id);
      if (error) throw error;
      toast.success("Коллекция удалена");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить коллекцию");
    }
  };

  // Types
  const saveType = async (payload: Partial<MattressType>) => {
    try {
      if (editingType?.id) {
        const { error } = await supabase
          .from("mattress_types")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingType.id);
        if (error) throw error;
        toast.success("Тип обновлен");
      } else {
        const maxOrder = Math.max(0, ...types.map((t) => t.order_index || 0));
        const { error } = await supabase.from("mattress_types").insert([
          {
            ...payload,
            order_index: maxOrder + 10,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast.success("Тип добавлен");
      }
      await loadData();
      setOpenTypeModal(false);
      setEditingType(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить тип");
    }
  };

  const deleteType = async (id: string) => {
    if (!confirm("Удалить тип?")) return;
    try {
      const { error } = await supabase.from("mattress_types").delete().eq("id", id);
      if (error) throw error;
      toast.success("Тип удален");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить тип");
    }
  };

  // Hardness Levels
  const saveHardness = async (payload: Partial<MattressHardnessLevel>) => {
    try {
      if (editingHardness?.id) {
        const { error } = await supabase
          .from("mattress_hardness_levels")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingHardness.id);
        if (error) throw error;
        toast.success("Уровень жесткости обновлен");
      } else {
        const maxOrder = Math.max(0, ...hardnessLevels.map((h) => h.order_index || 0));
        const { error } = await supabase.from("mattress_hardness_levels").insert([
          {
            ...payload,
            order_index: maxOrder + 10,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast.success("Уровень жесткости добавлен");
      }
      await loadData();
      setOpenHardnessModal(false);
      setEditingHardness(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить уровень жесткости");
    }
  };

  const deleteHardness = async (id: string) => {
    if (!confirm("Удалить уровень жесткости?")) return;
    try {
      const { error } = await supabase.from("mattress_hardness_levels").delete().eq("id", id);
      if (error) throw error;
      toast.success("Уровень жесткости удален");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить уровень жесткости");
    }
  };

  // Popular Filters
  const saveFilter = async (payload: Partial<MattressPopularFilter>) => {
    try {
      if (editingFilter?.id) {
        const { error } = await supabase
          .from("mattress_popular_filters")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingFilter.id);
        if (error) throw error;
        toast.success("Фильтр обновлен");
      } else {
        const maxOrder = Math.max(0, ...popularFilters.map((f) => f.order_index || 0));
        const { error } = await supabase.from("mattress_popular_filters").insert([
          {
            ...payload,
            order_index: maxOrder + 10,
            is_active: true,
          },
        ]);
        if (error) throw error;
        toast.success("Фильтр добавлен");
      }
      await loadData();
      setOpenFilterModal(false);
      setEditingFilter(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить фильтр");
    }
  };

  const deleteFilter = async (id: string) => {
    if (!confirm("Удалить фильтр?")) return;
    try {
      const { error } = await supabase.from("mattress_popular_filters").delete().eq("id", id);
      if (error) throw error;
      toast.success("Фильтр удален");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить фильтр");
    }
  };

  // Articles
  const saveArticle = async (payload: Partial<MattressFirstPurchaseArticle>) => {
    try {
      if (editingArticle?.id) {
        const { error } = await supabase
          .from("mattress_first_purchase_articles")
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq("id", editingArticle.id);
        if (error) throw error;
        toast.success("Статья обновлена");
      } else {
        const maxOrder = Math.max(0, ...articles.map((a) => a.order_index || 0));
        const { error } = await supabase.from("mattress_first_purchase_articles").insert([
          {
            ...payload,
            order_index: maxOrder + 10,
            is_active: true,
            is_main: false,
          },
        ]);
        if (error) throw error;
        toast.success("Статья добавлена");
      }
      await loadData();
      setOpenArticleModal(false);
      setEditingArticle(null);
    } catch (e) {
      console.error(e);
      toast.error("Не удалось сохранить статью");
    }
  };

  const deleteArticle = async (id: string) => {
    if (!confirm("Удалить статью?")) return;
    try {
      const { error } = await supabase
        .from("mattress_first_purchase_articles")
        .delete()
        .eq("id", id);
      if (error) throw error;
      toast.success("Статья удалена");
      await loadData();
    } catch (e) {
      console.error(e);
      toast.error("Не удалось удалить статью");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Управление страницей матрасов</h1>
        <button
          onClick={() => setOpenSettings(true)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 flex items-center"
        >
          <Pencil className="w-4 h-4 mr-2" />
          Настройки страницы
        </button>
      </div>

      {/* Settings Modal */}
      <Modal
        title="Настройки страницы"
        isOpen={openSettings && !!settings}
        onClose={() => setOpenSettings(false)}
        size="large"
      >
        {settings && (
          <SettingsForm
            settings={settings}
            onSave={upsertSettings}
            onCancel={() => setOpenSettings(false)}
          />
        )}
      </Modal>

      {/* Collections Section */}
      <Section
        title="Коллекции"
        items={collections}
        onAdd={() => {
          setEditingCollection(null);
          setOpenCollectionModal(true);
        }}
        onEdit={(item) => {
          setEditingCollection(item);
          setOpenCollectionModal(true);
        }}
        onDelete={deleteCollection}
        renderItem={(item) => (
          <div className="flex items-center space-x-4">
            <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        )}
      />

      {/* Collection Modal */}
      <Modal
        title={editingCollection ? "Редактировать коллекцию" : "Добавить коллекцию"}
        isOpen={openCollectionModal}
        onClose={() => {
          setOpenCollectionModal(false);
          setEditingCollection(null);
        }}
      >
        <CollectionForm
          collection={editingCollection}
          onSave={saveCollection}
          onCancel={() => {
            setOpenCollectionModal(false);
            setEditingCollection(null);
          }}
        />
      </Modal>

      {/* Types Section */}
      <Section
        title="Типы матрасов"
        items={types}
        onAdd={() => {
          setEditingType(null);
          setOpenTypeModal(true);
        }}
        onEdit={(item) => {
          setEditingType(item);
          setOpenTypeModal(true);
        }}
        onDelete={deleteType}
        renderItem={(item) => (
          <div className="flex items-center space-x-4">
            <img src={item.image_url} alt={item.name} className="w-16 h-16 object-cover rounded" />
            <p className="font-medium">{item.name}</p>
          </div>
        )}
      />

      {/* Type Modal */}
      <Modal
        title={editingType ? "Редактировать тип" : "Добавить тип"}
        isOpen={openTypeModal}
        onClose={() => {
          setOpenTypeModal(false);
          setEditingType(null);
        }}
      >
        <TypeForm
          type={editingType}
          onSave={saveType}
          onCancel={() => {
            setOpenTypeModal(false);
            setEditingType(null);
          }}
        />
      </Modal>

      {/* Hardness Levels Section */}
      <Section
        title="Уровни жесткости"
        items={hardnessLevels}
        onAdd={() => {
          setEditingHardness(null);
          setOpenHardnessModal(true);
        }}
        onEdit={(item) => {
          setEditingHardness(item);
          setOpenHardnessModal(true);
        }}
        onDelete={deleteHardness}
        renderItem={(item) => (
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-sm text-gray-600">{item.description}</p>
            <p className="text-xs text-gray-500">Уровень: {item.level}/5</p>
          </div>
        )}
      />

      {/* Hardness Modal */}
      <Modal
        title={editingHardness ? "Редактировать уровень жесткости" : "Добавить уровень жесткости"}
        isOpen={openHardnessModal}
        onClose={() => {
          setOpenHardnessModal(false);
          setEditingHardness(null);
        }}
      >
        <HardnessForm
          hardness={editingHardness}
          onSave={saveHardness}
          onCancel={() => {
            setOpenHardnessModal(false);
            setEditingHardness(null);
          }}
        />
      </Modal>

      {/* Popular Filters Section */}
      <Section
        title="Популярные фильтры"
        items={popularFilters}
        onAdd={() => {
          setEditingFilter(null);
          setOpenFilterModal(true);
        }}
        onEdit={(item) => {
          setEditingFilter(item);
          setOpenFilterModal(true);
        }}
        onDelete={deleteFilter}
        renderItem={(item) => (
          <div className="flex items-center space-x-4">
            <img src={item.image_url} alt={item.name} className="w-16 h-16 object-contain" />
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          </div>
        )}
      />

      {/* Filter Modal */}
      <Modal
        title={editingFilter ? "Редактировать фильтр" : "Добавить фильтр"}
        isOpen={openFilterModal}
        onClose={() => {
          setOpenFilterModal(false);
          setEditingFilter(null);
        }}
      >
        <FilterForm
          filter={editingFilter}
          onSave={saveFilter}
          onCancel={() => {
            setOpenFilterModal(false);
            setEditingFilter(null);
          }}
        />
      </Modal>

      {/* Articles Section */}
      <Section
        title="Статьи для первой покупки"
        items={articles}
        onAdd={() => {
          setEditingArticle(null);
          setOpenArticleModal(true);
        }}
        onEdit={(item) => {
          setEditingArticle(item);
          setOpenArticleModal(true);
        }}
        onDelete={deleteArticle}
        renderItem={(item) => (
          <div className="flex items-center space-x-4">
            <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded" />
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-gray-600">{item.description}</p>
              {item.is_main && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Главная</span>
              )}
            </div>
          </div>
        )}
      />

      {/* Article Modal */}
      <Modal
        title={editingArticle ? "Редактировать статью" : "Добавить статью"}
        isOpen={openArticleModal}
        onClose={() => {
          setOpenArticleModal(false);
          setEditingArticle(null);
        }}
      >
        <ArticleForm
          article={editingArticle}
          onSave={saveArticle}
          onCancel={() => {
            setOpenArticleModal(false);
            setEditingArticle(null);
          }}
        />
      </Modal>
    </div>
  );
};

// Reusable Section Component
const Section = <T extends { id: string }>({
  title,
  items,
  onAdd,
  onEdit,
  onDelete,
  renderItem,
}: {
  title: string;
  items: T[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
  renderItem: (item: T) => React.ReactNode;
}) => (
  <div className="bg-white rounded-lg shadow border p-6">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      <button
        onClick={onAdd}
        className="flex items-center px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Добавить
      </button>
    </div>
    <div className="space-y-3">
      {items.length === 0 ? (
        <p className="text-gray-500 text-center py-4">Нет элементов</p>
      ) : (
        items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
          >
            {renderItem(item)}
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(item)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

// Form Components
const SettingsForm = ({
  settings,
  onSave,
  onCancel,
}: {
  settings: MattressPageSettings;
  onSave: (payload: Partial<MattressPageSettings>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState(settings);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок страницы</label>
        <input
          type="text"
          value={form.hero_title}
          onChange={(e) => setForm({ ...form, hero_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание страницы</label>
        <input
          type="text"
          value={form.hero_description}
          onChange={(e) => setForm({ ...form, hero_description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'По типу'</label>
        <input
          type="text"
          value={form.type_section_title}
          onChange={(e) => setForm({ ...form, type_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'По жесткости'</label>
        <input
          type="text"
          value={form.hardness_section_title}
          onChange={(e) => setForm({ ...form, hardness_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'Популярные фильтры'</label>
        <input
          type="text"
          value={form.popular_filters_section_title}
          onChange={(e) => setForm({ ...form, popular_filters_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'По коллекции'</label>
        <input
          type="text"
          value={form.collections_section_title}
          onChange={(e) => setForm({ ...form, collections_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'Первая покупка'</label>
        <input
          type="text"
          value={form.first_purchase_section_title}
          onChange={(e) => setForm({ ...form, first_purchase_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок секции 'Хиты продаж'</label>
        <input
          type="text"
          value={form.hit_sales_section_title}
          onChange={(e) => setForm({ ...form, hit_sales_section_title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Текст кнопки 'Смотреть все'</label>
        <input
          type="text"
          value={form.view_all_button_text}
          onChange={(e) => setForm({ ...form, view_all_button_text: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

const CollectionForm = ({
  collection,
  onSave,
  onCancel,
}: {
  collection: MattressCollection | null;
  onSave: (payload: Partial<MattressCollection>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<MattressCollection>>({
    title: collection?.title || "",
    description: collection?.description || "",
    image_url: collection?.image_url || "",
    collection_type: collection?.collection_type || "budget",
    price_min: collection?.price_min || null,
    price_max: collection?.price_max || null,
    preferences: collection?.preferences || [],
  });

  useEffect(() => {
    setForm({
      title: collection?.title || "",
      description: collection?.description || "",
      image_url: collection?.image_url || "",
      collection_type: collection?.collection_type || "budget",
      price_min: collection?.price_min || null,
      price_max: collection?.price_max || null,
      preferences: collection?.preferences || [],
    });
  }, [collection]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL изображения *</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Тип коллекции *</label>
        <select
          value={form.collection_type}
          onChange={(e) => setForm({ ...form, collection_type: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="budget">Бюджетные</option>
          <option value="premium">Премиум</option>
          <option value="relaxation">Релаксация</option>
          <option value="business">Бизнес</option>
          <option value="sleep">Сон</option>
          <option value="healthy-sleep">Здоровый сон</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Минимальная цена</label>
          <input
            type="number"
            value={form.price_min || ""}
            onChange={(e) =>
              setForm({ ...form, price_min: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Максимальная цена</label>
          <input
            type="number"
            value={form.price_max || ""}
            onChange={(e) =>
              setForm({ ...form, price_max: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
          disabled={!form.title || !form.description || !form.image_url}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

const TypeForm = ({
  type,
  onSave,
  onCancel,
}: {
  type: MattressType | null;
  onSave: (payload: Partial<MattressType>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<MattressType>>({
    name: type?.name || "",
    image_url: type?.image_url || "",
    type_id: type?.type_id || "",
    width_min: type?.width_min || null,
    width_max: type?.width_max || null,
    age_categories: type?.age_categories || [],
    preferences: type?.preferences || [],
    mattress_types: type?.mattress_types || [],
  });

  useEffect(() => {
    setForm({
      name: type?.name || "",
      image_url: type?.image_url || "",
      type_id: type?.type_id || "",
      width_min: type?.width_min || null,
      width_max: type?.width_max || null,
      age_categories: type?.age_categories || [],
      preferences: type?.preferences || [],
      mattress_types: type?.mattress_types || [],
    });
  }, [type]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL изображения *</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">ID типа (уникальный) *</label>
        <input
          type="text"
          value={form.type_id}
          onChange={(e) => setForm({ ...form, type_id: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
          disabled={!!type}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Минимальная ширина (см)</label>
          <input
            type="number"
            value={form.width_min || ""}
            onChange={(e) =>
              setForm({ ...form, width_min: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Максимальная ширина (см)</label>
          <input
            type="number"
            value={form.width_max || ""}
            onChange={(e) =>
              setForm({ ...form, width_max: e.target.value ? parseInt(e.target.value) : null })
            }
            className="w-full px-3 py-2 border rounded"
          />
        </div>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
          disabled={!form.name || !form.image_url || !form.type_id}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

const HardnessForm = ({
  hardness,
  onSave,
  onCancel,
}: {
  hardness: MattressHardnessLevel | null;
  onSave: (payload: Partial<MattressHardnessLevel>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<MattressHardnessLevel>>({
    name: hardness?.name || "",
    description: hardness?.description || "",
    level: hardness?.level || 3,
    hardness_value: hardness?.hardness_value || "Средняя",
  });

  useEffect(() => {
    setForm({
      name: hardness?.name || "",
      description: hardness?.description || "",
      level: hardness?.level || 3,
      hardness_value: hardness?.hardness_value || "Средняя",
    });
  }, [hardness]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Уровень (1-5) *</label>
        <input
          type="number"
          min="1"
          max="5"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Значение жесткости *</label>
        <select
          value={form.hardness_value}
          onChange={(e) => setForm({ ...form, hardness_value: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        >
          <option value="Мягкая">Мягкая</option>
          <option value="Средняя">Средняя</option>
          <option value="Жесткая">Жесткая</option>
        </select>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
          disabled={!form.name || !form.description || !form.level || !form.hardness_value}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

const FilterForm = ({
  filter,
  onSave,
  onCancel,
}: {
  filter: MattressPopularFilter | null;
  onSave: (payload: Partial<MattressPopularFilter>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<MattressPopularFilter>>({
    name: filter?.name || "",
    description: filter?.description || "",
    image_url: filter?.image_url || "",
    filter_id: filter?.filter_id || "",
    age_categories: filter?.age_categories || [],
    preferences: filter?.preferences || [],
    functions: filter?.functions || [],
  });

  useEffect(() => {
    setForm({
      name: filter?.name || "",
      description: filter?.description || "",
      image_url: filter?.image_url || "",
      filter_id: filter?.filter_id || "",
      age_categories: filter?.age_categories || [],
      preferences: filter?.preferences || [],
      functions: filter?.functions || [],
    });
  }, [filter]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Название *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL изображения *</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">ID фильтра (уникальный) *</label>
        <input
          type="text"
          value={form.filter_id}
          onChange={(e) => setForm({ ...form, filter_id: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
          disabled={!!filter}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
          disabled={!form.name || !form.description || !form.image_url || !form.filter_id}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

const ArticleForm = ({
  article,
  onSave,
  onCancel,
}: {
  article: MattressFirstPurchaseArticle | null;
  onSave: (payload: Partial<MattressFirstPurchaseArticle>) => void;
  onCancel: () => void;
}) => {
  const [form, setForm] = useState<Partial<MattressFirstPurchaseArticle>>({
    title: article?.title || "",
    description: article?.description || "",
    image_url: article?.image_url || "",
    article_url: article?.article_url || "",
    is_main: article?.is_main || false,
  });

  useEffect(() => {
    setForm({
      title: article?.title || "",
      description: article?.description || "",
      image_url: article?.image_url || "",
      article_url: article?.article_url || "",
      is_main: article?.is_main || false,
    });
  }, [article]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Заголовок *</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Описание *</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          rows={3}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL изображения *</label>
        <input
          type="text"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          className="w-full px-3 py-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">URL статьи</label>
        <input
          type="text"
          value={form.article_url || ""}
          onChange={(e) => setForm({ ...form, article_url: e.target.value })}
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <div>
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={form.is_main}
            onChange={(e) => setForm({ ...form, is_main: e.target.checked })}
            className="rounded"
          />
          <span className="text-sm font-medium">Главная статья</span>
        </label>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <button onClick={onCancel} className="px-4 py-2 border rounded">
          Отмена
        </button>
        <button
          onClick={() => onSave(form)}
          className="px-4 py-2 bg-teal-500 text-white rounded"
          disabled={!form.title || !form.description || !form.image_url}
        >
          Сохранить
        </button>
      </div>
    </div>
  );
};

export default AdminMattresses;

