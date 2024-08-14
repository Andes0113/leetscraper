from pathlib import Path

import scrapy
from playwright.async_api import Page
from scrapy_playwright.page import PageMethod


class NeetcodeSpider(scrapy.Spider):
    name = "neetcode"

    def start_requests(self):
        urls = [
            # "file:///Users/alex/projects/leetscraper/neetcode.html",
            "https://neetcode.io/practice",
        ]
        for url in urls:
            yield scrapy.Request(
                url=url,
                callback=self.parse,
                meta=dict(
                    playwright=True,
                    playwright_include_page=True,
                    playwright_page_methods=[
                        PageMethod("wait_for_selector", 'span:has-text("NeetCode 150")'),
                        PageMethod("click", 'span:has-text("NeetCode 150")'),
                        # PageMethod("wait_for_selector", 'a:has-text("Contains Duplicate")'),  # Update with actual target element selector

                    ],
                    arbitrary="arbitray"
                )
            )

    async def parse(self, response, **kwargs):
        page: Page = response.meta["playwright_page"]
        await page.locator("[data-tooltip='Show List View']").click()
        await page.get_by_text('Contains Duplicate').wait_for()

        content = await page.content()

        html = scrapy.Selector(text=content)

        for topic_element in html.css("app-root div div div app-table.ng-star-inserted"):
            topic = topic_element.css("div p.ng-star-inserted::text").get().strip()

            problems = topic_element.css("div table tbody tr")
            for problem in problems:
                name = problem.css("td a.table-text::text").get().strip()
                difficulty = problem.css("td div button b::text").get()
                link = problem.css("td a.table-text::attr(href)").get()
                print(link)
                yield {
                    "name": name,
                    "topic": topic,
                    "difficulty": difficulty,
                    "link": link,
                }
        