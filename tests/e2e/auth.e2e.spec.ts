import { test, expect } from '@playwright/test'

test.describe('Authentication and Navigation Routing', () => {
  const PROTECTED_ROUTES = [
    '/card-test',
    '/profile',
    '/wallet',
    '/gmail',
    '/statements',
    '/subscription'
  ]

  const PUBLIC_ROUTES = [
    '/',
    '/login',
    '/privacy-and-policy',
    '/terms-and-conditions'
  ]

  test.describe('Logged out', () => {
    test('public routes remain accessible', async ({ page }) => {
      for (const route of PUBLIC_ROUTES) {
        await page.goto(route)
        // Ensure no redirect to login if not already login
        if (route !== '/login') {
          expect(page.url()).not.toContain('/login')
        }
      }
    })

    test('protected routes redirect to login', async ({ page }) => {
      for (const route of PROTECTED_ROUTES) {
        await page.goto(route)
        expect(page.url()).toContain('/login')
        expect(page.url()).toContain(`redirect=${encodeURIComponent(route)}`)
      }
    })
  })

  test.describe('Logged in', () => {
    // This is pseudo-code for login since we don't have a real backend in E2E directly here,
    // but typically you would set the cookie to simulate logged in state.
    test.beforeEach(async ({ page, context }) => {
      await context.addCookies([
        {
          name: 'payload-token',
          value: 'fake-token',
          domain: 'localhost',
          path: '/',
        }
      ])
    })

    test('protected routes open normally', async ({ page }) => {
      // Setup network intercept to mock /api/users/me since we use a fake token
      await page.route('**/api/users/me', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 1, email: 'test@example.com', name: 'Test User' }
          })
        })
      })

      for (const route of PROTECTED_ROUTES) {
        await page.goto(route)
        // Should not redirect
        expect(page.url()).not.toContain('/login')
      }
    })

    test('browser refresh remains authenticated', async ({ page }) => {
      await page.route('**/api/users/me', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 1, email: 'test@example.com', name: 'Test User' }
          })
        })
      })

      await page.goto('/wallet')
      expect(page.url()).not.toContain('/login')

      await page.reload()
      expect(page.url()).not.toContain('/login')
    })

    test('logout redirects to login', async ({ page }) => {
      await page.route('**/api/users/me', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            user: { id: 1, email: 'test@example.com', name: 'Test User' }
          })
        })
      })
      await page.route('**/api/users/logout', route => {
        route.fulfill({ status: 200 })
      })

      await page.goto('/logout')
      // Assuming logout page renders and has a logout button
      const logoutBtn = page.locator('button.cm-logout-btn-submit')
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click()
      }
      // After logout, token is removed and it should redirect to home, 
      // but if we visit a protected route next, it should go to login
      await page.goto('/wallet')
      expect(page.url()).toContain('/login')
    })
  })

  test.describe('Redirect preservation', () => {
    test('login redirects back to original route', async ({ page }) => {
      await page.goto('/wallet')
      // Should redirect to /login?redirect=/wallet
      expect(page.url()).toContain('/login?redirect=%2Fwallet')

      // Mock login request
      await page.route('**/api/users/send-otp', route => route.fulfill({ status: 200, body: JSON.stringify({ channel: 'email' }) }))
      await page.route('**/api/users/verify-otp', route => route.fulfill({ status: 200, body: JSON.stringify({ profileComplete: true }) }))

      // Perform login steps
      await page.fill('input#identifier', 'test@example.com')
      await page.click('button[type="submit"]')
      
      // We expect the verify code input now
      await page.fill('input#code', '123456')
      await page.click('button[type="submit"]')

      // URL should now be /wallet after successful assign
      // Since it's a window.location.assign, playwright will wait for navigation
      await page.waitForURL('**/wallet*')
      expect(page.url()).toContain('/wallet')
    })
  })
})
