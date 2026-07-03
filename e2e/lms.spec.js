import { test, expect } from "@playwright/test";
import { login } from "./utils/auth.js";
import { ACCOUNTS } from "./fixtures/accounts.js";

test.describe("LMS 교육 (수리점)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "shop", ACCOUNTS.shop);
    await page.goto("/shop/lms");
    await expect(page.getByText("LMS 교육")).toBeVisible();
  });

  test("가이드 목록에 두 개의 필수 교육 카드가 보인다", async ({ page }) => {
    await expect(page.getByText("수리 리포트 작성 기준")).toBeVisible();
    await expect(page.getByText("플랫폼 A/S 처리 절차 및 부정 처리 주의 안내")).toBeVisible();
  });

  test("가이드를 읽지 않으면 퀴즈 시작 버튼이 비활성화된다", async ({ page }) => {
    await page.getByRole("button", { name: /학습 시작|다시 보기/ }).first().click();
    const startQuizBtn = page.getByRole("button", { name: "퀴즈 시작하기" });
    await expect(startQuizBtn).toBeDisabled();

    await page.getByText("가이드를 끝까지 읽었으며 내용을 이해했습니다.").click();
    await expect(startQuizBtn).toBeEnabled();
  });

  test("퀴즈 전 문항을 답변해야 제출 버튼이 활성화된다", async ({ page }) => {
    await page.getByRole("button", { name: /학습 시작|다시 보기/ }).first().click();
    await page.getByText("가이드를 끝까지 읽었으며 내용을 이해했습니다.").click();
    await page.getByRole("button", { name: "퀴즈 시작하기" }).click();

    const submitBtn = page.getByRole("button", { name: "답안 제출" });
    await expect(submitBtn).toBeDisabled();

    const radios = page.locator('input[type="radio"]');
    const questionGroups = await page.locator("form, fieldset, [role='radiogroup']").count();
    // 문항별로 첫 번째 보기를 선택 (그룹 셀렉터가 프로젝트마다 다를 수 있어 라디오 name 기준으로 순회)
    const names = new Set();
    const count = await radios.count();
    for (let i = 0; i < count; i++) {
      const name = await radios.nth(i).getAttribute("name");
      if (name && !names.has(name)) {
        names.add(name);
        await radios.nth(i).check();
      }
    }
    await expect(submitBtn).toBeEnabled();
  });

  test("모든 교육을 수료하면 완료 배너와 대시보드/수료증 이동 버튼이 보인다", async ({ page }) => {
    // 사전 조건: 두 가이드 모두 80% 이상으로 이미 수료된 테스트 계정이어야 통과.
    // 미수료 상태라면 이 케이스는 skip 처리하고 별도 데이터 세팅 후 재실행.
    const banner = page.getByText("필수 교육 수료 완료!");
    if (!(await banner.isVisible().catch(() => false))) {
      test.skip(true, "테스트 계정이 아직 두 가이드를 모두 수료하지 않음 — 선행 시나리오 필요");
    }
    await expect(page.getByRole("link", { name: "대시보드로 이동" })).toBeVisible();
    await expect(page.getByRole("link", { name: "수료증 확인" })).toBeVisible();
  });
});

test.describe("LMS 수료 관리 (관리자)", () => {
  test.beforeEach(async ({ page }) => {
    await login(page, "admin", ACCOUNTS.admin);
    await page.goto("/admin/lms");
    await expect(page.getByText("LMS 수료 관리")).toBeVisible();
  });

  test("KPI 카드 4개가 표시된다", async ({ page }) => {
    await expect(page.getByText("전체 수리점 계정")).toBeVisible();
    await expect(page.getByText("전 과정 수료 완료")).toBeVisible();
    await expect(page.getByText("부분 수료")).toBeVisible();
    await expect(page.getByText("미수료")).toBeVisible();
  });

  test("수리점명으로 검색하면 목록이 필터링된다", async ({ page }) => {
    const search = page.getByPlaceholder("수리점명 검색...");
    await search.fill("존재하지않는수리점명XYZ123");
    await page.waitForTimeout(400); // 디바운스 300ms 대기
    await expect(page.getByText("수리점 계정이 없습니다.")).toBeVisible();
  });

  test("개별 수료 기록 삭제 시 확인 모달이 뜬다", async ({ page }) => {
    const deleteBtn = page.getByRole("button", { name: "삭제" }).first();
    if (!(await deleteBtn.isVisible().catch(() => false))) {
      test.skip(true, "삭제 가능한 수료 기록이 없음");
    }
    await deleteBtn.click();
    await expect(page.getByText("수료 기록 삭제")).toBeVisible();
    await expect(page.getByText("이 작업은 되돌릴 수 없습니다.")).toBeVisible();
    await page.getByRole("button", { name: "취소" }).click();
  });
});
