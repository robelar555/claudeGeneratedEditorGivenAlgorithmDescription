
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
    
    // Tagged Interval Tree Implementation
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
      
      // Add a tag to an interval
      addTag(tag, interval) {
        const [start, end] = interval;
        if (start >= end) return; // Invalid interval
        
        console.log(`Adding tag ${tag} to interval [${start},${end}]`);
        this._addTagDFS(this.root, tag, start, end);
        this._ensureTreeProperties(this.root);
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
        
        // We need to find where to insert the new tag
        let insertPoints = [];
        let currentPos = start;
        
        // Check if we need to insert before the first child
        if (currentPos < node.children[0].interval[0]) {
          insertPoints.push({
            index: 0,
            start: currentPos,
            end: Math.min(end, node.children[0].interval[0])
          });
          currentPos = Math.min(end, node.children[0].interval[0]);
        }
        
        // Go through each child
        for (let i = 0; i < node.children.length && currentPos < end; i++) {
          const child = node.children[i];
          
          // If current position is before this child's start
          if (currentPos < child.interval[0]) {
            // Insert a new node before this child
            insertPoints.push({
              index: i,
              start: currentPos,
              end: Math.min(end, child.interval[0])
            });
            currentPos = Math.min(end, child.interval[0]);
          }
          
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
          const newNode = new IntervalNode(point.start, point.end, tag);
          node.children.splice(point.index, 0, newNode);
        }
      }
      
      // Remove a tag from an interval
      removeTag(tag, interval) {
        const [start, end] = interval;
        if (start >= end) return false; // Invalid interval
        
        console.log(`Removing tag ${tag} from interval [${start},${end}]`);
        const result = this._removeTagDFS(this.root, tag, start, end);
        this._ensureTreeProperties(this.root);
        return result.removed;
      }
      
   // Remove a tag from an interval
  removeTag(tag, interval) {
    const [start, end] = interval;
    if (start >= end) return false; // Invalid interval
    
    console.log(`Removing tag ${tag} from interval [${start},${end}]`);
    const result = this._removeTagDFS(this.root, tag, start, end);
    this._ensureTreeProperties(this.root);
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
        
        // Categorize children based on their position relative to the removal interval
        for (const child of node.children) {
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
          preTagNode.children = [...beforeNodes]; // Clone to avoid reference issues
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
          postTagNode.children = [...afterNodes]; // Clone to avoid reference issues
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
                  node.children.push(rehookNode);
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
                  node.children.push(rehookNode);
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
    let i = 0;
    
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
          
          // Insert rehook nodes
          if (childResult.rehookNodeList.length > 0) {
            node.children.splice(i, 0, ...childResult.rehookNodeList);
            i += childResult.rehookNodeList.length;
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
  
  // Ensure tree properties (non-overlapping, sorted, merged, inside parent)
  _ensureTreeProperties(node) {
    if (!node || node.children.length === 0) return;
    
    // Sort children by start position (Sorted property)
    node.children.sort((a, b) => a.interval[0] - b.interval[0]);
    
    // Remove any empty intervals
    node.children = node.children.filter(child => 
      child.interval[0] < child.interval[1]);
    
    if (node.children.length === 0) return;
    
    // Merge adjacent/overlapping nodes with same tag (Merged property)
    const mergedChildren = [];
    let current = node.children[0];
    
    for (let i = 1; i < node.children.length; i++) {
      const next = node.children[i];
      
      // Same tag and adjacent/overlapping - merge
      if (current.tag === next.tag && next.interval[0] <= current.interval[1]) {
        current.interval[1] = Math.max(current.interval[1], next.interval[1]);
        // Merge children too
        current.children.push(...next.children);
      } else {
        mergedChildren.push(current);
        current = next;
      }
    }
    
    mergedChildren.push(current);
    node.children = mergedChildren;
    
    // Process children recursively
    for (const child of node.children) {
      // Ensure child interval fits within parent (Inside property)
      child.interval[0] = Math.max(child.interval[0], node.interval[0]);
      child.interval[1] = Math.min(child.interval[1], node.interval[1]);
      
      // Check Tag property (a node cannot have the same tag as its parent)
      if (child.tag === node.tag) {
        // Move child's children up and remove child
        for (const grandchild of child.children) {
          if (grandchild.tag !== node.tag) {
            node.children.push(grandchild);
          }
        }
        // Remove this child from the list later
      } else {
        // Process this child recursively
        this._ensureTreeProperties(child);
      }
    }
    
    // Final filter to remove children with same tag as parent
    node.children = node.children.filter(child => child.tag !== node.tag);
    
    // One more sort to ensure everything is properly ordered
    node.children.sort((a, b) => a.interval[0] - b.interval[0]);
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
        
        // Check children
        for (const child of node.children) {
          // Skip if no overlap
          if (end <= child.interval[0] || start >= child.interval[1]) {
            continue;
          }
          
          if (this._checkTagDFS(child, tag, start, end)) {
            return true;
          }
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

