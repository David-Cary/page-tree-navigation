import {
  KeyedPropertySearchParser,
  SearchPathParser,
  NamedPagePathParser,
  PageContentPathParser,
  NamedPageRouteParser,
  KeyedURLValuesParser,
  ContentCrawler,
  IndexedContentTreeCrawler
} from "../src/index"

describe("KeyedPropertySearchParser", () => {
  const parser =  new KeyedPropertySearchParser('id')
  describe("parse", () => {
    test("should convert to key value pair", () => {
      const result = parser.parse('me')
      expect(result).toEqual({
        key: 'id',
        value: 'me'
      })
    })
  })
  describe("stringify", () => {
    test("should extract the pair's value", () => {
      const result = parser.stringify({
        key: 'id',
        value: 'me'
      })
      expect(result).toEqual('me')
    })
  })
})

describe("SearchPathParser", () => {
  const parser = new SearchPathParser(
    [
      {
        prefix: '.~',
        check: (source) => typeof source === 'object' && source.key === 'localName',
        parser: new KeyedPropertySearchParser('localName')
      },
      {
        prefix: '/',
        decodedPrefix: 'children'
      },
      {
        prefix: '.'
      }
    ],
    new KeyedPropertySearchParser('id')
  );
  describe("parse", () => {
    test("should convert to search terms", () => {
      const result = parser.parse('main.~terms/0.text')
      expect(result).toEqual([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'text'
      ])
    })
  })
  describe("stringify", () => {
    test("should encode search terms", () => {
      const result = parser.stringify([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'text'
      ])
      expect(result).toEqual('main.~terms/0.text')
    })
  })
})

describe("NamedPagePathParser", () => {
  const parser = new NamedPagePathParser()
  const expandedParser = new NamedPagePathParser(true)
  describe("parse", () => {
    test("should convert to search terms", () => {
      const result = parser.parse('~main.~terms.0')
      expect(result).toEqual([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        0
      ])
    })
    test("should be able to handle single number string", () => {
      const result = parser.parse('0')
      expect(result).toEqual([0])
    })
    test("should inject separator for index sequence", () => {
      const result = parser.parse('0.0')
      expect(result).toEqual([0, 0])
    })
    test("expanded version should also handle index sequences", () => {
      const result = expandedParser.parse('0.0')
      expect(result).toEqual([0, 'children', 0])
    })
  })
  describe("stringify", () => {
    test("should encode search terms", () => {
      const result = parser.stringify([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        0
      ])
      expect(result).toEqual('~main.~terms.0')
    })
    test("index list should be delimited for expanded version", () => {
      const result = expandedParser.stringify([1,2])
      expect(result).toEqual('1.2')
    })
  })
})

describe("PageContentPathParser", () => {
  const parser = new PageContentPathParser()
  const splitParser = new PageContentPathParser(
    new KeyedURLValuesParser(
      {
        origin: 'http://my.site',
        path: [
          'view',
          { key: 'pagePath' }
        ],
        search: {
          contentPath: { key: 'contentPath' }
        }
      }
    )
  )
  describe("parse", () => {
    test("should convert to search terms", () => {
      const result = parser.parse('~main.~terms.0/body.text')
      expect(result).toEqual([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'content',
        'body',
        'text'
      ])
    })
    test("should unite split path terms", () => {
      const result = splitParser.parse('http://my.site/view/~main.~terms.0?contentPath=body.text')
      expect(result).toEqual([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'content',
        'body',
        'text'
      ])
    })
  })
  describe("stringify", () => {
    test("should encode search terms", () => {
      const result = parser.stringify([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'content',
        'body',
        'text'
      ])
      expect(result).toEqual('~main.~terms.0/body.text')
    })
    test("should combine subpaths", () => {
      const result = splitParser.stringify([
        {
          key: 'id',
          value: 'main'
        },
        {
          key: 'localName',
          value: 'terms'
        },
        'children',
        0,
        'content',
        'body',
        'text'
      ])
      expect(result).toEqual('http://my.site/view/~main.~terms.0?contentPath=body.text')
    })
  })
})

describe("NamedPageRouteParser", () => {
  const parser = new NamedPageRouteParser(
    new KeyedURLValuesParser(
      {
        origin: 'http://my.site',
        path: [
          'view',
          { key: 'pagePath' }
        ],
        search: {
          contentPath: { key: 'contentPath' }
        }
      }
    ),
    [
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
      },
      {
        content: 'unnamed page',
        children: [
          {
            content: 'subpage',
          }
        ]
      }
    ]
  )
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
  describe("parse", () => {
    test("should unpack and apply the embedded search terms", () => {
      const url = 'http://my.site/view/~mainPage.~intro.~terms.0.1?contentPath=body.text'
      const route = parser.parse(url)
      expect(route.target).toEqual('something')
    })
  })
  describe("stringify", () => {
    test("should convert the route to a url", () => {
      const url = parser.stringify(textRoute)
      expect(url).toEqual(
        'http://my.site/view/~mainPage.~intro.~terms.0.1?contentPath=body.text'
      )
    })
    test("should be able to handle page index route", () => {
      const indexedCrawler = new IndexedContentTreeCrawler()
      const route = indexedCrawler.createRouteFrom(
        parser.context,
        [1, 0]
      )
      const searchPath = parser.getSearch(route)
      expect(searchPath).toEqual([1, 0])
      const url = parser.pathParser.stringify(searchPath)
      //const url = parser.stringify(route)
      /*expect(url).toEqual(
        'http://my.site/view/1.0'
      )*/
    })
  })
})
