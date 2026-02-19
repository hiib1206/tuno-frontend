/**
 * AI 모델 정보 상수
 *
 * @remarks
 * 각 AI 모델의 이름, 라벨, 설명, 주요 기능을 정의한다.
 */
export const aiModels = {
  "prophet-v2": {
    name: "Prophet v2.0",
    label: "Prophet v2.0 (안정)",
    description:
      "Facebook에서 개발한 시계열 예측 모델로, 계절성과 트렌드를 잘 파악합니다. 안정적이고 신뢰할 수 있는 예측을 제공하며, 일반적인 주식 시장 분석에 적합합니다.",
    features: ["계절성 분석", "트렌드 예측", "안정적인 성능"],
  },
  "lstm-turbo": {
    name: "LSTM Turbo",
    label: "LSTM Turbo (실험적)",
    description:
      "딥러닝 기반 장단기 메모리 네트워크로, 복잡한 패턴과 비선형 관계를 학습합니다. 빠른 처리 속도와 높은 정확도를 제공하지만, 실험적 단계의 모델입니다.",
    features: ["딥러닝 기반", "복잡한 패턴 학습", "빠른 처리 속도"],
  },
  "transformer-x": {
    name: "Transformer X",
    label: "Transformer X (고변동성)",
    description:
      "최신 Transformer 아키텍처를 활용한 모델로, 고변동성 주식과 복잡한 시장 상황에서 우수한 성능을 보입니다. 장기 예측에 특히 강점이 있습니다.",
    features: ["고변동성 대응", "장기 예측", "복잡한 시장 분석"],
  },
} as const;

/** AI 모델 키 타입 */
export type AIModelKey = keyof typeof aiModels;
