from pathlib import Path

import scrapy
from playwright.async_api import Page
from scrapy_playwright.page import PageMethod

import json

import subprocess

def get_clipboard():
    p = subprocess.Popen(['pbpaste'], stdout=subprocess.PIPE)
    retcode = p.wait()
    data = p.stdout.read()
    return data

class SolutionSpider(scrapy.Spider):
    name = "solutions"

    def start_requests(self):
        f = open('questions.json')
        problems = json.load(f)

        for problem in problems:
            url = 'https://neetcode.io/' + problem['link']

            yield scrapy.Request(
                url=url,
                callback=self.parse,
                meta=dict(
                    playwright=True,
                    playwright_include_page=True,
                    playwright_page_methods=[
                    ],
                    arbitrary="arbitray"
                )
            )
            break

    async def parse(self, response, **kwargs):
        page: Page = response.meta["playwright_page"]

        async with page.expect_response("*/getProblemMetadataFunction") as response_info:
            print(response_info)

        await page.locator("span.tab-header").filter(has_text="solution").click()


        code_response = await response_info.value
        print("CODE RESPONSE:")     
        print(code_response)

        content = await page.content()
        html = scrapy.Selector(text=content)

        # await page.locator("app-code").hover()

        # code_copy_btn = page.locator("app-code div div.code-toolbar div.toolbar div button")
        # print("BUTTON")
        # print(await code_copy_btn.count())
        
        # await code_copy_btn.click()
        # await page.get_by_text('Copied!').wait_for()

        # code = html.xpath('//app-code').get()
        # print(code)
