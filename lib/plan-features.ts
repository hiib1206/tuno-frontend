export interface PlanFeature {
  label: string;
  free: boolean | string;
  pro: boolean | string;
}

export interface PlanFeatureGroup {
  category: string;
  features: PlanFeature[];
}

export const planFeatureGroups: PlanFeatureGroup[] = [
  {
    category: "AI 주식 분석",
    features: [
      { label: "일일 분석 횟수", free: "5회", pro: "100회" },
      { label: "Quant Signal", free: true, pro: true },
      { label: "Snapback 분석", free: true, pro: true },
      { label: "퀀트 시그널 자동 알림", free: false, pro: true },
      { label: "AI 포트폴리오 추천", free: false, pro: true },
      { label: "우선 분석", free: false, pro: true },
    ],
  },
  {
    category: "종목 데이터",
    features: [{ label: "실시간 시세 / 호가", free: true, pro: true }],
  },
];

export const planInfo = {
  FREE: {
    name: "Free",
    price: 0,
    description: "기본적인 투자 분석을 무료로 시작하세요.",
  },
  PRO: {
    name: "Pro",
    price: 9900,
    description: "더 많은 AI 분석으로 투자 판단력을 높이세요.",
  },
};
