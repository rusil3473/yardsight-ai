import asyncio
import os
import shutil
from playwright.async_api import async_playwright

async def record():
    video_dir = os.path.abspath("demo_video")
    if os.path.exists(video_dir):
        shutil.rmtree(video_dir, ignore_errors=True)
    os.makedirs(video_dir, exist_ok=True)

    print("Launching Chromium for comprehensive YardSight AI demo recording...")
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            record_video_dir=video_dir,
            record_video_size={"width": 1280, "height": 720},
            viewport={"width": 1280, "height": 720}
        )
        page = await context.new_page()

        try:
            print("1. Opening YardSight app at http://localhost:5173/...")
            await page.goto("http://localhost:5173/", wait_until="networkidle", timeout=15000)
            await page.wait_for_timeout(1500)

            # Check if auth portal is present
            sign_in_btn = await page.query_selector("button:has-text('Sign In'), button[type='submit']")
            if sign_in_btn:
                print("Signing in as Facility Administrator...")
                await sign_in_btn.click()
                await page.wait_for_timeout(2500)

            # Helper to click tabs safely
            async def click_tab(text_pattern):
                print(f"Navigating to tab: {text_pattern}")
                btn = await page.query_selector(f"aside button:has-text('{text_pattern}')")
                if btn:
                    await btn.click(force=True)
                    await page.wait_for_timeout(2000)
                    return True
                return False

            # --- TAB 1: Logistics Command (Home) ---
            print("SHOWCASING: Tab 1 - Logistics Command (Home Dashboard)")
            await click_tab("Logistics Command")
            await page.wait_for_timeout(2500)
            await page.mouse.wheel(0, 350)
            await page.wait_for_timeout(1800)
            await page.mouse.wheel(0, -350)
            await page.wait_for_timeout(1200)

            # --- TAB 2: Live CCTV Matrix ---
            print("SHOWCASING: Tab 2 - Live CCTV Matrix (Multi-RTSP & Ring Feeds)")
            await click_tab("Live CCTV Matrix")
            await page.wait_for_timeout(4000)
            # Hover over a camera card to show interaction
            camera_card = await page.query_selector(".grid > div")
            if camera_card:
                await camera_card.hover()
                await page.wait_for_timeout(1500)

            # --- TAB 3: OpenCV 4.10 ANPR ---
            print("SHOWCASING: Tab 3 - OpenCV 4.10 Perspective Homography ANPR")
            await click_tab("OpenCV 4.10 ANPR")
            await page.wait_for_timeout(3000)
            unwarp_btn = await page.query_selector("button:has-text('Unwarp'), button:has-text('Scan'), button:has-text('Simulate'), button:has-text('Process')")
            if unwarp_btn:
                await unwarp_btn.click(force=True)
                await page.wait_for_timeout(2500)
            await page.mouse.wheel(0, 250)
            await page.wait_for_timeout(1500)
            await page.mouse.wheel(0, -250)

            # --- TAB 4: Nimbus AI Hub (Alexa+ MCP Agent) ---
            print("SHOWCASING: Tab 4 - Nimbus AI Hub & Alexa+ MCP Agent")
            await click_tab("Nimbus AI Hub")
            await page.wait_for_timeout(3000)
            chat_input = await page.query_selector("input[placeholder*='Ask'], textarea[placeholder*='Ask'], input[type='text']")
            if chat_input:
                await chat_input.fill("Alexa, inspect Loading Bay 3 for chemical hazards and check Schneider manifest.")
                await page.wait_for_timeout(1000)
                await page.keyboard.press("Enter")
                await page.wait_for_timeout(3500)

            # --- TAB 5: Nebius VLM Agent ---
            print("SHOWCASING: Tab 5 - Nebius VLM Spatial Reasoning Agent")
            await click_tab("Nebius VLM Agent")
            await page.wait_for_timeout(3500)

            # --- TAB 6: Concrete Specular Leaks ---
            print("SHOWCASING: Tab 6 - Concrete Specular Hydrocarbon Leak Detector")
            await click_tab("Concrete Specular Leaks")
            await page.wait_for_timeout(3000)
            slider = await page.query_selector("input[type='range']")
            if slider:
                await slider.fill("0.85")
                await page.wait_for_timeout(1500)
            actuator_btn = await page.query_selector("button:has-text('Boom'), button:has-text('Pump'), button:has-text('Deploy'), button:has-text('Actuator')")
            if actuator_btn:
                await actuator_btn.click(force=True)
                await page.wait_for_timeout(2000)
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(800)

            # --- TAB 7: FactoryOS & Energy ---
            print("SHOWCASING: Tab 7 - FactoryOS & Energy Analytics")
            await click_tab("FactoryOS & Energy")
            await page.wait_for_timeout(3000)

            # --- TAB 8: Fleet & Dock Dwell ---
            print("SHOWCASING: Tab 8 - Fleet & Dock Dwell SLAs")
            await click_tab("Fleet & Dock Dwell")
            await page.wait_for_timeout(3000)

            # --- TAB 9: E-Way Bills & eBOL ---
            print("SHOWCASING: Tab 9 - E-Way Bills & US eBOL Compliance")
            await click_tab("E-Way Bills & eBOL")
            await page.wait_for_timeout(3000)

            # --- TAB 10: Scale & Governance ---
            print("SHOWCASING: Tab 10 - Scale & Governance")
            await click_tab("Scale & Governance")
            await page.wait_for_timeout(2500)

            # --- Top Bar Action: Audit Report Modal ---
            print("SHOWCASING: Audit Certification Report Modal")
            audit_btn = await page.query_selector("button:has-text('Audit'), button:has-text('Report'), button:has-text('Certificate')")
            if audit_btn:
                await audit_btn.click(force=True)
                await page.wait_for_timeout(2500)
                await page.keyboard.press("Escape")
                await page.wait_for_timeout(1000)

            # Final Outro: Back to Logistics Command
            print("Returning to Logistics Command for outro...")
            await click_tab("Logistics Command")
            await page.wait_for_timeout(2500)

        except Exception as e:
            print(f"Notice during walkthrough: {e}")
        finally:
            print("Finalizing video recording...")
            await context.close()
            await browser.close()

    files = [f for f in os.listdir(video_dir) if f.endswith(('.webm', '.mp4'))]
    if files:
        target = os.path.join(video_dir, "yardsight_demo_walkthrough.webm")
        src = os.path.join(video_dir, files[0])
        if os.path.exists(target) and target != src:
            os.remove(target)
        if target != src:
            os.rename(src, target)
        
        desktop_target = r"c:\Users\Rusil\Desktop\yardsight_demo_walkthrough.webm"
        shutil.copyfile(target, desktop_target)
        size_mb = os.path.getsize(target) / (1024 * 1024)
        print(f"SUCCESS: Comprehensive demo video recorded!")
        print(f"Saved to: {desktop_target} ({size_mb:.2f} MB)")
    else:
        print("No video file generated.")

if __name__ == "__main__":
    asyncio.run(record())
