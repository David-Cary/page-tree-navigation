import {
  PhasedPathParser,
  DelimitedPathParser,
  ValidKeyParser,
  TableOfContentsFactory,
  PageLinkFactory,
  PageTreeNode
} from "../src/index"

describe("TableOfContentsFactory", () => {
  const parser = new PhasedPathParser(
      undefined,
      new DelimitedPathParser(),
      new ValidKeyParser()
  )
  const factory = new TableOfContentsFactory(
    new PageLinkFactory(
      (route) => parser.stringify(route.path),
      (index) => `Section ${index + 1}`
    )
  )
  describe("mapContentNodes", () => {
    test("should populate link for each indexed item in route", () => {
      const pages: PageTreeNode[] = [
        {
          title: 'Test Page',
          content: 'A',
          children: [
            {
              content: 'A1'
            }
          ]
        }
      ]
      const nodes = factory.mapContentNodes(pages)
      expect(nodes).toEqual([
        {
          link: {
            text: 'Test Page',
            href: '0'
          },
          children: [
            {
              link: {
                text: 'Section 1',
                href: '0.0'
              },
              children: []
            }
          ]
        }
      ])
    })
  })
})
