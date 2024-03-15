import { type StyleRuleDescription, type PageTreeNode, type PageTreeDocument, type ContentSourceReference } from '../data/pages';
export declare function checkEquivalence(first: any, second: any): boolean;
export declare function getStyleRulesConflicts(first: StyleRuleDescription[], second: StyleRuleDescription[]): StyleRuleDescription[][];
export declare function extendStyleRules(...args: StyleRuleDescription[][]): StyleRuleDescription[];
export declare function getDocumentReference<CT = string>(source: PageTreeDocument<CT>): ContentSourceReference;
export declare function getDocumentAsPage<CT = string>(source: PageTreeDocument<CT>, content: CT): PageTreeNode<CT>;
