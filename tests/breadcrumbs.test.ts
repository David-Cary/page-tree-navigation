import {
  PhasedPathParser,
  DelimitedPathParser,
  ValidKeyParser,
  BreadcrumbFactory,
  PageLinkFactory,
  IndexedContentTreeCrawler
} from "../src/index"

describe("BreadcrumbFactory", () => {
  const parser = new PhasedPathParser(
      undefined,
      new DelimitedPathParser(),
      new ValidKeyParser()
  )
  const factory = new BreadcrumbFactory(
    new PageLinkFactory(
      (route) => parser.stringify(route.path),
      (index) => `Section ${index + 1}`
    )
  )
  describe("getRouteLink", () => {
    test("should populate link for each indexed item in route", () => {
      const crawler = new IndexedContentTreeCrawler()
      const route = crawler.createRouteFrom(
        [
          {
            title: 'Test Page',
            content: 'A',
            children: [
              {
                content: 'A1'
              }
            ]
          }
        ],
        [0, 0]
      )
      const links = factory.getRouteLinks(route)
      expect(links).toEqual([
        {
          text: 'Test Page',
          href: '0'
        },
        {
          text: 'Section 1',
          href: '0.0'
        }
      ])
    })
  })
})
