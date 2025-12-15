#!/usr/bin/env python3
"""
Concepts listing module - scans concepts folder for items and generates path list
"""
import os
from pathlib import Path
import json

def get_concepts_list():
    """
    Scans the concepts directory and returns a list of concept paths.
    Only includes folders that contain a data.json file.
    
    Returns:
        list: List of paths like 'concepts/concept-id/data.json'
    """
    concepts_dir = Path(__file__).parent
    paths = []
    
    try:
        # List all subdirectories in concepts folder
        for item in sorted(concepts_dir.iterdir()):
            if item.is_dir() and not item.name.startswith('.'):
                # Check if data.json exists in this folder
                data_json = item / 'data.json'
                if data_json.exists():
                    paths.append(f'concepts/{item.name}/data.json')
    except Exception as e:
        print(f"Error scanning concepts directory: {e}")
    
    return paths


def get_concepts_json():
    """
    Returns concepts as JSON-serializable dict.
    
    Returns:
        dict: {'concepts': ['concepts/concept-id/data.json', ...]}
    """
    return {'concepts': get_concepts_list()}


if __name__ == '__main__':
    # Test: print the list
    concepts = get_concepts_list()
    print('Found concepts:')
    for concept in concepts:
        print(f'  {concept}')
    print(f'\nTotal: {len(concepts)} concepts')
