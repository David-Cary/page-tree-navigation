import {
  DelimitedPathParser,
  DelimiterEncodedPathParser,
  EnclosedTextParser,
  NumericTextParser,
  PhasedPathParser,
  KeyedSegmentsParser,
  KeyedURLValuesParser
} from "../src/index"

describe("DelimitedPathParser", () => {
  const parser = new DelimitedPathParser()
  describe("parse", () => {
    test("should split by delimiter", () => {
      const path = parser.parse("0.1")
      expect(path).toEqual(['0', '1'])
    })
  })
  describe("stringify", () => {
    test("should join using delimiter", () => {
      const text = parser.stringify(['0', '1'])
      expect(text).toEqual("0.1")
    })
  })
})

describe("DelimiterEncodedPathParser", () => {
  const parser = new DelimiterEncodedPathParser({
    'children': '/',
    'content': '.'
  })
  describe("parse", () => {
    test("should split using delimiter map", () => {
      const path = parser.parse("0/1.0")
      expect(path).toEqual(['0', 'children', '1', 'content', '0'])
    })
  })
  describe("stringify", () => {
    test("should join using delimiter map", () => {
      const text = parser.stringify(['0', 'children', '1', 'content', '0'])
      expect(text).toEqual("0/1.0")
    })
  })
})

describe("EnclosedTextParser", () => {
  const parser = new EnclosedTextParser('page/', '&u=me')
  describe("parse", () => {
    test("should extract nested text", () => {
      const path = parser.parse("page/intro&u=me")
      expect(path).toEqual('intro')
    })
  })
  describe("stringify", () => {
    test("should wrap target text", () => {
      const text = parser.stringify('intro')
      expect(text).toEqual("page/intro&u=me")
    })
  })
})

describe("NumericTextParser", () => {
  const parser = new NumericTextParser()
  describe("parse", () => {
    test("should try to convert a string to a number", () => {
      const path = parser.parse("1")
      expect(path).toEqual(1)
    })
    test("shouldn't convert if the result would be not a number", () => {
      const path = parser.parse("a")
      expect(path).toEqual("a")
    })
  })
  describe("stringify", () => {
    test("should wrap the value in a string if it isn't one already", () => {
      const text = parser.stringify(1)
      expect(text).toEqual("1")
    })
  })
})

describe("PhasedPathParser", () => {
  const parser = new PhasedPathParser(
    new EnclosedTextParser('page/', '&u=me'),
    new DelimitedPathParser('/'),
    new NumericTextParser()
  )
  describe("parse", () => {
    test("should extract encoded path", () => {
      const path = parser.parse("page/intro/1&u=me")
      expect(path).toEqual(['intro', 1])
    })
  })
  describe("stringify", () => {
    test("should encode target path", () => {
      const text = parser.stringify(['intro', 1])
      expect(text).toEqual("page/intro/1&u=me")
    })
  })
})

describe("KeyedSegmentsParser", () => {
  const parser = new KeyedSegmentsParser(['main', 'sub'])
  describe("parse", () => {
    test("should extract encoded path", () => {
      const results = parser.parse("room.bin")
      expect(results).toEqual({
        main: 'room',
        sub: 'bin'
      })
    })
    test("should handle partial paths", () => {
      const results = parser.parse("room")
      expect(results).toEqual({
        main: 'room'
      })
    })
  })
  describe("stringify", () => {
    test("should encode target values", () => {
      const text = parser.stringify({
        main: 'room',
        sub: 'bin'
      })
      expect(text).toEqual("room.bin")
    })
    test("should handle missing tail", () => {
      const text = parser.stringify({
        main: 'room'
      })
      expect(text).toEqual("room.")
    })
    test("should handle missing head", () => {
      const text = parser.stringify({
        sub: 'bin'
      })
      expect(text).toEqual(".bin")
    })
  })
})

describe("KeyedURLValuesParser", () => {
  const parser = new KeyedURLValuesParser(
    {
      origin: 'https://my.site',
      path: [
        'view',
        {
          key: 'page',
          placeholder: '_unknown_'
        }
      ],
      hash: { key: 'elementId' },
      search: {
        user: { key: 'userId'},
        fs: 'true'
      }
    }
  )
  describe("parse", () => {
    test("should extract url values", () => {
      const values = parser.parse("https://my.site/view/p1?user=me&fs=true#item")
      expect(values).toEqual({
        page: 'p1',
        userId: 'me',
        elementId: 'item'
      })
    })
    test("should skip any path steps with the placeholder value", () => {
      const values = parser.parse("https://my.site/view/_unknown_?user=me&fs=true")
      expect(values).toEqual({
        userId: 'me'
      })
    })
  })
  describe("stringify", () => {
    test("should build url using the provided values", () => {
      const text = parser.stringify({
        page: 'p1',
        userId: 'me',
        elementId: 'item'
      })
      expect(text).toEqual("https://my.site/view/p1?user=me&fs=true#item")
    })
    test("should use the placeholder for missing path steps", () => {
      const text = parser.stringify({
        userId: 'me'
      })
      expect(text).toEqual("https://my.site/view/_unknown_?user=me&fs=true")
    })
  })
})
