import mongoose from 'mongoose';
import Problem from '../models/Problem.js';

const seedProblems = async () => {
  try {
    // Clear and re-seed pure C++ problems cleanly
    console.log('Re-seeding pure C++ coding challenges...');
    await Problem.deleteMany({});

    const defaultProblems = [
      {
        title: 'Reverse Words in a String',
        description: 'Given an input string `s`, reverse the order of the words. A word is defined as a sequence of non-space characters. The words in `s` will be separated by at least one space.',
        difficulty: 'Medium',
        tags: ['Arrays & Strings'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: 'the sky is blue', output: 'blue is sky the', isSample: true },
          { input: '  hello world  ', output: 'world hello', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    string reverseWords(string s) {\n        // Write your code here\n        return "";\n    }\n};`
        }
      },
      {
        title: 'Reverse Linked List',
        description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.',
        difficulty: 'Easy',
        tags: ['Linked Lists'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '1,2,3,4,5', output: '5,4,3,2,1', isSample: true }
        ],
        boilerplates: {
          cpp: `class Solution {\npublic:\n    ListNode* reverseList(ListNode* head) {\n        // Write your code here\n        return nullptr;\n    }\n};`
        }
      },
      {
        title: 'Valid Parentheses',
        description: 'Given a string `s` containing just the characters `\'(\'`, `\')\'`, `\'{\'`, `\'}\'`, `\'[\'` and `\']\'`, determine if the input string is valid.',
        difficulty: 'Easy',
        tags: ['Stacks & Queues'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '()[]{}', output: 'true', isSample: true },
          { input: '(]', output: 'false', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isValid(string s) {\n        // Write your code here\n        return false;\n    }\n};`
        }
      },
      {
        title: 'Invert Binary Tree',
        description: 'Given the `root` of a binary tree, invert the tree, and return its root.',
        difficulty: 'Easy',
        tags: ['Trees & Graphs'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: '4,2,7,1,3,6,9', output: '4,7,2,9,6,3,1', isSample: true }
        ],
        boilerplates: {
          cpp: `class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your code here\n        return nullptr;\n    }\n};`
        }
      },
      {
        title: 'Climbing Stairs',
        description: 'You are climbing a staircase. It takes `n` steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?',
        difficulty: 'Easy',
        tags: ['Dynamic Programming'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '2', output: '2', isSample: true },
          { input: '3', output: '3', isSample: true }
        ],
        boilerplates: {
          cpp: `class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your code here\n        return 0;\n    }\n};`
        }
      },
      {
        title: 'Subsets',
        description: 'Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.',
        difficulty: 'Medium',
        tags: ['Recursion & Backtracking'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: '1,2', output: '[],[1],[2],[1,2]', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<vector<int>> subsets(vector<int>& nums) {\n        // Write your code here\n        return {};\n    }\n};`
        }
      },
      {
        title: 'Merge Sorted Array',
        description: 'You are given two integer arrays `nums1` and `nums2`, sorted in non-decreasing order, and two integers `m` and `n`, representing the number of elements in `nums1` and `nums2` respectively. Merge `nums2` into `nums1` as one sorted array.',
        difficulty: 'Easy',
        tags: ['Sorting & Searching'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '1,2,3,0,0,0\n3\n2,5,6\n3', output: '1,2,2,3,5,6', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {\n        // Write your code here\n    }\n};`
        }
      },
      {
        title: 'Jump Game',
        description: 'You are given an integer array `nums`. You are initially positioned at the array\'s first index, and each element in the array represents your maximum jump length at that position. Return `true` if you can reach the last index, or `false` otherwise.',
        difficulty: 'Medium',
        tags: ['Greedy Algorithms'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: '2,3,1,1,4', output: 'true', isSample: true },
          { input: '3,2,1,0,4', output: 'false', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool canJump(vector<int>& nums) {\n        // Write your code here\n        return false;\n    }\n};`
        }
      },
      {
        title: 'Single Number',
        description: 'Given a non-empty array of integers `nums`, every element appears twice except for one. Find that single one.',
        difficulty: 'Easy',
        tags: ['Bit Manipulation'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '2,2,1', output: '1', isSample: true },
          { input: '4,1,2,1,2', output: '4', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int singleNumber(vector<int>& nums) {\n        // Write your code here\n        return 0;\n    }\n};`
        }
      },
      {
        title: 'Fizz Buzz',
        description: 'Given an integer `n`, return a string array `answer` (1-indexed) where answer[i] is "FizzBuzz" if divisible by 3 and 5, "Fizz" if divisible by 3, "Buzz" if divisible by 5, or the number as a string otherwise.',
        difficulty: 'Easy',
        tags: ['Math & Number Theory'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '3', output: '"1","2","Fizz"', isSample: true },
          { input: '5', output: '"1","2","Fizz","4","Buzz"', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\n#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<string> fizzBuzz(int n) {\n        // Write your code here\n        return {};\n    }\n};`
        }
      },
      {
        title: 'Max Consecutive Ones III',
        description: 'Given a binary array `nums` and an integer `k`, return the maximum number of consecutive `1`s in the array if you can flip at most `k` `0`s.',
        difficulty: 'Medium',
        tags: ['Sliding Window'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: '1,1,1,0,0,0,1,1,1,1,0\n2', output: '6', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int longestOnes(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};`
        }
      },
      {
        title: 'Valid Palindrome',
        description: 'A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Given a string `s`, return `true` if it is a palindrome, or `false` otherwise.',
        difficulty: 'Easy',
        tags: ['Two Pointers'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: 'A man, a plan, a canal: Panama', output: 'true', isSample: true },
          { input: 'race a car', output: 'false', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <string>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool isPalindrome(string s) {\n        // Write your code here\n        return false;\n    }\n};`
        }
      },
      {
        title: 'Binary Search',
        description: 'Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.',
        difficulty: 'Easy',
        tags: ['Binary Search'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '-1,0,3,5,9,12\n9', output: '4', isSample: true },
          { input: '-1,0,3,5,9,12\n2', output: '-1', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your code here\n        return -1;\n    }\n};`
        }
      },
      {
        title: 'Kth Largest Element in an Array',
        description: 'Given an integer array `nums` and an integer `k`, return the `k`th largest element in the array.',
        difficulty: 'Medium',
        tags: ['Heaps & Priority Queues'],
        constraints: { timeLimit: 2, memoryLimit: 256 },
        testCases: [
          { input: '3,2,1,5,6,4\n2', output: '5', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        // Write your code here\n        return 0;\n    }\n};`
        }
      },
      {
        title: 'Contains Duplicate',
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
        difficulty: 'Easy',
        tags: ['Hashing'],
        constraints: { timeLimit: 1, memoryLimit: 128 },
        testCases: [
          { input: '1,2,3,1', output: 'true', isSample: true },
          { input: '1,2,3,4', output: 'false', isSample: true }
        ],
        boilerplates: {
          cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    bool containsDuplicate(vector<int>& nums) {\n        // Write your code here\n        return false;\n    }\n};`
        }
      }
    ];

    await Problem.insertMany(defaultProblems);
    console.log('Successfully seeded default programming problems!');
  } catch (err) {
    console.error('Error seeding problems:', err);
  }
};

export const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not defined!');
  }

  try {
    const conn = await mongoose.connect(mongoUri);
    console.log('mongodb connected successfully');
    await seedProblems();
    return conn;
  } catch (err) {
    throw err;
  }
};
