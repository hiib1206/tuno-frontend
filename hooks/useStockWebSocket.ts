import { TR_ID, TrId } from "@/types/Stock";
import { useCallback, useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL!;

/**
 * 사용 예시:
 * const { realtimeData } = useStockWebSocket("005930", {
 *   trCodes: ["H0UNCNT0", "H0STASP0"],
 *   onData: (trId, data) => {
 *     if (trId === "H0UNCNT0") {
 *       // 체결가 데이터 처리
 *     } else if (trId === "H0STASP0") {
 *       // 호가 데이터 처리
 *     }
 *   }
 * });
 */
interface UseStockWebSocketOptions {
  enabled?: boolean;
  trCodes?: TrId[]; // 구독할 TR 코드 배열
  onData?: (trId: string, data: any) => void; // TR 코드와 데이터를 함께 전달
}

interface UseStockWebSocketResult {
  realtimeData: Record<string, any>; // TR 코드별 데이터
  isConnected: boolean;
  error: string | null;
}

/**
 * 실시간 주식 데이터를 수신하는 WebSocket 훅
 * 여러 TR 코드를 동시에 구독 가능
 */
export function useStockWebSocket(
  stockCode: string,
  options: UseStockWebSocketOptions = {}
): UseStockWebSocketResult {
  // enabled: WebSocket 연결을 켜거나 끄는 스위치
  const { enabled = true, trCodes = [TR_ID.H0UNCNT0], onData } = options;
  // WebSocket으로 받은 실시간 주식 데이터 저장 (TR 코드별)
  const [realtimeData, setRealtimeData] = useState<Record<string, any>>({});
  // WebSocket 연결 상태 표시
  const [isConnected, setIsConnected] = useState(false);
  // WebSocket 연결/수신 중 발생한 에러 메시지 저장
  const [error, setError] = useState<string | null>(null);
  // WebSocket 인스턴스 참조 저장 -> 재연결 시 기존 연결 정리, 컴포넌트 언마운트 시 연결 종료
  const wsRef = useRef<WebSocket | null>(null);
  // 재연결 타이머 ID 저장 -> 재연결 지연 실행 관리, 언마운트 시 타이머 정리
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  // 의도적 종료 플래그 -> cleanup에 의한 종료 시 자동 재연결 방지
  const intentionalCloseRef = useRef(false);

  // onData 콜백을 ref로 관리하여 의존성 문제 방지
  const onDataRef = useRef(onData);
  useEffect(() => {
    onDataRef.current = onData;
  }, [onData]);

  // trCodes를 ref로 관리
  const trCodesRef = useRef(trCodes);
  useEffect(() => {
    trCodesRef.current = trCodes;
  }, [trCodes]);

  const connect = useCallback(() => {
    if (!enabled || !stockCode) return;

    // 기존 연결 정리 (의도적 종료로 표시하여 onclose에서 재연결 방지)
    if (wsRef.current) {
      intentionalCloseRef.current = true;
      wsRef.current.close();
      wsRef.current = null;
    }

    // 새 연결 시작 시 의도적 종료 플래그 리셋
    intentionalCloseRef.current = false;

    try {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectAttemptsRef.current = 0;

        // 모든 TR 코드에 대해 구독 요청
        trCodesRef.current.forEach((trId) => {
          ws.send(
            JSON.stringify({
              type: "subscribe",
              trId,
              trKey: stockCode,
            })
          );
        });
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);

          switch (message.type) {
            case "realtime":
              // 구독한 TR 코드 중 하나인지 확인
              if (trCodesRef.current.includes(message.trId)) {
                const data = message.data;

                // 종목코드 검증 (모든 TR 응답에 MKSC_SHRN_ISCD 필드 존재)
                if (data.MKSC_SHRN_ISCD && data.MKSC_SHRN_ISCD !== stockCode) {
                  break; // 다른 종목 데이터면 무시
                }

                // TR 코드별로 데이터 저장
                setRealtimeData((prev) => ({
                  ...prev,
                  [message.trId]: data,
                }));

                // 콜백 실행
                onDataRef.current?.(message.trId, data);
              }
              break;

            case "subscribed":
              // console.log(`구독 완료: ${message.trId} - ${message.trKey}`);
              break;

            case "error":
              // console.error("WebSocket 에러:", message.message);
              setError("실시간 데이터 수신 중 오류가 발생했습니다.");
              break;

            case "welcome":
              // console.log("WebSocket 연결됨:", message.message);
              break;
          }
        } catch (e) {
          // console.error("메시지 파싱 에러:", e);
          setError("실시간 데이터 수신 중 오류가 발생했습니다.");
        }
      };

      ws.onerror = () => {
        // 현재 활성 연결이 아니면 무시
        if (wsRef.current !== ws) return;

        setError("실시간 데이터 수신 중 오류가 발생했습니다.");
        setIsConnected(false);
      };

      ws.onclose = () => {
        // 현재 활성 연결이 아니면 무시 (이전 연결의 onclose 이벤트)
        if (wsRef.current !== ws) return;

        setIsConnected(false);

        // 의도적 종료가 아닐 때만 자동 재연결 (최대 시도 횟수 제한)
        if (
          !intentionalCloseRef.current &&
          enabled &&
          reconnectAttemptsRef.current < maxReconnectAttempts
        ) {
          const delay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectAttemptsRef.current++;
            connect();
          }, delay);
        }
      };
    } catch (e) {
      setError("실시간 데이터 조회 연결 실패하였습니다.");
      setIsConnected(false);
    }
  }, [enabled, stockCode]);

  // 연결 및 정리
  useEffect(() => {
    connect();

    return () => {
      // 의도적 종료 표시 (자동 재연결 방지)
      intentionalCloseRef.current = true;

      // 재연결 타이머 정리
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // WebSocket 연결 종료
      if (wsRef.current) {
        const ws = wsRef.current;
        if (ws.readyState === WebSocket.OPEN) {
          // 모든 TR 코드 구독 해제
          trCodesRef.current.forEach((trId) => {
            ws.send(
              JSON.stringify({
                type: "unsubscribe",
                trId,
                trKey: stockCode,
              })
            );
          });
        }
        ws.close();
        wsRef.current = null;
      }
    };
  }, [connect, stockCode]);

  return { realtimeData, isConnected, error };
}
