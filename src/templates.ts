export interface TemplateCat {
  ja: string;
  en: string;
  items: [string, string][];
}

export interface Template {
  id: string;
  emoji: string;
  ja: string;
  en: string;
  cats: TemplateCat[];
}

export const TEMPLATES: Template[] = [
  {
    id: 'overseas',
    emoji: '✈️',
    ja: '海外旅行',
    en: 'Overseas trip',
    cats: [
      {
        ja: '貴重品',
        en: 'Essentials',
        items: [
          ['パスポート', 'Passport'],
          ['航空券・eチケット', 'Flight tickets / e-ticket'],
          ['財布', 'Wallet'],
          ['クレジットカード', 'Credit cards'],
          ['現地通貨・日本円', 'Local currency & yen'],
          ['海外旅行保険の書類', 'Travel insurance papers'],
          ['ホテルの予約確認', 'Hotel confirmation'],
        ],
      },
      {
        ja: '電子機器',
        en: 'Electronics',
        items: [
          ['スマホ', 'Phone'],
          ['充電器・ケーブル', 'Charger & cables'],
          ['モバイルバッテリー', 'Power bank'],
          ['変換プラグ', 'Plug adapter'],
          ['SIM・Wi-Fiルーター', 'SIM / pocket Wi-Fi'],
          ['イヤホン', 'Earphones'],
        ],
      },
      {
        ja: '衣類',
        en: 'Clothes',
        items: [
          ['着替え', 'Outfits'],
          ['下着・靴下', 'Underwear & socks'],
          ['パジャマ', 'Pyjamas'],
          ['羽織りもの', 'Light jacket'],
          ['歩きやすい靴', 'Comfortable shoes'],
        ],
      },
      {
        ja: '洗面・衛生',
        en: 'Toiletries & health',
        items: [
          ['歯ブラシ', 'Toothbrush'],
          ['スキンケア・化粧品', 'Skincare & make-up'],
          ['常備薬', 'Medicine'],
          ['日焼け止め', 'Sunscreen'],
          ['マスク', 'Face masks'],
        ],
      },
      {
        ja: 'その他',
        en: 'Other',
        items: [
          ['ボールペン（入国カード用）', 'Pen (for arrival card)'],
          ['折りたたみ傘', 'Folding umbrella'],
          ['エコバッグ', 'Reusable bag'],
          ['ネックピロー', 'Neck pillow'],
        ],
      },
    ],
  },
  {
    id: 'domestic',
    emoji: '🚄',
    ja: '国内1泊',
    en: 'Overnight (domestic)',
    cats: [
      {
        ja: '貴重品',
        en: 'Essentials',
        items: [
          ['財布', 'Wallet'],
          ['スマホ', 'Phone'],
          ['切符・予約確認', 'Tickets / booking'],
          ['保険証', 'Health insurance card'],
        ],
      },
      {
        ja: '衣類',
        en: 'Clothes',
        items: [
          ['着替え', 'Change of clothes'],
          ['下着・靴下', 'Underwear & socks'],
          ['パジャマ', 'Pyjamas'],
        ],
      },
      {
        ja: '洗面・身だしなみ',
        en: 'Toiletries',
        items: [
          ['歯ブラシ', 'Toothbrush'],
          ['スキンケア・化粧品', 'Skincare & make-up'],
          ['コンタクト・メガネ', 'Contacts / glasses'],
          ['常備薬', 'Medicine'],
        ],
      },
      {
        ja: 'その他',
        en: 'Other',
        items: [
          ['充電器', 'Charger'],
          ['モバイルバッテリー', 'Power bank'],
          ['ハンカチ・ティッシュ', 'Handkerchief & tissues'],
          ['折りたたみ傘', 'Folding umbrella'],
        ],
      },
    ],
  },
  {
    id: 'beach',
    emoji: '🏖️',
    ja: '海・ビーチ',
    en: 'Beach day',
    cats: [
      {
        ja: '海グッズ',
        en: 'Beach gear',
        items: [
          ['水着', 'Swimsuit'],
          ['ラッシュガード', 'Rash guard'],
          ['ビーチサンダル', 'Flip-flops'],
          ['バスタオル', 'Beach towel'],
          ['レジャーシート', 'Picnic mat'],
          ['浮き輪', 'Swim ring'],
        ],
      },
      {
        ja: '日差し対策',
        en: 'Sun protection',
        items: [
          ['日焼け止め', 'Sunscreen'],
          ['サングラス', 'Sunglasses'],
          ['帽子', 'Hat'],
        ],
      },
      {
        ja: 'その他',
        en: 'Other',
        items: [
          ['スマホ防水ケース', 'Waterproof phone case'],
          ['ビニール袋（濡れ物用）', 'Plastic bags (wet stuff)'],
          ['着替え', 'Change of clothes'],
          ['飲み物', 'Drinks'],
          ['小銭', 'Coins'],
        ],
      },
    ],
  },
  {
    id: 'business',
    emoji: '💼',
    ja: '出張',
    en: 'Business trip',
    cats: [
      {
        ja: '仕事道具',
        en: 'Work',
        items: [
          ['名刺', 'Business cards'],
          ['資料', 'Documents'],
          ['手帳・ノート', 'Notebook'],
          ['ペン', 'Pen'],
          ['社員証', 'Staff ID'],
        ],
      },
      {
        ja: '電子機器',
        en: 'Electronics',
        items: [
          ['ノートPC', 'Laptop'],
          ['PC充電器', 'Laptop charger'],
          ['スマホ充電器', 'Phone charger'],
          ['HDMI・変換アダプタ', 'HDMI / adapters'],
        ],
      },
      {
        ja: '衣類',
        en: 'Clothes',
        items: [
          ['スーツ', 'Suit'],
          ['シャツ', 'Shirts'],
          ['ネクタイ', 'Tie'],
          ['革靴', 'Dress shoes'],
          ['下着・靴下', 'Underwear & socks'],
        ],
      },
      {
        ja: 'その他',
        en: 'Other',
        items: [
          ['財布', 'Wallet'],
          ['切符・予約確認', 'Tickets / booking'],
          ['歯ブラシ', 'Toothbrush'],
          ['常備薬', 'Medicine'],
        ],
      },
    ],
  },
];
