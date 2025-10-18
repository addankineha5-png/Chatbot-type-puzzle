import random
import math
import time

class SimulatedAnnealingPuzzleRules:
    def __init__(self):
        self.puzzles = {
            "The Alchemist's Challenge": {
                "description": "Three potions sit before you: red, blue, and green. One grants wisdom, one grants strength, and one is poison. Use the clues to determine which is which.",
                "rules": [
                    "The wise potion is not red.",
                    "The poison is not green.",
                    "The blue potion grants strength.",
                    "The strength potion is not poison."
                ],
                "solution": ["green", "the green potion", "green potion"],
                "solution_explanation": "The green potion grants wisdom, the blue potion grants strength, and the red potion is poison."
            },
            "The Enchanted Keys": {
                "description": "Four keys: gold, silver, bronze, and iron. Each opens one of four doors: treasure, library, armory, or exit. Determine which key opens which door.",
                "rules": [
                    "The gold key does not open the treasure door.",
                    "The silver key opens either the library or the exit.",
                    "The bronze key does not open the armory.",
                    "The exit is not opened by the gold or bronze key."
                ],
                "solution": ["silver", "the silver key", "silver key"],
                "solution_explanation": "The silver key opens the exit, the gold key opens the library, the bronze key opens the treasure, and the iron key opens the armory."
            },
            "The Celestial Alignment": {
                "description": "Four celestial bodies: sun, moon, star, and comet. Each represents one element: fire, water, air, and earth. Determine which body represents which element.",
                "rules": [
                    "The sun does not represent water or earth.",
                    "The moon represents either water or air.",
                    "The star does not represent fire.",
                    "The element earth is represented by either the star or the comet."
                ],
                "solution": ["fire", "the fire element", "fire element"],
                "solution_explanation": "The sun represents fire, the moon represents water, the comet represents air, and the star represents earth."
            }
        }
        
        self.current_puzzle = None
        self.knowledge_base = []
        self.temperature = 1.0
        self.cooling_rate = 0.95
        self.min_temperature = 0.01
        
    def select_puzzle(self, puzzle_name):
        """Select a puzzle to solve"""
        # Print available puzzles for debugging
        print(f"Available puzzles: {list(self.puzzles.keys())}")
        print(f"Trying to select: '{puzzle_name}'")
        
        # Direct matching attempt
        if puzzle_name in self.puzzles:
            self.current_puzzle = puzzle_name
            self.knowledge_base = self.puzzles[puzzle_name]["rules"].copy()
            self.temperature = 1.0  # Reset temperature for new puzzle
            return f"You are now attempting to solve: {puzzle_name}\n\n{self.puzzles[puzzle_name]['description']}\n\nRules:"
        
        # Case-insensitive matching
        for key in self.puzzles.keys():
            if key.lower() == puzzle_name.lower():
                self.current_puzzle = key
                self.knowledge_base = self.puzzles[key]["rules"].copy()
                self.temperature = 1.0  # Reset temperature for new puzzle
                return f"You are now attempting to solve: {key}\n\n{self.puzzles[key]['description']}\n\nRules:"
        
        # Partial matching
        for key in self.puzzles.keys():
            if puzzle_name.lower() in key.lower() or key.lower() in puzzle_name.lower():
                self.current_puzzle = key
                self.knowledge_base = self.puzzles[key]["rules"].copy()
                self.temperature = 1.0  # Reset temperature for new puzzle
                return f"You are now attempting to solve: {key}\n\n{self.puzzles[key]['description']}\n\nRules:"
        
        # If all else fails, use the first puzzle (emergency fallback)
        if self.puzzles:
            first_puzzle = list(self.puzzles.keys())[0]
            self.current_puzzle = first_puzzle
            self.knowledge_base = self.puzzles[first_puzzle]["rules"].copy()
            self.temperature = 1.0  # Reset temperature for new puzzle
            return f"Puzzle '{puzzle_name}' not found. Using '{first_puzzle}' instead.\n\n{self.puzzles[first_puzzle]['description']}\n\nRules:"
        
        return "No puzzles available."
    
    def get_rules(self):
        """Get the rules for the current puzzle"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        rules = self.puzzles[self.current_puzzle]["rules"]
        return "\n".join([f"- {rule}" for rule in rules])
    
    def query_rule(self, query):
        """Process a query about the puzzle rules using simulated annealing"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        # Normalize query
        query = query.lower().strip()
        if query.endswith("?"):
            query = query[:-1]
            
        # Initial state: random response
        current_state = random.choice(["Yes", "No", "That cannot be determined from the rules"])
        current_energy = self.evaluate_response(query, current_state)
        
        best_state = current_state
        best_energy = current_energy
        
        # Simulated annealing process
        temp = self.temperature
        while temp > self.min_temperature:
            # Generate a neighbor state
            neighbor = random.choice(["Yes", "No", "That cannot be determined from the rules"])
            
            # Calculate energy of neighbor
            neighbor_energy = self.evaluate_response(query, neighbor)
            
            # Decide whether to accept the neighbor
            if neighbor_energy < current_energy:
                # Accept better state
                current_state = neighbor
                current_energy = neighbor_energy
                
                if current_energy < best_energy:
                    best_state = current_state
                    best_energy = current_energy
            else:
                # Accept worse state with a probability based on temperature
                delta_energy = neighbor_energy - current_energy
                acceptance_probability = math.exp(-delta_energy / temp)
                
                if random.random() < acceptance_probability:
                    current_state = neighbor
                    current_energy = neighbor_energy
            
            # Cool down
            temp *= self.cooling_rate
            
        # Add explanation based on the rules
        explanation = self.generate_explanation(query, best_state)
        
        return f"{best_state}. {explanation}"
    
    def evaluate_response(self, query, response):
        """Evaluate how good a response is to a query (lower is better)"""
        # This would normally use logical inference
        # For this example, we'll use a simplified approach
        
        # Extract key terms from query
        terms = set(query.lower().split())
        
        # Check if query terms appear in rules
        rule_relevance = 0
        for rule in self.knowledge_base:
            rule_terms = set(rule.lower().split())
            common_terms = terms.intersection(rule_terms)
            rule_relevance += len(common_terms)
            
        # Penalize uncertain answers for specific queries
        uncertainty_penalty = 5 if response == "That cannot be determined from the rules" and rule_relevance > 2 else 0
        
        # Calculate energy (lower is better)
        energy = 10 - rule_relevance + uncertainty_penalty
        
        return energy
    
    def generate_explanation(self, query, response):
        """Generate an explanation for the response based on the rules"""
        relevant_rules = []
        
        # Extract key terms from query
        terms = set(query.lower().split())
        
        # Find relevant rules
        for rule in self.knowledge_base:
            rule_terms = set(rule.lower().split())
            common_terms = terms.intersection(rule_terms)
            if common_terms:
                relevant_rules.append(rule)
                
        if not relevant_rules:
            return "This is based on logical deduction from the rules."
            
        # Return explanation based on relevant rules
        if len(relevant_rules) == 1:
            return f"This is based on the rule: '{relevant_rules[0]}'"
        else:
            return f"This is based on combining multiple rules, including: '{relevant_rules[0]}' and '{relevant_rules[1]}'"
    
    def check_answer(self, answer):
        """Check if the provided answer is correct"""
        if not self.current_puzzle:
            return "Please select a puzzle first."
            
        answer = answer.lower().strip()
        
        if answer in [sol.lower() for sol in self.puzzles[self.current_puzzle]["solution"]]:
            explanation = self.puzzles[self.current_puzzle]["solution_explanation"]
            return f"That's correct! You've solved the puzzle. {explanation}"
        else:
            return "That's not correct. Try again or ask more questions about the rules."
    
    def get_available_puzzles(self):
        """Return a list of available puzzles"""
        return list(self.puzzles.keys())

# Example usage
def demonstrate_simulated_annealing_rules():
    rule_system = SimulatedAnnealingPuzzleRules()
    
    print("=== Simulated Annealing Puzzle Rules Demonstration ===")
    print("Available puzzles:", rule_system.get_available_puzzles())
    
    # Select a puzzle
    puzzle_name = "The Alchemist's Challenge"
    print("\n" + rule_system.select_puzzle(puzzle_name))
    
    # Get the rules
    print("\nRules:")
    print(rule_system.get_rules())
    
    # Query some rules
    print("\nQuerying rules:")
    print("Q: Is the red potion poison?")
    print("A:", rule_system.query_rule("Is the red potion poison?"))
    
    print("\nQ: Is the green potion the wise potion?")
    print("A:", rule_system.query_rule("Is the green potion the wise potion?"))
    
    print("\nQ: Is the blue potion poison?")
    print("A:", rule_system.query_rule("Is the blue potion poison?"))
    
    # Try an incorrect answer
    print("\nTrying incorrect answer:")
    print("Answer: red")
    print(rule_system.check_answer("red"))
    
    # Try the correct answer
    print("\nTrying correct answer:")
    print("Answer: green")
    print(rule_system.check_answer("green"))

if __name__ == "__main__":
    demonstrate_simulated_annealing_rules()