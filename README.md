# claudeGeneratedEditorGivenAlgorithmDescription

An editor, created with algorithm description given below

Website
----
https://claude.site/artifacts/b3147501-5ebb-4d4f-91c8-601f9b3701ff

Pictures
-----

![image](https://github.com/user-attachments/assets/0ca74742-b94d-46c4-a2e9-6b52ef638537)





Problem statement:
------------------

Given a text, how to add tags (like < u > , < i > and < b >) and remove tags.

Tree properties:
-----------

 - Intervals at same level of tree is:
     - Non-overlaping                                                                    (Non-overlapping property)
     - Interval at same level must be sorted                                             (Sorted property)
     - Must be continous, where possible - if intervals can be merged, it must be merged (Merged property)
     - Has a start and stop value              
 - Intervals of child of a node:               
     - Is inside its parents interval                                                    (Inside property)
 - A node can not have a tag that onself have                                          . (Tag property)


Add tag (input: [tag , interval : [start,stop]]):
---------

Main idea: keep track of what is left of interval, while adding parts of interval along with a tag at 
           appropriate places.

1. Because the whole interval in "interval" is to be covered, start position must be found through DFS.
2. A start position is found when one of following is true:
    - Found the smallest interval containing start position
    - Found node of same tag - this is needed to avoid having sub child of same tag.
3. Add tag operation is continued - through continuation of dfs - with a new - updated - start position.



Remove tag (input : [tag, interval : [start,stop]]):
--------------

Main idea: keep track of what is left of interval, while "re-hooking" sub-childs to  parent of parent.

1. One must use DFS to find tag containing smallest interval with start position.
2. There may be different cases, concerning interval:
    - If remove-interval is inside a tag (not touching start and end position):
         - Use a loop to find node that is inside remove-interval; add these to list of rehook-node-list (List rehook-node-list )
         - Use a loop to find node that is before remove-interval; remember them temporarily in a before-remove-interval-list 
         - Use a loop to find node that is after remove-interval;  remember them temporarily in a after-remove-interval-list 
         - Make a node corresponding to before-interval with same tag as this tag-node (pre-tag node); add these to list of rehook-node-list (List rehook-node-list )
         - Make a node corresponding to after-interval with same tag as this tag-node  (post-tag node); add these to list of rehook-node-list (List rehook-node-list )
         - Add child corresponding to before-interval (before-remove-interval-list ), to new tag-node corresponding to pre-tag node; add these to list of rehook-node-list (List rehook-node-list )
         - Add child corresponding to after-interval (after-remove-interval-list ), to new tag-node corresponding to post-tag node; add these to list of rehook-node-list (List rehook-node-list )
         - Make sure rehook-node-list  is in sorted order
         - Make sure rehook-node-list -node-list  is merged, when possible
         - Return rehook-node-list, along with a state REMOVE-INTERVAL-INSIDE and remaining interval (that is now empty, resulting in a termination of dfs)
         - Because parrent detects state REMOVE-INTERVAL-INSIDE, it removes this tag-node and add nodes in returned rehook-node-list
    - If remove-interval is at start of tag interval:
         - Use a loop to find node that is after remove-interval; add these to list of rehook-node-list (List rehook-node-list )
         - Make sure rehook-node-list  is in sorted order
         - Make sure rehook-node-list -node-list  is merged, when possible
         - Return rehook-node-list, along with a state REMOVE-INTERVAL-LEFT and remaining interval
         - Because parrent detects state REMOVE-INTERVAL-LEFT, it add nodes in returned rehook-node-list and continue dfs with remaining interval.
    - If remove-intrval is at end of tag interval:
         - Use a loop to find node that is before remove-interval,  and store them remember them temporarily in node affected by remove-interval
         - Make sure intervals is in sorted order
         - Make sure intervals is merged, when possible
         - Make sure rehook-node-list -node-list  is merged, when possible
         - Return rehook-node-list, along with a state REMOVE-INTERVAL-RIGHT and remaining interval
         - Because parrent detects state REMOVE-INTERVAL-RIGHT, it add nodes in returned rehook-node-list and continue dfs with remaining interval.


Justification of non-overlapping property after removing a tag against a interval:
------------

   Because interval of all childs is inside parent interval (inside property), and because all child have non-overlapping intervals (non-overlaping properties),  non-overlapping intervals is uphold when being added
   to its parent of parent.



"""
