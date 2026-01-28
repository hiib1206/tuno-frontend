import {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
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
        // 좌표를 bitmap 좌표계로 변환
        const upperY = Math.round(band.upperY * pixelRatio);
        const lowerY = Math.round(band.lowerY * pixelRatio);
        const centerY = Math.round(band.centerY * pixelRatio);
        const height = lowerY - upperY;

        // 색상에서 RGB 추출 (rgba(r, g, b, a) 형식)
        const rgbaMatch = band.color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const r = rgbaMatch ? rgbaMatch[1] : "96";
        const g = rgbaMatch ? rgbaMatch[2] : "165";
        const b = rgbaMatch ? rgbaMatch[3] : "250";

        // 밴드 영역 (상하단도 보이고 중심이 더 진한 그라데이션)
        const gradient = ctx.createLinearGradient(0, upperY, 0, lowerY);
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.10)`);   // 상단: 살짝 연하게
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.30)`); // 중심: 더 진하게
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.10)`);   // 하단: 살짝 연하게

        ctx.fillStyle = gradient;
        ctx.fillRect(0, upperY, width, height);

        // 중심선 (실선)
        const lineColor = `rgba(${r}, ${g}, ${b}, 0.6)`;
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = pixelRatio;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // 라벨 (밴드 위쪽 바깥)
        if (band.label) {
          const labelColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
          ctx.font = `bold ${10 * pixelRatio}px sans-serif`;
          ctx.fillStyle = labelColor;
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

  // 밴드 데이터 설정
  setBands(bands: PriceBand[]) {
    this._bands = bands;
    this._requestUpdate?.();
  }

  // 밴드 데이터 초기화
  clearBands() {
    this._bands = [];
    this._requestUpdate?.();
  }

  // lightweight-charts에서 호출하는 메서드들
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attached(param: SeriesAttachedParameter<any>) {
    this._series = param.series;
    this._requestUpdate = param.requestUpdate;
  }

  detached() {
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

    const renderData: BandRenderData[] = [];

    for (const band of this._bands) {
      // upperPrice/lowerPrice가 있으면 직접 사용, 없으면 range로 계산
      const upperPrice =
        band.upperPrice ?? band.price * (1 + (band.range ?? 0.025));
      const lowerPrice =
        band.lowerPrice ?? band.price * (1 - (band.range ?? 0.025));

      const upperY = this._series.priceToCoordinate(upperPrice);
      const lowerY = this._series.priceToCoordinate(lowerPrice);
      const centerY = this._series.priceToCoordinate(band.price);

      if (upperY === null || lowerY === null || centerY === null) continue;

      renderData.push({
        upperY,
        lowerY,
        centerY,
        upperPrice,
        lowerPrice,
        centerPrice: band.price,
        color: band.color,
        label: band.label,
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
