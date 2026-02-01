import {
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  PrimitivePaneViewZOrder,
  SeriesAttachedParameter,
} from "lightweight-charts";


// 지지선 밴드 설정
export interface PriceBand {
  price: number;
  color: string;
  range?: number; // 기본값 0.025 (±2.5%) - upperPrice/lowerPrice 없을 때 사용
  upperPrice?: number; // 지지 구간 상단 (직접 지정)
  lowerPrice?: number; // 지지 구간 하단 (직접 지정)
  label?: string;
}

// 호버 시 표시할 밴드 정보
export interface BandHoverInfo {
  label: string;
  upperPrice: number;
  centerPrice: number;
  lowerPrice: number;
  color: string;
}

// 홀로그램 그라데이션 색상 (AI 느낌)
export const SUPPORT_BAND_COLORS = [
  "rgba(96, 165, 250, 0.15)",   // Level 1: 파랑
  "rgba(167, 139, 250, 0.15)",  // Level 2: 보라
  "rgba(244, 114, 182, 0.15)",  // Level 3: 핑크
];

// 밴드 경계선 색상
export const SUPPORT_LINE_COLORS = [
  "rgba(96, 165, 250, 0.6)",
  "rgba(167, 139, 250, 0.6)",
  "rgba(244, 114, 182, 0.6)",
];

// 애니메이션 설정
const ANIM_DURATION = 900; // 밴드당 애니메이션 길이 (ms)
const ANIM_STAGGER = 500;  // 밴드 간 등장 딜레이 (ms)

// ease-out cubic: 처음 빠르고 끝에서 감속
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

// 렌더링 데이터 (hitTest용 가격 정보 포함)
interface BandRenderData {
  upperY: number;
  lowerY: number;
  centerY: number;
  upperPrice: number;
  lowerPrice: number;
  centerPrice: number;
  color: string;
  label?: string;
  progress: number; // 0~1 애니메이션 진행도
}

// Renderer: 실제 캔버스에 그리는 클래스
class PriceBandRenderer implements IPrimitivePaneRenderer {
  private _data: BandRenderData[] = [];

  update(data: BandRenderData[]) {
    this._data = data;
  }

  draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const width = scope.bitmapSize.width;
      const pixelRatio = scope.horizontalPixelRatio;

      for (const band of this._data) {
        const p = band.progress;
        if (p <= 0) continue; // 아직 등장 전

        // 좌표를 bitmap 좌표계로 변환
        const rawUpperY = Math.round(band.upperY * pixelRatio);
        const rawLowerY = Math.round(band.lowerY * pixelRatio);
        const rawCenterY = Math.round(band.centerY * pixelRatio);

        // 밴드 확장 애니메이션: 중심에서 상하로 벌어짐
        const upperY = Math.round(rawCenterY + (rawUpperY - rawCenterY) * p);
        const lowerY = Math.round(rawCenterY + (rawLowerY - rawCenterY) * p);
        const centerY = rawCenterY;
        const height = lowerY - upperY;

        // 색상에서 RGB 추출 (rgba(r, g, b, a) 형식)
        const rgbaMatch = band.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const r = rgbaMatch ? rgbaMatch[1] : "96";
        const g = rgbaMatch ? rgbaMatch[2] : "165";
        const b = rgbaMatch ? rgbaMatch[3] : "250";

        // 밴드 영역 (opacity도 progress에 따라 페이드인)
        const gradient = ctx.createLinearGradient(0, upperY, 0, lowerY);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.10 * p})`);
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${0.30 * p})`);
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, ${0.10 * p})`);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, upperY, width, height);

        // 중심선 (opacity 페이드인)
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.6 * p})`;
        ctx.lineWidth = pixelRatio;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // 라벨 (opacity 페이드인)
        if (band.label) {
          ctx.font = `bold ${10 * pixelRatio}px sans-serif`;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.9 * p})`;
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(band.label, 8 * pixelRatio, upperY - 2 * pixelRatio);
        }
      }
    });
  }
}

// PaneView: 렌더러를 관리하는 클래스
class PriceBandPaneView implements IPrimitivePaneView {
  private _renderer: PriceBandRenderer = new PriceBandRenderer();
  private _data: BandRenderData[] = [];

  update(data: BandRenderData[]) {
    this._data = data;
    this._renderer.update(data);
  }

  // hitTest용 데이터 접근
  getData(): BandRenderData[] {
    return this._data;
  }

  renderer(): IPrimitivePaneRenderer {
    return this._renderer;
  }

  zOrder(): PrimitivePaneViewZOrder {
    return "bottom"; // 캔들 뒤에 그림
  }
}

// Primitive: lightweight-charts에 연결되는 메인 클래스
export class PriceBandPrimitive implements ISeriesPrimitive {
  private _paneView: PriceBandPaneView = new PriceBandPaneView();
  private _bands: PriceBand[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _series: SeriesAttachedParameter<any>["series"] | null = null;
  private _requestUpdate?: () => void;
  private _animStartTime: number | null = null;
  private _animFrameId: number = 0;

  // 밴드 데이터 설정 (애니메이션 시작)
  setBands(bands: PriceBand[]) {
    this._bands = bands;
    this._startAnimation();
  }

  // 밴드 데이터 초기화
  clearBands() {
    this._stopAnimation();
    this._bands = [];
    this._requestUpdate?.();
  }

  private _startAnimation() {
    this._stopAnimation();
    this._animStartTime = performance.now();
    this._animate();
  }

  private _stopAnimation() {
    if (this._animFrameId) {
      cancelAnimationFrame(this._animFrameId);
      this._animFrameId = 0;
    }
    this._animStartTime = null;
  }

  private _animate() {
    this._requestUpdate?.();

    if (this._animStartTime === null) return;

    const elapsed = performance.now() - this._animStartTime;
    const totalDuration =
      ANIM_DURATION + ANIM_STAGGER * Math.max(0, this._bands.length - 1);

    if (elapsed < totalDuration) {
      this._animFrameId = requestAnimationFrame(() => this._animate());
    } else {
      // 애니메이션 완료
      this._animFrameId = 0;
      this._animStartTime = null;
      // 최종 상태 한 번 더 갱신 (progress=1 보장)
      this._requestUpdate?.();
    }
  }

  // lightweight-charts에서 호출하는 메서드들
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attached(param: SeriesAttachedParameter<any>) {
    this._series = param.series;
    this._requestUpdate = param.requestUpdate;
  }

  detached() {
    this._stopAnimation();
    this._series = null;
    this._requestUpdate = undefined;
  }

  paneViews() {
    return [this._paneView];
  }

  updateAllViews() {
    if (!this._series || this._bands.length === 0) {
      this._paneView.update([]);
      return;
    }

    // 애니메이션 경과 시간 계산
    const elapsed =
      this._animStartTime !== null
        ? performance.now() - this._animStartTime
        : Infinity; // 애니메이션 완료 → progress=1

    const renderData: BandRenderData[] = [];

    for (let i = 0; i < this._bands.length; i++) {
      const band = this._bands[i];

      // upperPrice/lowerPrice가 있으면 직접 사용, 없으면 range로 계산
      const upperPrice =
        band.upperPrice ?? band.price * (1 + (band.range ?? 0.025));
      const lowerPrice =
        band.lowerPrice ?? band.price * (1 - (band.range ?? 0.025));

      const upperY = this._series.priceToCoordinate(upperPrice);
      const lowerY = this._series.priceToCoordinate(lowerPrice);
      const centerY = this._series.priceToCoordinate(band.price);

      if (upperY === null || lowerY === null || centerY === null) continue;

      // 밴드별 stagger된 progress 계산
      const bandDelay = i * ANIM_STAGGER;
      const bandElapsed = Math.max(0, elapsed - bandDelay);
      const rawProgress = Math.min(1, bandElapsed / ANIM_DURATION);
      const progress = easeOutCubic(rawProgress);

      renderData.push({
        upperY,
        lowerY,
        centerY,
        upperPrice,
        lowerPrice,
        centerPrice: band.price,
        color: band.color,
        label: band.label,
        progress,
      });
    }

    this._paneView.update(renderData);
  }

  // 마우스 Y좌표로 호버된 밴드 정보 반환
  getBandAtY(y: number): BandHoverInfo | null {
    const data = this._paneView.getData();

    for (const band of data) {
      // Y좌표가 밴드 범위 안에 있는지 확인
      if (y >= band.upperY && y <= band.lowerY) {
        return {
          label: band.label || "",
          upperPrice: band.upperPrice,
          centerPrice: band.centerPrice,
          lowerPrice: band.lowerPrice,
          color: band.color,
        };
      }
    }

    return null;
  }
}
