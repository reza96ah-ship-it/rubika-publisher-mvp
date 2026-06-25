from __future__ import annotations

import base64
import os
import traceback
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as conditions
from selenium.webdriver.support.ui import WebDriverWait

SESSION_VALUE = os.environ["VISUAL_SESSION"]
BROWSER_BIN = os.environ["BROWSER_BIN"]
CHROMEDRIVER_BIN = os.environ["CHROMEDRIVER_BIN"]
OUTPUT = Path("visual-review")
OUTPUT.mkdir(parents=True, exist_ok=True)

CASES = (
    ("mobile-light", 390, 844, "light"),
    ("mobile-dark", 390, 844, "dark"),
    ("desktop-light", 1440, 900, "light"),
    ("desktop-dark", 1440, 900, "dark"),
)


def create_driver(width: int, height: int) -> webdriver.Chrome:
    options = Options()
    options.binary_location = BROWSER_BIN
    options.add_argument("--headless=new")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-gpu")
    options.add_argument(f"--window-size={width},{height}")
    options.set_capability("goog:loggingPrefs", {"browser": "ALL"})
    driver = webdriver.Chrome(service=Service(CHROMEDRIVER_BIN), options=options)
    driver.execute_cdp_cmd(
        "Emulation.setDeviceMetricsOverride",
        {
            "width": width,
            "height": height,
            "deviceScaleFactor": 1,
            "mobile": False,
        },
    )
    return driver


def full_page_png(driver: webdriver.Chrome) -> bytes:
    metrics = driver.execute_cdp_cmd("Page.getLayoutMetrics", {})
    content = metrics.get("cssContentSize") or metrics["contentSize"]
    screenshot = driver.execute_cdp_cmd(
        "Page.captureScreenshot",
        {
            "format": "png",
            "fromSurface": True,
            "captureBeyondViewport": True,
            "clip": {
                "x": 0,
                "y": 0,
                "width": content["width"],
                "height": content["height"],
                "scale": 1,
            },
        },
    )
    return base64.b64decode(screenshot["data"])


def capture(name: str, width: int, height: int, theme: str) -> None:
    driver = create_driver(width, height)
    try:
        driver.get("http://127.0.0.1:3100/login")
        driver.execute_script(
            "localStorage.setItem('rubika_publisher_access', arguments[0]);"
            "localStorage.setItem('theme', arguments[1]);"
            "document.documentElement.setAttribute('data-theme', arguments[1]);",
            SESSION_VALUE,
            theme,
        )
        driver.get("http://127.0.0.1:3100/")
        WebDriverWait(driver, 30).until(
            conditions.presence_of_element_located(
                (By.XPATH, "//h1[normalize-space()='داشبورد']")
            )
        )
        WebDriverWait(driver, 30).until(
            lambda current: current.execute_script(
                "return document.readyState === 'complete'"
            )
        )

        overflow = driver.execute_script(
            "return document.documentElement.scrollWidth > "
            "document.documentElement.clientWidth"
        )
        if overflow:
            raise RuntimeError(f"{name}: horizontal overflow detected")

        javascript_errors = [
            entry["message"]
            for entry in driver.get_log("browser")
            if entry.get("level") == "SEVERE"
            and "javascript" in entry.get("source", "").lower()
        ]
        if javascript_errors:
            raise RuntimeError(f"{name}: {' | '.join(javascript_errors)}")

        (OUTPUT / f"{name}.png").write_bytes(full_page_png(driver))
    except Exception:
        try:
            (OUTPUT / f"{name}-failure.png").write_bytes(full_page_png(driver))
        except Exception:
            pass
        (OUTPUT / f"{name}-error.txt").write_text(
            f"URL: {driver.current_url}\n\n{traceback.format_exc()}",
            encoding="utf-8",
        )
        raise
    finally:
        driver.quit()


failures: list[str] = []
for case in CASES:
    try:
        capture(*case)
    except Exception:
        failures.append(case[0])

if failures:
    (OUTPUT / "result.txt").write_text(
        f"Dashboard visual review failed for: {', '.join(failures)}\n",
        encoding="utf-8",
    )
    raise SystemExit(1)

(OUTPUT / "result.txt").write_text(
    "Dashboard visual review passed at 390x844 and 1440x900 in light and dark modes.\n",
    encoding="utf-8",
)
