import { DefinedObjectVertex, ValueLookupVertex, type ValueVertex, KeyCrawler, type TraversalStrategy, type TraversalRoute, type UntypedObject } from 'key-crawler';
/**
 * Used to single full, partial, or no access to certain features.
 * @type
 */
export type Permissions = boolean | Record<string, boolean>;
/**
 * Notes changes to permissions if a given token applies.
 * @template CT
 * @interface
 * @property {string} token - string to be matched against
 * @property {Permissions} changes - permission changes to apply on a match
 */
export interface PermissionException {
    token: string;
    changes: Permissions;
}
/**
 * Describes a set of restrictions on accessing and editing content, including
 * how those restrictions can be bypassed or altered.
 * @interface
 * @property {Permissions | undefined} permissions - default values for user permissions
 * @property {PermissionException[] | undefined} exceptions - list of potential permission changes
 */
export interface ContentLock {
    permissions?: Permissions;
    exceptions?: PermissionException[];
}
/**
 * Attaches a content lock to an object.
 * @interface
 * @property {ContentLock | undefined} lock - content lock to be applied
 */
export interface LockableContent {
    lock?: ContentLock;
}
/**
 * Generic interface of nested content nodes.
 * @template CT
 * @interface
 * @property {CT} content - data to be stored in this node
 * @property {Array<ContentNode<CT>> | undefined} children - associated child nodes
 * @property {ContentLock | undefined} lock - optional restrictions placed on user access to this node
 */
export interface ContentNode<CT = string> extends LockableContent {
    content: CT;
    children?: Array<ContentNode<CT>>;
}
/**
 * Used to create a publication record for the target content.
 * @interface
 * @property {string | undefined} as - identifier for the content at time of publication
 * @property {string | undefined} by - author of the target content
 * @property {Date} on - date of publication
 * @property {string | undefined} version - optional version string
 */
export interface PublicationData {
    as?: string;
    by?: string;
    on: Date;
    version?: string;
}
/**
 * Attaches a cotent id, title, and publication history.
 * @interface
 * @property {string | undefined} id - unique in tree identifier
 * @property {string | undefined} title - name/description for user convenience
 * @property {string | undefined} published - publication history
 */
export interface PublishableItem {
    id?: string;
    title?: string;
    published?: PublicationData[];
}
export declare function publishItem(item: PublishableItem, author?: string, version?: string): void;
/**
 * Used to reference imported content.
 * @interface
 * @property {string | undefined} id - identifier for the target content
 * @property {string | undefined} by - author of the target content
 * @property {Date} on - date of publication
 * @property {string | undefined} version - optional version string
 * @property {any[] | undefined} contentPath - path of the imported content within source document
 */
export interface ContentSourceReference {
    id?: string;
    by?: string;
    on: Date;
    version?: string;
    contentPath?: any[];
}
/**
 * Attaches publication and local name properties to a content node.
 * @template CT
 * @interface
 * @property {string | undefined} localName - idenifier within nearest identified ancestor
 * @property {Array<PageTreeNode<CT>> | undefined} children - associated child nodes
 * @property {ContentSourceReference | undefined} source - marks source for imported content
 */
export interface PageTreeNode<CT = string> extends ContentNode<CT>, PublishableItem {
    localName?: string;
    children?: Array<PageTreeNode<CT>>;
    source?: ContentSourceReference;
}
/**
 * Retrieve a mapping of pages by their id property.
 * @function
 * @param {Array<PageTreeNode<CT>>} pages - list of pages to evaluate
 * @param {Record<string, Array<PageTreeNode<CT>>>} results - optional starting point for mapping
 * @returns {Record<string, Array<PageTreeNode<CT>>>}
 */
export declare function getPagesById<CT = string>(pages: Array<PageTreeNode<CT>>, results?: Record<string, Array<PageTreeNode<CT>>>): Record<string, Array<PageTreeNode<CT>>>;
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
 * Used to check if two strings match.
 * @type
 */
export type TextMatchCallback = (a: string, b: string) => boolean;
/**
 * Handles determining permissions for LockableContent.
 * @class
 * @property {TextMatchCallback} matchTokens - matches access tokens to permission excption tokens
 */
export declare class ContentPermissionsReader {
    matchTokens: TextMatchCallback;
    constructor(matchTokens?: TextMatchCallback);
    /**
     * Extracts a given user's permissions for the target content lock.
     * @function
     * @param {ContentLock} lock - content lock to be checked
     * @param {string[]} accessTokens - tokens to be matched to the lock
     * @returns {Permissions}
     */
    getContentLockPermissions(lock: ContentLock, accessTokens: string[]): Permissions;
    /**
     * Extracts a given user's permissions for the target route's content.
     * @function
     * @param {TraversalRoute} route - route to the target contennt
     * @param {string[]} accessTokens - tokens to be matched to the lock
     * @returns {Permissions}
     */
    getRoutePermissions(route: TraversalRoute, accessTokens: string[]): Permissions;
    /**
     * Extracts an object's content lock, if any.
     * @function
     * @param {any} source - item to be evaluated
     * @param {string} key - property to check for a lock
     * @returns {ContentLock | undefined}
     */
    getContentLockOf(source: any, key?: string): ContentLock | undefined;
    /**
     * Extracts a particular permission from permission set.
     * @function
     * @param {Permissions | undefined} permissions - source of target permission
     * @param {string} key - name of permission to check
     * @param {boolean} defaultValue - value to return if key does not apply
     * @returns {boolean}
     */
    getPermission(permissions: Permissions | undefined, key: string, defaultValue?: boolean): boolean;
    /**
     * Extracts specific permissions using a default value map.
     * @function
     * @param {Permissions | undefined} permissions - source of target permissions
     * @param {Record<string, boolean>} defaults - keys to return and their associated default values
     * @returns {Record<string, boolean>}
     */
    getPermissionSubset(permissions: Permissions | undefined, defaults: Record<string, boolean>): Record<string, boolean>;
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
 * @property {StyleRuleDescription[] | undefined} style - style rules to be applied
 * @property {Array<PageTreeNode<CT>>} pages - associated content pages
 */
export interface PageTreeDocument<CT = string> extends PublishableItem, LockableContent {
    style?: StyleRuleDescription[];
    pages: Array<PageTreeNode<CT>>;
}
export declare enum SampleDocumentPermissions {
    EDIT_STYLE = "editStyle"
}
export declare enum SamplePagePermissions {
    VIEW = "view",
    EDIT_CONTENT = "editContent",
    EDIT_CHILDREN = "editChildren",
    REMOVE = "remove",
    RENAME = "rename",
    PUBLISH = "publish",
    LOCK = "lock",
    UNLOCK = "unlock"
}
