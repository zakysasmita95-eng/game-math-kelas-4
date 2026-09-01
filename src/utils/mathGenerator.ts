import { MathQuestion, MathTopic, DifficultyLevel } from '../types';

const EMOJIS = ['🍎', '⭐️', '🍪', '⚽️', '🍩', '🚗', '🐱', '🚀', '🍓', '🧁'];
const NAMES = ['Budi', 'Siti', 'Edo', 'Lani', 'Dayu', 'Udin', 'Beni', 'Rani', 'Rizky', 'Aisyah'];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateDistractors(correctAnswer: number, count: number = 3, minVal: number = 1): number[] {
  const distractors = new Set<number>();
  const offsets = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];
  
  // Shuffle offsets for natural variation
  const shuffledOffsets = shuffleArray(offsets);

  for (const offset of shuffledOffsets) {
    const candidate = correctAnswer + offset;
    if (candidate >= minVal && candidate !== correctAnswer) {
      distractors.add(candidate);
      if (distractors.size >= count) break;
    }
  }

  // Fallback if not enough
  let fallbackDelta = 4;
  while (distractors.size < count) {
    const candidate = correctAnswer + fallbackDelta;
    if (candidate >= minVal && candidate !== correctAnswer) {
      distractors.add(candidate);
    }
    fallbackDelta += fallbackDelta > 0 ? -fallbackDelta * 2 : Math.abs(fallbackDelta) + 1;
  }

  return Array.from(distractors).slice(0, count);
}

export function generateQuestion(
  topic: MathTopic,
  difficulty: DifficultyLevel,
  customMultipliers?: number[]
): MathQuestion {
  // Determine if multiplication, division, or word problem
  let chosenTopic: 'multiplication' | 'division' | 'word-problem';

  if (topic === 'all') {
    const rand = Math.random();
    if (rand < 0.45) chosenTopic = 'multiplication';
    else if (rand < 0.9) chosenTopic = 'division';
    else chosenTopic = 'word-problem';
  } else if (topic === 'multiplication') {
    chosenTopic = Math.random() < 0.2 && difficulty !== 'easy' ? 'word-problem' : 'multiplication';
  } else if (topic === 'division') {
    chosenTopic = Math.random() < 0.2 && difficulty !== 'easy' ? 'word-problem' : 'division';
  } else {
    chosenTopic = 'word-problem';
  }

  const id = 'q_' + Math.random().toString(36).substring(2, 9);
  const emoji = getRandomItem(EMOJIS);

  if (chosenTopic === 'word-problem') {
    return generateWordProblem(id, difficulty, emoji);
  } else if (chosenTopic === 'division') {
    return generateDivisionQuestion(id, difficulty, emoji, customMultipliers);
  } else {
    return generateMultiplicationQuestion(id, difficulty, emoji, customMultipliers);
  }
}

function generateMultiplicationQuestion(
  id: string,
  difficulty: DifficultyLevel,
  emoji: string,
  customMultipliers?: number[]
): MathQuestion {
  let num1: number;
  let num2: number;

  if (customMultipliers && customMultipliers.length > 0) {
    num1 = getRandomItem(customMultipliers);
    num2 = getRandomInt(1, 10);
  } else if (difficulty === 'easy') {
    // 1-5 and 10
    const easySet = [1, 2, 3, 4, 5, 10];
    num1 = getRandomItem(easySet);
    num2 = getRandomInt(1, 10);
  } else if (difficulty === 'medium') {
    // 6-9 and full 1-10
    num1 = getRandomInt(4, 9);
    num2 = getRandomInt(3, 10);
  } else {
    // Hard: Belasan x Satuan or 11-25
    if (Math.random() < 0.6) {
      num1 = getRandomInt(11, 25);
      num2 = getRandomInt(3, 9);
    } else {
      num1 = getRandomInt(6, 12);
      num2 = getRandomInt(6, 12);
    }
  }

  const correctAnswer = num1 * num2;
  const distractors = generateDistractors(correctAnswer, 3, 1);
  const options = shuffleArray([correctAnswer, ...distractors]);

  const isMissingFactor = difficulty !== 'easy' && Math.random() < 0.35;

  let questionText: string;
  let subText: string;

  if (isMissingFactor) {
    if (Math.random() < 0.5) {
      questionText = `${num1} × ❓ = ${correctAnswer}`;
      subText = `Berapakah angka pengganti tanda tanya (❓)?`;
    } else {
      questionText = `❓ × ${num2} = ${correctAnswer}`;
      subText = `Berapakah angka pengganti tanda tanya (❓)?`;
    }
    // Correct answer for missing factor is the missing number!
    // But let's check: if question is num1 x ? = ans, target is num2!
    const targetAns = questionText.startsWith('❓') ? num1 : num2;
    const factorDistractors = generateDistractors(targetAns, 3, 1);
    const factorOptions = shuffleArray([targetAns, ...factorDistractors]);

    return {
      id,
      topic: 'multiplication',
      questionText,
      subText,
      num1,
      num2,
      operator: 'x',
      correctAnswer: targetAns,
      options: factorOptions,
      explanation: `Karena ${num1} × ${num2} = ${correctAnswer}, maka angka yang dicari adalah ${targetAns}. Kamu juga bisa menghitungnya dengan pembagian: ${correctAnswer} : ${questionText.startsWith('❓') ? num2 : num1} = ${targetAns}.`,
      visualData: num1 <= 6 && num2 <= 6 ? {
        type: 'groups',
        groupsCount: num1,
        itemsPerGroup: num2,
        itemEmoji: emoji,
      } : undefined,
    };
  }

  questionText = `${num1} × ${num2} = ...`;
  subText = `Hitung hasil perkalian ${num1} dikali ${num2}`;

  const visualType = num1 <= 5 && num2 <= 6 ? (Math.random() < 0.5 ? 'groups' : 'grid') : undefined;

  return {
    id,
    topic: 'multiplication',
    questionText,
    subText,
    num1,
    num2,
    operator: 'x',
    correctAnswer,
    options,
    explanation: `Perkalian ${num1} × ${num2} sama dengan menjumlahkan angka ${num2} sebanyak ${num1} kali (${Array(num1).fill(num2).join(' + ')}) = ${correctAnswer}.`,
    visualData: visualType ? {
      type: visualType,
      groupsCount: num1,
      itemsPerGroup: num2,
      itemEmoji: emoji,
    } : undefined,
  };
}

function generateDivisionQuestion(
  id: string,
  difficulty: DifficultyLevel,
  emoji: string,
  customMultipliers?: number[]
): MathQuestion {
  let divisor: number;
  let quotient: number;

  if (customMultipliers && customMultipliers.length > 0) {
    divisor = getRandomItem(customMultipliers);
    quotient = getRandomInt(1, 10);
  } else if (difficulty === 'easy') {
    const easyDivisors = [2, 3, 4, 5, 10];
    divisor = getRandomItem(easyDivisors);
    quotient = getRandomInt(1, 6);
  } else if (difficulty === 'medium') {
    divisor = getRandomInt(3, 9);
    quotient = getRandomInt(3, 10);
  } else {
    // Hard: Dividend up to 150
    divisor = getRandomInt(4, 12);
    quotient = getRandomInt(8, 20);
  }

  const dividend = divisor * quotient;
  const correctAnswer = quotient;
  const distractors = generateDistractors(correctAnswer, 3, 1);
  const options = shuffleArray([correctAnswer, ...distractors]);

  const isMissingDividend = difficulty !== 'easy' && Math.random() < 0.3;

  if (isMissingDividend) {
    const questionText = `❓ : ${divisor} = ${quotient}`;
    const subText = `Berapakah angka yang dibagi (❓)?`;
    const dividendDistractors = generateDistractors(dividend, 3, 1);
    const dividendOptions = shuffleArray([dividend, ...dividendDistractors]);

    return {
      id,
      topic: 'division',
      questionText,
      subText,
      num1: dividend,
      num2: divisor,
      operator: ':',
      correctAnswer: dividend,
      options: dividendOptions,
      explanation: `Untuk mencari angka yang dibagi, kalikan hasil bagi dengan pembagi: ${quotient} × ${divisor} = ${dividend}. Maka angka pengganti ❓ adalah ${dividend}.`,
      visualData: quotient <= 5 && divisor <= 4 ? {
        type: 'division-baskets',
        groupsCount: divisor,
        itemsPerGroup: quotient,
        totalItems: dividend,
        itemEmoji: emoji,
      } : undefined,
    };
  }

  const questionText = `${dividend} : ${divisor} = ...`;
  const subText = `Hitung hasil ${dividend} dibagi ${divisor}`;

  return {
    id,
    topic: 'division',
    questionText,
    subText,
    num1: dividend,
    num2: divisor,
    operator: ':',
    correctAnswer,
    options,
    explanation: `${dividend} dibagi ${divisor} sama dengan ${correctAnswer}. Kita dapat membuktikannya dengan perkalian: ${correctAnswer} × ${divisor} = ${dividend}.`,
    visualData: dividend <= 24 && divisor <= 5 ? {
      type: 'division-baskets',
      groupsCount: divisor,
      itemsPerGroup: quotient,
      totalItems: dividend,
      itemEmoji: emoji,
    } : undefined,
  };
}

function generateWordProblem(
  id: string,
  difficulty: DifficultyLevel,
  emoji: string
): MathQuestion {
  const name = getRandomItem(NAMES);
  const isMultiplication = Math.random() < 0.5;

  if (isMultiplication) {
    const boxes = difficulty === 'easy' ? getRandomInt(2, 5) : getRandomInt(4, 9);
    const itemsPerBox = difficulty === 'easy' ? getRandomInt(3, 6) : getRandomInt(6, 12);
    const total = boxes * itemsPerBox;

    const templates = [
      {
        q: `${name} membeli ${boxes} kantong ${emoji}. Tiap kantong berisi ${itemsPerBox} buah. Berapa total ${emoji} milik ${name}?`,
        title: `Belanja Buah ${name}`,
      },
      {
        q: `Di dalam kelas terdapat ${boxes} meja. Di setiap meja ada ${itemsPerBox} buku gambar. Berapa jumlah seluruh buku gambar?`,
        title: `Penyusunan Meja Kelas`,
      },
      {
        q: `${name} menyusun ${boxes} baris stiker. Setiap baris memiliki ${itemsPerBox} stiker. Berapa banyak stiker yang tersusun?`,
        title: `Koleksi Stiker`,
      },
    ];

    const chosen = getRandomItem(templates);
    const distractors = generateDistractors(total, 3, 1);
    const options = shuffleArray([total, ...distractors]);

    return {
      id,
      topic: 'word-problem',
      questionText: chosen.q,
      subText: `Operasi Hitung: ${boxes} × ${itemsPerBox}`,
      num1: boxes,
      num2: itemsPerBox,
      operator: 'x',
      correctAnswer: total,
      options,
      explanation: `Total = Jumlah kantong/baris (${boxes}) × Isi tiap kantong (${itemsPerBox}) = ${boxes} × ${itemsPerBox} = ${total}.`,
      visualData: boxes <= 5 && itemsPerBox <= 6 ? {
        type: 'groups',
        groupsCount: boxes,
        itemsPerGroup: itemsPerBox,
        itemEmoji: emoji,
      } : undefined,
      storyContext: {
        title: chosen.title,
        character: name,
      },
    };
  } else {
    // Division story problem
    const groups = difficulty === 'easy' ? getRandomInt(2, 5) : getRandomInt(3, 8);
    const itemsPerGroup = difficulty === 'easy' ? getRandomInt(2, 6) : getRandomInt(5, 12);
    const total = groups * itemsPerGroup;

    const templates = [
      {
        q: `${name} memiliki ${total} permen ${emoji}. Permen tersebut akan dibagikan rata kepada ${groups} temannya. Berapa permen yang didapat setiap teman?`,
        title: `Berbagi Permen`,
      },
      {
        q: `Ibu guru membawa ${total} buku tulis untuk dibagikan sama banyak ke ${groups} kelompok belajar. Berapa buku yang diterima tiap kelompok?`,
        title: `Pembagian Buku Kelompok`,
      },
      {
        q: `Ada ${total} bibit tanaman yang akan ditanam rata di dalam ${groups} pot bunga. Berapa bibit tanaman di setiap pot?`,
        title: `Menanam Bunga`,
      },
    ];

    const chosen = getRandomItem(templates);
    const distractors = generateDistractors(itemsPerGroup, 3, 1);
    const options = shuffleArray([itemsPerGroup, ...distractors]);

    return {
      id,
      topic: 'word-problem',
      questionText: chosen.q,
      subText: `Operasi Hitung: ${total} : ${groups}`,
      num1: total,
      num2: groups,
      operator: ':',
      correctAnswer: itemsPerGroup,
      options,
      explanation: `Bagian tiap orang = Total (${total}) : Jumlah orang (${groups}) = ${itemsPerGroup}.`,
      visualData: total <= 24 && groups <= 5 ? {
        type: 'division-baskets',
        groupsCount: groups,
        itemsPerGroup: itemsPerGroup,
        totalItems: total,
        itemEmoji: emoji,
      } : undefined,
      storyContext: {
        title: chosen.title,
        character: name,
      },
    };
  }
}

export const POWER_UPS_CATALOG = [
  {
    id: 'double-points',
    type: 'double-points' as const,
    name: 'Kilat 2x Poin',
    description: 'Poin bernilai ganda (200 poin) untuk jawaban benar berikutnya!',
    icon: '⚡',
    color: 'from-amber-400 to-orange-500',
  },
  {
    id: 'shield',
    type: 'shield' as const,
    name: 'Perisai Pelindung',
    description: 'Melindungi tim dari kehilangan poin/tali saat salah menjawab!',
    icon: '🛡️',
    color: 'from-blue-400 to-indigo-600',
  },
  {
    id: 'bomb-5050',
    type: 'bomb-5050' as const,
    name: 'Bom Pilihan 50:50',
    description: 'Menghapus 2 pilihan jawaban yang salah!',
    icon: '💣',
    color: 'from-rose-500 to-red-600',
  },
  {
    id: 'freeze',
    type: 'freeze' as const,
    name: 'Es Pembeku Lawan',
    description: 'Membekukan tombol lawan selama 3 detik!',
    icon: '❄️',
    color: 'from-cyan-400 to-teal-500',
    appliedToOpponent: true,
  },
  {
    id: 'extra-time',
    type: 'extra-time' as const,
    name: 'Waktu Ekstra +5s',
    description: 'Memberikan tambahan 5 detik untuk menjawab soal!',
    icon: '⏳',
    color: 'from-emerald-400 to-green-600',
  },
];
