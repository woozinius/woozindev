// 0. 구글 시트 CSV URL
// 웹에 게시 → CSV 형식으로 얻은 URL을 아래에 그대로 넣으시면 됩니다.
const SHEET_CSV_URL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vQunOubW2LxKOTkmbx5hpR--bd7ARjT49y4dTDhjtPT1etuTVpi6xTVvFYd98-p9uaeyvUfU9GVBCQB/pub?output=csv";

// 단어 데이터: 처음에는 비어 있고, 나중에 시트에서 채워짐
let words = [];

// DOM 요소 가져오기
const gradeSelect = document.getElementById("grade-select");
const unitSelect = document.getElementById("unit-select");
const searchInput = document.getElementById("search-input");
const wordListEl = document.getElementById("word-list");
const shuffleButton = document.getElementById("shuffle-button");

// 현재 선택 상태
// grade: "all" 또는 "1" / "2" / "3" (문자열 그대로 유지)
let currentGrade = gradeSelect.value || "all";
// unit: "all" 또는 unit 코드 (greeting, school 등)
let currentUnit = unitSelect.value || "all";
let currentSearch = "";

// 섞기 버튼에서 강제로 한 번 섞도록 지시하는 플래그
let forceShuffleOnce = false;

/**
 * Fisher–Yates Shuffle
 * 배열을 무작위로 섞은 새 배열을 반환
 */
function shuffleArray(array) {
  const arr = array.slice(); // 원본 보존
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * CSV 텍스트를 words 배열로 변환
 * 시트 컬럼 순서:
 * grade,unit,unitName,wordKo,meaningZh,meaningRu,pos
 */
function parseCsvToWords(csvText) {
  const lines = csvText.trim().split("\n");
  if (lines.length <= 1) return [];

  // 첫 줄은 헤더, 나머지가 데이터
  const dataLines = lines.slice(1);

  const result = dataLines
    .map((line) => line.trim())
    .filter((line) => line !== "")
    .map((line) => {
      const cols = line.split(",");

      return {
        grade: Number(cols[0]),
        unit: cols[1],
        unitName: cols[2],
        wordKo: cols[3],
        meaningZh: cols[4],
        meaningRu: cols[5],
        pos: cols[6],
      };
    });

  return result;
}

/**
 * 특정 학년에 대해 사용 가능한 단원 목록을 추출
 * 반환 형식: [{ value: "greeting", label: "인사 / 소개" }, ...]
 */
function getUnitsForGrade(gradeNumber) {
  const map = new Map();

  words.forEach((item) => {
    if (item.grade === gradeNumber) {
      if (!map.has(item.unit)) {
        map.set(item.unit, item.unitName || item.unit);
      }
    }
  });

  return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
}

/**
 * 학년(currentGrade)에 맞게 단원 셀렉트를 다시 채우기
 * - 학년 전체일 때: 단원도 "전체"만
 * - 특정 학년일 때: "전체" + 해당 학년의 각 단원
 */
function populateUnitSelect() {
  unitSelect.innerHTML = "";

  // 항상 맨 위에 "전체" 옵션 추가
  const allOpt = document.createElement("option");
  allOpt.value = "all";
  allOpt.textContent = "전체";
  unitSelect.appendChild(allOpt);

  // 학년이 "전체"이면 단원도 전체만 유지
  if (currentGrade === "all") {
    currentUnit = "all";
    unitSelect.value = "all";
    return;
  }

  // 특정 학년일 때만 단원 목록 추가
  const gradeNumber = Number(currentGrade);
  const units = getUnitsForGrade(gradeNumber);

  units.forEach((u) => {
    const opt = document.createElement("option");
    opt.value = u.value;
    opt.textContent = u.label;
    unitSelect.appendChild(opt);
  });

  // 단원 기본값은 "전체"
  currentUnit = "all";
  unitSelect.value = "all";
}

/**
 * 단어 리스트를 화면에 렌더링
 * currentGrade, currentUnit, currentSearch를 기준으로 필터링
 * - 학년/단원 모두 "전체"일 때 → 새로고침마다 랜덤
 * - 섞기 버튼 클릭 시 → forceShuffleOnce로 한 번 더 강제 랜덤
 */
function renderWordList() {
  const filtered = words.filter((item) => {
    // 학년 필터: "전체"면 모두 허용, 아니면 해당 학년만
    const matchGrade =
      currentGrade === "all" || item.grade === Number(currentGrade);

    // 단원 필터: "전체"면 모두 허용, 아니면 해당 단원만
    const matchUnit =
      currentUnit === "all" || item.unit === currentUnit;

    // 검색어 필터 (한국어 단어 기준)
    const search = currentSearch.trim().toLowerCase();
    const matchSearch =
      search === "" ||
      (item.wordKo && item.wordKo.toLowerCase().includes(search));

    return matchGrade && matchUnit && matchSearch;
  });

  // 전체 학년 + 전체 단원일 때는 항상 섞기
  // 또는 섞기 버튼으로 강제 섞기 지시가 있을 때 섞기
  let finalList = filtered;
  const shouldShuffle =
    (currentGrade === "all" && currentUnit === "all") || forceShuffleOnce;

  if (shouldShuffle) {
    finalList = shuffleArray(filtered);
  }

  // 섞기 버튼 강제 플래그는 한 번 사용 후 초기화
  forceShuffleOnce = false;

  wordListEl.innerHTML = "";

  if (finalList.length === 0) {
    const emptyEl = document.createElement("p");
    emptyEl.textContent = "해당 조건에 맞는 단어가 없습니다.";
    emptyEl.style.fontSize = "14px";
    emptyEl.style.color = "#666";
    wordListEl.appendChild(emptyEl);
    return;
  }

  finalList.forEach((item) => {
    const card = document.createElement("article");
    card.className = "word-card";

    // 상단: 한국어 단어 + 학년/품사 정보
    const header = document.createElement("div");
    header.className = "word-card-header";

    const wordKoEl = document.createElement("div");
    wordKoEl.className = "word-ko";
    wordKoEl.textContent = item.wordKo;

    const metaEl = document.createElement("div");
    metaEl.className = "word-meta";
    const posText = item.pos ? ` · ${item.pos}` : "";
    metaEl.textContent = `${item.grade}학년${posText}`;

    header.appendChild(wordKoEl);
    header.appendChild(metaEl);

    // 번역 영역
    const translations = document.createElement("div");
    translations.className = "word-translations";

    const zhLine = document.createElement("div");
    zhLine.textContent = `🇨🇳 ${item.meaningZh || "-"}`;

    const ruLine = document.createElement("div");
    ruLine.textContent = `🇷🇺 ${item.meaningRu || "-"}`;

    translations.appendChild(zhLine);
    translations.appendChild(ruLine);

    // 단원명
    const unitEl = document.createElement("div");
    unitEl.className = "word-unit";
    unitEl.textContent = `단원: ${item.unitName || item.unit || "-"}`;

    // 카드 조립
    card.appendChild(header);
    card.appendChild(translations);
    card.appendChild(unitEl);

    wordListEl.appendChild(card);
  });
}

/**
 * 구글 시트 CSV를 불러와 words 배열을 채운 뒤 렌더링
 */
async function loadWordsFromSheet() {
  wordListEl.innerHTML = "<p>단어를 불러오는 중입니다...</p>";

  try {
    const response = await fetch(SHEET_CSV_URL);

    if (!response.ok) {
      throw new Error("시트 요청 실패: " + response.status);
    }

    const csvText = await response.text();
    words = parseCsvToWords(csvText);

    // 학년에 맞는 단원 목록 채우기 + 초기 렌더링
    populateUnitSelect();
    renderWordList();
  } catch (error) {
    console.error(error);
    wordListEl.innerHTML =
      "<p>단어를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</p>";
  }
}

/**
 * 이벤트 연결
 */
gradeSelect.addEventListener("change", () => {
  currentGrade = gradeSelect.value; // "all" 또는 "1"/"2"/"3"
  populateUnitSelect();
  renderWordList();
});

unitSelect.addEventListener("change", () => {
  currentUnit = unitSelect.value; // "all" 또는 unit 코드
  renderWordList();
});

searchInput.addEventListener("input", () => {
  currentSearch = searchInput.value;
  renderWordList();
});

// 🔥 섞기 버튼: 현재 필터 조건 내에서 다시 랜덤 섞기
shuffleButton.addEventListener("click", () => {
  forceShuffleOnce = true;
  renderWordList();
});

// 페이지 로드 시 시트에서 데이터 불러오기
loadWordsFromSheet();