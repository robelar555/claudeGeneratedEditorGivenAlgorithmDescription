
    /**
     * Tagged Interval Tree Editor
     * 
     * ALGORITHM DESCRIPTION:
     * 
     * Problem statement:
     * Given a text, how to add tags (like <u>, <i> and <b>) and remove tags.
     * 
     * Tree properties:
     * Intervals at same level of tree is:
     * - Non-overlaping (Non-overlapping property)
     * - Interval at same level must be sorted (Sorted property)
     * - Must be continous, where possible - if intervals can be merged, it must be merged (Merged property)
     * - Has a start and stop value
     * 
     * Intervals of child of a node:
     * - Is inside its parents interval (Inside property)
     * - A node can not have a tag that onself have. (Tag property)
     * 
     * Add tag (input: [tag, interval: [start,stop]]):
     * Main idea: keep track of what is left of interval, while adding parts of interval along with a tag at appropriate places.
     * 
     * Because the whole interval in "interval" is to be covered, start position must be found through DFS.
     * A start position is found when one of following is true:
     * - Found the smallest interval containing start position
     * - Found node of same tag - this is needed to avoid having sub child of same tag.
     * Add tag operation is continued - through continuation of dfs - with a new - updated - start position.
     * 
     * Remove tag (input: [tag, interval: [start,stop]]):
     * Main idea: keep track of what is left of interval, while "re-hooking" sub-childs to parent of parent.
     * 
     * One must use DFS to find tag containing smallest interval with start position.
     * There may be different cases, concerning interval:
     * 
     * If remove-interval is inside a tag (not touching start and end position):
     * - Use a loop to find node that is inside remove-interval; add these to list of rehook-node-list (List rehook-node-list)
     * - Use a loop to find node that is before remove-interval; remember them temporarily in a before-remove-interval-list
     * - Use a loop to find node that is after remove-interval; remember them temporarily in a after-remove-interval-list
     * - Make a node corresponding to before-interval with same tag as this tag-node (pre-tag node); add these to list of rehook-node-list
     * - Make a node corresponding to after-interval with same tag as this tag-node (post-tag node); add these to list of rehook-node-list
     * - Add child corresponding to before-interval (before-remove-interval-list), to new tag-node corresponding to pre-tag node
     * - Add child corresponding to after-interval (after-remove-interval-list), to new tag-node corresponding to post-tag node
     * - Make sure rehook-node-list is in sorted order
     * - Make sure rehook-node-list is merged, when possible
     * - Return rehook-node-list, along with a state REMOVE-INTERVAL-INSIDE and remaining interval (that is now empty, resulting in a termination of dfs)
     * - Because parent detects state REMOVE-INTERVAL-INSIDE, it removes this tag-node and add nodes in returned rehook-node-list
     * 
     * If remove-interval is at start of tag interval:
     * - Use a loop to find node that is after remove-interval; add these to list of rehook-node-list
     * - Make sure rehook-node-list is in sorted order
     * - Make sure rehook-node-list is merged, when possible
     * - Return rehook-node-list, along with a state REMOVE-INTERVAL-LEFT and remaining interval
     * - Because parent detects state REMOVE-INTERVAL-LEFT, it add nodes in returned rehook-node-list and continue dfs with remaining interval.
     * 
     * If remove-interval is at end of tag interval:
     * - Use a loop to find node that is before remove-interval, and store them temporarily in node affected by remove-interval
     * - Make sure intervals is in sorted order
     * - Make sure intervals is merged, when possible
     * - Make sure rehook-node-list is merged, when possible
     * - Return rehook-node-list, along with a state REMOVE-INTERVAL-RIGHT and remaining interval
     * - Because parent detects state REMOVE-INTERVAL-RIGHT, it add nodes in returned rehook-node-list and continue dfs with remaining interval.
     * 
     * Justification of non-overlapping property after removing a tag against a interval:
     * Because interval of all childs is inside parent interval (inside property), and because all child have non-overlapping intervals 
     * (non-overlaping properties), non-overlapping intervals is uphold when being added to its parent of parent.
     */
class IntervalNode {
  constructor(start, end, tag = null) {
    this.interval = [start, end];
    this.tag = tag;
    this.children = [];
  }
  
  toString(indent = 0) {
    const indentStr = ' '.repeat(indent);
    let result = `${indentStr}[${this.interval[0]},${this.interval[1]}]`;
    if (this.tag) {
      result += ` tag: ${this.tag}`;
    }
    result += '\n';
    
    for (const child of this.children) {
      result += child.toString(indent + 2);
    }
    return result;
  }
}

class TaggedIntervalTree {
  constructor(start = 0, end = 0) {
    this.root = new IntervalNode(start, end);
  }
  
  // Binary search to find insertion point
  _findInsertionPoint(children, start) {
    if (children.length === 0) return 0;
    
    let left = 0;
    let right = children.length - 1;
    
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (children[mid].interval[0] === start) {
        return mid;
      } else if (children[mid].interval[0] < start) {
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }
    
    return left;
  }
  
  // Try to merge a new interval with existing children
  _tryMergeWithNeighbors(node, newStart, newEnd, tag) {
    if (node.children.length === 0) return false;
    
    // Find potential neighbors using binary search
    const index = this._findInsertionPoint(node.children, newStart);
    
    // Check left neighbor if exists
    if (index > 0) {
      const leftNeighbor = node.children[index - 1];
      if (leftNeighbor.tag === tag && leftNeighbor.interval[1] >= newStart) {
        // Can merge with left neighbor
        leftNeighbor.interval[1] = Math.max(leftNeighbor.interval[1], newEnd);
        
        // Check if we can also merge with right neighbor
        if (index < node.children.length) {
          const rightNeighbor = node.children[index];
          if (rightNeighbor.tag === tag && leftNeighbor.interval[1] >= rightNeighbor.interval[0]) {
            leftNeighbor.interval[1] = Math.max(leftNeighbor.interval[1], rightNeighbor.interval[1]);
            leftNeighbor.children.push(...rightNeighbor.children);
            node.children.splice(index, 1);
          }
        }
        return true;
      }
    }
    
    // Check right neighbor if exists
    if (index < node.children.length) {
      const rightNeighbor = node.children[index];
      if (rightNeighbor.tag === tag && newEnd >= rightNeighbor.interval[0]) {
        // Can merge with right neighbor
        rightNeighbor.interval[0] = Math.min(rightNeighbor.interval[0], newStart);
        return true;
      }
    }
    
    return false;
  }
  
  // Add a tag to an interval
  addTag(tag, interval) {
    const [start, end] = interval;
    if (start >= end) return; // Invalid interval
    
    console.log(`Adding tag ${tag} to interval [${start},${end}]`);
    this._addTagDFS(this.root, tag, start, end);
  }
  
  _addTagDFS(node, tag, start, end) {
    // Make sure we're working within the node's interval
    start = Math.max(start, node.interval[0]);
    end = Math.min(end, node.interval[1]);
    
    if (start >= end) return null; // No valid interval
    
    // If this node has the same tag, we don't need to add it again
    if (node.tag === tag) return null;
    
    // If no children, create a new child with this tag
    if (node.children.length === 0) {
      const newNode = new IntervalNode(start, end, tag);
      node.children.push(newNode);
      return;
    }
    
    // Try to merge with existing children first
    if (this._tryMergeWithNeighbors(node, start, end, tag)) {
      return;
    }
    
    // We need to find where to insert the new tag
    let insertPoints = [];
    let currentPos = start;
    
    // Use binary search to find the first child that might overlap
    let i = this._findInsertionPoint(node.children, currentPos);
    if (i > 0 && node.children[i - 1].interval[1] > currentPos) {
      // If previous child overlaps with our start, adjust i
      i--;
    }
    
    // Check if we need to insert before the first relevant child
    if (i < node.children.length && currentPos < node.children[i].interval[0]) {
      insertPoints.push({
        index: i,
        start: currentPos,
        end: Math.min(end, node.children[i].interval[0])
      });
      currentPos = Math.min(end, node.children[i].interval[0]);
    }
    
    // Go through relevant children
    while (i < node.children.length && currentPos < end) {
      const child = node.children[i];
      
      // If current position overlaps with this child
      if (currentPos < child.interval[1]) {
        // Recursively add tag to this child
        this._addTagDFS(child, tag, currentPos, end);
        currentPos = child.interval[1];
      }
      
      // If there's a gap after this child and before the next
      const nextChild = node.children[i + 1];
      if (currentPos < end && nextChild && currentPos < nextChild.interval[0]) {
        insertPoints.push({
          index: i + 1,
          start: currentPos,
          end: Math.min(end, nextChild.interval[0])
        });
        currentPos = Math.min(end, nextChild.interval[0]);
      }
      
      i++;
    }
    
    // If we still have interval left after all children
    if (currentPos < end) {
      insertPoints.push({
        index: node.children.length,
        start: currentPos,
        end: end
      });
    }
    
    // Insert all the new nodes (in reverse order to not mess up indices)
    for (let i = insertPoints.length - 1; i >= 0; i--) {
      const point = insertPoints[i];
      
      // Try to merge with neighbors first
      if (!this._tryMergeWithNeighbors(node, point.start, point.end, tag)) {
        const newNode = new IntervalNode(point.start, point.end, tag);
        node.children.splice(point.index, 0, newNode);
      }
    }
  }
  
  // Remove a tag from an interval
  removeTag(tag, interval) {
    const [start, end] = interval;
    if (start >= end) return false; // Invalid interval
    
    console.log(`Removing tag ${tag} from interval [${start},${end}]`);
    const result = this._removeTagDFS(this.root, tag, start, end);
    return result.removed;
  }
  
  _removeTagDFS(node, tag, start, end) {
    // Adjust interval to node boundaries
    const effectiveStart = Math.max(start, node.interval[0]);
    const effectiveEnd = Math.min(end, node.interval[1]);
    
    if (effectiveStart >= effectiveEnd) {
      return { 
        removed: false,
        state: 'NO_OVERLAP',
        remainingInterval: [start, end],
        rehookNodeList: []
      };
    }
    
    // Check if this node has the tag to remove
    if (node.tag === tag) {
      const originalStart = node.interval[0];
      const originalEnd = node.interval[1];
      const rehookNodeList = [];
      
      // Case 1: Remove-interval is inside a tag (not touching start and end position)
      if (effectiveStart > originalStart && effectiveEnd < originalEnd) {
        // Create separate collections for children
        const beforeNodes = [];
        const insideNodes = [];
        const afterNodes = [];
        
        // Use binary search to find the division points for children
        const startIndex = this._findInsertionPoint(node.children, effectiveStart);
        const endIndex = this._findInsertionPoint(node.children, effectiveEnd);
        
        // Process children based on their position
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.interval[1] <= effectiveStart) {
            // Child is entirely before removal interval
            beforeNodes.push(child);
          } else if (child.interval[0] >= effectiveEnd) {
            // Child is entirely after removal interval
            afterNodes.push(child);
          } else {
            // Child overlaps with removal interval - needs further processing
            const childResult = this._removeTagDFS(child, tag, effectiveStart, effectiveEnd);
            if (childResult.state === 'REMOVE-ENTIRE-NODE' || childResult.state === 'REMOVE-INTERVAL-INSIDE') {
              // If child is completely removed or split, add its rehook nodes
              rehookNodeList.push(...childResult.rehookNodeList);
            } else if (childResult.state === 'REMOVE-INTERVAL-LEFT' || childResult.state === 'REMOVE-INTERVAL-RIGHT') {
              // If child is partially removed, it's still in the tree
              insideNodes.push(child);
            } else {
              // If nothing was removed, keep the child as is
              insideNodes.push(child);
            }
          }
        }
        
        // Create pre-tag node (before the removal interval)
        if (effectiveStart > originalStart) {
          const preTagNode = new IntervalNode(originalStart, effectiveStart, tag);
          preTagNode.children = beforeNodes;
          rehookNodeList.push(preTagNode);
        } else {
          // If removal starts at node start, just add before nodes to rehook list
          rehookNodeList.push(...beforeNodes);
        }
        
        // Add inside nodes to rehook list
        rehookNodeList.push(...insideNodes);
        
        // Create post-tag node (after the removal interval)
        if (effectiveEnd < originalEnd) {
          const postTagNode = new IntervalNode(effectiveEnd, originalEnd, tag);
          postTagNode.children = afterNodes;
          rehookNodeList.push(postTagNode);
        } else {
          // If removal ends at node end, just add after nodes to rehook list
          rehookNodeList.push(...afterNodes);
        }
        
        return {
          removed: true,
          state: 'REMOVE-INTERVAL-INSIDE',
          remainingInterval: [end, end], // Empty interval since we've handled it
          rehookNodeList: rehookNodeList
        };
      }
      
      // Case 2: Remove-interval starts at or before tag start but ends within tag
      if (effectiveStart <= originalStart && effectiveEnd < originalEnd) {
        // Adjust this node's interval to start at the end of the removal
        node.interval[0] = effectiveEnd;
        
        // Use binary search to find children that need processing
        const cutoffIndex = this._findInsertionPoint(node.children, effectiveEnd);
        
        // Process any children that might be affected
        const childrenToRemove = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.interval[1] <= effectiveEnd) {
            // This child is entirely removed
            childrenToRemove.push(i);
          } else if (child.interval[0] < effectiveEnd) {
            // This child is partially affected
            const childResult = this._removeTagDFS(child, tag, effectiveStart, effectiveEnd);
            if (childResult.removed && childResult.state === 'REMOVE-ENTIRE-NODE') {
              childrenToRemove.push(i);
              // Add any rehook nodes back to the node's children
              for (const rehookNode of childResult.rehookNodeList) {
                if (rehookNode.interval[0] >= effectiveEnd) {
                  const insertPos = this._findInsertionPoint(node.children, rehookNode.interval[0]);
                  node.children.splice(insertPos, 0, rehookNode);
                }
              }
            }
          }
        }
        
        // Remove affected children (in reverse order to not mess up indices)
        for (let i = childrenToRemove.length - 1; i >= 0; i--) {
          node.children.splice(childrenToRemove[i], 1);
        }
        
        return {
          removed: true, 
          state: 'REMOVE-INTERVAL-LEFT',
          remainingInterval: [effectiveEnd, end],
          rehookNodeList: []
        };
      }
      
      // Case 3: Remove-interval starts within tag but extends to or beyond tag end
      if (effectiveStart > originalStart && effectiveEnd >= originalEnd) {
        // Adjust this node's interval to end at the start of the removal
        node.interval[1] = effectiveStart;
        
        // Use binary search to find children that need processing
        const startIndex = this._findInsertionPoint(node.children, effectiveStart);
        
        // Process any children that might be affected
        const childrenToRemove = [];
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (child.interval[0] >= effectiveStart) {
            // This child is entirely removed
            childrenToRemove.push(i);
          } else if (child.interval[1] > effectiveStart) {
            // This child is partially affected
            const childResult = this._removeTagDFS(child, tag, effectiveStart, child.interval[1]);
            if (childResult.removed && childResult.state === 'REMOVE-ENTIRE-NODE') {
              childrenToRemove.push(i);
              // Add any rehook nodes back to the node's children
              for (const rehookNode of childResult.rehookNodeList) {
                if (rehookNode.interval[1] <= effectiveStart) {
                  const insertPos = this._findInsertionPoint(node.children, rehookNode.interval[0]);
                  node.children.splice(insertPos, 0, rehookNode);
                }
              }
            }
          }
        }
        
        // Remove affected children (in reverse order to not mess up indices)
        for (let i = childrenToRemove.length - 1; i >= 0; i--) {
          node.children.splice(childrenToRemove[i], 1);
        }
        
        return {
          removed: true,
          state: 'REMOVE-INTERVAL-RIGHT',
          remainingInterval: [start, effectiveStart],
          rehookNodeList: []
        };
      }
      
      // Case 4: Remove-interval completely covers tag
      if (effectiveStart <= originalStart && effectiveEnd >= originalEnd) {
        // Process children to see if any need tag removal too
        const processedChildren = [];
        for (const child of node.children) {
          // If child overlaps with removal interval
          if (child.interval[0] < effectiveEnd && child.interval[1] > effectiveStart) {
            const childResult = this._removeTagDFS(child, tag, effectiveStart, effectiveEnd);
            if (childResult.removed) {
              // Add rehook nodes from child
              processedChildren.push(...childResult.rehookNodeList);
            } else {
              // Keep child as is
              processedChildren.push(child);
            }
          } else {
            // Child doesn't overlap, keep it
            processedChildren.push(child);
          }
        }
        
        return {
          removed: true,
          state: 'REMOVE-ENTIRE-NODE',
          remainingInterval: [effectiveEnd, end],
          rehookNodeList: processedChildren
        };
      }
    }
    
    // This node doesn't have the tag to remove, so process children
    let removed = false;
    
    // Use binary search to find children that might overlap with the removal interval
    let startIdx = this._findInsertionPoint(node.children, effectiveStart);
    if (startIdx > 0 && node.children[startIdx - 1].interval[1] > effectiveStart) {
      startIdx--;
    }
    
    let i = startIdx;
    while (i < node.children.length) {
      const child = node.children[i];
      
      // Skip if no overlap
      if (effectiveEnd <= child.interval[0] || effectiveStart >= child.interval[1]) {
        i++;
        continue;
      }
      
      const childResult = this._removeTagDFS(child, tag, start, end);
      
      if (childResult.removed) {
        removed = true;
        
        if (childResult.state === 'REMOVE-ENTIRE-NODE' || 
            childResult.state === 'REMOVE-INTERVAL-INSIDE') {
          // Remove this child and add its rehook nodes
          node.children.splice(i, 1);
          
          // Insert rehook nodes at the right positions
          if (childResult.rehookNodeList.length > 0) {
            // Insert rehook nodes in sorted order
            for (const rehookNode of childResult.rehookNodeList) {
              const insertPos = this._findInsertionPoint(node.children, rehookNode.interval[0]);
              node.children.splice(insertPos, 0, rehookNode);
            }
            
            // Update position for next iteration
            i = this._findInsertionPoint(node.children, effectiveStart);
            if (i > 0 && node.children[i - 1].interval[1] > effectiveStart) {
              i--;
            }
          }
        } else {
          // For LEFT and RIGHT states, the child was adjusted, so keep it
          i++;
        }
        
        // Continue with remaining interval if any
        if (childResult.remainingInterval[0] < childResult.remainingInterval[1]) {
          // Call recursively with remaining interval
          const remainingResult = this._removeTagDFS(
            node, 
            tag, 
            childResult.remainingInterval[0], 
            childResult.remainingInterval[1]
          );
          
          if (remainingResult.removed) {
            removed = true;
          }
        }
      } else {
        i++;
      }
    }
    
    // Ensure child intervals are properly nested within parent
    for (const child of node.children) {
      child.interval[0] = Math.max(child.interval[0], node.interval[0]);
      child.interval[1] = Math.min(child.interval[1], node.interval[1]);
    }
    
    return {
      removed: removed,
      state: 'PROCESSED_CHILDREN',
      remainingInterval: [Math.max(effectiveEnd, start), end], // Remaining part after this node
      rehookNodeList: []
    };
  }
  
  // Check if an interval has a specific tag
  hasTag(tag, interval) {
    const [start, end] = interval;
    return this._checkTagDFS(this.root, tag, start, end);
  }
  
  _checkTagDFS(node, tag, start, end) {
    // If this node has the tag and fully contains the interval
    if (node.tag === tag && 
        node.interval[0] <= start && 
        node.interval[1] >= end) {
      return true;
    }
    
    // Use binary search to find children that might overlap
    let i = this._findInsertionPoint(node.children, start);
    if (i > 0 && node.children[i - 1].interval[1] > start) {
      i--;
    }
    
    // Check relevant children
    while (i < node.children.length) {
      const child = node.children[i];
      
      // Skip if no overlap
      if (end <= child.interval[0] || start >= child.interval[1]) {
        i++;
        continue;
      }
      
      if (this._checkTagDFS(child, tag, start, end)) {
        return true;
      }
      
      i++;
    }
    
    return false;
  }
  
  // Get formatted text
  getFormattedText(text) {
    // Collect all formatting tags at each position
    const markers = [];
    
    function collectMarkers(node, parentTags = []) {
      if (node.tag) {
        // Add opening tag
        markers.push({
          position: node.interval[0],
          tag: node.tag,
          isOpening: true
        });
        
        // Add closing tag
        markers.push({
          position: node.interval[1],
          tag: node.tag,
          isOpening: false
        });
      }
      
      // Process children
      for (const child of node.children) {
        collectMarkers(child, node.tag ? [...parentTags, node.tag] : parentTags);
      }
    }
    
    collectMarkers(this.root);
    
    // Sort markers by position (closing tags come before opening tags at same position)
    markers.sort((a, b) => {
      if (a.position === b.position) {
        return a.isOpening ? 1 : -1;
      }
      return a.position - b.position;
    });
    
    // Insert tags into text
    let result = '';
    let lastPosition = 0;
    
    for (const marker of markers) {
      // Add text up to this marker
      result += text.substring(lastPosition, marker.position);
      lastPosition = marker.position;
      
      // Add tag
      if (marker.isOpening) {
        result += `<${marker.tag}>`;
      } else {
        result += `</${marker.tag}>`;
      }
    }
    
    // Add remaining text
    result += text.substring(lastPosition);
    
    return result;
  }
  
  toString() {
    return this.root.toString();
  }
}
