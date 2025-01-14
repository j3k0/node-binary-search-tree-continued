/**
 * Simple binary search tree
 */
var customUtils = require('./customUtils');


/**
 * Constructor
 * @param {Object} options Optional
 * @param {Boolean}  options.unique Whether to enforce a 'unique' constraint on the key or not
 * @param {Key}      options.key Initialize this BST's key with key
 * @param {Value}    options.value Initialize this BST's data with [value]
 * @param {Function} options.compareKeys Initialize this BST's compareKeys
 */
function BinarySearchTree (options) {
  options = options || {};

  this.left = null;
  this.right = null;
  this.parent = options.parent !== undefined ? options.parent : null;
  if (options.hasOwnProperty('key')) { this.key = options.key; }
  this.data = customUtils.isDef(options.value) ? [options.value] : [];
  this.unique = options.unique || false;

  this.compareKeys = options.compareKeys || customUtils.defaultCompareKeysFunction;
  this.checkValueEquality = options.checkValueEquality || customUtils.defaultCheckValueEquality;
}


// ================================
// Methods used to test the tree
// ================================


/**
 * Get the descendant with max key
 */
BinarySearchTree.prototype.getMaxKeyDescendant = function () {
  if (this.right) {
    return this.right.getMaxKeyDescendant();
  } else {
    return this;
  }
};


/**
 * Get the maximum key
 */
BinarySearchTree.prototype.getMaxKey = function () {
  return this.getMaxKeyDescendant().key;
};


/**
 * Get the descendant with min key
 */
BinarySearchTree.prototype.getMinKeyDescendant = function () {
  if (this.left) {
    return this.left.getMinKeyDescendant()
  } else {
    return this;
  }
};


/**
 * Get the minimum key
 */
BinarySearchTree.prototype.getMinKey = function () {
  return this.getMinKeyDescendant().key;
};


/**
 * Check that all nodes (incl. leaves) fullfil condition given by fn
 * test is a function passed every (key, data) and which throws if the condition is not met
 */
BinarySearchTree.prototype.checkAllNodesFullfillCondition = function (test) {
  if (!this.hasOwnProperty('key')) { return; }

  test(this.key, this.data);
  if (this.left) { this.left.checkAllNodesFullfillCondition(test); }
  if (this.right) { this.right.checkAllNodesFullfillCondition(test); }
};


/**
 * Check that the core BST properties on node ordering are verified
 * Throw if they aren't
 */
BinarySearchTree.prototype.checkNodeOrdering = function () {
  var self = this;

  if (!this.hasOwnProperty('key')) { return; }

  if (this.left) {
    this.left.checkAllNodesFullfillCondition(function (k) {
      if (self.compareKeys(k, self.key) >= 0) {
        throw new Error('Tree with root ' + self.key + ' is not a binary search tree');
      }
    });
    this.left.checkNodeOrdering();
  }

  if (this.right) {
    this.right.checkAllNodesFullfillCondition(function (k) {
      if (self.compareKeys(k, self.key) <= 0) {
        throw new Error('Tree with root ' + self.key + ' is not a binary search tree');
      }
    });
    this.right.checkNodeOrdering();
  }
};


/**
 * Check that all pointers are coherent in this tree
 */
BinarySearchTree.prototype.checkInternalPointers = function () {
  if (this.left) {
    if (this.left.parent !== this) { throw new Error('Parent pointer broken for key ' + this.key); }
    this.left.checkInternalPointers();
  }

  if (this.right) {
    if (this.right.parent !== this) { throw new Error('Parent pointer broken for key ' + this.key); }
    this.right.checkInternalPointers();
  }
};


/**
 * Check that a tree is a BST as defined here (node ordering and pointer references)
 */
BinarySearchTree.prototype.checkIsBST = function () {
  this.checkNodeOrdering();
  this.checkInternalPointers();
  if (this.parent) { throw new Error("The root shouldn't have a parent"); }
};


/**
 * Get number of keys inserted
 */
BinarySearchTree.prototype.getNumberOfKeys = function () {
  var res;

  if (!this.hasOwnProperty('key')) { return 0; }

  res = 1;
  if (this.left) { res += this.left.getNumberOfKeys(); }
  if (this.right) { res += this.right.getNumberOfKeys(); }

  return res;
};



// ============================================
// Methods used to actually work on the tree
// ============================================

/**
 * Create a BST similar (i.e. same options except for key and value) to the current one
 * Use the same constructor (i.e. BinarySearchTree, AVLTree etc)
 * @param {Object} options see constructor
 */
BinarySearchTree.prototype.createSimilar = function (options) {
  options = options || {};
  options.unique = this.unique;
  options.compareKeys = this.compareKeys;
  options.checkValueEquality = this.checkValueEquality;

  return new this.constructor(options);
};


/**
 * Create the left child of this BST and return it
 */
BinarySearchTree.prototype.createLeftChild = function (options) {
  var leftChild = this.createSimilar(options);
  leftChild.parent = this;
  this.left = leftChild;

  return leftChild;
};


/**
 * Create the right child of this BST and return it
 */
BinarySearchTree.prototype.createRightChild = function (options) {
  var rightChild = this.createSimilar(options);
  rightChild.parent = this;
  this.right = rightChild;

  return rightChild;
};


/**
 * Insert a new element
 * @param {Key} key
 * @param {Value=} value Optional
 */
BinarySearchTree.prototype.insert = function (key, value) {
  // Empty tree, insert as root
  if (!this.hasOwnProperty('key')) {
    this.key = key;
    customUtils.isDef(value) && this.data.push(value);
    return;
  }

  // Same key as root
  if (this.compareKeys(this.key, key) === 0) {
    if (this.unique) {
      var err = new Error("Can't insert key " + key + ", it violates the unique constraint");
      err.key = key;
      err.errorType = 'uniqueViolated';
      throw err;
    } else {
      customUtils.isDef(value) && this.data.push(value);
    }
    return;
  }

  var childNode = { key: key };
  if (customUtils.isDef(value)) {
    childNode.value = value;
  }
  if (this.compareKeys(key, this.key) < 0) {
    // Insert in left subtree
    if (this.left) {
      this.left.insert(key, value);
    } else {
      this.createLeftChild(childNode);
    }
  } else {
    // Insert in right subtree
    if (this.right) {
      this.right.insert(key, value);
    } else {
      this.createRightChild(childNode);
    }
  }
};


/**
 * Search for all data corresponding to a key
 */
BinarySearchTree.prototype.search = function (key) {
  if (!this.hasOwnProperty('key')) { return []; }

  if (this.compareKeys(this.key, key) === 0) { return this.data; }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      return this.left.search(key);
    } else {
      return [];
    }
  } else {
    if (this.right) {
      return this.right.search(key);
    } else {
      return [];
    }
  }
};

/**
 * Search for data coming right after a specific key
 */
BinarySearchTree.prototype.searchAfter = function (key) {
  if (!this.hasOwnProperty('key')) { return []; }

  if (this.compareKeys(this.key, key) === 0) {
    // if there's a right child, the next key will be there
    var cur = this.right;
    if( cur ) {
      // within the right branch, traverse left until leaf
      while( cur.left ) 
        cur = cur.left;
      return cur.data;
    }
      
    // traverse up until you find a bigger key
    cur = this.parent;
    while( cur ) {
      if (this.compareKeys(key, cur.key) < 0)
        return cur.data;
      cur = cur.parent;
    }
    return [];
  }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      return this.left.searchAfter(key);
    } else {
      return this.data;
    }
  } else {
    if (this.right) {
      return this.right.searchAfter(key);
    } else {
      // traverse up until you find a bigger key
      var cur = this.parent;
      while( cur ) {
        if (this.compareKeys(key, cur.key) < 0)
          return cur.data;
        cur = cur.parent;
      }
      return [];
    }
  }
};

/**
 * Search for data coming right before a specific key
 */
BinarySearchTree.prototype.searchBefore = function (key) {
  if (!this.hasOwnProperty('key')) { return []; }

  if (this.compareKeys(this.key, key) === 0) {
    // if there's a left child, the previous key will be there
    var cur = this.left;
    if( cur ) {
      // within the left branch, traverse right until leaf
      while( cur.right ) 
        cur = cur.right;
      return cur.data;
    }
      
    // traverse up until you find a smaller key
    cur = this.parent;
    while( cur ) {
      if (this.compareKeys(key, cur.key) > 0)
        return cur.data;
      cur = cur.parent;
    }
    return [];
  }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      return this.left.searchBefore(key);
    } else {
      // traverse up until you find a smaller key
      var cur = this.parent;
      while( cur ) {
        if (this.compareKeys(key, cur.key) > 0)
          return cur.data;
        cur = cur.parent;
      }
      return [];
    }
  } else {
    if (this.right) {
      return this.right.searchBefore(key);
    } else {
      return this.data;
    }
  }
};

/**
 * Search for all data corresponding to a specific key, if that key
 * does not exist, find the nearest key less than the specified key and its 
 * associated data. Returns null if no such key&data can be found.
**/
BinarySearchTree.prototype.searchNearestLte = function (key, nearestSoFar) {
  if (!this.hasOwnProperty('key')) { return null; }

  var nearest = null;

  if(typeof nearestSoFar != 'undefined') {
    nearest = nearestSoFar;
  }

  if(this.compareKeys(key, this.key) === 0) {
    return this.data;
  }

  if((nearest == null || Math.abs(this.compareKeys(this.key, key)) < Math.abs(this.compareKeys(key, nearest.key))) &&
    this.compareKeys(this.key, key) <= 0) {
    
    nearest = {key: this.key, data: this.data};
  }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      const leftCandidate = this.left.searchNearestLte(key, nearest);
      if(leftCandidate != null && (nearest == null || Math.abs(this.compareKeys(leftCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key))) 
        && this.compareKeys(leftCandidate.key, key) <= 0) {
        
        nearest = leftCandidate;
      }
    }
  } 

  if (nearest == null || this.compareKeys(key, this.key) >= 0) {
    if (this.right) {
      const rightCandidate = this.right.searchNearestLte(key, nearest);
      if(rightCandidate != null && (nearest == null || Math.abs(this.compareKeys(rightCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key)))
        && this.compareKeys(rightCandidate.key, key) <= 0) {
        
        nearest = rightCandidate;
      }
    }
  }

  return nearest;
}

/**
 * Search for all data corresponding to a specific key, if that key
 * does not exist, find the nearest key greater than the specified key and its 
 * associated data. Returns null if no such key&data can be found.
**/
BinarySearchTree.prototype.searchNearestGte = function (key, nearestSoFar) {
  if (!this.hasOwnProperty('key')) { return null; }

  var nearest = null;

  if(typeof nearestSoFar != 'undefined') {
    nearest = nearestSoFar;
  }

  if(this.compareKeys(key, this.key) === 0) {
    return this.data;
  }

  if((nearest == null || Math.abs(this.compareKeys(this.key, key)) < Math.abs(this.compareKeys(key, nearest.key))) &&
    this.compareKeys(this.key, key) >= 0) {
    
    nearest = {key: this.key, data: this.data};
  }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      const leftCandidate = this.left.searchNearestGte(key, nearest);
      if(leftCandidate != null && (nearest == null || Math.abs(this.compareKeys(leftCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key))) 
        && this.compareKeys(leftCandidate.key, key) >= 0) {
        
        nearest = leftCandidate;
      }
    }
  } 

  if (nearest == null || this.compareKeys(key, this.key) >= 0) {
    if (this.right) {
      const rightCandidate = this.right.searchNearestGte(key, nearest);
      if(rightCandidate != null && (nearest == null || Math.abs(this.compareKeys(rightCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key)))
        && this.compareKeys(rightCandidate.key, key) >= 0) {
        
        nearest = rightCandidate;
      }
    }
  }

  return nearest;
}

/**
 * Search for all data corresponding to a specific key, if that key
 * does not exist, find the nearest key and associated data.
 */
BinarySearchTree.prototype.searchNearest = function (key, nearestSoFar) {
  if (!this.hasOwnProperty('key')) { return null; }

  var nearest = null;

  if(typeof nearestSoFar != 'undefined') {
    nearest = nearestSoFar;
  }

  if(this.compareKeys(key, this.key) === 0) {
    return this.data;
  }

  if(nearest == null || 
    Math.abs(this.compareKeys(this.key, key)) < Math.abs(this.compareKeys(key, nearest.key))) {
    
    nearest = {key: this.key, data: this.data};
  }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) {
      const leftCandidate = this.left.searchNearest(key, nearest);
      if(leftCandidate != null && (nearest == null || 
        Math.abs(this.compareKeys(leftCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key)))) {
        
        nearest = leftCandidate;
      }
    }
  } else {
    if (this.right) {
      const rightCandidate = this.right.searchNearest(key, nearest);
      if(rightCandidate != null && (nearest == null || 
        Math.abs(this.compareKeys(rightCandidate.key, key)) < Math.abs(this.compareKeys(key, nearest.key)))) {
        
        nearest = rightCandidate;
      }
    }
  }

  return nearest;
};


/**
 * Return a function that tells whether a given key matches a lower bound
 */
BinarySearchTree.prototype.getLowerBoundMatcher = function (query) {
  var self = this;

  // No lower bound
  if (!query.hasOwnProperty('$gt') && !query.hasOwnProperty('$gte')) {
    return function () { return true; };
  }

  if (query.hasOwnProperty('$gt') && query.hasOwnProperty('$gte')) {
    if (self.compareKeys(query.$gte, query.$gt) === 0) {
      return function (key) { return self.compareKeys(key, query.$gt) > 0; };
    }

    if (self.compareKeys(query.$gte, query.$gt) > 0) {
      return function (key) { return self.compareKeys(key, query.$gte) >= 0; };
    } else {
      return function (key) { return self.compareKeys(key, query.$gt) > 0; };
    }
  }

  if (query.hasOwnProperty('$gt')) {
    return function (key) { return self.compareKeys(key, query.$gt) > 0; };
  } else {
    return function (key) { return self.compareKeys(key, query.$gte) >= 0; };
  }
};


/**
 * Return a function that tells whether a given key matches an upper bound
 */
BinarySearchTree.prototype.getUpperBoundMatcher = function (query) {
  var self = this;

  // No lower bound
  if (!query.hasOwnProperty('$lt') && !query.hasOwnProperty('$lte')) {
    return function () { return true; };
  }

  if (query.hasOwnProperty('$lt') && query.hasOwnProperty('$lte')) {
    if (self.compareKeys(query.$lte, query.$lt) === 0) {
      return function (key) { return self.compareKeys(key, query.$lt) < 0; };
    }

    if (self.compareKeys(query.$lte, query.$lt) < 0) {
      return function (key) { return self.compareKeys(key, query.$lte) <= 0; };
    } else {
      return function (key) { return self.compareKeys(key, query.$lt) < 0; };
    }
  }

  if (query.hasOwnProperty('$lt')) {
    return function (key) { return self.compareKeys(key, query.$lt) < 0; };
  } else {
    return function (key) { return self.compareKeys(key, query.$lte) <= 0; };
  }
};


/**
 * Get all data for a key between bounds
 * Return it in key order
 * @param {Object} query Mongo-style query where keys are $lt, $lte, $gt or $gte (other keys are not considered)
 * @param {Functions} lbm/ubm matching functions calculated at the first recursive step
 */
BinarySearchTree.prototype.betweenBounds = function (query, lbm, ubm) {
  var res = [];

  if (!this.hasOwnProperty('key')) { return []; }   // Empty tree

  lbm = lbm || this.getLowerBoundMatcher(query);
  ubm = ubm || this.getUpperBoundMatcher(query);

  if (lbm(this.key) && this.left) { res = res.concat(this.left.betweenBounds(query, lbm, ubm)); }
  if (lbm(this.key) && ubm(this.key)) { res = res.concat(this.data); }
  if (ubm(this.key) && this.right) { res = res.concat(this.right.betweenBounds(query, lbm, ubm)); }

  return res;
};


/**
 * Delete the current node if it is a leaf
 * Return true if it was deleted
 */
BinarySearchTree.prototype.deleteIfLeaf = function () {
  if (this.left || this.right) { return false; }

  // The leaf is itself a root
  if (!this.parent) {
    delete this.key;
    this.data = [];
    return true;
  }

  if (this.parent.left === this) {
    this.parent.left = null;
  } else {
    this.parent.right = null;
  }

  return true;
};


/**
 * Delete the current node if it has only one child
 * Return true if it was deleted
 */
BinarySearchTree.prototype.deleteIfOnlyOneChild = function () {
  var child;

  if (this.left && !this.right) { child = this.left; }
  if (!this.left && this.right) { child = this.right; }
  if (!child) { return false; }

  // Root
  if (!this.parent) {
    this.key = child.key;
    this.data = child.data;

    this.left = null;
    if (child.left) {
      this.left = child.left;
      child.left.parent = this;
    }

    this.right = null;
    if (child.right) {
      this.right = child.right;
      child.right.parent = this;
    }

    return true;
  }

  if (this.parent.left === this) {
    this.parent.left = child;
    child.parent = this.parent;
  } else {
    this.parent.right = child;
    child.parent = this.parent;
  }

  return true;
};


/**
 * Delete a key or just a value
 * @param {Key} key
 * @param {Value=} value Optional. If not set, the whole key is deleted. If set, only this value is deleted
 */
BinarySearchTree.prototype.delete = function (key, value) {
  var replaceWith;

  if (!this.hasOwnProperty('key')) { return; }

  if (this.compareKeys(key, this.key) < 0) {
    if (this.left) { this.left.delete(key, value); }
    return;
  }

  if (this.compareKeys(key, this.key) > 0) {
    if (this.right) { this.right.delete(key, value); }
    return;
  }

  if (!this.compareKeys(key, this.key) === 0) { return; }

  // Delete only a value
  if (this.data.length > 1 && customUtils.isDef(value)) {
    this.data = this.data.filter(function(d) {
      return !this.checkValueEquality(d, value);
    }, this);
    return;
  }

  // Delete the whole node
  if (this.deleteIfLeaf()) {
    return;
  }
  if (this.deleteIfOnlyOneChild()) {
    return;
  }

  // We are in the case where the node to delete has two children
  if (Math.random() >= 0.5) {   // Randomize replacement to avoid unbalancing the tree too much
    // Use the in-order predecessor
    replaceWith = this.left.getMaxKeyDescendant();

    this.key = replaceWith.key;
    this.data = replaceWith.data;

    if (this === replaceWith.parent) {   // Special case
      this.left = replaceWith.left;
      if (replaceWith.left) { replaceWith.left.parent = replaceWith.parent; }
    } else {
      replaceWith.parent.right = replaceWith.left;
      if (replaceWith.left) { replaceWith.left.parent = replaceWith.parent; }
    }
  } else {
    // Use the in-order successor
    replaceWith = this.right.getMinKeyDescendant();

    this.key = replaceWith.key;
    this.data = replaceWith.data;

    if (this === replaceWith.parent) {   // Special case
      this.right = replaceWith.right;
      if (replaceWith.right) { replaceWith.right.parent = replaceWith.parent; }
    } else {
      replaceWith.parent.left = replaceWith.right;
      if (replaceWith.right) { replaceWith.right.parent = replaceWith.parent; }
    }
  }
};


/**
 * Execute a function on every node of the tree, in key order
 * @param {Function} fn Signature: node. Most useful will probably be node.key and node.data
 */
BinarySearchTree.prototype.executeOnEveryNode = function (fn) {
  if (this.left) { this.left.executeOnEveryNode(fn); }
  fn(this);
  if (this.right) { this.right.executeOnEveryNode(fn); }
};


/**
 * Pretty print a tree
 * @param {Boolean} printData To print the nodes' data along with the key
 */
BinarySearchTree.prototype.prettyPrint = function (printData, spacing) {
  spacing = spacing || "";

  console.log(spacing + "* " + this.key);
  if (printData) { console.log(spacing + "* " + this.data); }

  if (!this.left && !this.right) { return; }

  if (this.left) {
    this.left.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
  if (this.right) {
    this.right.prettyPrint(printData, spacing + "  ");
  } else {
    console.log(spacing + "  *");
  }
};




// Interface
module.exports = BinarySearchTree;
