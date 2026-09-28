import './style.css';
import { lang, switchLang, t, type Lang } from './i18n';
import { TEMPLATES, type Template } from './templates';
import { closeSheet, downloadBlob, esc, openSheet, pickFile, registerPwa, showToast, todayStamp, uid } from './ui';

interface Item {
  id: string;
  text: string;
  checked: boolean;
}

interface Cat {
  id: string;
  name: string;
  items: Item[];
}

interface PackList {
  id: string;
  name: string;
  emoji: string;
  cats: Cat[];
  created: number;
}

interface State {
  lists: PackList[];
  remainingOnly: boolean;
}

const STORE_KEY = 'tabi-no-mochimono:v1';
const LIST_EMOJIS = ['🧳', '✈️', '🚄', '🏖️', '💼', '⛺', '🎿', '🏕️', '🗼', '♨️', '👶', '🐶'];

const app = document.querySelector<HTMLDivElement>('#app')!;
let editMode = false;

function load(): State {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) {
      const s = JSON.parse(raw) as Partial<State>;
      return {
        lists: Array.isArray(s.lists) ? s.lists.map(sanitizeList).filter((x): x is PackList => !!x) : [],
        remainingOnly: !!s.remainingOnly,
      };
    }
  } catch {
    /* ignore */
  }
  return { lists: [], remainingOnly: false };
}

function sanitizeList(v: unknown): PackList | null {
  if (!v || typeof v !== 'object') return null;
  const o = v as Record<string, unknown>;
  if (typeof o.name !== 'string' || !Array.isArray(o.cats)) return null;
  const cats: Cat[] = (o.cats as unknown[])
    .filter((c): c is Record<string, unknown> => !!c && typeof c === 'object')
    .map((c) => ({
      id: typeof c.id === 'string' ? c.id : uid(),
      name: typeof c.name === 'string' ? c.name : '',
      items: Array.isArray(c.items)
        ? (c.items as unknown[])
            .filter((i): i is Record<string, unknown> => !!i && typeof i === 'object' && typeof (i as Record<string, unknown>).text === 'string')
            .map((i) => ({ id: typeof i.id === 'string' ? i.id : uid(), text: String(i.text), checked: !!i.checked }))
        : [],
    }));
  return {
    id: typeof o.id === 'string' ? o.id : uid(),
    name: o.name,
    emoji: typeof o.emoji === 'string' && o.emoji ? o.emoji : '🧳',
    cats,
    created: typeof o.created === 'number' ? o.created : Date.now(),
  };
}

const state = load();

function save(): void {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function currentList(): PackList | null {
  const m = location.hash.match(/^#\/l\/(.+)$/);
  if (!m) return null;
  return state.lists.find((l) => l.id === decodeURIComponent(m[1]!)) ?? null;
}

function counts(l: PackList): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const c of l.cats) {
    for (const i of c.items) {
      total++;
      if (i.checked) done++;
    }
  }
  return { done, total };
}

function move<T>(arr: T[], i: number, dir: -1 | 1): void {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return;
  [arr[i], arr[j]] = [arr[j]!, arr[i]!];
}

function fromTemplate(tp: Template, name: string): PackList {
  const l = lang();
  return {
    id: uid(),
    name,
    emoji: tp.emoji,
    created: Date.now(),
    cats: tp.cats.map((c) => ({
      id: uid(),
      name: l === 'ja' ? c.ja : c.en,
      items: c.items.map(([ja, en]) => ({ id: uid(), text: l === 'ja' ? ja : en, checked: false })),
    })),
  };
}

function cloneList(src: PackList): PackList {
  return {
    ...src,
    id: uid(),
    name: src.name + t('copySuffix'),
    created: Date.now(),
    cats: src.cats.map((c) => ({ ...c, id: uid(), items: c.items.map((i) => ({ ...i, id: uid() })) })),
  };
}

// ---------- render ----------
function headerHtml(): string {
  const l = lang();
  return `
  <header>
    <div class="header-row">
      <div class="titles">
        <img class="logo" src="./icons/icon-192.png" alt="" />
        <div>
          <h1>${t('appTitle')}</h1>
          <p class="sub">${t('appSub')}</p>
        </div>
      </div>
      <div class="lang-toggle" role="group" aria-label="Language">
        <button type="button" data-lang="ja" class="${l === 'ja' ? 'active' : ''}">日本語</button>
        <button type="button" data-lang="en" class="${l === 'en' ? 'active' : ''}">English</button>
      </div>
    </div>
  </header>`;
}

function progressBar(done: number, total: number): string {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return `<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${pct}%"></span></div>`;
}

function renderHome(): void {
  const lists = state.lists;
  const cards = lists
    .map((l, i) => {
      const { done, total } = counts(l);
      const complete = total > 0 && done === total;
      return `
      <li class="list-card card ${complete ? 'complete' : ''}">
        <button type="button" class="list-open" data-open="${l.id}">
          <span class="list-emoji">${esc(l.emoji)}</span>
          <span class="list-main">
            <span class="list-name">${esc(l.name)}</span>
            ${progressBar(done, total)}
          </span>
          <span class="list-count">${complete ? '✓' : t('items', { d: done, n: total })}</span>
        </button>
        ${
          editMode
            ? `<span class="order-btns">
                <button type="button" class="icon-btn" data-lmove="${i}:-1" aria-label="${t('moveUp')}" ${i === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" class="icon-btn" data-lmove="${i}:1" aria-label="${t('moveDown')}" ${i === lists.length - 1 ? 'disabled' : ''}>↓</button>
              </span>`
            : ''
        }
      </li>`;
    })
    .join('');
  const templates = TEMPLATES.map(
    (tp) => `<button type="button" class="tpl" data-tpl="${tp.id}"><span class="tpl-emoji">${tp.emoji}</span><span>${esc(lang() === 'ja' ? tp.ja : tp.en)}</span></button>`,
  ).join('');
  app.innerHTML = `
    ${headerHtml()}
    <main class="main">
      ${
        lists.length
          ? `<div class="section-head"><h2>${t('myLists')}</h2>${
              lists.length > 1
                ? `<button type="button" class="btn small ghost" data-home-edit>${editMode ? t('doneEditing') : t('reorder')}</button>`
                : ''
            }</div>
             <ul class="lists">${cards}</ul>`
          : `<div class="empty"><div class="big">🧳</div><p><strong>${t('noLists')}</strong></p><p>${t('noListsBody')}</p></div>`
      }
      <div class="section-head"><h2>${t('fromTemplate')}</h2></div>
      <div class="tpl-grid">
        ${templates}
        <button type="button" class="tpl blank" data-tpl="blank"><span class="tpl-emoji">＋</span><span>${t('blank')}</span></button>
      </div>
      <div class="section-head"><h2>${t('data')}</h2></div>
      <div class="row wrap">
        <button type="button" class="btn small" data-export ${lists.length ? '' : 'disabled'}>⬇ ${t('exportJson')}</button>
        <button type="button" class="btn small" data-import>⬆ ${t('importJson')}</button>
      </div>
    </main>
    <footer class="note">${t('footer')}</footer>
  `;
}

function renderList(l: PackList): void {
  const { done, total } = counts(l);
  const complete = total > 0 && done === total;
  const cats = l.cats
    .map((c, ci) => {
      const cDone = c.items.filter((i) => i.checked).length;
      const visible = state.remainingOnly && !editMode ? c.items.filter((i) => !i.checked) : c.items;
      const items = visible
        .map((it) => {
          const ii = c.items.indexOf(it);
          return `
          <li class="item ${it.checked ? 'checked' : ''}">
            <button type="button" class="check" data-toggle="${c.id}:${it.id}" aria-pressed="${it.checked}">
              <span class="box" aria-hidden="true"></span>
              <span class="text">${esc(it.text)}</span>
            </button>
            ${
              editMode
                ? `<span class="order-btns">
                    <button type="button" class="icon-btn sm" data-imove="${c.id}:${ii}:-1" aria-label="${t('moveUp')}" ${ii === 0 ? 'disabled' : ''}>↑</button>
                    <button type="button" class="icon-btn sm" data-imove="${c.id}:${ii}:1" aria-label="${t('moveDown')}" ${ii === c.items.length - 1 ? 'disabled' : ''}>↓</button>
                    <button type="button" class="icon-btn sm del" data-idel="${c.id}:${it.id}" aria-label="${t('remove')}">✕</button>
                  </span>`
                : ''
            }
          </li>`;
        })
        .join('');
      const hiddenAll = state.remainingOnly && !editMode && c.items.length > 0 && visible.length === 0;
      return `
      <section class="cat card" data-cat="${c.id}">
        <div class="cat-head">
          <h3>${esc(c.name || t('otherCat'))}</h3>
          <span class="cat-count ${c.items.length && cDone === c.items.length ? 'ok' : ''}">${cDone}/${c.items.length}</span>
          ${
            editMode
              ? `<span class="order-btns">
                  <button type="button" class="icon-btn sm" data-cmove="${ci}:-1" aria-label="${t('moveUp')}" ${ci === 0 ? 'disabled' : ''}>↑</button>
                  <button type="button" class="icon-btn sm" data-cmove="${ci}:1" aria-label="${t('moveDown')}" ${ci === l.cats.length - 1 ? 'disabled' : ''}>↓</button>
                  <button type="button" class="icon-btn sm" data-crename="${c.id}" aria-label="${t('renameCategory')}">✎</button>
                  <button type="button" class="icon-btn sm del" data-cdel="${c.id}" aria-label="${t('deleteCategory')}">✕</button>
                </span>`
              : ''
          }
        </div>
        ${items ? `<ul class="items">${items}</ul>` : ''}
        ${hiddenAll ? `<p class="cat-empty">✓ ${t('allHidden')}</p>` : ''}
        ${!c.items.length ? `<p class="cat-empty">${t('emptyCat')}</p>` : ''}
        <form class="add-item" data-add="${c.id}">
          <input type="text" name="text" placeholder="${esc(t('addItemPh'))}" maxlength="80" enterkeyhint="enter" autocomplete="off" />
          <button type="submit" class="icon-btn add" aria-label="${t('add')}">＋</button>
        </form>
      </section>`;
    })
    .join('');
  app.innerHTML = `
    <div class="topbar">
      <button type="button" class="icon-btn" data-back aria-label="${t('back')}">←</button>
      <button type="button" class="list-title" data-rename><span>${esc(l.emoji)}</span><span class="nm">${esc(l.name)}</span></button>
      <button type="button" class="icon-btn" data-menu aria-label="${t('menu')}">⋯</button>
    </div>
    <div class="progress card ${complete ? 'complete' : ''}">
      <div class="row">
        <strong class="pct">${total ? Math.round((done / total) * 100) : 0}%</strong>
        <span class="muted">${t('items', { d: done, n: total })}</span>
        <span class="spacer"></span>
        ${
          editMode
            ? `<button type="button" class="btn small primary" data-edit-done>${t('doneEditing')}</button>`
            : `<button type="button" class="btn small soft" data-remaining>${state.remainingOnly ? t('showAll') : t('remainingOnly')}</button>`
        }
      </div>
      ${progressBar(done, total)}
      ${complete ? `<p class="done-msg">${t('progressDone')}</p>` : ''}
    </div>
    <main class="main cats">${cats}
      <button type="button" class="btn block dashed" data-add-cat>＋ ${t('addCategory')}</button>
    </main>
    <footer class="note">${t('footer')}</footer>
  `;
}

function render(): void {
  const l = currentList();
  if (location.hash.startsWith('#/l/') && !l) {
    history.replaceState(null, '', location.pathname + location.search);
  }
  if (l) renderList(l);
  else renderHome();
}

// ---------- sheets ----------
function nameSheet(opts: {
  title: string;
  value: string;
  emoji?: string;
  onSave: (name: string, emoji?: string) => void;
}): void {
  let emoji = opts.emoji;
  const sheet = openSheet(`
    <h2>${esc(opts.title)}</h2>
    <label class="field">${opts.emoji !== undefined ? t('listName') : t('categoryName')}
      <input type="text" id="nm" maxlength="60" value="${esc(opts.value)}" enterkeyhint="done" />
    </label>
    ${
      emoji !== undefined
        ? `<div class="field">${t('emoji')}<div class="emo-grid">${LIST_EMOJIS.map(
            (e) => `<button type="button" class="emo ${e === emoji ? 'active' : ''}" data-emo="${e}">${e}</button>`,
          ).join('')}</div></div>`
        : ''
    }
    <div class="actions">
      <button type="button" class="btn" data-s="cancel">${t('cancel')}</button>
      <button type="button" class="btn primary" data-s="save">${t('save')}</button>
    </div>
  `);
  const input = sheet.querySelector<HTMLInputElement>('#nm')!;
  window.setTimeout(() => input.select(), 60);
  const commit = () => {
    const v = input.value.trim();
    if (!v) {
      input.focus();
      return;
    }
    closeSheet();
    opts.onSave(v, emoji);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') commit();
  });
  sheet.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const emo = target.closest<HTMLElement>('[data-emo]');
    if (emo) {
      emoji = emo.dataset.emo!;
      sheet.querySelectorAll('.emo').forEach((b) => b.classList.toggle('active', b === emo));
    }
    const s = target.closest<HTMLElement>('[data-s]')?.dataset.s;
    if (s === 'cancel') closeSheet();
    if (s === 'save') commit();
  });
}

function createFromTemplate(id: string): void {
  const tp = TEMPLATES.find((x) => x.id === id);
  const defaultName = tp ? (lang() === 'ja' ? tp.ja : tp.en) : t('newList');
  nameSheet({
    title: t('newList'),
    value: defaultName,
    emoji: tp?.emoji ?? '🧳',
    onSave: (name, emoji) => {
      const l: PackList = tp
        ? fromTemplate(tp, name)
        : { id: uid(), name, emoji: '🧳', created: Date.now(), cats: [{ id: uid(), name: lang() === 'ja' ? '持ち物' : 'Items', items: [] }] };
      if (emoji) l.emoji = emoji;
      state.lists.unshift(l);
      save();
      editMode = false;
      location.hash = `#/l/${l.id}`;
    },
  });
}

function menuSheet(l: PackList): void {
  const sheet = openSheet(`
    <h2>${esc(l.emoji)} ${esc(l.name)}</h2>
    <div class="menu-list">
      <button type="button" class="btn" data-m="rename">✎ ${t('rename')}</button>
      <button type="button" class="btn" data-m="reorder">↕ ${t('reorder')}</button>
      <button type="button" class="btn" data-m="addcat">＋ ${t('addCategory')}</button>
      <button type="button" class="btn" data-m="reset">↺ ${t('resetChecks')}</button>
      <button type="button" class="btn" data-m="dup">⧉ ${t('duplicate')}</button>
      <button type="button" class="btn danger" data-m="delete">🗑 ${t('deleteList')}</button>
    </div>
    <div class="actions"><button type="button" class="btn" data-m="close">${t('cancel')}</button></div>
  `);
  sheet.addEventListener('click', (e) => {
    const m = (e.target as HTMLElement).closest<HTMLElement>('[data-m]')?.dataset.m;
    if (!m) return;
    closeSheet();
    if (m === 'rename') renameList(l);
    if (m === 'reorder') {
      editMode = true;
      render();
    }
    if (m === 'addcat') addCategory(l);
    if (m === 'reset') {
      if (!confirm(t('confirmReset'))) return;
      l.cats.forEach((c) => c.items.forEach((i) => (i.checked = false)));
      save();
      render();
      showToast(t('resetDone'));
    }
    if (m === 'dup') {
      const copy = cloneList(l);
      state.lists.splice(state.lists.indexOf(l) + 1, 0, copy);
      save();
      location.hash = `#/l/${copy.id}`;
      showToast(t('duplicated'));
    }
    if (m === 'delete') {
      if (!confirm(t('confirmDeleteList', { n: l.name }))) return;
      state.lists = state.lists.filter((x) => x !== l);
      save();
      location.hash = '';
      showToast(t('deleted'));
    }
  });
}

function renameList(l: PackList): void {
  nameSheet({
    title: t('rename'),
    value: l.name,
    emoji: l.emoji,
    onSave: (name, emoji) => {
      l.name = name;
      if (emoji) l.emoji = emoji;
      save();
      render();
    },
  });
}

function addCategory(l: PackList): void {
  nameSheet({
    title: t('addCategory'),
    value: '',
    onSave: (name) => {
      l.cats.push({ id: uid(), name, items: [] });
      save();
      render();
      window.setTimeout(() => {
        document.querySelector<HTMLInputElement>(`[data-add="${l.cats[l.cats.length - 1]!.id}"] input`)?.focus();
      }, 30);
    },
  });
}

async function importJson(): Promise<void> {
  const file = await pickFile('application/json,.json');
  if (!file) return;
  try {
    const data = JSON.parse(await file.text()) as unknown;
    const arr = Array.isArray(data) ? data : (data as { lists?: unknown[] })?.lists;
    if (!Array.isArray(arr)) throw new Error('format');
    const lists = arr.map(sanitizeList).filter((x): x is PackList => !!x);
    if (!lists.length) throw new Error('empty');
    const ids = new Set(state.lists.map((l) => l.id));
    for (const l of lists) {
      if (ids.has(l.id)) l.id = uid();
      state.lists.push(l);
    }
    save();
    render();
    showToast(t('imported', { n: lists.length }));
  } catch {
    showToast(t('importFailed'));
  }
}

function exportJson(): void {
  const data = { app: 'tabi-no-mochimono', version: 1, exportedAt: new Date().toISOString(), lists: state.lists };
  downloadBlob(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }), `tabi-no-mochimono-${todayStamp()}.json`);
  showToast(t('exported'));
}

// ---------- events ----------
app.addEventListener('click', (e) => {
  const target = e.target as HTMLElement;
  const d = (k: string) => target.closest<HTMLElement>(`[data-${k}]`)?.dataset[k.replace(/-(\w)/g, (_, c: string) => c.toUpperCase())];
  const l = currentList();

  const lg = d('lang') as Lang | undefined;
  if (lg) {
    switchLang(lg);
    render();
    return;
  }
  const open = d('open');
  if (open) {
    editMode = false;
    location.hash = `#/l/${open}`;
    return;
  }
  const tpl = d('tpl');
  if (tpl) return createFromTemplate(tpl);
  if (target.closest('[data-home-edit]')) {
    editMode = !editMode;
    return render();
  }
  const lmove = d('lmove');
  if (lmove) {
    const [i, dir] = lmove.split(':').map(Number);
    move(state.lists, i!, dir as -1 | 1);
    save();
    return render();
  }
  if (target.closest('[data-export]')) return exportJson();
  if (target.closest('[data-import]')) return void importJson();

  if (!l) return;
  if (target.closest('[data-back]')) {
    editMode = false;
    location.hash = '';
    return;
  }
  if (target.closest('[data-menu]')) return menuSheet(l);
  if (target.closest('[data-rename]')) return renameList(l);
  if (target.closest('[data-add-cat]')) return addCategory(l);
  if (target.closest('[data-edit-done]')) {
    editMode = false;
    return render();
  }
  if (target.closest('[data-remaining]')) {
    state.remainingOnly = !state.remainingOnly;
    save();
    return render();
  }
  const tg = d('toggle');
  if (tg) {
    const [cid, iid] = tg.split(':');
    const it = l.cats.find((c) => c.id === cid)?.items.find((i) => i.id === iid);
    if (it) {
      it.checked = !it.checked;
      save();
      if (navigator.vibrate && it.checked) navigator.vibrate(8);
      render();
    }
    return;
  }
  const im = d('imove');
  if (im) {
    const [cid, i, dir] = im.split(':');
    const c = l.cats.find((x) => x.id === cid);
    if (c) move(c.items, Number(i), Number(dir) as -1 | 1);
    save();
    return render();
  }
  const idel = d('idel');
  if (idel) {
    const [cid, iid] = idel.split(':');
    const c = l.cats.find((x) => x.id === cid);
    if (c) c.items = c.items.filter((i) => i.id !== iid);
    save();
    return render();
  }
  const cm = d('cmove');
  if (cm) {
    const [i, dir] = cm.split(':').map(Number);
    move(l.cats, i!, dir as -1 | 1);
    save();
    return render();
  }
  const cr = d('crename');
  if (cr) {
    const c = l.cats.find((x) => x.id === cr);
    if (c)
      nameSheet({
        title: t('renameCategory'),
        value: c.name,
        onSave: (name) => {
          c.name = name;
          save();
          render();
        },
      });
    return;
  }
  const cd = d('cdel');
  if (cd) {
    const c = l.cats.find((x) => x.id === cd);
    if (c && (c.items.length === 0 || confirm(t('confirmDeleteCat', { n: c.name })))) {
      l.cats = l.cats.filter((x) => x !== c);
      save();
      render();
    }
  }
});

app.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = e.target as HTMLFormElement;
  const cid = form.dataset.add;
  const l = currentList();
  if (!cid || !l) return;
  const input = form.querySelector<HTMLInputElement>('input')!;
  const text = input.value.trim();
  if (!text) return;
  const c = l.cats.find((x) => x.id === cid);
  if (!c) return;
  c.items.push({ id: uid(), text, checked: false });
  save();
  render();
  // keep the keyboard open for rapid entry
  document.querySelector<HTMLInputElement>(`[data-add="${cid}"] input`)?.focus();
});

window.addEventListener('hashchange', () => {
  closeSheet();
  render();
  window.scrollTo(0, 0);
});

document.documentElement.lang = lang();
render();
registerPwa();
