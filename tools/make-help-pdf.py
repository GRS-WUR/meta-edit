"""Regenerate public/meta-edit-help.pdf from public/help.html.

Run after editing the help page:
    pip install playwright && playwright install chromium
    python tools/make-help-pdf.py
"""
import pathlib
from playwright.sync_api import sync_playwright

root = pathlib.Path(__file__).resolve().parent.parent
src = (root / "public" / "help.html").as_uri()
out = root / "public" / "meta-edit-help.pdf"

footer = ('<div style="font-size:8px;width:100%;padding:0 14mm;color:#5b6573;'
          'display:flex;justify-content:space-between;font-family:sans-serif">'
          '<span>meta-edit help &middot; GRS, Wageningen University &amp; Research</span>'
          '<span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>')

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto(src)
    page.wait_for_load_state("networkidle")
    page.pdf(path=str(out), format="A4", print_background=True,
             prefer_css_page_size=True, display_header_footer=True,
             header_template="<span></span>", footer_template=footer)
    browser.close()
print("wrote", out)
