// Jasmine Tests for Tagged Interval Tree

describe('IntervalNode', function() {
  it('constructs properly', function() {
    const node = new IntervalNode(0, 10, 'b');
    expect(node.interval).toEqual([0, 10]);
    expect(node.tag).toBe('b');
    expect(node.children).toEqual([]);
  });

  it('toString works correctly', function() {
    const node = new IntervalNode(0, 10, 'b');
    const child = new IntervalNode(2, 8, 'i');
    node.children.push(child);

    const result = node.toString();
    expect(result).toContain('[0,10] tag: b');
    expect(result).toContain('  [2,8] tag: i');
  });
});

describe('TaggedIntervalTree', function() {
  it('constructs tree with default values', function() {
    const tree = new TaggedIntervalTree();
    expect(tree.root.interval).toEqual([0, 0]);
    expect(tree.root.tag).toBeNull();
    expect(tree.root.children).toEqual([]);
  });

  it('constructs tree with custom values', function() {
    const tree = new TaggedIntervalTree(0, 100);
    expect(tree.root.interval).toEqual([0, 100]);
  });
});

describe('Adding tags', function() {
  it('adds a tag to an empty tree', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 20]);
    
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].interval).toEqual([10, 20]);
    expect(tree.root.children[0].tag).toBe('b');
  });

  it('adds multiple non-overlapping tags', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 20]);
    tree.addTag('i', [30, 40]);
    
    expect(tree.root.children.length).toBe(2);
    expect(tree.root.children[0].interval).toEqual([10, 20]);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[1].interval).toEqual([30, 40]);
    expect(tree.root.children[1].tag).toBe('i');
  });

  it('adds overlapping tags of different types', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 30]);
    tree.addTag('i', [20, 40]);
    
    // The bold tag should now have the italic tag as a child where they overlap
    expect(tree.root.children.length).toBe(2);
    
    const boldNode = tree.root.children.find(c => c.tag === 'b');
    expect(boldNode.interval).toEqual([10, 30]);
    
    const italicNodeOutside = tree.root.children.find(c => c.tag === 'i' && c.interval[0] >= 30);
    expect(italicNodeOutside.interval).toEqual([30, 40]);
    
    // Check if there's an italic node inside the bold node for the overlapping part
    expect(boldNode.children.length).toBe(1);
    expect(boldNode.children[0].tag).toBe('i');
    expect(boldNode.children[0].interval).toEqual([20, 30]);
  });

  it('adds a tag inside an existing tag', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 40]);
    tree.addTag('i', [20, 30]);
    
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 40]);
    expect(tree.root.children[0].children.length).toBe(1);
    expect(tree.root.children[0].children[0].tag).toBe('i');
    expect(tree.root.children[0].children[0].interval).toEqual([20, 30]);
  });

  it('does not add a tag with invalid interval', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [30, 20]); // End before start
    
    expect(tree.root.children.length).toBe(0);
  });

  it('merges adjacent tags of same type', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 20]);
    tree.addTag('b', [20, 30]);
    
    // Should be merged into one bold tag
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 30]);
  });

  it('adds same tag with gap between', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 20]);
    tree.addTag('b', [30, 40]);
    
    // Should remain as two separate tags
    expect(tree.root.children.length).toBe(2);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 20]);
    expect(tree.root.children[1].tag).toBe('b');
    expect(tree.root.children[1].interval).toEqual([30, 40]);
  });

  it('handles nested tags of the same type', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 40]);
    tree.addTag('b', [20, 30]); // Should be ignored since parent already has this tag
    
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 40]);
    expect(tree.root.children[0].children.length).toBe(0); // No nested bold
  });
});

describe('Removing tags', function() {
  it('removes a simple tag', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 30]);
    const removed = tree.removeTag('b', [10, 30]);
    
    expect(removed).toBe(true);
    expect(tree.root.children.length).toBe(0);
  });

  it('removes a partial tag from the start', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 40]);
    const removed = tree.removeTag('b', [10, 25]);
    
    expect(removed).toBe(true);
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([25, 40]);
  });

  it('removes a partial tag from the end', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 40]);
    const removed = tree.removeTag('b', [25, 40]);
    
    expect(removed).toBe(true);
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 25]);
  });

  it('removes a tag from the middle, creating two tags', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 50]);
    const removed = tree.removeTag('b', [25, 35]);
    
    expect(removed).toBe(true);
    expect(tree.root.children.length).toBe(2);
    expect(tree.root.children[0].tag).toBe('b');
    expect(tree.root.children[0].interval).toEqual([10, 25]);
    expect(tree.root.children[1].tag).toBe('b');
    expect(tree.root.children[1].interval).toEqual([35, 50]);
  });

  it('handles removing a tag that does not exist', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 30]);
    const removed = tree.removeTag('i', [10, 30]);
    
    expect(removed).toBe(false);
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('b');
  });

  it('removes a tag with nested child tags', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 40]);
    tree.addTag('i', [20, 30]);
    const removed = tree.removeTag('b', [10, 40]);
    
    // The italic tag should now be directly under the root
    expect(removed).toBe(true);
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].tag).toBe('i');
    expect(tree.root.children[0].interval).toEqual([20, 30]);
  });

  // Additional remove tests...
});

describe('hasTag function', function() {
  it('correctly identifies when an interval has a tag', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 30]);
    
    expect(tree.hasTag('b', [10, 30])).toBe(true);
    expect(tree.hasTag('b', [15, 25])).toBe(true);
  });

  it('correctly identifies when an interval does not have a tag', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 30]);
    
    expect(tree.hasTag('i', [10, 30])).toBe(false);
    expect(tree.hasTag('b', [5, 15])).toBe(false); // Partial overlap
    expect(tree.hasTag('b', [25, 35])).toBe(false); // Partial overlap
    expect(tree.hasTag('b', [5, 35])).toBe(false); // Contains the tag but extends beyond
  });
});

describe('getFormattedText function', function() {
  it('generates correctly formatted text with single tag', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [5, 10]);
    
    const text = "Hello world!";
    const formatted = tree.getFormattedText(text);
    expect(formatted).toBe("Hello<b> worl</b>d!");
  });

  it('generates correctly formatted text with multiple non-overlapping tags', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [0, 5]);
    tree.addTag('i', [6, 11]);
    
    const text = "Hello world!";
    const formatted = tree.getFormattedText(text);
    expect(formatted).toBe("<b>Hello</b> <i>world</i>!");
  });

  it('generates correctly formatted text with nested tags', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [0, 11]);
    tree.addTag('i', [6, 11]);
    
    const text = "Hello world!";
    const formatted = tree.getFormattedText(text);
    expect(formatted).toBe("<b>Hello <i>world</i></b>!");
  });
});

describe('Complex scenarios', function() {
  it('handles adding and removing multiple tags in sequence', function() {
    const tree = new TaggedIntervalTree(0, 100);
    
    // Add several tags
    tree.addTag('b', [5, 25]);
    tree.addTag('i', [10, 30]);
    tree.addTag('u', [20, 40]);
    
    // Remove one tag partially
    tree.removeTag('i', [15, 25]);
    
    // Check the result
    const text = "0123456789012345678901234567890123456789";
    const formatted = tree.getFormattedText(text);
    
    // Expected result:
    // - Bold from 5-25
    // - Italic from 10-15 and 25-30
    // - Underline from 20-40
    expect(formatted).toBe("01234<b>56789<i>0123</i>4<u>56789</u></b><i>0123</i><u>456789</u>0123456789");
  });
});

describe('Edge cases', function() {
  it('handles zero-length intervals', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [10, 10]); // Zero length
    
    expect(tree.root.children.length).toBe(0);
  });

  it('handles intervals at tree boundaries', function() {
    const tree = new TaggedIntervalTree(0, 100);
    tree.addTag('b', [0, 100]); // Full range
    
    expect(tree.root.children.length).toBe(1);
    expect(tree.root.children[0].interval).toEqual([0, 100]);
    expect(tree.root.children[0].tag).toBe('b');
  });
});