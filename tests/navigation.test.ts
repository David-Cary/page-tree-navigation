import {
  LinearTreeNavigator,
  IndexedContentTreeCrawler
} from "../src/index"

describe("LinearTreeNavigator", () => {
  const sampleTree = [
    {
      content: 'A'
    },
    {
      content: 'B',
      children: [
        {
          content: 'B1'
        },
        {
          content: 'B2'
        }
      ]
    },
    {
      content: 'C',
      children: [
        {
          content: 'C1'
        },
        {
          content: 'C2'
        }
      ]
    }
  ]
  const nav = new LinearTreeNavigator(
    new IndexedContentTreeCrawler()
  )
  describe("getFirstNodeRoute", () => {
    test("should get first node", () => {
      const route = nav.getFirstNodeRoute(sampleTree)
      expect(route.path).toEqual([0])
    })
  })
  describe("getLastNodeRoute", () => {
    test("should get last descendeant node", () => {
      const route = nav.getLastNodeRoute(sampleTree)
      expect(route.path).toEqual([2, 1])
    })
  })
  describe("goToNextNode", () => {
    test("should go to first child if we have any", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [1])
      nav.goToNextNode(route)
      expect(route.path).toEqual([1, 0])
    })
    test("should go to next sibling if we have no children", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [2, 0])
      nav.goToNextNode(route)
      expect(route.path).toEqual([2, 1])
    })
    test("should go to parent's next sibling if we're the last child", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [1, 1])
      nav.goToNextNode(route)
      expect(route.path).toEqual([2])
    })
    test("should return an empty route if we're already at the last node", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [2, 1])
      nav.goToNextNode(route)
      expect(route.path).toEqual([])
      expect(route.target).toEqual(null)
    })
  })
  describe("goToPreviousNode", () => {
    test("should go to parent if we're the first child", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [1, 0])
      nav.goToPreviousNode(route)
      expect(route.path).toEqual([1])
    })
    test("should go to last child of previous sibling if we're not the first", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [2])
      nav.goToPreviousNode(route)
      expect(route.path).toEqual([1, 1])
    })
    test("should go to previous sibling if it has no children", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [1, 1])
      nav.goToPreviousNode(route)
      expect(route.path).toEqual([1, 0])
    })
    test("should return an empty route if we're already at the first node", () => {
      const route = nav.crawler.createRouteFrom(sampleTree, [0])
      nav.goToPreviousNode(route)
      expect(route.path).toEqual([])
      expect(route.target).toEqual(null)
    })
  })
})
