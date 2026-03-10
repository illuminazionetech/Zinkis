from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        # Launch browser
        browser = p.chromium.launch(headless=True)

        # 1. Desktop Context
        desktop = browser.new_context(viewport={'width': 1280, 'height': 800})
        page = desktop.new_page()

        try:
            print("Capturing desktop views...")
            page.goto("http://localhost:5173", wait_until="networkidle")
            page.screenshot(path="v2_desktop_initial.png")

            # Open Settings
            settings_btn = page.get_by_role("button", name="Impostazioni")
            if settings_btn.is_visible():
                settings_btn.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="v2_settings_open.png")
                # Close specifically via the X in the modal
                page.locator("button:has(svg.lucide-x)").last.click()
                page.wait_for_timeout(500)

            # Use the handle to open analytics
            handle = page.locator("main > div:last-child > button")
            if handle.is_visible():
                handle.click()
                page.wait_for_timeout(1000)
                page.screenshot(path="v2_analytics_open_desktop.png")

            # 2. Mobile Context
            print("Capturing mobile views...")
            mobile = browser.new_context(viewport={'width': 390, 'height': 844}, is_mobile=True)
            m_page = mobile.new_page()
            m_page.goto("http://localhost:5173", wait_until="networkidle")
            m_page.screenshot(path="v2_mobile_initial.png")

            # Sidebar menu
            menu_btn = m_page.locator("button:has(svg.lucide-menu)")
            if menu_btn.is_visible():
                menu_btn.click()
                m_page.wait_for_timeout(1000)
                m_page.screenshot(path="v2_mobile_sidebar_open.png")

            print("Screenshots captured successfully.")

        except Exception as e:
            print(f"Error during verification: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    run()
