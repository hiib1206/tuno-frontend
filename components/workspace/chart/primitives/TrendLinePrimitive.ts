import {
  ISeriesPrimitive,
  SeriesAttachedParameter,
  IPrimitivePaneView,
  IPrimitivePaneRenderer,
  PrimitivePaneViewZOrder,
  Time,
  UTCTimestamp,
} from "lightweight-charts";

// 추세선 설정
export interface TrendLine {
  id: string;
  startPoint: { time: UTCTimestamp; price: number };
  endPoint: { time: UTCTimestamp; price: number };
  color: string;
  lineWidth?: number;
  lineStyle?: "solid" | "dashed" | "dotted";
}

// 렌더링 데이터
interface LineRenderData {
  id: string;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  color: string;
  lineWidth: number;
  lineStyle: "solid" | "dashed" | "dotted";
  isSelected?: boolean;
  // 라벨용 데이터
  priceDiff: number;
  percentDiff: number;
}

// Renderer: 실제 캔버스에 그리는 클래스
class TrendLineRenderer implements IPrimitivePaneRenderer {
  private _data: LineRenderData[] = [];

  update(data: LineRenderData[]) {
    this._data = data;
  }

  draw(target: Parameters<IPrimitivePaneRenderer["draw"]>[0]) {
    target.useBitmapCoordinateSpace((scope) => {
      const ctx = scope.context;
      const pixelRatio = scope.horizontalPixelRatio;

      for (const line of this._data) {
        const startX = Math.round(line.startX * pixelRatio);
        const startY = Math.round(line.startY * pixelRatio);
        const endX = Math.round(line.endX * pixelRatio);
        const endY = Math.round(line.endY * pixelRatio);

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

        // 추세선 그리기
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();

        // 선택된 라인: 양 끝에 정사각형 핸들 표시
        if (line.isSelected) {
          ctx.setLineDash([]);
          const handleSize = 6 * pixelRatio;

          // 시작점 핸들 (정사각형)
          ctx.fillStyle = line.color;
          ctx.fillRect(
            startX - handleSize / 2,
            startY - handleSize / 2,
            handleSize,
            handleSize
          );

          // 끝점 핸들 (정사각형)
          ctx.fillRect(
            endX - handleSize / 2,
            endY - handleSize / 2,
            handleSize,
            handleSize
          );
        }

        // 끝점에 라벨 표시 (가격차이 + %)
        ctx.setLineDash([]);
        const sign = line.priceDiff >= 0 ? "+" : "";
        const labelText = `${sign}${Math.round(line.priceDiff).toLocaleString()} (${sign}${line.percentDiff.toFixed(2)}%)`;

        ctx.font = `${11 * pixelRatio}px sans-serif`;
        const textMetrics = ctx.measureText(labelText);
        const padding = 4 * pixelRatio;
        const textHeight = 11 * pixelRatio;

        // 라벨 배경
        const bgX = endX + 8 * pixelRatio;
        const bgY = endY - textHeight / 2 - padding;
        const bgWidth = textMetrics.width + padding * 2;
        const bgHeight = textHeight + padding * 2;

        ctx.fillStyle = line.color;
        ctx.beginPath();
        ctx.roundRect(bgX, bgY, bgWidth, bgHeight, 3 * pixelRatio);
        ctx.fill();

        // 라벨 텍스트
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.textBaseline = "middle";
        ctx.fillText(labelText, bgX + padding, endY);
      }

      // 선 스타일 리셋
      ctx.setLineDash([]);
    });
  }
}

// PaneView: 렌더러를 관리하는 클래스
class TrendLinePaneView implements IPrimitivePaneView {
  private _renderer: TrendLineRenderer = new TrendLineRenderer();

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

// Primitive: lightweight-charts에 연결되는 메인 클래스
export class TrendLinePrimitive implements ISeriesPrimitive<Time> {
  private _paneView: TrendLinePaneView = new TrendLinePaneView();
  private _lines: TrendLine[] = [];
  private _selectedId: string | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _series: SeriesAttachedParameter<any>["series"] | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _chart: SeriesAttachedParameter<any>["chart"] | null = null;
  private _requestUpdate?: () => void;

  // 미리보기 상태
  private _previewStart: { time: UTCTimestamp; price: number } | null = null;
  private _previewEnd: { time: UTCTimestamp; price: number } | null = null;

  // 추세선 추가
  addLine(line: TrendLine) {
    this._lines.push(line);
    this._requestUpdate?.();
  }

  // 추세선 제거
  removeLine(id: string) {
    this._lines = this._lines.filter((l) => l.id !== id);
    this._requestUpdate?.();
  }

  // 모든 추세선 제거
  clearLines() {
    this._lines = [];
    this._requestUpdate?.();
  }

  // 추세선 목록 반환
  getLines(): TrendLine[] {
    return [...this._lines];
  }

  // 추세선 업데이트 (드래그 등)
  updateLine(
    id: string,
    updates: Partial<Pick<TrendLine, "startPoint" | "endPoint">>
  ) {
    const line = this._lines.find((l) => l.id === id);
    if (line) {
      if (updates.startPoint) line.startPoint = updates.startPoint;
      if (updates.endPoint) line.endPoint = updates.endPoint;
      this._requestUpdate?.();
    }
  }

  // 좌표 근처의 추세선 찾기 (hit testing)
  getLineAtPoint(
    x: number,
    y: number,
    threshold: number = 8
  ): TrendLine | null {
    if (!this._series || !this._chart) return null;

    for (const line of this._lines) {
      const startX = this._chart.timeScale().timeToCoordinate(line.startPoint.time);
      const startY = this._series.priceToCoordinate(line.startPoint.price);
      const endX = this._chart.timeScale().timeToCoordinate(line.endPoint.time);
      const endY = this._series.priceToCoordinate(line.endPoint.price);

      if (
        startX === null ||
        startY === null ||
        endX === null ||
        endY === null
      ) {
        continue;
      }

      // 점과 선분 사이의 거리 계산
      const distance = this._pointToLineDistance(
        x,
        y,
        startX,
        startY,
        endX,
        endY
      );

      if (distance <= threshold) {
        return line;
      }
    }

    return null;
  }

  // 선택된 추세선의 핸들(끝점) 감지
  getHandleAtPoint(
    x: number,
    y: number,
    threshold: number = 10
  ): "start" | "end" | null {
    if (!this._series || !this._chart || !this._selectedId) return null;

    const line = this._lines.find((l) => l.id === this._selectedId);
    if (!line) return null;

    const startX = this._chart.timeScale().timeToCoordinate(line.startPoint.time);
    const startY = this._series.priceToCoordinate(line.startPoint.price);
    const endX = this._chart.timeScale().timeToCoordinate(line.endPoint.time);
    const endY = this._series.priceToCoordinate(line.endPoint.price);

    if (startX === null || startY === null || endX === null || endY === null) {
      return null;
    }

    // 시작점 핸들 체크
    const startDist = Math.sqrt((x - startX) ** 2 + (y - startY) ** 2);
    if (startDist <= threshold) {
      return "start";
    }

    // 끝점 핸들 체크
    const endDist = Math.sqrt((x - endX) ** 2 + (y - endY) ** 2);
    if (endDist <= threshold) {
      return "end";
    }

    return null;
  }

  // 점과 선분 사이의 거리 계산
  private _pointToLineDistance(
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) {
      param = dot / lenSq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy);
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

  // 미리보기 시작점 설정
  setPreviewStart(point: { time: UTCTimestamp; price: number } | null) {
    this._previewStart = point;
    this._previewEnd = null;
    this._requestUpdate?.();
  }

  // 미리보기 끝점 설정
  setPreviewEnd(point: { time: UTCTimestamp; price: number } | null) {
    this._previewEnd = point;
    this._requestUpdate?.();
  }

  // 미리보기 초기화
  clearPreview() {
    this._previewStart = null;
    this._previewEnd = null;
    this._requestUpdate?.();
  }

  // 좌표를 시간/가격으로 변환
  coordinateToPoint(
    x: number,
    y: number
  ): { time: UTCTimestamp; price: number } | null {
    if (!this._series || !this._chart) return null;

    const time = this._chart.timeScale().coordinateToTime(x);
    const price = this._series.coordinateToPrice(y);

    if (time === null || price === null) return null;

    return { time: time as UTCTimestamp, price };
  }

  // lightweight-charts에서 호출하는 메서드들
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attached(param: SeriesAttachedParameter<any>) {
    this._series = param.series;
    this._chart = param.chart;
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
    if (!this._series || !this._chart) {
      this._paneView.update([]);
      return;
    }

    const renderData: LineRenderData[] = [];

    for (const line of this._lines) {
      const startX = this._chart.timeScale().timeToCoordinate(line.startPoint.time);
      const startY = this._series.priceToCoordinate(line.startPoint.price);
      const endX = this._chart.timeScale().timeToCoordinate(line.endPoint.time);
      const endY = this._series.priceToCoordinate(line.endPoint.price);

      if (
        startX === null ||
        startY === null ||
        endX === null ||
        endY === null
      ) {
        continue;
      }

      // 가격 차이 및 % 계산
      const priceDiff = line.endPoint.price - line.startPoint.price;
      const percentDiff =
        (priceDiff / line.startPoint.price) * 100;

      renderData.push({
        id: line.id,
        startX,
        startY,
        endX,
        endY,
        color: line.color,
        lineWidth: line.lineWidth ?? 1,
        lineStyle: line.lineStyle ?? "solid",
        isSelected: line.id === this._selectedId,
        priceDiff,
        percentDiff,
      });
    }

    // 미리보기 선 렌더링
    if (this._previewStart && this._previewEnd) {
      const previewStartX = this._chart
        .timeScale()
        .timeToCoordinate(this._previewStart.time);
      const previewStartY = this._series.priceToCoordinate(
        this._previewStart.price
      );
      const previewEndX = this._chart
        .timeScale()
        .timeToCoordinate(this._previewEnd.time);
      const previewEndY = this._series.priceToCoordinate(
        this._previewEnd.price
      );

      if (
        previewStartX !== null &&
        previewStartY !== null &&
        previewEndX !== null &&
        previewEndY !== null
      ) {
        const priceDiff = this._previewEnd.price - this._previewStart.price;
        const percentDiff = (priceDiff / this._previewStart.price) * 100;

        renderData.push({
          id: "preview",
          startX: previewStartX,
          startY: previewStartY,
          endX: previewEndX,
          endY: previewEndY,
          color: "#f59e0b",
          lineWidth: 1,
          lineStyle: "dashed",
          isSelected: false,
          priceDiff,
          percentDiff,
        });
      }
    }

    this._paneView.update(renderData);
  }
}
