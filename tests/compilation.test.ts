import {
  getStyleRulesConflicts,
  extendStyleRules,
  getDocumentAsPage
} from "../src/index"

describe("getStyleRulesConflicts", () => {
  test("should detect a conflict if there's a shared selector with different values", () => {
    const conflicts = getStyleRulesConflicts(
      [
        {
          selector: 'p',
          values: {
            margin: '1px'
          }
        },
        {
          selector: '.highlight',
          values: {
            color: 'yellow'
          }
        }
      ],
      [
        {
          selector: '.highlight',
          values: {
            color: 'red'
          }
        },
        {
          selector: 'table',
          values: {
            margin: '1px'
          }
        }
      ]
    )
    expect(conflicts).toEqual([
      [
        {
          selector: '.highlight',
          values: {
            color: 'yellow'
          }
        },
        {
          selector: '.highlight',
          values: {
            color: 'red'
          }
        }
      ]
    ])
  })
  test("should detect no conflict if values are same when selectors are same", () => {
    const conflicts = getStyleRulesConflicts(
      [
        {
          selector: 'p',
          values: {
            margin: '1px'
          }
        },
        {
          selector: '.highlight',
          values: {
            color: 'yellow'
          }
        }
      ],
      [
        {
          selector: '.highlight',
          values: {
            color: 'yellow'
          }
        },
        {
          selector: 'table',
          values: {
            margin: '1px'
          }
        }
      ]
    )
    expect(conflicts).toEqual([])
  })
})

describe("extendStyleRules", () => {
  test("should give precedence to later rules", () => {
    const rules = extendStyleRules(
      [
        {
          selector: 'p',
          values: {
            margin: '1px'
          }
        },
        {
          selector: '.highlight',
          values: {
            color: 'yellow'
          }
        }
      ],
      [
        {
          selector: '.highlight',
          values: {
            color: 'red'
          }
        },
        {
          selector: 'table',
          values: {
            margin: '1px'
          }
        }
      ]
    )
    expect(rules).toEqual([
      {
        selector: 'p',
        values: {
          margin: '1px'
        }
      },
      {
        selector: '.highlight',
        values: {
          color: 'red'
        }
      },
      {
        selector: 'table',
        values: {
          margin: '1px'
        }
      }
    ])
  })
})

describe("getDocumentAsPage", () => {
  test("should include source reference and copy document properties", () => {
    const page = getDocumentAsPage(
      {
        id: 'some-doc',
        title: 'Some Doc',
        lock: {
          exceptions: [
            {
              token: 'editor',
              changes: true
            }
          ]
        },
        pages: [
          {
            content: 'p1'
          }
        ]
      },
      'imported'
    )
    expect(page).toEqual(
      {
        title: 'Some Doc',
        lock: {
          exceptions: [
            {
              token: 'editor',
              changes: true
            }
          ]
        },
        content: 'imported',
        children: [
          {
            content: 'p1'
          }
        ],
        source: expect.objectContaining({
          id: 'some-doc'
        })
      }
    )
  })
  test("should use last publication data if available", () => {
    const page = getDocumentAsPage(
      {
        id: 'some-doc',
        title: 'Some Doc',
        pages: [
          {
            content: 'p1'
          }
        ],
        published: [
          {
            as: 'alpha',
            by: 'Bob',
            on: new Date('2001-01-22'),
            version: '0.1.0'
          },
          {
            as: 'beta',
            by: 'George',
            on: new Date('2001-11-12'),
            version: '0.2.0'
          }
        ]
      },
      'imported'
    )
    expect(page).toEqual(
      {
        title: 'Some Doc',
        content: 'imported',
        children: [
          {
            content: 'p1'
          }
        ],
        source: {
          id: 'beta',
          by: 'George',
          on: new Date('2001-11-12'),
          version: '0.2.0'
        }
      }
    )
  })
})
