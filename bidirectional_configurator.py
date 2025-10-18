import random
import time
import math

class BidirectionalPuzzleConfigurator:
    def __init__(self):
        self.puzzles = {
            "The Shifting Maze": {
                "base_difficulty": 2.5,
                "current_difficulty": 2.5,
                "min_difficulty": 1.0,
                "max_difficulty": 5.0,
                "configurations": {
                    "easy": {"paths": 3, "dead_ends": 2, "traps": 0},
                    "medium": {"paths": 2, "dead_ends": 4, "traps": 1},
                    "hard": {"paths": 1, "dead_ends": 6, "traps": 3}
                }
            },
            "The Crystal Sequence": {
                "base_difficulty": 2.0,
                "current_difficulty": 2.0,
                "min_difficulty": 1.0,
                "max_difficulty": 5.0,
                "configurations": {
                    "easy": {"sequence_length": 3, "red_herrings": 1, "time_limit": 120},
                    "medium": {"sequence_length": 5, "red_herrings": 2, "time_limit": 90},
                    "hard": {"sequence_length": 7, "red_herrings": 3, "time_limit": 60}
                }
            },
            "The Arcane Symbols": {
                "base_difficulty": 3.0,
                "current_difficulty": 3.0,
                "min_difficulty": 1.0,
                "max_difficulty": 5.0,
                "configurations": {
                    "easy": {"symbols": 4, "combinations": 2, "obscurity": "low"},
                    "medium": {"symbols": 6, "combinations": 3, "obscurity": "medium"},
                    "hard": {"symbols": 8, "combinations": 4, "obscurity": "high"}
                }
            }
        }
        
        self.player_metrics = {
            "solve_time": [],
            "attempts": [],
            "hints_used": []
        }
        
        self.current_puzzle = None
        self.step_size = 0.3
        
    def select_puzzle(self, puzzle_name):
        """Select a puzzle to configure"""
        # Print available puzzles for debugging
        print(f"Available puzzles: {list(self.puzzles.keys())}")
        print(f"Trying to select: '{puzzle_name}'")
        
        # Direct matching attempt
        if puzzle_name in self.puzzles:
            self.current_puzzle = puzzle_name
            return f"Selected puzzle: {puzzle_name} (Current difficulty: {self.puzzles[puzzle_name]['current_difficulty']:.1f}/5.0)"
        
        # Case-insensitive matching
        for key in self.puzzles.keys():
            if key.lower() == puzzle_name.lower():
                self.current_puzzle = key
                return f"Selected puzzle: {key} (Current difficulty: {self.puzzles[key]['current_difficulty']:.1f}/5.0)"
        
        # Partial matching
        for key in self.puzzles.keys():
            if puzzle_name.lower() in key.lower() or key.lower() in puzzle_name.lower():
                self.current_puzzle = key
                return f"Selected puzzle: {key} (Current difficulty: {self.puzzles[key]['current_difficulty']:.1f}/5.0)"
        
        # If all else fails, use the first puzzle (emergency fallback)
        if self.puzzles:
            first_puzzle = list(self.puzzles.keys())[0]
            self.current_puzzle = first_puzzle
            return f"Puzzle '{puzzle_name}' not found. Using '{first_puzzle}' instead. (Current difficulty: {self.puzzles[first_puzzle]['current_difficulty']:.1f}/5.0)"
        
        return "No puzzles available."
    
    def get_configuration(self):
        """Get the current puzzle configuration based on difficulty"""
        if not self.current_puzzle:
            return {"difficulty": 0, "configuration": {}}
            
        difficulty = self.puzzles[self.current_puzzle]["current_difficulty"]
        
        # Determine which configuration to use based on difficulty
        if difficulty < 2.0:
            config_type = "easy"
        elif difficulty < 4.0:
            config_type = "medium"
        else:
            config_type = "hard"
            
        base_config = self.puzzles[self.current_puzzle]["configurations"][config_type]
        
        # Fine-tune configuration based on exact difficulty
        config = {}
        for key, value in base_config.items():
            if isinstance(value, int):
                # Scale numeric values based on difficulty within the range
                if config_type == "easy":
                    scale_factor = (difficulty - 1.0) / 1.0  # Scale within easy range (1.0-2.0)
                elif config_type == "medium":
                    scale_factor = (difficulty - 2.0) / 2.0  # Scale within medium range (2.0-4.0)
                else:
                    scale_factor = (difficulty - 4.0) / 1.0  # Scale within hard range (4.0-5.0)
                
                # Apply scaling with some randomness
                adjustment = int(value * scale_factor * 0.2)
                config[key] = value + adjustment
            else:
                config[key] = value
                
        return {
            "difficulty": difficulty,
            "configuration": config
        }
    
    def update_difficulty(self, solve_time, attempts, hints_used):
        """Update difficulty using bidirectional search based on player performance"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        # Store metrics
        self.player_metrics["solve_time"].append(solve_time)
        self.player_metrics["attempts"].append(attempts)
        self.player_metrics["hints_used"].append(hints_used)
        
        # Calculate performance score (lower is better)
        avg_time = sum(self.player_metrics["solve_time"]) / len(self.player_metrics["solve_time"])
        avg_attempts = sum(self.player_metrics["attempts"]) / len(self.player_metrics["attempts"])
        avg_hints = sum(self.player_metrics["hints_used"]) / len(self.player_metrics["hints_used"])
        
        # Normalize metrics
        norm_time = min(1.0, solve_time / (avg_time * 2)) if avg_time > 0 else 0.5
        norm_attempts = min(1.0, attempts / (avg_attempts * 2)) if avg_attempts > 0 else 0.5
        norm_hints = min(1.0, hints_used / (avg_hints * 2)) if avg_hints > 0 else 0.5
        
        performance = (norm_time + norm_attempts + norm_hints) / 3
        
        # Bidirectional search implementation
        # Unlike hill climbing which only moves in one direction,
        # bidirectional search explores from both directions
        current_difficulty = self.puzzles[self.current_puzzle]["current_difficulty"]
        min_difficulty = self.puzzles[self.current_puzzle]["min_difficulty"]
        max_difficulty = self.puzzles[self.current_puzzle]["max_difficulty"]
        
        # Forward search (from current to harder)
        forward_difficulty = min(max_difficulty, current_difficulty + self.step_size)
        
        # Backward search (from current to easier)
        backward_difficulty = max(min_difficulty, current_difficulty - self.step_size)
        
        # Evaluate which direction to move based on performance
        if performance < 0.4:  # Player did very well
            new_difficulty = forward_difficulty
            direction = "increased"
        elif performance > 0.7:  # Player struggled
            new_difficulty = backward_difficulty
            direction = "decreased"
        else:  # Player did okay
            new_difficulty = current_difficulty
            direction = "maintained"
            
        # Update difficulty
        self.puzzles[self.current_puzzle]["current_difficulty"] = new_difficulty
        
        return f"Based on your performance, puzzle difficulty has been {direction} to {new_difficulty:.1f}/5.0"
    
    def get_available_puzzles(self):
        """Return a list of available puzzles"""
        return list(self.puzzles.keys())

# Example usage
def demonstrate_bidirectional_configurator():
    configurator = BidirectionalPuzzleConfigurator()
    
    print("=== Bidirectional Puzzle Configurator Demonstration ===")
    print("Available puzzles:", configurator.get_available_puzzles())
    
    # Select a puzzle
    puzzle_name = "The Shifting Maze"
    print("\n" + configurator.select_puzzle(puzzle_name))
    
    # Get initial configuration
    print("\nInitial configuration:")
    config = configurator.get_configuration()
    print(f"Difficulty: {config['difficulty']:.1f}/5.0")
    print(f"Configuration: {config['configuration']}")
    
    # Simulate a player who did well (fast solve time, few attempts, no hints)
    print("\nSimulating player who performed well:")
    print(configurator.update_difficulty(30, 1, 0))
    
    # Get new configuration after adjustment
    print("\nNew configuration after adjustment:")
    config = configurator.get_configuration()
    print(f"Difficulty: {config['difficulty']:.1f}/5.0")
    print(f"Configuration: {config['configuration']}")
    
    # Simulate a player who struggled (long solve time, many attempts, many hints)
    print("\nSimulating player who struggled:")
    print(configurator.update_difficulty(180, 5, 3))
    
    # Get new configuration after adjustment
    print("\nNew configuration after adjustment:")
    config = configurator.get_configuration()
    print(f"Difficulty: {config['difficulty']:.1f}/5.0")
    print(f"Configuration: {config['configuration']}")

if __name__ == "__main__":
    demonstrate_bidirectional_configurator()