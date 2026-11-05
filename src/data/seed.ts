import type { Key, Module, Tag, WordContent, WordUserData } from '../types';

const createdAt = (day: number) => new Date(Date.UTC(2026, 0, day)).toISOString();

export const seedModules: Module[] = [
  { id: 'first-steps', title: 'Первые шаги', hskLevel: 1, order: 1 },
  { id: 'everyday-life', title: 'Повседневная жизнь', hskLevel: 1, order: 2 },
  { id: 'studies', title: 'Учёба и язык', hskLevel: 2, order: 3 },
];

export const seedTags: Tag[] = [
  { id: 'people', name: 'Люди' },
  { id: 'education', name: 'Учёба' },
  { id: 'time', name: 'Время' },
  { id: 'food', name: 'Еда и напитки' },
  { id: 'animals', name: 'Животные' },
  { id: 'verbs', name: 'Глаголы' },
  { id: 'places', name: 'Места' },
];

export const seedKeys: Key[] = [
  { id: 'ren', symbol: '人', pinyin: 'rén', translation: 'человек', childKeyIds: [], createdAt: createdAt(1) },
  { id: 'nv', symbol: '女', pinyin: 'nǚ', translation: 'женщина', childKeyIds: [], createdAt: createdAt(2) },
  { id: 'zi', symbol: '子', pinyin: 'zǐ', translation: 'ребёнок', childKeyIds: [], createdAt: createdAt(3) },
  { id: 'kou', symbol: '口', pinyin: 'kǒu', translation: 'рот', childKeyIds: [], createdAt: createdAt(4) },
  { id: 'mu', symbol: '木', pinyin: 'mù', translation: 'дерево', childKeyIds: [], createdAt: createdAt(5) },
  { id: 'shui', symbol: '氵', pinyin: 'shuǐ', translation: 'вода', childKeyIds: [], createdAt: createdAt(6) },
  { id: 'xin', symbol: '心', pinyin: 'xīn', translation: 'сердце', childKeyIds: [], createdAt: createdAt(7) },
  { id: 'ri', symbol: '日', pinyin: 'rì', translation: 'солнце, день', childKeyIds: [], createdAt: createdAt(8) },
  { id: 'yue', symbol: '月', pinyin: 'yuè', translation: 'луна, месяц', childKeyIds: [], createdAt: createdAt(9) },
  { id: 'yan', symbol: '讠', pinyin: 'yán', translation: 'речь', childKeyIds: [], createdAt: createdAt(10) },
  { id: 'shou', symbol: '扌', pinyin: 'shǒu', translation: 'рука', childKeyIds: [], createdAt: createdAt(11) },
  { id: 'da', symbol: '大', pinyin: 'dà', translation: 'большой', childKeyIds: [], createdAt: createdAt(12) },
  { id: 'xiao', symbol: '小', pinyin: 'xiǎo', translation: 'маленький', childKeyIds: [], createdAt: createdAt(13) },
  { id: 'sheng', symbol: '生', pinyin: 'shēng', translation: 'рождаться, жизнь', childKeyIds: [], createdAt: createdAt(14) },
  { id: 'wen', symbol: '文', pinyin: 'wén', translation: 'письменность, культура', childKeyIds: [], createdAt: createdAt(15) },
  { id: 'you', symbol: '又', pinyin: 'yòu', translation: 'снова, правая рука', childKeyIds: [], createdAt: createdAt(16) },
  { id: 'quan', symbol: '犭', pinyin: 'quǎn', translation: 'животное, собака', childKeyIds: [], createdAt: createdAt(17) },
  { id: 'cao', symbol: '艹', pinyin: 'cǎo', translation: 'трава', childKeyIds: [], createdAt: createdAt(18) },
  { id: 'wei', symbol: '囗', pinyin: 'wéi', translation: 'ограждение', childKeyIds: [], createdAt: createdAt(19) },
  { id: 'hao-key', symbol: '好', pinyin: 'hǎo', translation: 'хороший', childKeyIds: ['nv', 'zi'], createdAt: createdAt(20) },
  { id: 'ming-key', symbol: '明', pinyin: 'míng', translation: 'светлый', childKeyIds: ['ri', 'yue'], createdAt: createdAt(21) },
  { id: 'xiu-key', symbol: '休', pinyin: 'xiū', translation: 'отдыхать', childKeyIds: ['ren', 'mu'], createdAt: createdAt(22) },
];

export const seedWords: WordContent[] = [
  { id: 'wo', hanzi: '我', pinyin: 'wǒ', translation: 'я', moduleId: 'first-steps', hskLevel: 1, tags: ['people'], keyIds: ['shou'], createdAt: createdAt(1) },
  { id: 'ni', hanzi: '你', pinyin: 'nǐ', translation: 'ты, вы', moduleId: 'first-steps', hskLevel: 1, tags: ['people'], keyIds: ['ren'], createdAt: createdAt(2) },
  { id: 'hao', hanzi: '好', pinyin: 'hǎo', translation: 'хороший, хорошо', moduleId: 'first-steps', hskLevel: 1, tags: [], keyIds: ['hao-key', 'nv', 'zi'], createdAt: createdAt(3) },
  { id: 'ren-word', hanzi: '人', pinyin: 'rén', translation: 'человек, люди', moduleId: 'first-steps', hskLevel: 1, tags: ['people'], keyIds: ['ren'], measureWord: '个', createdAt: createdAt(4) },
  { id: 'nvren', hanzi: '女人', pinyin: 'nǚrén', translation: 'женщина', moduleId: 'first-steps', hskLevel: 1, tags: ['people'], keyIds: ['nv', 'ren'], measureWord: '个', createdAt: createdAt(5) },
  { id: 'xuesheng', hanzi: '学生', pinyin: 'xuésheng', translation: 'ученик, студент', moduleId: 'studies', hskLevel: 1, tags: ['people', 'education'], keyIds: ['zi', 'sheng'], measureWord: '个', createdAt: createdAt(6) },
  { id: 'laoshi', hanzi: '老师', pinyin: 'lǎoshī', translation: 'учитель, преподаватель', moduleId: 'studies', hskLevel: 1, tags: ['people', 'education'], keyIds: [], measureWord: '位', createdAt: createdAt(7) },
  { id: 'xuexi', hanzi: '学习', pinyin: 'xuéxí', translation: 'учиться, изучать', moduleId: 'studies', hskLevel: 1, tags: ['education', 'verbs'], keyIds: ['zi'], createdAt: createdAt(8) },
  { id: 'hanzi', hanzi: '汉字', pinyin: 'hànzì', translation: 'китайский иероглиф', moduleId: 'studies', hskLevel: 1, tags: ['education'], keyIds: ['shui', 'you', 'zi'], measureWord: '个', createdAt: createdAt(9) },
  { id: 'zhongguo', hanzi: '中国', pinyin: 'Zhōngguó', translation: 'Китай', moduleId: 'first-steps', hskLevel: 1, tags: ['places'], keyIds: ['kou', 'wei'], createdAt: createdAt(10) },
  { id: 'zhongwen', hanzi: '中文', pinyin: 'Zhōngwén', translation: 'китайский язык', moduleId: 'studies', hskLevel: 1, tags: ['education'], keyIds: ['kou', 'wen'], createdAt: createdAt(11) },
  { id: 'jintian', hanzi: '今天', pinyin: 'jīntiān', translation: 'сегодня', moduleId: 'everyday-life', hskLevel: 1, tags: ['time'], keyIds: ['ren'], createdAt: createdAt(12) },
  { id: 'mingtian', hanzi: '明天', pinyin: 'míngtiān', translation: 'завтра', moduleId: 'everyday-life', hskLevel: 1, tags: ['time'], keyIds: ['ming-key', 'ri', 'yue'], createdAt: createdAt(13) },
  { id: 'shui-word', hanzi: '水', pinyin: 'shuǐ', translation: 'вода', moduleId: 'everyday-life', hskLevel: 1, tags: ['food'], keyIds: ['shui'], measureWord: '杯', createdAt: createdAt(14) },
  { id: 'cha', hanzi: '茶', pinyin: 'chá', translation: 'чай', moduleId: 'everyday-life', hskLevel: 1, tags: ['food'], keyIds: ['cao', 'ren', 'mu'], measureWord: '杯', createdAt: createdAt(15) },
  { id: 'shu', hanzi: '书', pinyin: 'shū', translation: 'книга', moduleId: 'studies', hskLevel: 1, tags: ['education'], keyIds: [], measureWord: '本', createdAt: createdAt(16) },
  { id: 'mao', hanzi: '猫', pinyin: 'māo', translation: 'кошка, кот', moduleId: 'everyday-life', hskLevel: 2, tags: ['animals'], keyIds: ['quan', 'cao'], measureWord: '只', createdAt: createdAt(17) },
  { id: 'gou', hanzi: '狗', pinyin: 'gǒu', translation: 'собака', moduleId: 'everyday-life', hskLevel: 2, tags: ['animals'], keyIds: ['quan', 'kou'], measureWord: '只', createdAt: createdAt(18) },
  { id: 'pengyou', hanzi: '朋友', pinyin: 'péngyou', translation: 'друг, друзья', moduleId: 'first-steps', hskLevel: 1, tags: ['people'], keyIds: ['yue', 'you'], measureWord: '个', createdAt: createdAt(19) },
  { id: 'chi', hanzi: '吃', pinyin: 'chī', translation: 'есть, кушать', moduleId: 'everyday-life', hskLevel: 1, tags: ['food', 'verbs'], keyIds: ['kou'], createdAt: createdAt(20) },
  { id: 'he', hanzi: '喝', pinyin: 'hē', translation: 'пить', moduleId: 'everyday-life', hskLevel: 1, tags: ['food', 'verbs'], keyIds: ['kou'], createdAt: createdAt(21) },
  { id: 'kan', hanzi: '看', pinyin: 'kàn', translation: 'смотреть, читать', moduleId: 'everyday-life', hskLevel: 1, tags: ['verbs'], keyIds: ['shou'], createdAt: createdAt(22) },
  { id: 'daxue', hanzi: '大学', pinyin: 'dàxué', translation: 'университет', moduleId: 'studies', hskLevel: 1, tags: ['education', 'places'], keyIds: ['da', 'zi'], createdAt: createdAt(23) },
  { id: 'xiaoxuesheng', hanzi: '小学生', pinyin: 'xiǎoxuésheng', translation: 'школьник, ученик начальной школы', moduleId: 'studies', hskLevel: 2, tags: ['people', 'education'], keyIds: ['xiao', 'zi', 'sheng'], measureWord: '个', createdAt: createdAt(24) },
  { id: 'xiexie', hanzi: '谢谢', pinyin: 'xièxie', translation: 'спасибо', moduleId: 'first-steps', hskLevel: 1, tags: ['verbs'], keyIds: ['yan'], createdAt: createdAt(25) },
];

const userExamples: Record<string, Pick<WordUserData, 'associations' | 'examples'>> = {
  hao: { associations: '女 + 子 — женщина и ребёнок', examples: '你好吗？ — Как дела?, 很好 — очень хорошо' },
  xuesheng: { associations: '学习的学生 — тот, кто учится', examples: '我是学生。 — Я студент.' },
  zhongguo: { associations: '中 — центр, 国 — страна', examples: '我住在中国。 — Я живу в Китае.' },
  cha: { associations: '艹 + 人 + 木 — растение, человек и дерево', examples: '我想喝茶。 — Я хочу попить чай.' },
  mao: { examples: '我有一只猫。 — У меня есть кошка.' },
  pengyou: { examples: '他是我的朋友。 — Он мой друг.' },
};

export const seedWordUserData: WordUserData[] = seedWords.map((word) => ({
  wordId: word.id,
  ...userExamples[word.id],
  srs: {
    box: 0,
    lastReview: null,
    nextReview: word.createdAt,
    correctStreak: 0,
    wrongCount: 0,
  },
}));
