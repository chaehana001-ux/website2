# KARST Goods Commerce Design Guideline

## Direction

- **Layout reference:** Fitosauna의 이미지 중심 Hero, 긴 스크롤 내러티브, 가로 카드, 비교표, 대형 CTA 구조
- **Content reference:** KARST Goods의 Stone Paper 제품, 카테고리, 소재와 지속가능성 메시지
- **Purpose:** 개인 포트폴리오가 아닌 제품 탐색과 구매 전환을 위한 브랜드 커머스 사이트

## Active files

- `index.html` — 상품 중심 페이지 구조와 콘텐츠
- `CSS/commerce-tokens.css` — 커머스 디자인 토큰의 단일 source of truth
- `CSS/site.css` — 섹션과 컴포넌트 스타일
- `script.js` — 메뉴, 상품 슬라이더, reveal 인터랙션

## Core system

- Background: `#F2EFE7`
- Surface: `#F7F4ED`, `#E7E1D6`
- Text: `#1D211D`
- Accent: `#A66F45`, `#758070`
- Desktop grid: 12 columns / Mobile grid: 4 columns
- Product flow: Hero → Categories → Stone Paper benefits → Sustainability → Comparison → Best sellers → Community → Shop CTA

## Commerce requirements

- 상품명, 가격, 상태와 구매 CTA의 위계를 명확히 유지한다.
- 카테고리 및 상품 슬라이더는 키보드로 조작할 수 있어야 한다.
- 제품 이미지는 의미 있는 대체 텍스트를 제공한다.
- 가격에는 tabular numerals를 사용한다.
- 모바일에서는 상품 카드가 한 장씩 보이는 가로 탐색 방식으로 전환한다.
- `prefers-reduced-motion` 환경에서는 reveal과 smooth motion을 제거한다.
