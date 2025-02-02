# Binary search trees for Node.js

**This is a fork of <a href="https://github.com/louischatriot" target="_blank">@louischatriot's</a> project with the intent to grow the project and add new features.**

Two implementations of binary search tree: <a href="http://en.wikipedia.org/wiki/Binary_search_tree" target="_blank">basic</a> and <a href="http://en.wikipedia.org/wiki/AVL_tree" target="_blank">AVL</a> (a kind of self-balancing binary search tree).


## Installation and tests
Package name is `binary-search-tree-continued`.

```bash
npm install binary-search-tree-continued --save

make test
```

## Usage
The API mainly provides 3 functions: `insert`, `search` and `delete`. If you do not create a unique-type binary search tree, you can store multiple pieces of data for the same key. Doing so with a unique-type BST will result in an error being thrown. Data is always returned as an array, and you can delete all data relating to a given key, or just one piece of data.

Values inserted can be anything except `undefined`.

```javascript
var BinarySearchTree = require('binary-search-tree').BinarySearchTree
  , AVLTree = require('binary-search-tree').AVLTree   // Same API as BinarySearchTree

// Creating a binary search tree
var bst = new BinarySearchTree();

// Inserting some data
bst.insert(15, 'some data for key 15');
bst.insert(12, 'something else');
bst.insert(18, 'hello');

// You can insert multiple pieces of data for the same key
// if your tree doesn't enforce a unique constraint
bst.insert(18, 'world');

// Retrieving data (always returned as an array of all data stored for this key)
bst.search(15);   // Equal to ['some data for key 15']
bst.search(18);   // Equal to ['hello', 'world']
bst.search(1);    // Equal to []

// Search between bounds with a MongoDB-like query
// Data is returned in key order
// Note the difference between $lt (less than) and $gte (less than OR EQUAL)
bst.betweenBounds({ $lt: 18, $gte: 12});   // Equal to ['something else', 'some data for key 15']

// Deleting all the data relating to a key
bst.delete(15);   // bst.search(15) will now give []
bst.delete(18, 'world');   // bst.search(18) will now give ['hello']
```

There are three optional parameters you can pass the BST constructor, allowing you to enforce a key-uniqueness constraint, use a custom function to compare keys and use a custom function to check whether values are equal. These parameters are all passed in an object.

### Browsing through all keys in the tree

You can use `searchAfter` and `searchBefore` to browse through all keys in the tree, like this:

```javascript
// this assumes that each value in the BST includes 'key' attribute
var node = bst.search(bst.getMinKey());
for( ; node.length > 0; node = bst.searchAfter(node[0].key) ) {
  // do something with each node here
  // node is now an array of values, as with search()
}
```

You can use `getMinKey` and `getMaxKey` to get started from the beginning or the end, or you can also use any other key value as a starting point.

### Finding the nearest key to a given key which may or may not be in the tree

You can use `searchNearest` to find the key and data nearest to the specified key.

```javascript
// Creating a binary search tree
var bst = new BinarySearchTree();

// Inserting some data
bst.insert(15, 'some data for key 15');
bst.insert(12, 'something else');
bst.insert(18, 'hello');

bst.searchNearest(20); // Equal to {key: 18, data: ['hello']}
bst.searchNearest(13); // Equal to {key: 12, data: ['something else']}
```

### Uniqueness

```javascript
var bst = new BinarySearchTree({ unique: true });
bst.insert(10, 'hello');
bst.insert(10, 'world');   // Will throw an error
```

### Custom key comparison

```javascript
// Custom key comparison function
// It needs to return the distance between the keys. Negative if
// a < b and positive if a > b
// If none is provided, the default one can compare numbers, dates and strings
// which are the most common usecases
function compareKeys (a, b) {
  return a.age - b.age;
}

// Now we can use objects with an 'age' property as keys
var bst = new BinarySearchTree({ compareKeys: compareKeys });
bst.insert({ age: 23 }, 'Mark');
bst.insert({ age: 47 }, 'Franck');
```

### Custom value checking

```javascript
// Custom value equality checking function used when we try to just delete one piece of data
// Returns true if a and b are considered the same, false otherwise
// The default function is able to compare numbers and strings
function checkValueEquality (a, b) {
  return a.length === b.length;
}
var bst = new BinarySearchTree({ checkValueEquality: checkValueEquality });
bst.insert(10, 'hello');
bst.insert(10, 'world');
bst.insert(10, 'howdoyoudo');

bst.delete(10, 'abcde');
bst.search(10);   // Returns ['howdoyoudo']
```


## License 

(The MIT License)

Copyright (c) 2013 Louis Chatriot &lt;louis.chatriot@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
