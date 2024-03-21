import {
  ValueVertexFactory
} from 'key-crawler'
import {
  SearchPathResolver,
  PropertySearchFactory,
  getValidIndexedNodeVertex,
  getValidContentNodeVertex
} from "../src/index"

describe("SearchPathResolver", () => {
  const samplePages = [
    {
      id: 'intro',
      content: ''
    },
    {
      id: 'main',
      content: '',
      children: [
        {
          id: 'p1',
          content: '',
          children: [
            {
              content: 'A'
            },
            {
              content: 'B'
            }
          ]
        },
        {
          id: 'p2',
          content: ''
        }
      ]
    },
    {
      id: 'closing',
      content: ''
    }
  ];
  describe("resolve", () => {
    const searchFactory = new PropertySearchFactory(
      new ValueVertexFactory([
        getValidIndexedNodeVertex
      ])
    )
    const resolver = new SearchPathResolver([
      searchFactory.getPropertySearch(),
      searchFactory.getKeyCallback()
    ])
    test("should return results based on the search term rules", () => {
      const response = resolver.resolve(
        samplePages,
        [
          {
            key: 'id',
            value: 'p1'
          },
          1
        ]
      )
      expect(response.results.length).toEqual(1)
      expect(response.results[0]?.path).toEqual([1, 0, 1])
    })
    test("Should return no matches for an invalid key", () => {
      const response = resolver.resolve([], [0])
      expect(response.results).toEqual([])
    })
  })
  describe("with property index support", () => {
    const searchFactory = new PropertySearchFactory(
      new ValueVertexFactory([
        getValidContentNodeVertex
      ])
    )
    const resolver = new SearchPathResolver([
      searchFactory.getPropertySearch(),
      searchFactory.getPropertyItemAtCallback(['children', 'content']),
      searchFactory.getKeyCallback()
    ])
    test("should be able to resolve index path", () => {
      const response = resolver.resolve(
        samplePages,
        [1, 0]
      )
      expect(response.results.length).toEqual(1)
      expect(response.results[0]?.path).toEqual([1, 'children', 0])
    })
  })
})
