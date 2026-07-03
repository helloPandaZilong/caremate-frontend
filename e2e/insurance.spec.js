import { test, expect } from "@playwright/test";
import { login } from "./utils/auth.js";
import { ACCOUNTS } from "./fixtures/accounts.js";

test.describe("고객 보험 관리", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "customer", ACCOUNTS.customer);
    await page.goto("/customer/insurance");
    await expect(page.getByText("내 보험 관리")).toBeVisible();
  });

  test("보험 목록과 요약 통계(연동된 보험/활성화된 보험)가 표시된다", async ({ page }) => {
    await expect(page.getByText("연동된 보험", { exact: true })).toBeVisible();
    await expect(page.getByText("활성화된 보험", { exact: true })).toBeVisible();
  });

  test("보험 연동하기 → 필수값 미입력 시 등록되지 않는다", async ({ page }) => {
    await page.getByRole("button", { name: "보험 연동하기" }).click();
    const submitBtn = page.getByRole("button", { name: "등록하기" });
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();
    // 필수 필드(required)가 채워지지 않으면 폼이 제출되지 않고 모달이 유지된다
    await expect(page.getByRole("button", { name: "등록하기" })).toBeVisible();
  });

  test("보험 연동하기 → DB에 적재된 보험상품으로 신규 등록", async ({ page }) => {
    await page.getByRole("button", { name: "보험 연동하기" }).click();

    const productSelect = page.locator("select");
    await productSelect.waitFor({ state: "visible" });
    const optionCount = await productSelect.locator("option").count();
    test.skip(optionCount <= 1, "DB에 적재된 보험상품이 없음 — 마스터 데이터 확인 필요");
    await productSelect.selectOption({ index: 1 });

    const policyNumber = `E2E-${Date.now()}`;
    await page.locator('input[type="text"]').first().fill(policyNumber);

    const today = new Date().toISOString().slice(0, 10);
    const nextYear = new Date(Date.now() + 365 * 86400000).toISOString().slice(0, 10);
    const dateInputs = page.locator('input[type="date"]');
    await dateInputs.nth(0).fill(today);
    await dateInputs.nth(1).fill(nextYear);

    await page.getByRole("button", { name: "등록하기" }).click();

    const duplicateTypeError = page.getByText(/이미 ACTIVE 상태의 동일 유형 보험이 있습니다/);
    const registered = page.getByText(policyNumber);
    await expect(duplicateTypeError.or(registered)).toBeVisible({ timeout: 10000 });
    if (await duplicateTypeError.isVisible()) {
      test.skip(true, "테스트 계정이 이미 동일 유형(TELECOM 등) 보험을 보유 중 — 백엔드 정책상 중복 등록 불가");
      return;
    }
    await expect(registered).toBeVisible();
  });

  test("보험 카드 클릭 시 상세 모달에 청구 횟수/금액 사용량이 표시된다", async ({ page }) => {
    const firstCard = page.locator("text=증권번호:").first();
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip(true, "연동된 보험이 없어 상세 조회 불가");
    }
    await firstCard.click();
    await expect(page.getByText("청구 횟수")).toBeVisible();
    await expect(page.getByText("청구 금액")).toBeVisible();
    await expect(page.getByRole("button", { name: "연동 해제" })).toBeVisible();
  });

  test("연동 해제 시 목록에서 제거된다", async ({ page }) => {
    const firstCard = page.locator("text=증권번호:").first();
    if (!(await firstCard.isVisible().catch(() => false))) {
      test.skip(true, "연동 해제할 보험이 없음");
    }
    const policyText = await page.locator(".text-base.font-semibold").first().textContent();
    await firstCard.click();
    await page.getByRole("button", { name: "연동 해제" }).click();
    if (policyText) {
      await expect(page.getByText(policyText, { exact: true })).toHaveCount(0);
    }
  });
});
