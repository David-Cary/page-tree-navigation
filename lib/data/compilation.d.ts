import { type StyleRuleDescription, type PageTreeNode, type PageTreeDocument, type ContentSourceReference } from '../data/pages';
/**
 * Checks if two items have the same property values.
 * @function
 * @param {any} first - first object to be checked
 * @param {any} second - second object to be checked
 * @returns {boolean}
 */
export declare function checkEquivalence(first: any, second: any): boolean;
/**
 * Checks two style rule lists and returns pairs where each is from
 * a different list but has the same selector.
 * @function
 * @param {StyleRuleDescription[]} first - first object to be checked
 * @param {StyleRuleDescription[]} second - second object to be checked
 * @returns {StyleRuleDescription[][]}
 */
export declare function getStyleRulesConflicts(first: StyleRuleDescription[], second: StyleRuleDescription[]): StyleRuleDescription[][];
/**
 * Merges styles rule list while keeping selectors unique, giving precedence to later styles.
 * @function
 * @param {...StyleRuleDescription[][]} args - rule sets to be merged
 * @returns {StyleRuleDescription[]}
 */
export declare function extendStyleRules(...args: StyleRuleDescription[][]): StyleRuleDescription[];
/**
 * Extracts the ContentSourceReference for a particular PageTreeDocument.
 * @function
 * @param {PageTreeDocument<CT>} source - document to be converted
 * @returns {ContentSourceReference}
 */
export declare function getDocumentReference<CT = string>(source: PageTreeDocument<CT>): ContentSourceReference;
/**
 * Converts a PageTreeDocument to a PageTreeNode.
 * @function
 * @param {PageTreeDocument<CT>} source - document to be converted
 * @param {CT} content - content to load into the resulting page
 * @returns {PageTreeNode<CT>}
 */
export declare function getDocumentAsPage<CT = string>(source: PageTreeDocument<CT>, content: CT): PageTreeNode<CT>;
