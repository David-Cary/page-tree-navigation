import {
  NamedPageRouteParser,
  KeyedURLValuesParser,
  ContentCrawler
} from "../src/index"

describe("PageRouteParser", () => {
  const parser = new NamedPageRouteParser(
    new KeyedURLValuesParser(
      {
        origin: 'http://my.site',
        path: [
          'view'
        ],
        hash: { key: 'pageId' },
        search: {
          pagePath: { key: 'pagePath' },
          contentPath: { key: 'contentPath' }
        }
      }
    )
  )
  parser.context = [
    {
      id: 'mainPage',
      content: '',
      children: [
        {
          localName: 'intro',
          content: '',
          children: [
            {
              localName: 'terms',
              content: '',
              children: [
                {
                  content: '',
                  children: [
                    {
                      content: '',
                      children: []
                    },
                    {
                      content: {
                        body: {
                          text: 'something'
                        }
                      },
                      children: []
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
  ]
  const crawler = new ContentCrawler()
  const textRoute = crawler.createRouteFrom(
    parser.context,
    [
      0,
      'children',
      0,
      'children',
      0,
      'children',
      0,
      'children',
      1,
      'content',
      'body',
      'text'
    ]
  )
  describe("parseRouteStrings", () => {
    test("should parse parameter strings", () => {
      const summary = parser.parseRouteStrings({
        pageId: 'mainPage',
        pagePath: 'intro.terms.0.1',
        contentPath: 'body.text'
      })
      expect(summary).toEqual({
        pageId: 'mainPage',
        pagePath: ['intro', 'terms', 0, 1],
        contentPath: ['body', 'text']
      })
    })
  })
  describe("getSearchPath", () => {
    test("should return search steps based on provided summary", () => {
      const path = parser.getSearchPath({
        pageId: 'mainPage',
        pagePath: ['intro', 'terms', 0, 1],
        contentPath: ['body', 'text']
      })
      expect(path).toEqual([
        { key: 'id', value: 'mainPage' },
        { key: 'localName', value: 'intro' },
        { key: 'localName', value: 'terms' },
        'children',
        0,
        'children',
        1,
        'content',
        'body',
        'text'
      ])
    })
  })
  describe("parse", () => {
    test("should unpack and apply the embedded search terms", () => {
      const url = 'http://my.site/view?pagePath=intro.terms.0.1&contentPath=body.text#mainPage'
      const route = parser.parse(url)
      expect(route.target).toEqual('something')
    })
  })
  describe("getRouteParameters", () => {
    test("should extract shortcut data from the route", () => {
      const summary = parser.getRouteParameters(textRoute)
      expect(summary).toEqual({
        pageId: 'mainPage',
        pagePath: ['intro', 'terms', 0, 1],
        contentPath: ['body', 'text']
      })
    })
  })
  describe("getRouteStrings", () => {
    test("should extract url parameters from the route", () => {
      const params = parser.getRouteStrings(textRoute)
      expect(params).toEqual({
        pageId: 'mainPage',
        pagePath: 'intro.terms.0.1',
        contentPath: 'body.text'
      })
    })
  })
  describe("stringify", () => {
    test("should convert the route to a url", () => {
      const url = parser.stringify(textRoute)
      expect(url).toEqual(
        'http://my.site/view?pagePath=intro.terms.0.1&contentPath=body.text#mainPage'
      )
    })
  })
})
