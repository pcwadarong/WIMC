/** 기본 카테고리 트리 (design.md §9). 신규 유저 온보딩 시 DB에 시드한다. */
export interface DefaultCategory {
  name: string;
  children: string[];
}

export const DEFAULT_CATEGORIES: DefaultCategory[] = [
  {
    name: "상의",
    children: [
      "티셔츠",
      "블라우스",
      "셔츠",
      "니트",
      "맨투맨",
      "후드",
      "탑",
      "민소매",
    ],
  },
  {
    name: "하의",
    children: [
      "팬츠",
      "숏팬츠",
      "데님",
      "카고",
      "슬랙스",
      "스커트",
      "레깅스",
      "조거",
    ],
  },
  {
    name: "아우터",
    children: ["코트", "재킷", "패딩", "가디건", "바람막이", "점퍼", "베스트"],
  },
  {
    name: "신발",
    children: ["스니커즈", "로퍼", "부츠", "샌들", "힐", "플랫슈즈", "슬리퍼"],
  },
  {
    name: "가방",
    children: ["숄더백", "크로스백", "에코백", "클러치", "백팩", "토트백"],
  },
  {
    name: "악세서리",
    children: [
      "목걸이",
      "귀걸이",
      "반지",
      "팔찌",
      "벨트",
      "모자",
      "스카프",
      "선글라스",
    ],
  },
];

/** 대분류 이름 (옷장 탭 순서) */
export const TOP_CATEGORIES = DEFAULT_CATEGORIES.map((c) => c.name);
