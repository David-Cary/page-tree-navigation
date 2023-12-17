import {
  AnyObject,
  UntypedObject,
  ArrayVertex,
  ObjectVertex,
  DefinedObjectVertex,
  ValueVertexFactory,
  SearchOrder,
  DepthFirstSearch,
  BreadthFirstSearch,
  KeyCrawler,
  ValueLookupVertex,
  MapVertex,
  DOMNodeVertex,
  TraversalState,
  ValidKey,
  resolvePropertyLookup
} from "../src/index"
import { JSDOM } from 'jsdom'

describe("ArrayVertex", () => {
  test("should allow iteration over source array's keys", () => {
    const source = ['a', 'b']
    const keys: number[] = []
    const values: unknown[] = []
    const vertex = new ArrayVertex<string>(source)
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual([0, 1])
    expect(values).toEqual(['a', 'b'])
  })
})

describe("ObjectVertex", () => {
  test("should allow iteration over source object's keys", () => {
    const source = { x: 1, y: 2}
    const keys: unknown[] = []
    const values: unknown[] = []
    const vertex = new ObjectVertex(source)
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual(['x', 'y'])
    expect(values).toEqual([1, 2])
  })
})

describe("DefinedObjectVertex", () => {
  test("should only iterate over the target set of keys", () => {
    const source = { value: 0, child: { value: 1 } }
    const keys: unknown[] = []
    const values: unknown[] = []
    const vertex = new DefinedObjectVertex(source, ['child'])
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual(['child'])
    expect(values).toEqual([{ value: 1 }])
  })
})

const treeReader = new ValueVertexFactory([
  (value: UntypedObject) => {
    if ('children' in value) {
      return new DefinedObjectVertex(value, ['children'])
    }
  }
])

describe("ValueVertexFactory", () => {
  test("should produce an array vertex if given an array", () => {
    const vertex = treeReader.createVertex([])
    expect(vertex).toBeInstanceOf(ArrayVertex)
  })
  test("should produce an object vertex if given an object", () => {
    const vertex = treeReader.createVertex({})
    expect(vertex).toBeInstanceOf(ObjectVertex)
  })
  test("should follow the provided rules for speciality vertices", () => {
    const vertex = treeReader.createVertex({ children: [] })
    expect(vertex).toBeInstanceOf(DefinedObjectVertex)
  })
})

const testTree = {
  value: 'root',
  children: [
    {
      value: 'a',
      children: [
        {
          value: 'a1'
        },
        {
          value: 'a2'
        }
      ]
    },
    {
      value: 'b'
    },
    {
      value: 'c',
      children: [
        {
          value: 'c1'
        },
        {
          value: 'c2'
        },
        {
          value: 'c3'
        }
      ]
    }
  ]
}

function getNodeValue(source: unknown) {
  if (typeof source === 'object' && source != null) {
    const sourceObject = source as UntypedObject
    return sourceObject.value
  }
}

function stashValue(source: unknown, destination: unknown[]) {
  const value = getNodeValue(source)
  if(value !== undefined) {
    destination.push(value)
  }
}

describe("DepthFirstSearch", () => {
  test("should perform preorder traversal by default", () => {
    const search = new DepthFirstSearch()
    const values: unknown[] = []
    search.traverse(
      testTree,
      (state) => {
        if (typeof state.route.target !== 'object') {
          values.push(state.route.target)
        }
      }
    )
    expect(values).toEqual([
      'root',
      'a',
      'a1',
      'a2',
      'b',
      'c',
      'c1',
      'c2',
      'c3'
    ])
  })
  test("should perform postorder traversal when the parameter is passed in", () => {
    const search = new DepthFirstSearch(SearchOrder.POSTORDER)
    const values: unknown[] = []
    search.traverse(
      testTree,
      (state) => stashValue(state.route.target, values)
    )
    expect(values).toEqual([
      'a1',
      'a2',
      'a',
      'b',
      'c1',
      'c2',
      'c3',
      'c',
      'root'
    ])
  })
  test("should respect the skipIteration signal", () => {
    const search = new DepthFirstSearch()
    const values: unknown[] = []
    search.traverse(
      testTree,
      (state) => {
        if (typeof state.route.target === 'object') {
          const targetObject = state.route.target as UntypedObject
          values.push(targetObject.value)
          state.skipIteration = true
        }
      }
    )
    expect(values).toEqual(['root'])
  })
})

describe("BreadthFirstSearch", () => {
  test("should traverse node in expected order", () => {
    const search = new BreadthFirstSearch()
    const values: unknown[] = []
    search.traverse(
      testTree,
      (state) => stashValue(state.route.target, values)
    )
    expect(values).toEqual([
      'root',
      'a',
      'b',
      'c',
      'a1',
      'a2',
      'c1',
      'c2',
      'c3'
    ])
  })
  test("should respect the skipIteration signal", () => {
    const search = new BreadthFirstSearch()
    const values: unknown[] = []
    search.traverse(
      testTree,
      (state) => {
        if (typeof state.route.target === 'object') {
          const targetObject = state.route.target as UntypedObject
          values.push(targetObject.value)
          state.skipIteration = true
        }
      }
    )
    expect(values).toEqual(['root'])
  })
})

const treeCrawler = new KeyCrawler(undefined, treeReader)

describe("KeyCrawler", () => {
  describe("search", () => {
    test("should find matching values", () => {
      const response = treeCrawler.search(
        testTree,
        (state) => getNodeValue(state.route.target) === 'c2'
      )
      expect(response.results.length).toEqual(1)
      const firstResult = response.results[0]
      expect(firstResult.target).toEqual({ value: 'c2' })
      expect(firstResult.path).toEqual(['children', 2, 'children', 1])
    })
    test("should respect search results cap", () => {
      const response = treeCrawler.search(
        [
          [0, 1],
          [0, 1, 1]
        ],
        (state) => state.route.target === 1,
        1
      )
      expect(response.results.length).toEqual(1)
      expect(response.state.visited.length).toEqual(2)
    })
  })
  describe("mapValue", () => {
    test("should apply conversion function", () => {
      const crawler = new KeyCrawler()
      const result = crawler.mapValue(
        [
          { x: 0.1, y: 2.3 },
          3.14
        ],
        (state: TraversalState) => {
          const target = state.route.target
          switch (typeof target) {
            case 'object': {
              if (target == null) return target
              return Array.isArray(target) ? [] : {}
            }
            case 'number': {
              return Math.floor(target)
            }
            default: {
              return target
            }
          }
        }
      )
      expect(result).toEqual([
        { x: 0, y: 2 },
        3
      ])
    })
    test("should use the provided child setter", () => {
      const crawler = new KeyCrawler(
        undefined,
        new ValueVertexFactory([
          (value: UntypedObject) => {
            if (!Array.isArray(value)) {
              return new ValueLookupVertex(value, ['children', '$key'])
            }
          }
        ])
      )
      const result = crawler.mapValue(
        {
          value: 'a',
          children: [
            { value: 'a1' },
            { value: 'a2' }
          ]
        },
        (state: TraversalState) => {
          const target = state.route.target
          if (typeof target === 'object' && target != null) {
            return Array.isArray(target)
              ? []
              : {
                value: (target as UntypedObject).value,
                depth: state.route.path.length
              }
          }
          return target
        },
        (
          target: AnyObject,
          key: ValidKey,
          value: any
        ) => {
          const index = Number(key)
          if (Array.isArray(target)) {
            if (isNaN(index)) return
            target[index] = value
          } else {
            const targetObject = target as UntypedObject
            let children: any[]
            if (Array.isArray(targetObject.children)) {
              children = targetObject.children
            } else {
              children = []
              targetObject.children = children
            }
            children[index] = value
          }
        }
      )
      expect(result).toEqual({
        value: 'a',
        depth: 0,
        children: [
          { value: 'a1', depth: 1 },
          { value: 'a2', depth: 1}
        ]
      })
    })
  })
  describe("createRouteFrom", () => {
    test("should include target value", () => {
      const route = treeCrawler.createRouteFrom(
        testTree,
        ['children', 0, 'children', 1, 'value']
      )
      expect(route.target).toEqual('a2')
    })
  })
  describe("extendRoute", () => {
    test("should include target value relative to previous target", () => {
      const route = treeCrawler.createRouteFrom(
        testTree,
        ['children', 0]
      )
      treeCrawler.extendRoute(route, ['children', 1, 'value'])
      expect(route.target).toEqual('a2')
    })
  })
  describe("goToIndexedBranch", () => {
    test("should include target value relative to previous target", () => {
      const route = treeCrawler.createRouteFrom(
        { x: 10, y: 20},
        []
      )
      treeCrawler.extendRouteByIndices(route, [0])
      expect(route.target).toEqual(10)
    })
    test("should start from end if given a negative index", () => {
      const route = treeCrawler.createRouteFrom(
        { x: 10, y: 20},
        []
      )
      treeCrawler.extendRouteByIndices(route, [-1])
      expect(route.target).toEqual(20)
    })
  })
  describe("revertRoute", () => {
    test("should target parent object", () => {
      const route = treeCrawler.createRouteFrom(
        testTree,
        ['children', 0, 'children', 1, 'value']
      )
      treeCrawler.revertRoute(route)
      expect(route.target).toEqual({ value: 'a2' })
    })
  })
})

describe("ValueLookupVertex", () => {
  const source = { value: 0, children: ['a', 'b'] }
  const vertex = new ValueLookupVertex(source, ['children', '$key'])
  test("should iterate over nested contents", () => {
    const keys: unknown[] = []
    const values: unknown[] = []
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual([0, 1])
    expect(values).toEqual(['a', 'b'])
  })
  test("should be able to get the direct path given a key", () => {
    const pathing = vertex.getValuePath(0)
    expect(pathing).toEqual(['children', 0])
  })
  test("should be able to extract a matching subpath", () => {
    const pathing = vertex.validateValuePath(['root', 'children', 1], 1)
    expect(pathing).toEqual({
      key: 1,
      path: ['children', 1]
    })
  })
})

describe("MapVertex", () => {
  const source = new Map<string, number>()
  source.set('a', 1)
  source.set('b', 2)
  const vertex = new MapVertex(source)
  test("should iterate over nested contents", () => {
    const keys: unknown[] = []
    const values: unknown[] = []
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual(['a', 'b'])
    expect(values).toEqual([1, 2])
  })
  test("should be able to get the direct path given a key", () => {
    const pathing = vertex.getValuePath('a')
    expect(pathing).toEqual([
      {
        name: 'get',
        args: ['a']
      }
    ])
  })
  test("should be able to extract a matching subpath", () => {
    const request = {
      name: 'get',
      args: ['a']
    }
    const pathing = vertex.validateValuePath([request])
    expect(pathing).toEqual({
      key: 'a',
      path: [request]
    })
  })
})

describe("DOMNodeVertex", () => {
  const { document } = (new JSDOM(`...`)).window
  const block = document.createElement('div')
  const content = document.createTextNode('Hi!')
  block.appendChild(content)
  const vertex = new DOMNodeVertex(block)
  test("should iterate over nested contents", () => {
    const keys: unknown[] = []
    const values: unknown[] = []
    for(const key of vertex.keyProvider) {
      keys.push(key)
      values.push(vertex.getKeyValue(key))
    }
    expect(keys).toEqual([0])
    expect(values).toEqual([content])
  })
  test("should be able to get the direct path given a key", () => {
    const pathing = vertex.getValuePath(0)
    expect(pathing).toEqual(['childNodes', 0])
  })
  test("should be able to extract a matching subpath", () => {
    const pathing = vertex.validateValuePath(['root', 'childNodes', 0], 1)
    expect(pathing).toEqual({
      key: 0,
      path: ['childNodes', 0]
    })
  })
})

describe("resolvePropertyLookup", () => {
  test("should be able to call a nested function and return the results", ()=>{
    const results = resolvePropertyLookup(
      { Math },
      [
        'Math',
        {
          name: 'min',
          args: [1, 2]
        }
      ]
    )
    expect(results).toBe(1)
  })
})

