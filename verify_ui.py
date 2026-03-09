from playwright.sync_api import sync_playwright, expect

def verify_ui(page):
    # 1. Access the app
    page.goto("http://localhost:5173")
    page.wait_for_load_state("networkidle")

    # 2. Check for the Settings button and click it
    # The default language is Italian, so name is "Impostazioni"
    settings_btn = page.get_by_role("button", name="Impostazioni")
    settings_btn.click()

    # 3. Take a screenshot of the new Settings Panel
    page.screenshot(path="/home/jules/verification/settings_panel.png")

    # 4. Close settings - clicking the X icon (which is a button)
    # Using a selector that's more robust
    page.locator("button:has(svg.lucide-x)").click()

    # 5. Type an address and search
    address_input = page.get_by_placeholder("Inserisci un indirizzo...")
    address_input.fill("Piazza del Popolo, Roma")

    search_btn = page.get_by_role("button", name="Cerca")
    search_btn.click()

    # 6. Wait for the error message or settings to pop up
    page.wait_for_timeout(2000)
    page.screenshot(path="/home/jules/verification/error_state.png")

    # 7. Add a dummy key to bypass the error and see the tabs
    page.evaluate("localStorage.setItem('google_api_key', 'AIza_dummy_key')")
    page.reload()
    page.wait_for_load_state("networkidle")

    # Trigger search again
    page.get_by_placeholder("Inserisci un indirizzo...").fill("Piazza del Popolo, Roma")
    page.get_by_role("button", name="Cerca").click()

    # Wait for the UI to update
    page.wait_for_timeout(3000)
    page.screenshot(path="/home/jules/verification/main_dashboard_tabs.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_ui(page)
        finally:
            browser.close()
