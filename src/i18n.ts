export type Lang = 'ja' | 'en';

const LANG_KEY = 'tabi-no-mochimono-lang';

export function getLang(): Lang {
  const v = localStorage.getItem(LANG_KEY);
  if (v === 'en' || v === 'ja') return v;
  return 'ja';
}

export function setLang(lang: Lang): void {
  localStorage.setItem(LANG_KEY, lang);
  document.documentElement.lang = lang;
}

type Dict = Record<string, string>;

let current: Lang = getLang();

export function lang(): Lang {
  return current;
}

export function switchLang(l: Lang): void {
  current = l;
  setLang(l);
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const raw = dictionaries[current][key] ?? dictionaries.ja[key] ?? key;
  if (!vars) return raw;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.split(`{${k}}`).join(String(v)),
    raw,
  );
}

const ja: Dict = {
  appTitle: '旅の持ち物',
  appSub: '忘れ物ゼロのチェックリスト',
  myLists: 'マイリスト',
  newList: '新しいリスト',
  fromTemplate: 'テンプレートから作成',
  blank: '空のリスト',
  blankDesc: '一から作る',
  listName: 'リスト名',
  create: '作成',
  cancel: 'キャンセル',
  save: '保存',
  back: '戻る',
  menu: 'メニュー',
  rename: '名前を変更',
  resetChecks: 'チェックをすべて外す',
  duplicate: '複製',
  reorder: '並べ替え・編集',
  doneEditing: '編集を終了',
  addCategory: 'カテゴリを追加',
  categoryName: 'カテゴリ名',
  renameCategory: 'カテゴリ名を変更',
  deleteList: 'リストを削除',
  deleteCategory: 'カテゴリを削除',
  confirmDeleteList: '「{n}」を削除しますか？',
  confirmDeleteCat: 'カテゴリ「{n}」と中のアイテムを削除しますか？',
  confirmReset: 'すべてのチェックを外しますか？',
  addItemPh: 'アイテムを追加…',
  add: '追加',
  items: '{d} / {n}',
  progressDone: '準備完了！いってらっしゃい 🎉',
  remainingOnly: '残りだけ表示',
  showAll: 'すべて表示',
  noLists: 'まだリストがありません',
  noListsBody: 'テンプレートを選ぶか、空のリストから始めましょう。',
  emptyCat: 'アイテムはまだありません',
  copySuffix: '（コピー）',
  data: 'データ',
  exportJson: 'JSONを書き出す',
  importJson: 'JSONを読み込む',
  imported: '{n}件のリストを読み込みました',
  importFailed: '読み込めませんでした（形式が違います）',
  exported: '書き出しました',
  resetDone: 'チェックを外しました',
  duplicated: '複製しました',
  deleted: '削除しました',
  emoji: 'アイコン',
  footer: 'データはこの端末だけに保存 · 無料 · 広告なし · ログイン不要',
  otherCat: 'その他',
  moveUp: '上へ',
  moveDown: '下へ',
  remove: '削除',
  allHidden: 'このカテゴリはすべてチェック済み',
};

const en: Dict = {
  appTitle: 'Trip Packing',
  appSub: 'Never forget a thing',
  myLists: 'My lists',
  newList: 'New list',
  fromTemplate: 'Start from a template',
  blank: 'Blank list',
  blankDesc: 'Start from scratch',
  listName: 'List name',
  create: 'Create',
  cancel: 'Cancel',
  save: 'Save',
  back: 'Back',
  menu: 'Menu',
  rename: 'Rename',
  resetChecks: 'Uncheck everything',
  duplicate: 'Duplicate',
  reorder: 'Reorder & edit',
  doneEditing: 'Done editing',
  addCategory: 'Add category',
  categoryName: 'Category name',
  renameCategory: 'Rename category',
  deleteList: 'Delete list',
  deleteCategory: 'Delete category',
  confirmDeleteList: 'Delete “{n}”?',
  confirmDeleteCat: 'Delete category “{n}” and its items?',
  confirmReset: 'Uncheck all items?',
  addItemPh: 'Add an item…',
  add: 'Add',
  items: '{d} / {n}',
  progressDone: 'All packed — have a great trip! 🎉',
  remainingOnly: 'Remaining only',
  showAll: 'Show all',
  noLists: 'No lists yet',
  noListsBody: 'Pick a template or start with a blank list.',
  emptyCat: 'No items yet',
  copySuffix: ' (copy)',
  data: 'Data',
  exportJson: 'Export JSON',
  importJson: 'Import JSON',
  imported: 'Imported {n} list(s)',
  importFailed: 'Could not import (wrong format)',
  exported: 'Exported',
  resetDone: 'All unchecked',
  duplicated: 'Duplicated',
  deleted: 'Deleted',
  emoji: 'Icon',
  footer: 'Data stays on this device · free · no ads · no login',
  otherCat: 'Other',
  moveUp: 'Move up',
  moveDown: 'Move down',
  remove: 'Remove',
  allHidden: 'Everything here is packed',
};

const dictionaries: Record<Lang, Dict> = { ja, en };
