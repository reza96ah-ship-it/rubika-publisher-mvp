from __future__ import annotations

import base64
import json
import os
import traceback
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
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
    options.set_capability(
        "goog:loggingPrefs",
        {"browser": "ALL", "performance": "ALL"},
    )
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


def install_bootstrap(driver: webdriver.Chrome, theme: str) -> None:
    source = f"""
      localStorage.setItem('rubika_publisher_access', {json.dumps(SESSION_VALUE)});
      localStorage.setItem('theme', {json.dumps(theme)});
      if (document.documentElement) {{
        document.documentElement.setAttribute('data-theme', {json.dumps(theme)});
      }}
      window.__dashboardReviewFetches = [];
      const originalFetch = window.fetch.bind(window);
      window.fetch = async (...args) => {{
        const rawUrl = args[0] instanceof Request ? args[0].url : String(args[0]);
        try {{
          const response = await originalFetch(...args);
          window.__dashboardReviewFetches.push({{ url: rawUrl, status: response.status }});
          return response;
        }} catch (error) {{
          window.__dashboardReviewFetches.push({{
            url: rawUrl,
            error: error instanceof Error ? error.message : String(error)
          }});
          throw error;
        }}
      }};
    """
    driver.execute_cdp_cmd(
        "Page.addScriptToEvaluateOnNewDocument",
        {"source": source},
    )


def collect_diagnostics(driver: webdriver.Chrome) -> dict[str, object]:
    try:
        browser_logs = driver.get_log("browser")
    except Exception as error:
        browser_logs = [{"error": str(error)}]

    try:
        performance_logs = driver.get_log("performance")
    except Exception as error:
        performance_logs = [{"error": str(error)}]

    network_events: list[dict[str, object]] = []
    for entry in performance_logs:
        message = entry.get("message")
        if not isinstance(message, str):
            continue
        try:
            payload = json.loads(message).get("message", {})
        except json.JSONDecodeError:
            continue
        method = payload.get("method")
        params = payload.get("params", {})
        if method == "Network.responseReceived":
            response = params.get("response", {})
            url = response.get("url", "")
            if "127.0.0.1:8000" in url or "localhost:8000" in url:
                network_events.append(
                    {
                        "kind": "response",
                        "url": url,
                        "status": response.get("status"),
                    }
                )
        elif method == "Network.loadingFailed":
            network_events.append(
                {
                    "kind": "failed",
                    "error": params.get("errorText"),
                    "canceled": params.get("canceled"),
                }
            )

    try:
        page_state = driver.execute_script(
            """
            return {
              readyState: document.readyState,
              tokenPresent: Boolean(localStorage.getItem('rubika_publisher_access')),
              tokenLength: (localStorage.getItem('rubika_publisher_access') || '').length,
              theme: localStorage.getItem('theme'),
              bodyText: document.body ? document.body.innerText.slice(0, 4000) : '',
              fetches: window.__dashboardReviewFetches || []
            };
            """
        )
    except Exception as error:
        page_state = {"error": str(error)}

    return {
        "url": driver.current_url,
        "title": driver.title,
        "page": page_state,
        "browserLogs": browser_logs,
        "networkEvents": network_events,
    }


def dashboard_ready(driver: webdriver.Chrome) -> bool:
    return bool(
        driver.find_elements(By.XPATH, "//h1[normalize-space()='داشبورد']")
    )


def capture(name: str, width: int, height: int, theme: str) -> None:
    driver = create_driver(width, height)
    try:
        install_bootstrap(driver, theme)
        driver.get("http://127.0.0.1:3100/")
        WebDriverWait(driver, 30).until(dashboard_ready)

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
        try:
            (OUTPUT / f"{name}-page.html").write_text(
                driver.page_source,
                encoding="utf-8",
            )
        except Exception:
            pass
        diagnostics = collect_diagnostics(driver)
        (OUTPUT / f"{name}-error.txt").write_text(
            f"{traceback.format_exc()}\n\n"
            f"Diagnostics:\n{json.dumps(diagnostics, ensure_ascii=False, indent=2)}\n",
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
