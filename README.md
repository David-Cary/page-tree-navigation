# Page Tree Navigation
This provides support for navigating through a collection of pages with their own nested subpages.  This includes support for tables of content, breadcrumb trails, page searches, and next/previous navigation through such trees.

# Quickstart
## Installation
You can install this library though npm like so:
```
$ npm install --save page-tree-navigation
```

Note that this takes advantage of the [key-crawler](https://www.npmjs.com/package/key-crawler) library for a lot of it's traversal functionality.

## Content Trees
Many utility classes in this library take advantage of the `ContentNode` generic class.  Each such node consists of a typed content property and a children property for their child nodes.

`PageTreeNode` builds further on this by attaching the following properties to such nodes:
  * id: A unique identifier for the node within the node tree.
  * localName: An identifier that should be unique within the context of an ancestor with it's own local name or id.
  * title: A name/description for the page meant to be displayed to users.

If you want key crawler functionality for these trees, you can use the `IndexedContentTreeCrawler` subclass or create a key crawler with `getValidIndexedNodeVertex` as a vertex factory rule.  As the names suggests, these create abbreviated paths by the node's child index.  For example, a path of 'pages[0].children[1]' would abbreviate down to '0.1'.

If you want the crawler to use the full path, use the `ContentCrawler` subclass or `getValidContentNodeVertex` factory rule.  This can useful if you want to reference the node's content.  If that content is a tree itself you may need to add extra rules to reference subcontent.

## Linear Navigation
If you want to go to the first, previous, next, or last node of a content tree, you can do so with the `LinearTreeNavigator` class.  This takes a key crawler as it's only constructor parameter.  You'll usually want the `IndexedContentTreeCrawler` for content node trees, like so:
```
  const nav = new LinearTreeNavigator(
    new IndexedContentTreeCrawler()
  )
```

Not that this ordering is a based preorder depth-first traversal.  This mirror how a table of content maps to document content, where it starts at the first section listed advances into the first subsection from there.

## Links

This libray provides support for anchor elements through `HyperlinkSummary` objects.  These consist of text, href, and target strings.

These summaries are usually generated though a `RouteLinkFactory`.  These take a text callback, href callback, and optional target string as their constructor parameters.  The callbacks both take in key-crawler traversal routes as their sole parameter and return strings.

The `PageLinkFactory` variant only requires the href callback with an indexed title callback and target string as optional parameters.  These will use the node's title for the text if the node has that property.  If not, it will back using that indexed title callback with the node's index or simply convert the index to a string if that callback was not provided.

## Table of Contents
`TableOfContentsFactory` instances convert content node trees to a tree of `TableOfContentsNode` entries.  Each table of contents node contains a hyperlink summary (link property) that references the target content tree node.  While implementing the display for such a table is up to you, this does the leg work of setting up the references and text for that table.

Each such factory expects a route link factory as it's first and only constructor parameter.  To actually create the table of contents tree, simply call the factory's `mapContentNodes` function with the array of content nodes to be converted.

## Breadcrumbs
`BreadcrumbFactory` instances create links to all non-array object steps along a given route.  As with table of content factories, these take in a route link factory as their constructor parameter.  Once set up, simply call `getRouteLinks` with the target traversal route and it will return an array of hyperlink summaries for step along that route.

As the name suggests, this is useful if you want to provide links to parents of the current page / content.  The bit about only creating links for non-array objects means you'll only get links for the content nodes themselves, not the child lists.

## Reversible Text Parsers
While you can create your own href callback functions, we have provided some parsers to help with that.  As an added benefit, they can also be used to resolve such links back into routes.  These are based on the generic `ReversibleTextParser` interface, with a parse method for extracting data from a string and a stringify method to encode said data in a string.  For href callbacks you'll want to use the stringify function.

### Delimited Path Parsers
The most basic of these is the `DelimitedPathParser`.  That simply parses with a string split and stringifies with an array join.  Both use the instance's delimiter property.  You can specify that in the constructor, but it defaults to dot notation (".").

### Delimiter Encoded Path Parsers
`DelimiterEncodedPathParser` is a bit more complex as it lets you specify multiple delimiters and map them to specific property names.  Said delimiter map must be passed into the parser's constructor.  This is usefull for full content paths there you can reference both the childred and content properties.  For example this:
```
  const parser = new DelimiterEncodedPathParser({
    'children': '/',
    'content': '.'
  })
```
Would convert "pages.children[0].children[1].content[2]" to "0.1/2".

### Phased Path Parsers
For more complex operations you may want to use a `PhasedPathParser` instance.  These break parsing down into the following steps with their corresponding sub-parsers:
  * stringParser - Removes any encoding or extra characters from the string.
  * splitter - Breaks the decoded string into component substrings.
  * stepParser - Performs any needed conversion on each substring to get it to the right data type.

You can specify these the above order in the phased parser's constructor.  Of those only the splitter is critical and it defaults to a delimited path parser with dot notation.  These parsers get used in reverse order to stringify a provided path.

On the string parser front, we've provided the `EnclosedTextParser` class for handling wrapped text.  When creating such a parser, you may specify a prefix and suffix in the constructor.  This can be used for basic url handling where the path is part of the url.

For step conversion, we've got the `NumericTextParser` class.  That will try to convert the provided string to a number, but will leave it unchanged if text can not be converted.  This is useful for dealing with paths that mix numbers and strings.

Should you potentially have symbols in your path, you can use the `ValidKeyParser` instead.  That functions much the same but can safely stringify symbols as well as numbers.  It also lets you speficy a string prefix in the constructor.  The parser will them try to convert any string that start with that prefix back to symbols when parsing them.

### URL Parameter Parsing
Another option for dealing with url strings is the `KeyedURLValuesParser` class.  That extracts a paramter map from parsed string and creates url strings from such maps.  This can help if you want to break the path into parts, such as a page path and subcontent path.

Each such parser relies on it's template to determine how to extract and insert those parameters.  The template has the following properties:
  * origin - A string covering the url's domain.
  * path - An array of strings and path tokens.
  * hash - An optional string or key wrapper.
  * search - An optional map of query parameter names to text or key wrappers.

The key wrappers used by the hash and search properties are simply objects with a "key" property that references the target parameter name.  Their being objects simply makes parsing easier as we can use type checks to detect them.

The path tokens used by the path property are similar, but can also have a "placeholder" string to use if the target parameter does not exist.  This helps prevent double slashes in the url for missing parameters.

Note that if you don't specify any template it will default to one with an empty string for the origin and an empty array for the path.  You can also specify a base path for the parser as it's second constructor parameter.  This is only used to safely convert the provided string to a `URL` object internally before parameter extraction.

## Searches
Should you want to search for a particular content node, you can do so with the relevant key crawler's search functions.  This gets significantly more complicated if you want to perform nested searches, such as getting the a sub-page with a particular local name form an identified parent page.

While you can handle that with a series of searches, we're provided the `SearchPathResolver` class to help with that.  For each instance you need only call it's `resolve` function with the root object and a search path as the parameters.  As with a key crawler search, you can also provide a max results limitation as the 3rd parameter to cut things short early.  Said path can be any combination of objects and keys (numbers, strings, or symbols).

Each such resolver will use it's list of term rules to determine the search to perform for a given path step.  You can pass this rules list into the constructor or assign it after the fact to the `termRules` property.

Each of those rules is a callback function that takes a traversal state, search term, and visitation callback as it's parameters and returns true if the search term is a valid one for that rule.  The resolver will pass search handling on to the first callback that return true for it and skip all remaining rules.  That visitation callback will in turn be called for each node it finds that matches the rule's criteria.

### Search Term Callback Factories
An easy way to generate search path rules is with a `SearchTermCallbackFactory`.  These provide a `getSearchCallback` and 

`getSearchCallback` expects a check generation callback and allows a "shallow" flag as it's second parameter.  The check generation callback accepts a term returns a check callback if the term is valid.  Said check callback takes in a traversal state and returns either true or false.

The "shallow" flag tells the search to skip iterating though any descendants of a matching node.  This can be useful for things like idenfier searches.

`getKeyCallback` is significantly simpler, returning a rule that treats all non-object terms as keys and directing the search to the node pointed at by that key.  In effect this lets you combine normal path keys with more elaborate search steps.  That allows for things like "get the first child of the node with the following id".

### Property Searches
`PropertySearchFactory` simplifies more setting up checks for specific property values.  Just use the `getPropertySearch` to generate a search rule to will treat any object with the "key" property as a property check.  Said check will return true true if the target node has a property whose name matches the term's key and whose value matches the term's "value" property.  For example, giving it the term `{ key: "id", value: "main" }` would return true for a node whose id is "main".

Should you want that rule and above `getKeyCallback` rule enabled by default you can use the `PageTreeSearchResolver` as it comes with both of those.

## Routing by Name
You may have noticed that generating hyperlinks by traversal paths is accurate but not the most readable.  They're also prone to breaking if the target node is moved to another point in the tree.

One way to mitigate these is use the page's id and/or local name in the hyperlink string.  To help with this, we've provided the `NamedPageRouteParser` class.  Such parsers will try to replace part of the path with page id or local name strings where possible.

To create one of these route parsers you'll need to provide it parameter parser that can convert a string to a string map, such as the `KeyedURLValuesParser`.  You can pass that in as the first constructor parameter and set it through the "paramParser" property.  Said constructor also accepts the following additional parameters:
  * contentParser - Used to break down any references to nested content within a page.  Use this if your page content can have nested children you want to reference.
  * pathParser - Used to resolve the part of the page path after the identifier.  Separate from the content parser as they may have different conventions.
  * context - The root object to use when trying to parse a url to a content route.

Note that both of those optional parsers default to phased path parsers with a delimited path parser as their splitter.  That means by default the parser expects dot notation for both it's page path and content path.

As for the parameter parser, you should set it up to handle the following parameters:
  * pageId - The id of the lowest level page with such a property in the target path.  For example, if a page with an id of "main" had a subpage with an id of "intro" a route to that subpage or it's content would use "intro" as the page id.
  * pagePath - An abbreviated version of the path following the above node with an id value.  If any local names where in that part of the path it will replace the part of the path between the named node and it's nearest named or identified ancestor with it's local name.  That means the first part of the path will be a series of delimited local names while the latter half will be delimited indices.  For example, you might see "main.intro.0".
  * contentPath - The path to any nested subcontent within the target page.

Note that we could have attached the page id to the front of the page path much like we did with local names.  However, that would have made it hard to differentiate between a path that started with a local name vs on that started with an id.
