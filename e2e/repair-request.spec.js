import { test, expect } from "@playwright/test";
import { login } from "./utils/auth.js";
import { ACCOUNTS } from "./fixtures/accounts.js";

async function goToRequestPage(page) {
  await page.goto("/customer/request");
  await expect(page.getByText("비대면 A/S 접수")).toBeVisible();
}

test.describe("비대면 A/S 접수 플로우", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "customer", ACCOUNTS.customer);
    await goToRequestPage(page);
  });

  test("Step0(사진 업로드)는 선택 사항이라 입력 없이 다음 단계로 이동 가능", async ({ page }) => {
    const nextBtn = page.getByRole("button", { name: "다음 단계" });
    await expect(nextBtn).toBeEnabled();
    await nextBtn.click();
    await expect(page.getByText("파손 상황 설명")).toBeVisible();
  });

  test("Step1(파손 설명) 미입력 시 다음 단계 버튼 비활성화", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    const nextBtn = page.getByRole("button", { name: "다음 단계" });
    await expect(nextBtn).toBeDisabled();

    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다.");
    await expect(nextBtn).toBeEnabled();
  });

  test("Step2(서비스센터·시간) 미선택 시 다음 단계 버튼 비활성화, 선택 후 활성화", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다.");
    await page.getByRole("button", { name: "다음 단계" }).click();
    await expect(page.locator("label").filter({ hasText: "서비스 센터 선택" })).toBeVisible();

    const nextBtn = page.getByRole("button", { name: "다음 단계" });
    await expect(nextBtn).toBeDisabled();

    const firstShop = page.locator(".cursor-pointer").filter({ hasText: /점|센터/ }).first();
    await firstShop.click();

    const enabledSlot = page.locator("button:not([disabled])", { hasText: /^\d{2}:\d{2}$/ }).first();
    if (!(await enabledSlot.isVisible().catch(() => false))) {
      test.skip(true, "선택 가능한 시간 슬롯이 없음 (휴무일이거나 전 슬롯 마감) — 날짜를 바꿔 재시도 필요");
    }
    await enabledSlot.click();
    await expect(nextBtn).toBeEnabled();
  });

  test("휴무일로 날짜를 바꾸면 시간 슬롯 대신 휴무 안내 문구가 보인다", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다.");
    await page.getByRole("button", { name: "다음 단계" }).click();

    const firstShop = page.locator(".cursor-pointer").filter({ hasText: /점|센터/ }).first();
    await firstShop.click();

    // 향후 14일 중 휴무일 안내 문구가 뜨는 날짜를 탐색
    const dateInput = page.locator('input[type="date"]');
    const base = new Date();
    let found = false;
    for (let i = 0; i < 14; i++) {
      const d = new Date(base.getTime() + i * 86400000).toISOString().slice(0, 10);
      await dateInput.fill(d);
      if (await page.getByText("휴무일입니다").isVisible().catch(() => false)) {
        found = true;
        break;
      }
    }
    test.skip(!found, "14일 이내 휴무일이 없는 서비스 센터 — 마스터 데이터에 휴무 요일 설정 필요");
    await expect(page.getByText("다른 날짜를 선택해주세요.")).toBeVisible();
  });

  test("Step3(보험 선택) 미선택 시 접수 제출 버튼 비활성화", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다.");
    await page.getByRole("button", { name: "다음 단계" }).click();

    const firstShop = page.locator(".cursor-pointer").filter({ hasText: /점|센터/ }).first();
    await firstShop.click();
    const enabledSlot = page.locator("button:not([disabled])", { hasText: /^\d{2}:\d{2}$/ }).first();
    test.skip(!(await enabledSlot.isVisible().catch(() => false)), "선택 가능한 시간 슬롯 없음");
    await enabledSlot.click();
    await page.getByRole("button", { name: "다음 단계" }).click();
    await expect(page.getByText("보험 정책 선택")).toBeVisible();

    const submitBtn = page.getByRole("button", { name: "접수 제출" });
    await expect(submitBtn).toBeDisabled();
  });

  test("잔여 청구 횟수가 소진된 보험은 선택할 수 없고 재등록 안내가 보인다", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다.");
    await page.getByRole("button", { name: "다음 단계" }).click();

    const firstShop = page.locator(".cursor-pointer").filter({ hasText: /점|센터/ }).first();
    await firstShop.click();
    const enabledSlot = page.locator("button:not([disabled])", { hasText: /^\d{2}:\d{2}$/ }).first();
    test.skip(!(await enabledSlot.isVisible().catch(() => false)), "선택 가능한 시간 슬롯 없음");
    await enabledSlot.click();
    await page.getByRole("button", { name: "다음 단계" }).click();

    const exhaustedNotice = page.getByText("잔여 횟수가 남아있다면 정상 접수할 수 있으니");
    if (!(await exhaustedNotice.isVisible().catch(() => false))) {
      test.skip(true, "테스트 계정에 청구 횟수 소진된 보험이 없음 — DB에 remainingClaimCount=0인 보험 시딩 필요");
    }
    await expect(exhaustedNotice).toBeVisible();
  });

  test("전체 플로우: 사진 없이 접수 완료까지 성공", async ({ page }) => {
    await page.getByRole("button", { name: "다음 단계" }).click();
    await page.locator("textarea").fill("액정이 파손되어 터치가 되지 않습니다. E2E 테스트 접수 건입니다.");
    await page.getByRole("button", { name: "다음 단계" }).click();

    const firstShop = page.locator(".cursor-pointer").filter({ hasText: /점|센터/ }).first();
    await firstShop.click();
    const enabledSlot = page.locator("button:not([disabled])", { hasText: /^\d{2}:\d{2}$/ }).first();
    test.skip(!(await enabledSlot.isVisible().catch(() => false)), "선택 가능한 시간 슬롯 없음");
    await enabledSlot.click();
    await page.getByRole("button", { name: "다음 단계" }).click();

    const selectablePolicy = page.locator(".cursor-pointer").filter({ hasText: "증권번호" }).first();
    test.skip(!(await selectablePolicy.isVisible().catch(() => false)), "선택 가능한(잔여 횟수 있는) 보험이 없음");
    await selectablePolicy.click();

    const submitBtn = page.getByRole("button", { name: "접수 제출" });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    await expect(page.getByText("접수가 완료되었습니다!")).toBeVisible({ timeout: 10000 });
    await page.getByRole("button", { name: "대시보드로 이동" }).click();
    await expect(page).toHaveURL(/\/customer\/dashboard/);
  });
});
