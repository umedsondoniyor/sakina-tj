import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Plus, Trash2, X, Tags, ChevronUp, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category } from '../../lib/types';

function slugifyInput(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

const AdminCategories: React.FC = () => {
  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({ name: '', slug: '', image_url: '' });

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index', { ascending: true })
        .order('id', { ascending: true });
      if (error) throw error;
      setRows((data ?? []) as Category[]);
    } catch (e) {
      console.error(e);
      toast.error('Не удалось загрузить категории');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditing(null);
    setDraft({ name: '', slug: '', image_url: '' });
    setModalOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setDraft({
      name: c.name,
      slug: c.slug,
      image_url: c.image_url ?? '',
    });
    setModalOpen(true);
  };

  const save = async () => {
    const name = draft.name.trim();
    const slug = slugifyInput(draft.slug || slugifyInput(draft.name));
    if (!name || !slug) {
      toast.error('Укажите название и slug (латиница, цифры, дефис)');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name,
        slug,
        image_url: draft.image_url.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editing) {
        if (slug !== editing.slug) {
          const { count, error: cntErr } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('category', editing.slug);
          if (cntErr) throw cntErr;
          if (count && count > 0) {
            toast.error(
              'Нельзя изменить slug: сначала переназначьте товары этой категории или оставьте прежний slug.',
            );
            setSaving(false);
            return;
          }
        }
        const { error } = await supabase.from('categories').update(payload).eq('id', editing.id);
        if (error) throw error;
        toast.success('Категория обновлена');
      } else {
        const { data: maxRow } = await supabase
          .from('categories')
          .select('order_index')
          .order('order_index', { ascending: false })
          .limit(1)
          .maybeSingle();
        const nextOrder = (maxRow?.order_index ?? -1) + 1;

        const { error } = await supabase.from('categories').insert({
          ...payload,
          order_index: nextOrder,
          created_at: new Date().toISOString(),
        });
        if (error) {
          if (error.message?.includes('unique') || error.code === '23505') {
            toast.error('Категория с таким slug уже есть');
            setSaving(false);
            return;
          }
          throw error;
        }
        toast.success('Категория создана');
      }

      setModalOpen(false);
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Category) => {
    if (!confirm(`Удалить категорию «${c.name}»?`)) return;

    try {
      const { count, error: cntErr } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })
        .eq('category', c.slug);
      if (cntErr) throw cntErr;
      if (count && count > 0) {
        toast.error(`Нельзя удалить: ${count} товар(ов) используют эту категорию (поле category = «${c.slug}»).`);
        return;
      }

      const { error } = await supabase.from('categories').delete().eq('id', c.id);
      if (error) throw error;
      toast.success('Удалено');
      setRows((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      console.error(e);
      toast.error('Не удалось удалить');
    }
  };

  const moveRow = async (categoryId: string, direction: 'up' | 'down') => {
    const idx = rows.findIndex((r) => r.id === categoryId);
    if (idx === -1) return;
    const j = direction === 'up' ? idx - 1 : idx + 1;
    if (j < 0 || j >= rows.length) return;

    const reordered = [...rows];
    [reordered[idx], reordered[j]] = [reordered[j], reordered[idx]];

    const now = new Date().toISOString();
    try {
      const results = await Promise.all(
        reordered.map((row, i) =>
          supabase.from('categories').update({ order_index: i, updated_at: now }).eq('id', row.id),
        ),
      );
      const firstErr = results.find((r) => r.error)?.error;
      if (firstErr) throw firstErr;

      setRows(reordered.map((row, i) => ({ ...row, order_index: i })));
      toast.success('Порядок обновлён');
    } catch (e) {
      console.error(e);
      toast.error('Не удалось изменить порядок');
      await load();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Tags className="w-7 h-7 text-teal-600" />
            Категории каталога
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-xl">
            Справочник категорий для товаров (поле <code className="text-xs bg-gray-100 px-1 rounded">category</code>).
            Slug должен совпадать со значением у товара, чтобы фильтры и URL{' '}
            <code className="text-xs bg-gray-100 px-1 rounded">/categories/…</code> работали корректно. Порядок строк
            влияет на списки категорий на сайте и в форме товара.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="inline-flex items-center px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy"
        >
          <Plus className="w-4 h-4 mr-2" />
          Добавить категорию
        </button>
      </div>

      {rows.length === 0 ? (
        <div className="border border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-500">
          Категорий пока нет. Добавьте первую или импортируйте данные в таблицу <code>categories</code>.
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-3 font-medium w-24">Порядок</th>
                <th className="text-left p-3 font-medium">Название</th>
                <th className="text-left p-3 font-medium">Slug</th>
                <th className="text-left p-3 font-medium w-24">Картинка</th>
                <th className="text-right p-3 font-medium w-36">Действия</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c, index) => (
                <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50/80">
                  <td className="p-3">
                    <div className="flex flex-col items-start gap-0.5">
                      <button
                        type="button"
                        onClick={() => moveRow(c.id, 'up')}
                        disabled={index === 0}
                        className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        aria-label="Выше"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveRow(c.id, 'down')}
                        disabled={index === rows.length - 1}
                        className="p-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                        aria-label="Ниже"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-gray-900">{c.name}</td>
                  <td className="p-3 font-mono text-xs text-gray-700">{c.slug}</td>
                  <td className="p-3">
                    {c.image_url ? (
                      <img src={c.image_url} alt="" className="h-10 w-14 object-cover rounded border" />
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      type="button"
                      onClick={() => openEdit(c)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded inline-flex"
                      aria-label="Редактировать"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(c)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded inline-flex"
                      aria-label="Удалить"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">{editing ? 'Редактировать категорию' : 'Новая категория'}</h2>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1 rounded hover:bg-gray-100">
                <X size={22} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Название *</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Например: Матрасы"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Slug * <span className="text-gray-400">(латиница, цифры, дефис)</span>
                </label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: slugifyInput(e.target.value) }))}
                  placeholder="mattresses"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">URL картинки (опционально)</label>
                <input
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  value={draft.image_url}
                  onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded-lg">
                Отмена
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-brand-turquoise text-white rounded-lg hover:bg-brand-navy disabled:opacity-50"
              >
                {saving ? 'Сохранение…' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
