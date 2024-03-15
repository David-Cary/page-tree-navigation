import {
  PageTreeNode,
  publishItem
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
