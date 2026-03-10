from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # Desktop
        desktop = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = desktop.new_page()
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.screenshot(path="v2_desktop.png")

        # Mobile
        mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
        m_page = mobile.new_page()
        m_page.goto("http://localhost:5173", wait_until="networkidle")

        # Sidebar is open by default. Take a screenshot.
        m_page.screenshot(path="v2_mobile_sidebar_open.png")

        # Close sidebar
        m_page.locator("button:has(svg.lucide-x)").first.click()
        m_page.wait_for_timeout(500)
        m_page.screenshot(path="v2_mobile_sidebar_closed.png")

        # Open it again
        m_page.locator("button:has(svg.lucide-menu)").click()
        m_page.wait_for_timeout(500)

        # Search for something
        m_page.get_by_placeholder("Inserisci un indirizzo...").fill("Roma")
        m_page.get_by_role("button", name="Cerca").click()

        # Wait for error or results
        m_page.wait_for_timeout(3000)
        m_page.screenshot(path="v2_mobile_after_search.png")

        browser.close()

if __name__ == "__main__":
    run()
