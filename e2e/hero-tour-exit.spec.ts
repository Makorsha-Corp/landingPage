import { expect, test } from '@playwright/test'

test.describe('Hero tour exit', () => {
  test('scroll past hero shows story card and tears down hero glass layers', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto('/')

    const lightToggle = page.getByRole('button', { name: /switch to light mode/i })
    if (await lightToggle.isVisible()) {
      await lightToggle.click()
    }

    const scroller = page.locator('.homepage2-scroller')
    await expect(scroller).toBeVisible()
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

    await scroller.evaluate((el) => {
      el.scrollTo({ top: el.clientHeight * 0.72, behavior: 'instant' })
    })

    await page.waitForTimeout(600)

    const overviewHeading = page.getByRole('heading', {
      name: 'Your whole operation, one place.',
    })
    await expect(overviewHeading).toBeVisible({ timeout: 8000 })

    await expect(page.locator('.homepage-hero-overlay-layer.is-compositor-hidden')).toHaveCount(1)

    const visibleGlassShells = page.locator('.tour-glass-shell:not(.is-compositor-hidden)')
    await expect(visibleGlassShells).toHaveCount(1)
    await expect(visibleGlassShells).toContainText('Your whole operation, one place.')
  })
})
