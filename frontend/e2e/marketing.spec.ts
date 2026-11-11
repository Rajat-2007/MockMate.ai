import { expect, test } from "@playwright/test";

test.describe("marketing site", () => {
  test("homepage shows the hero, categories and pricing", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "Practice Smarter.",
    );
    await expect(
      page.getByRole("link", { name: "Start Free Interview" }).first(),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Interview categories" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Pricing" })).toBeVisible();
  });

  test("primary navigation reaches each public page", async ({ page }) => {
    await page.goto("/");

    for (const [label, url] of [
      ["Features", "/features"],
      ["How it works", "/how-it-works"],
      ["Pricing", "/pricing"],
      ["FAQ", "/faq"],
    ] as const) {
      await page.getByRole("link", { name: label, exact: true }).first().click();
      await expect(page).toHaveURL(new RegExp(`${url}$`));
      await page.goto("/");
    }
  });

  test("mobile menu opens and links to pricing", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByRole("button", { name: "Open menu" }).click();
    const mobileNav = page.getByRole("navigation", { name: "Mobile" });
    await expect(mobileNav).toBeVisible();

    await mobileNav.getByRole("link", { name: "Pricing" }).click();
    await expect(page).toHaveURL(/\/pricing$/);
  });

  test("unknown routes render the 404 page", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("That page is not here.")).toBeVisible();
  });
});
