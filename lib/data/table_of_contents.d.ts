import { type TraversalRoute, type AnyObject, type ValidKey } from 'key-crawler';
import { type ContentNode, IndexedContentTreeCrawler } from '../data/pages';
import { type HyperlinkSummary, type RouteLinkFactory } from '../data/links';
export interface TableOfContentsNode {
    link: HyperlinkSummary;
    children: TableOfContentsNode[];
}
export declare class TableOfContentsFactory {
    readonly linkFactory: RouteLinkFactory;
    readonly contentCrawler: IndexedContentTreeCrawler;
    constructor(linkFactory: RouteLinkFactory);
    mapContentNodes(source: ContentNode[]): TableOfContentsNode[];
    mapRoute(route: TraversalRoute): TableOfContentsNode | TableOfContentsNode[];
    addNodeChild(target: AnyObject, key: ValidKey, value: any): void;
}
