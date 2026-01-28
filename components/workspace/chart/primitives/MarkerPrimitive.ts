import {
  IChartApi,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesPrimitive,
  PrimitivePaneViewZOrder,
  SeriesAttachedParameter,
  UTCTimestamp,
} from "lightweight-charts";

// 마커 설정
export interface ChartMarker {
  time: UTCTimestamp;
  price: number;
  text: string;
  color?: string;
}

// 렌더링 데이터
interface MarkerRenderData {
  x: number;
  y: number;
  text: string;
  color: string;
}

// Renderer: 실제 캔버스에 그리는 클래스
class MarkerRenderer implements IPrimitivePaneRenderer {
  private _data: MarkerRenderData | null = null;

  update(data: MarkerRenderData | null) {
    this._data = data;
  }

  draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]) {
    if (!this._data) return;

    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const pixelRatio = scope.horizontalPixelRatio;
      const { x, y, text, color } = this._data!;

      // 좌표를 bitmap 좌표계로 변환
      const bitmapX = Math.round(x * pixelRatio);
      const bitmapY = Math.round(y * pixelRatio);

      // 화살표 크기
      const arrowHeadSize = 10 * pixelRatio; // 화살촉 너비
      const arrowHeadHeight = 10 * pixelRatio; // 화살촉 높이
      const shaftWidth = 3 * pixelRatio; // 막대 두께
      const shaftHeight = 8 * pixelRatio; // 막대 길이

      ctx.fillStyle = color;

      // 1. 화살촉 (아래 방향 삼각형)
      ctx.beginPath();
      ctx.moveTo(bitmapX, bitmapY); // 화살표 끝점 (아래)
      ctx.lineTo(bitmapX - arrowHeadSize / 2, bitmapY - arrowHeadHeight);
      ctx.lineTo(bitmapX + arrowHeadSize / 2, bitmapY - arrowHeadHeight);
      ctx.closePath();
      ctx.fill();

      // 2. 화살대 (수직 막대)
      ctx.fillRect(
        bitmapX - shaftWidth / 2,
        bitmapY - arrowHeadHeight - shaftHeight,
        shaftWidth,
        shaftHeight
      );

      // 3. 텍스트 그리기 (화살대 위)
      ctx.font = `bold ${11 * pixelRatio}px sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "bottom";
      ctx.fillText(
        text,
        bitmapX,
        bitmapY - arrowHeadHeight - shaftHeight - 3 * pixelRatio
      );
    });
  }
}

// PaneView: 렌더러를 관리하는 클래스
class MarkerPaneView implements IPrimitivePaneView {
  private _renderer: MarkerRenderer = new MarkerRenderer();

  update(data: MarkerRenderData | null) {
    this._renderer.update(data);
  }

  renderer(): IPrimitivePaneRenderer {
    return this._renderer;
  }

  zOrder(): PrimitivePaneViewZOrder {
    return "top"; // 캔들 위에 그림
  }
}

// Primitive: lightweight-charts에 연결되는 메인 클래스
export class MarkerPrimitive implements ISeriesPrimitive {
  private _paneView: MarkerPaneView = new MarkerPaneView();
  private _marker: ChartMarker | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _series: SeriesAttachedParameter<any>["series"] | null = null;
  private _chart: IChartApi | null = null;
  private _requestUpdate?: () => void;

  // 마커 데이터 설정
  setMarker(marker: ChartMarker) {
    this._marker = marker;
    this._requestUpdate?.();
  }

  // 마커 데이터 초기화
  clearMarker() {
    this._marker = null;
    this._requestUpdate?.();
  }

  // 차트 인스턴스 설정 (시간 → X 좌표 변환에 필요)
  setChart(chart: IChartApi) {
    this._chart = chart;
  }

  // lightweight-charts에서 호출하는 메서드들
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attached(param: SeriesAttachedParameter<any>) {
    this._series = param.series;
    this._requestUpdate = param.requestUpdate;
  }

  detached() {
    this._series = null;
    this._chart = null;
    this._requestUpdate = undefined;
  }

  paneViews() {
    return [this._paneView];
  }

  updateAllViews() {
    if (!this._series || !this._chart || !this._marker) {
      this._paneView.update(null);
      return;
    }

    // 시간 → X 좌표
    const x = this._chart.timeScale().timeToCoordinate(this._marker.time);
    // 가격 → Y 좌표
    const y = this._series.priceToCoordinate(this._marker.price);

    if (x === null || y === null) {
      this._paneView.update(null);
      return;
    }

    this._paneView.update({
      x,
      y: y - 3,
      text: this._marker.text,
      color: this._marker.color || "#fbbf24", // 기본 amber-400
    });
  }
}
