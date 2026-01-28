import {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
  ISeriesPrimitiveAxisView,
} from "lightweight-charts";

// 수평선 설정
export interface HorizontalLine {
  id: string;
  price: number;
  color: string;
  lineWidth?: number;
  lineStyle?: "solid" | "dashed" | "dotted";
  label?: string;
}

// 렌더링 데이터
interface LineRenderData {
  id: string;
  y: number;
  price: number;
  color: string;
  lineWidth: number;
  lineStyle: "solid" | "dashed" | "dotted";
  label?: string;
  isSelected?: boolean;
}

// Renderer: 실제 캔버스에 그리는 클래스
class HorizontalLineRenderer implements IPrimitivePaneRenderer {
  private _data: LineRenderData[] = [];

  update(data: LineRenderData[]) {
    this._data = data;
  }

  draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const width = scope.bitmapSize.width;
      const pixelRatio = scope.horizontalPixelRatio;

      for (const line of this._data) {
        const y = Math.round(line.y * pixelRatio);

        ctx.strokeStyle = line.color;
        ctx.lineWidth = line.lineWidth * pixelRatio;

        // 선 스타일 설정
        if (line.lineStyle === "dashed") {
          ctx.setLineDash([6 * pixelRatio, 4 * pixelRatio]);
        } else if (line.lineStyle === "dotted") {
          ctx.setLineDash([2 * pixelRatio, 2 * pixelRatio]);
        } else {
          ctx.setLineDash([]);
        }

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();

        // 선택된 라인: 양 끝에 정사각형 핸들 표시
        if (line.isSelected) {
          ctx.setLineDash([]);
          const handleSize = 6 * pixelRatio;
          ctx.lineWidth = handleSize;

          // 왼쪽 핸들
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(handleSize, y);
          ctx.stroke();

          // 오른쪽 핸들
          ctx.beginPath();
          ctx.moveTo(width - handleSize, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }

        // 라벨
        if (line.label) {
          ctx.setLineDash([]);
          ctx.font = `${10 * pixelRatio}px sans-serif`;
          ctx.fillStyle = line.color;
          ctx.textAlign = "left";
          ctx.textBaseline = "bottom";
          ctx.fillText(line.label, 8 * pixelRatio, y - 4 * pixelRatio);
        }
      }

      // 선 스타일 리셋
      ctx.setLineDash([]);
    });
  }
}

// PaneView: 렌더러를 관리하는 클래스
class HorizontalLinePaneView implements IPrimitivePaneView {
  private _renderer: HorizontalLineRenderer = new HorizontalLineRenderer();

  update(data: LineRenderData[]) {
    this._renderer.update(data);
  }

  renderer(): IPrimitivePaneRenderer {
    return this._renderer;
  }

  zOrder(): PrimitivePaneViewZOrder {
    return "top"; // 캔들 위에 그림
  }
}

// 가격축 라벨 뷰
class HorizontalLinePriceAxisView implements ISeriesPrimitiveAxisView {
  private _price: number;
  private _color: string;
  private _coordinate: number = 0;

  constructor(price: number, color: string) {
    this._price = price;
    this._color = color;
  }

  update(price: number, color: string, coordinate: number) {
    this._price = price;
    this._color = color;
    this._coordinate = coordinate;
  }

  coordinate(): number {
    return this._coordinate;
  }

  text(): string {
    return Math.round(this._price).toLocaleString();
  }

  textColor(): string {
    return "#ffffff";
  }

  backColor(): string {
    return this._color;
  }

  visible(): boolean {
    return true;
  }

  tickVisible(): boolean {
    return true;
  }
}

// Primitive: lightweight-charts에 연결되는 메인 클래스
export class HorizontalLinePrimitive implements ISeriesPrimitive {
  private _paneView: HorizontalLinePaneView = new HorizontalLinePaneView();
  private _priceAxisViews: HorizontalLinePriceAxisView[] = [];
  private _lines: HorizontalLine[] = [];
  private _selectedId: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _series: SeriesAttachedParameter<any>["series"] | null = null;
  private _requestUpdate?: () => void;

  // 수평선 추가
  addLine(line: HorizontalLine) {
    this._lines.push(line);
    this._requestUpdate?.();
  }

  // 수평선 제거
  removeLine(id: string) {
    this._lines = this._lines.filter((l) => l.id !== id);
    this._requestUpdate?.();
  }

  // 모든 수평선 제거
  clearLines() {
    this._lines = [];
    this._requestUpdate?.();
  }

  // 수평선 목록 반환
  getLines(): HorizontalLine[] {
    return [...this._lines];
  }

  // 수평선 가격 업데이트
  updateLinePrice(id: string, newPrice: number) {
    const line = this._lines.find((l) => l.id === id);
    if (line) {
      line.price = newPrice;
      this._requestUpdate?.();
    }
  }

  // Y좌표 근처의 수평선 찾기 (hit testing)
  getLineAtY(y: number, threshold: number = 5): HorizontalLine | null {
    if (!this._series) return null;

    for (const line of this._lines) {
      const lineY = this._series.priceToCoordinate(line.price);
      if (lineY === null) continue;

      if (Math.abs(lineY - y) <= threshold) {
        return line;
      }
    }

    return null;
  }

  // 선택된 라인 설정
  setSelectedId(id: string | null) {
    this._selectedId = id;
    this._requestUpdate?.();
  }

  // 선택된 라인 ID 반환
  getSelectedId(): string | null {
    return this._selectedId;
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

  priceAxisViews() {
    return this._priceAxisViews;
  }

  updateAllViews() {
    if (!this._series) {
      this._paneView.update([]);
      this._priceAxisViews = [];
      return;
    }

    const renderData: LineRenderData[] = [];
    const newPriceAxisViews: HorizontalLinePriceAxisView[] = [];

    // 확정된 수평선들
    for (const line of this._lines) {
      const y = this._series.priceToCoordinate(line.price);
      if (y === null) continue;

      renderData.push({
        id: line.id,
        y,
        price: line.price,
        color: line.color,
        lineWidth: line.lineWidth ?? 1,
        lineStyle: line.lineStyle ?? "solid",
        label: line.label,
        isSelected: line.id === this._selectedId,
      });

      // 가격축 라벨 추가
      const axisView = new HorizontalLinePriceAxisView(line.price, line.color);
      axisView.update(line.price, line.color, y);
      newPriceAxisViews.push(axisView);
    }

    this._paneView.update(renderData);
    this._priceAxisViews = newPriceAxisViews;
  }
}
