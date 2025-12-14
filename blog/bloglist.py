#!/usr/bin/env python3
"""
Blog listing module - scans blog folder for posts and generates path list
"""
import os
from pathlib import Path
import json

def get_blog_posts():
    """
    Scans the blog directory and returns a list of blog post paths.
    Only includes folders that contain a data.json file.
    
    Returns:
        list: List of paths like 'blog/post-id/data.json'
    """
    blog_dir = Path(__file__).parent
    paths = []
    
    try:
        # List all subdirectories in blog folder
        for item in sorted(blog_dir.iterdir()):
            if item.is_dir() and not item.name.startswith('.'):
                # Check if data.json exists in this folder
                data_json = item / 'data.json'
                if data_json.exists():
                    paths.append(f'blog/{item.name}/data.json')
    except Exception as e:
        print(f"Error scanning blog directory: {e}")
    
    return paths


def get_blog_posts_json():
    """
    Returns blog posts as JSON-serializable dict.
    
    Returns:
        dict: {'posts': ['blog/post-id/data.json', ...]}
    """
    return {'posts': get_blog_posts()}


if __name__ == '__main__':
    # Test: print the list
    posts = get_blog_posts()
    print('Found blog posts:')
    for post in posts:
        print(f'  {post}')
    print(f'\nTotal: {len(posts)} posts')
