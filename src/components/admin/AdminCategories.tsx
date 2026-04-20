import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Pencil, Plus, Trash2, X, Tags, ChevronUp, ChevronDown, PackageOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Category } from '../../lib/types';

const fieldLabelClass = 'text-xs font-medium text-gray-500 uppercase tracking-wide';
const inputClass =
  'w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500';
const inputMonoClass = `${inputClass} font-mono text-sm`;
const addButtonClass =
  'inline-flex items-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 shrink-0';

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
      <div className="flex min-h-full items-center justify-center bg-gray-50/50 p-12">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-teal-600" />
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50/50">
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 ring-1 ring-teal-200/60">
              <Tags className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">Категории каталога</h1>
              <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-gray-600">
                Справочник категорий для товаров (поле{' '}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.7rem] font-mono text-gray-800">category</code>
                ). Slug должен совпадать со значением у товара, чтобы фильтры и URL{' '}
                <code className="rounded bg-gray-100 px-1.5 py-0.5 text-[0.7rem] font-mono text-gray-800">
                  /categories/…
                </code>{' '}
                работали корректно. Порядок строк влияет на списки категорий на сайте и в форме товара.
              </p>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-teal-200/70 bg-white shadow-sm ring-1 ring-teal-900/[0.06]">
          <div className="flex flex-col gap-4 border-b border-teal-100/90 bg-gradient-to-r from-teal-50/70 to-white px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:px-6">
            <div className="min-w-0">
              <h2 className="text-lg font-semibold text-gray-900">Список категорий</h2>
              <p className="mt-1 text-sm text-gray-600">
                Порядок, название, slug и превью изображения. Используйте стрелки слева, чтобы изменить порядок.
              </p>
            </div>
            <button type="button" onClick={openNew} className={addButtonClass}>
              <Plus className="h-4 w-4 shrink-0" aria-hidden />
              Добавить категорию
            </button>
          </div>

          {rows.length === 0 ? (
            <div className="p-5 sm:p-6">
              <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50/80 px-4 py-12 text-center">
                <PackageOpen className="mx-auto h-10 w-10 text-gray-400" aria-hidden />
                <h3 className="mt-3 text-sm font-semibold text-gray-900">Категорий пока нет</h3>
                <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                  Добавьте первую категорию или импортируйте данные в таблицу{' '}
                  <code className="rounded bg-gray-100 px-1 font-mono text-xs">categories</code>.
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-gray-200 bg-gray-50/90">
                  <tr>
                    <th className="w-24 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Порядок
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Название
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Slug
                    </th>
                    <th className="w-28 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Картинка
                    </th>
                    <th className="w-36 px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((c, index) => (
                    <tr key={c.id} className="transition-colors hover:bg-teal-50/40">
                      <td className="px-4 py-3 align-middle">
                        <div className="inline-flex flex-col rounded-lg border border-gray-100 bg-gray-50 p-0.5">
                          <button
                            type="button"
                            onClick={() => moveRow(c.id, 'up')}
                            disabled={index === 0}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Выше"
                          >
                            <ChevronUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveRow(c.id, 'down')}
                            disabled={index === rows.length - 1}
                            className="p-1.5 text-gray-500 transition-colors hover:rounded-md hover:bg-white hover:text-gray-900 disabled:opacity-25 disabled:hover:bg-transparent"
                            aria-label="Ниже"
                          >
                            <ChevronDown size={16} />
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-900">{c.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{c.slug}</td>
                      <td className="px-4 py-3">
                        {c.image_url ? (
                          <img
                            src={c.image_url}
                            alt=""
                            className="h-10 w-14 rounded-lg border border-gray-200 object-cover shadow-sm"
                          />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(c)}
                          className="inline-flex rounded-lg p-2.5 text-teal-700 transition-colors hover:bg-teal-50"
                          aria-label="Редактировать"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(c)}
                          className="inline-flex rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-50"
                          aria-label="Удалить"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="rounded-xl border border-teal-100 bg-teal-50/80 px-4 py-3 sm:px-5">
          <p className="text-sm text-teal-900/90">
            <span className="font-semibold text-teal-950">Подсказка:</span> после изменения slug или порядка проверьте
            каталог и карточки товаров — поле <span className="font-mono text-teal-950/90">category</span> должно совпадать
            со slug.
          </p>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white shadow-xl ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Закрыть"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>Название *</label>
                <input
                  className={inputClass}
                  value={draft.name}
                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                  placeholder="Например: Матрасы"
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>
                  Slug * <span className="normal-case text-gray-400">(латиница, цифры, дефис)</span>
                </label>
                <input
                  className={inputMonoClass}
                  value={draft.slug}
                  onChange={(e) => setDraft((d) => ({ ...d, slug: slugifyInput(e.target.value) }))}
                  placeholder="mattresses"
                />
              </div>
              <div>
                <label className={`mb-2 block ${fieldLabelClass}`}>URL картинки (опционально)</label>
                <input
                  className={inputMonoClass}
                  value={draft.image_url}
                  onChange={(e) => setDraft((d) => ({ ...d, image_url: e.target.value }))}
                  placeholder="https://…"
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-2 border-t border-gray-100 px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
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
