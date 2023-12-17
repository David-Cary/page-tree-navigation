import { type TraversalRoute } from 'key-crawler';
import { type HyperlinkSummary, type RouteLinkFactory } from '../data/links';
/**
 * Traverses through the children of each node in a content tree, by said child's index.
 * @class
 * @property {RouteLinkFactory} linkFactory - generates the link summaries for each step in the trail
 */
export declare class BreadcrumbFactory {
    readonly linkFactory: RouteLinkFactory;
    constructor(linkFactory: RouteLinkFactory);
    /**
     * Creates link data for every step along the provided route.
     * @function
     * @param {TraversalRoute} route - route to be processed
     * @returns {HyperlinkSummary[]}
     */
    getRouteLinks(route: TraversalRoute): HyperlinkSummary[];
}
