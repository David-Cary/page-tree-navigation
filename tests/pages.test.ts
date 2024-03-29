import {
  PageTreeNode,
  ContentPermissionsReader,
  publishItem,
  getPagesById
} from "../src/index"

describe("publishItem", () => {
  test("should attach publication entry to item", () => {
    const node: PageTreeNode = {
      id: 'topic',
      content: ''
    }
    publishItem(node, 'me', '0.4.0')
    expect(node.published).toEqual(
      [
        expect.objectContaining({
          as: 'topic',
          by: 'me',
          version: '0.4.0'
        })
      ]
    )
  })
})

describe("getPagesById", () => {
  test("should return mapping of pages by id", () => {
    const results = getPagesById(
      [
        {
          id: 'a',
          content: 'fruit',
          children: [
            {
              id: 'a1',
              content: 'apple'
            }
          ]
        },
        {
          id: 'b',
          content: 'veggies',
          children: [
            {
              id: 'b1',
              content: 'carrot'
            }
          ]
        }
      ]
    )
    expect(Object.keys(results)).toEqual(['a', 'a1', 'b', 'b1'])
  })
})

describe("ContentPermissionsReader", () => {
  const reader = new ContentPermissionsReader()
  describe("getPermissionSubset", () => {
    test("should only return permissions covered by the provided key map", () => {
      const subset = reader.getPermissionSubset(
        {
          view: true,
          edit: true
        },
        {
          edit: false
        }
      )
      expect(subset).toEqual({ edit: true })
    })
    test("if boolean, that should be applied to all defaults", () => {
      const subset = reader.getPermissionSubset(
        true,
        {
          edit: false
        }
      )
      expect(subset).toEqual({ edit: true })
    })
  })
})