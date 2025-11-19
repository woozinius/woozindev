// 1. 더미 단어 데이터
// 실제로는 여기 대신 CSV/구글시트 데이터를 넣을 예정
const words = [
  {
    grade: 1,
    unit: "greeting",
    unitName: "인사 / 소개",
    wordKo: "안녕하세요",
    meaningZh: "您好",
    meaningRu: "Здравствуйте",
    pos: "표현"
  },
  {
    grade: 1,
    unit: "greeting",
    unitName: "인사 / 소개",
    wordKo: "감사합니다",
    meaningZh: "谢谢",
    meaningRu: "Спасибо",
    pos: "표현"
  },
  {
    grade: 1,
    unit: "school",
    unitName: "학교 생활",
    wordKo: "학교",
    meaningZh: "学校",
    meaningRu: "школа",
    pos: "명사"
  },
  {
    grade: 2,
    unit: "school",
    unitName: "학교 생활",
    wordKo: "숙제",
    meaningZh: "作业",
    meaningRu: "домашнее задание",
    pos: "명사"
  }
];

// 2. DOM 요소 가져오기
const gradeSelect = document.getElementById("grade-select");
const unitSelect = document.getElementById("unit-select");
const searchInput = document.getElementById("search-input");
const wordListEl = document.getElementById("word-list");

// 3. 현재 선택 상태
let currentGrade = Number(gradeSelect.value);
let currentUnit = unitSelect.value;
let currentSearch = "";

// 4. 단어 리스트 렌더링 함수
function renderWordList() {
  // 필터링: 학년, 단원, 검색어
  const filtered = words.filter((item) => {
    const matchGrade = item.grade === currentGrade;
    const matchUnit = item.unit === currentUnit;

    const search = currentSearch.trim().toLowerCase();
    const matchSearch =
      search === "" ||
      item.wordKo.toLowerCase().includes(search);

    return matchGrade && matchUnit && matchSearch;
  });

  // 기존 내용 비우기
  wordListEl.innerHTML = "";

  // 결과가 없을 때 처리
  if (filtered.length === 0) {
    const emptyEl = document.createElement("p");
    emptyEl.textContent = "해당 조건에 맞는 단어가 없습니다.";
    emptyEl.style.fontSize = "14px";
    emptyEl.style.color = "#666";
    wordListEl.appendChild(emptyEl);
    return;
  }

  // 필터링된 각 단어를 카드로 만들어 추가
  filtered.forEach((item) => {
    const card = document.createElement("article");
    card.className = "word-card";

    // 상단: 한국어 단어 + 품사/학년 정보
    const header = document.createElement("div");
    header.className = "word-card-header";

    const wordKoEl = document.createElement("div");
    wordKoEl.className = "word-ko";
    wordKoEl.textContent = item.wordKo;

    const metaEl = document.createElement("div");
    metaEl.className = "word-meta";
    metaEl.textContent = `${item.grade}학년 · ${item.pos || ""}`;

    header.appendChild(wordKoEl);
    header.appendChild(metaEl);

    // 번역 영역
    const translations = document.createElement("div");
    translations.className = "word-translations";

    const zhLine = document.createElement("div");
    zhLine.textContent = `중국어: ${item.meaningZh || "-"}`;

    const ruLine = document.createElement("div");
    ruLine.textContent = `러시아어: ${item.meaningRu || "-"}`;

    translations.appendChild(zhLine);
    translations.appendChild(ruLine);

    // 단원명
    const unitEl = document.createElement("div");
    unitEl.className = "word-unit";
    unitEl.textContent = `단원: ${item.unitName}`;

    // 카드에 조립
    card.appendChild(header);
    card.appendChild(translations);
    card.appendChild(unitEl);

    wordListEl.appendChild(card);
  });
}

// 5. 이벤트 연결: 학년/단원/검색 변경 시 상태 업데이트 + 다시 렌더링
gradeSelect.addEventListener("change", () => {
  currentGrade = Number(gradeSelect.value);
  renderWordList();
});

unitSelect.addEventListener("change", () => {
  currentUnit = unitSelect.value;
  renderWordList();
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value;
  renderWordList();
});

// 6. 초기 렌더링
renderWordList();