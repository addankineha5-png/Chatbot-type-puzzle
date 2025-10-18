import time
from collections import deque
import random

class BFSPuzzleSolver:
    def __init__(self):
        # Dictionary of puzzles with their hints and solutions
        self.puzzles = {
            "The Guardian's Riddle": {
                "hints": [
                    "I am not alive, but I can make sounds.",
                    "You might find me in mountains or valleys.",
                    "I can be loud or soft, depending on the wind."
                ],
                "solution": ["echo", "an echo"],
                "difficulty": 2
            },
            "The Ancient Symbol": {
                "hints": [
                    "I have four equal sides and four equal angles.",
                    "I am not a rectangle, though I share some properties.",
                    "I can be found on a chessboard."
                ],
                "solution": ["square", "a square"],
                "difficulty": 1
            },
            "The Celestial Pattern": {
                "hints": [
                    "I wax and wane but never disappear completely.",
                    "I control the tides of the ocean.",
                    "I am Earth's only natural satellite."
                ],
                "solution": ["moon", "the moon"],
                "difficulty": 2
            }
        }
        
        self.current_puzzle = None
        self.hints_used = 0
        self.max_hints = 3
        self.start_time = None
        
    def select_puzzle(self, puzzle_name):
        """Select a puzzle to solve"""
        # Print available puzzles for debugging
        print(f"Available puzzles: {list(self.puzzles.keys())}")
        print(f"Trying to select: '{puzzle_name}'")
        
        # Direct matching attempt
        if puzzle_name in self.puzzles:
            self.current_puzzle = puzzle_name
            self.hints_used = 0
            self.start_time = time.time()
            return f"You are now attempting to solve: {puzzle_name}"
        
        # Case-insensitive matching
        for key in self.puzzles.keys():
            if key.lower() == puzzle_name.lower():
                self.current_puzzle = key
                self.hints_used = 0
                self.start_time = time.time()
                return f"You are now attempting to solve: {key}"
        
        # Partial matching
        for key in self.puzzles.keys():
            if puzzle_name.lower() in key.lower() or key.lower() in puzzle_name.lower():
                self.current_puzzle = key
                self.hints_used = 0
                self.start_time = time.time()
                return f"You are now attempting to solve: {key}"
        
        # If all else fails, use the first puzzle (emergency fallback)
        if self.puzzles:
            first_puzzle = list(self.puzzles.keys())[0]
            self.current_puzzle = first_puzzle
            self.hints_used = 0
            self.start_time = time.time()
            return f"Puzzle '{puzzle_name}' not found. Using '{first_puzzle}' instead."
        
        return "No puzzles available."
    
    def get_hint(self):
        """Use BFS to provide the next appropriate hint"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        if self.hints_used >= self.max_hints:
            return "You have used all available hints. Try to solve the puzzle with what you know."
            
        # BFS implementation for hint traversal
        # Unlike DLS which limits depth, BFS explores breadth-first
        queue = deque([(0, [])])  # (level, path)
        visited = set([0])
        
        while queue:
            level, path = queue.popleft()
            
            # If we've found the next hint level
            if level == self.hints_used:
                hint = self.puzzles[self.current_puzzle]["hints"][level]
                self.hints_used += 1
                return f"Hint {self.hints_used}/{self.max_hints}: {hint}"
            
            # Add next level to queue
            next_level = level + 1
            if next_level < self.max_hints and next_level not in visited:
                visited.add(next_level)
                queue.append((next_level, path + [next_level]))
                
        return "No more hints available."
    
    def check_answer(self, answer):
        """Check if the provided answer is correct"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        elapsed_time = time.time() - self.start_time
        answer = answer.lower().strip()
        
        if answer in [sol.lower() for sol in self.puzzles[self.current_puzzle]["solution"]]:
            score = self.calculate_score(elapsed_time)
            return f"Correct! You solved the puzzle in {elapsed_time:.1f} seconds using {self.hints_used} hints. Score: {score}/100"
        else:
            return "That's not correct. Try again or ask for a hint."
    
    def calculate_score(self, elapsed_time):
        """Calculate score based on time taken and hints used"""
        base_score = 100
        time_penalty = min(50, elapsed_time / 5)  # Max 50 points penalty for time
        hint_penalty = self.hints_used * 15  # 15 points penalty per hint
        
        score = max(0, base_score - time_penalty - hint_penalty)
        return round(score)
    
    def get_available_puzzles(self):
        """Return a list of available puzzles"""
        return list(self.puzzles.keys())

def test_puzzle_access():
    """Test function to verify puzzle access"""
    solver = BFSPuzzleSolver()
    print("\n=== PUZZLE ACCESS TEST ===")
    print(f"Puzzles defined: {solver.puzzles.keys()}")
    
    test_names = ["The Guardian's Riddle", "the guardian's riddle", "The Guardian's Riddle ", "Guardian", "Riddle"]
    for name in test_names:
        result = solver.select_puzzle(name)
        print(f"Selecting '{name}': {result}")
    
    print("=== END TEST ===\n")

# Example usage
def demonstrate_bfs_puzzle():
    solver = BFSPuzzleSolver()
    
    print("=== BFS Puzzle Solver Demonstration ===")
    print("Available puzzles:", solver.get_available_puzzles())
    
    # Select a puzzle
    puzzle_name = "The Guardian's Riddle"
    print("\n" + solver.select_puzzle(puzzle_name))
    
    # Get hints using BFS
    print("\nAsking for hints:")
    print(solver.get_hint())
    print(solver.get_hint())
    
    # Try an incorrect answer
    print("\nTrying incorrect answer:")
    print(solver.check_answer("mountain"))
    
    # Get the last hint
    print("\nGetting last hint:")
    print(solver.get_hint())
    
    # Try the correct answer
    print("\nTrying correct answer:")
    print(solver.check_answer("echo"))
    
    # Try to get another hint after solving
    print("\nTrying to get another hint:")
    print(solver.get_hint())

if __name__ == "__main__":
    test_puzzle_access()
    demonstrate_bfs_puzzle()