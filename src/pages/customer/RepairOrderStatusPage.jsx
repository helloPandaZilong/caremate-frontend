import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router";
import { RefreshCw } from "lucide-react";
import { Button, Card, Input, SectionTitle } from "../../components/shared";
import { getOrderStatusHistories } from "../../api/monitoringApi";
import RepairStatusStepper, {
  OrderStatusHistoryList,
} from "../../components/monitoring/RepairStatusStepper";

export default function RepairOrderStatusPage() {
  const params = useParams();
  const [orderId, setOrderId] = useState(params.orderId || localStorage.getItem("caremate-current-order-id") || "101");
  const [queryOrderId, setQueryOrderId] = useState(orderId);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    if (!queryOrderId) return;
    setLoading(true);
    setError("");
    try {
      const response = await getOrderStatusHistories(queryOrderId);
      setData(response);
      localStorage.setItem("caremate-current-order-id", String(queryOrderId));
    } catch (e) {
      setError(e.message || "상태 이력을 불러오지 못했습니다.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [queryOrderId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setQueryOrderId(orderId);
  };

  return (
      <div className="max-w-5xl flex flex-col gap-6">
        <SectionTitle
            title="A/S 상태 타임라인"
            subtitle="주문별 상태 이력과 현재 진행 단계를 백엔드 API로 조회합니다."
            action={
              <Button variant="secondary" size="sm" onClick={load} disabled={loading}>
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                새로고침
              </Button>
            }
        />

        <Card className="p-5">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 sm:items-end">
            <Input
                label="조회할 orderId"
                value={orderId}
                onChange={setOrderId}
                placeholder="예: 101"
                className="sm:w-64"
            />
            <Button type="submit" variant="accent" disabled={loading}>상태 이력 조회</Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            백엔드 엔드포인트: GET /api/customer/repair-orders/{queryOrderId || ":orderId"}/status-histories
          </p>
        </Card>

        {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
        )}

        {data ? (
            <>
              <RepairStatusStepper milestones={data.milestones} currentStatus={data.currentStatus} />
              <OrderStatusHistoryList histories={data.histories} />
            </>
        ) : (
            !loading && (
                <Card className="p-8 text-center text-sm text-muted-foreground">
                  조회할 주문 ID를 입력하면 상태 타임라인이 표시됩니다.
                </Card>
            )
        )}
      </div>
  );
}
