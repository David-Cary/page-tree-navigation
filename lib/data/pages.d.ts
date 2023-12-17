import { DefinedObjectVertex, ValueLookupVertex, type ValueVertex, KeyCrawler, type TraversalStrategy, type UntypedObject } from 'key-crawler';
/**
 * Generic interface of nested content nodes.
 * @template CT
 * @interface
 * @property {CT} content - data to be stored in this node
 * @property {Array<ContentNode<CT>> | undefined} children - associated child nodes
 */
export interface ContentNode<CT = string> {
    content: CT;
    children?: Array<ContentNode<CT>>;
}
/**
 * Attaches identifiers and title text to a content node.
 * @template CT
 * @interface
 * @property {string| undefined} id - unique in tree identifier
 * @property {string| undefined} title - name/description for user convenience
 * @property {string| undefined} localName - idenifier within nearest identified ancestor
 * @property {Array<PageTreeNode<CT>> | undefined} children - associated child nodes
 */
export interface PageTreeNode<CT = string> extends ContentNode<CT> {
    id?: string;
    title?: string;
    localName?: string;
    children?: Array<PageTreeNode<CT>>;
}
/**
 * Used to traverse through the children and content of a content node.
 * @class
 * @extends DefinedObjectVertex
 */
export declare class ContentNodeVertex extends DefinedObjectVertex {
    constructor(source: UntypedObject);
}
/**
 * Generates a ContentNodeVertex for objects with a content property.  Used as a VertexFactoryCallback.
 * @function
 * @param {UntypedObject} source - object the vertex is built around
 * @returns {ValueVertex | undefined}
 */
export declare function getValidContentNodeVertex(source: UntypedObject): ValueVertex | undefined;
/**
 * Used to traverse through the children of a content node by the child's index.
 * @class
 * @extends ValueLookupVertex<UntypedObject, number, UntypedObject>
 */
export declare class IndexedNodeVertex extends ValueLookupVertex<UntypedObject, number, UntypedObject> {
    constructor(source: UntypedObject);
}
/**
 * Generates a IndexedNodeVertex for objects with a content property.  Used as a VertexFactoryCallback.
 * @function
 * @param {UntypedObject} source - object the vertex is built around
 * @returns {ValueVertex | undefined}
 */
export declare function getValidIndexedNodeVertex(source: UntypedObject): ValueVertex | undefined;
/**
 * Traverses through the children and contents of each node in a content tree.
 * @class
 * @extends KeyCrawler
 */
export declare class ContentCrawler extends KeyCrawler {
    constructor(strategy?: TraversalStrategy);
}
/**
 * Traverses through the children of each node in a content tree, by said child's index.
 * @class
 * @extends KeyCrawler
 */
export declare class IndexedContentTreeCrawler extends KeyCrawler {
    constructor(strategy?: TraversalStrategy);
}
/**
 * Used to summarize css rules.
 * @interface
 * @property {string} selector - css selector
 * @property {Record<string, string>} values - map of css properties
 */
export interface StyleRuleDescription {
    selector: string;
    values: Record<string, string>;
}
/**
 * Wraps content pages in a collection with additional html document header information.
 * @template CT
 * @interface
 * @property {string| undefined} id - unique document identifier
 * @property {string| undefined} title - name/description for user convenience
 * @property {StyleRuleDescription[] | undefined} style - style rules to be applied
 * @property {Array<PageTreeNode<CT>>} pages - associated content pages
 */
export interface PageTreeDocument<CT = string> {
    id?: string;
    title?: string;
    style?: StyleRuleDescription[];
    pages: Array<PageTreeNode<CT>>;
}
