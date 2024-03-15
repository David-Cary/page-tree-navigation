import {
  type StyleRuleDescription,
  type PageTreeNode,
  type PageTreeDocument,
  type ContentSourceReference
} from '../data/pages'

/**
 * Checks if two items have the same property values.
 * @function
 * @param {any} first - first object to be checked
 * @param {any} second - second object to be checked
 * @returns {boolean}
 */
export function checkEquivalence (
  first: any,
  second: any
): boolean {
  if (first === second) return true
  if (typeof first === 'object' && typeof second === 'object') {
    if (Array.isArray(first)) {
      if (Array.isArray(second)) {
        if (first.length !== second.length) return false
        for (let i = 0; i < first.length; i++) {
          if (!checkEquivalence(first[i], second[i])) {
            return false
          }
        }
        return true
      }
    } else if (!Array.isArray(second)) {
      for (const key in first) {
        if (!checkEquivalence(first[key], second[key])) {
          return false
        }
      }
      for (const key in second) {
        if (key in first) continue
        return false
      }
      return true
    }
  }
  return false
}

/**
 * Checks two style rule lists and returns pairs where each is from
 * a different list but has the same selector.
 * @function
 * @param {StyleRuleDescription[]} first - first object to be checked
 * @param {StyleRuleDescription[]} second - second object to be checked
 * @returns {StyleRuleDescription[][]}
 */
export function getStyleRulesConflicts (
  first: StyleRuleDescription[],
  second: StyleRuleDescription[]
): StyleRuleDescription[][] {
  const conflicts: StyleRuleDescription[][] = []
  for (const firstItem of first) {
    for (const secondItem of second) {
      if (firstItem.selector !== secondItem.selector) continue
      if (checkEquivalence(firstItem.values, secondItem.values)) {
        continue
      }
      conflicts.push([firstItem, secondItem])
    }
  }
  return conflicts
}

/**
 * Merges styles rule list while keeping selectors unique, giving precedence to later styles.
 * @function
 * @param {...StyleRuleDescription[][]} args - rule sets to be merged
 * @returns {StyleRuleDescription[]}
 */
export function extendStyleRules (
  ...args: StyleRuleDescription[][]
): StyleRuleDescription[] {
  const results: StyleRuleDescription[] = []
  for (const ruleset of args) {
    for (const rule of ruleset) {
      const matchedIndex = results.findIndex(
        item => item.selector === rule.selector
      )
      if (matchedIndex >= 0) {
        results[matchedIndex] = rule
      } else {
        results.push(rule)
      }
    }
  }
  return results
}

/**
 * Extracts the ContentSourceReference for a particular PageTreeDocument.
 * @function
 * @param {PageTreeDocument<CT>} source - document to be converted
 * @returns {ContentSourceReference}
 */
export function getDocumentReference<CT = string> (
  source: PageTreeDocument<CT>
): ContentSourceReference {
  if (source.published != null && source.published.length > 0) {
    const lastPublication = source.published[source.published.length - 1]
    return {
      id: lastPublication.as,
      by: lastPublication.by,
      version: lastPublication.version,
      on: lastPublication.on
    }
  }
  return {
    id: source.id,
    on: new Date()
  }
}

/**
 * Converts a PageTreeDocument to a PageTreeNode.
 * @function
 * @param {PageTreeDocument<CT>} source - document to be converted
 * @param {CT} content - content to load into the resulting page
 * @returns {PageTreeNode<CT>}
 */
export function getDocumentAsPage<CT = string> (
  source: PageTreeDocument<CT>,
  content: CT
): PageTreeNode<CT> {
  return {
    title: source.title,
    source: getDocumentReference(source),
    lock: source.lock,
    content,
    children: source.pages
  }
}
