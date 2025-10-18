export class SimulatedAnnealingPuzzleRules {
    puzzles: Record<
      string,
      {
        description: string
        rules: string[]
        solution: string[]
        solution_explanation: string
      }
    >
    current_puzzle: string | null
    knowledge_base: string[]
    temperature: number
    cooling_rate: number
    min_temperature: number
  
    constructor() {
      this.puzzles = {
        "The Alchemist's Challenge": {
          description:
            "Three potions sit before you: red, blue, and green. One grants wisdom, one grants strength, and one is poison. Use the clues to determine which is which.",
          rules: [
            "The wise potion is not red.",
            "The poison is not green.",
            "The blue potion grants strength.",
            "The strength potion is not poison.",
          ],
          solution: ["green", "the green potion", "green potion"],
          solution_explanation:
            "The green potion grants wisdom, the blue potion grants strength, and the red potion is poison.",
        },
        "The Enchanted Keys": {
          description:
            "Four keys: gold, silver, bronze, and iron. Each opens one of four doors: treasure, library, armory, or exit. Determine which key opens which door.",
          rules: [
            "The gold key does not open the treasure door.",
            "The silver key opens either the library or the exit.",
            "The bronze key does not open the armory.",
            "The exit is not opened by the gold or bronze key.",
          ],
          solution: ["silver", "the silver key", "silver key"],
          solution_explanation:
            "The silver key opens the exit, the gold key opens the library, the bronze key opens the treasure, and the iron key opens the armory.",
        },
        "The Celestial Alignment": {
          description:
            "Four celestial bodies: sun, moon, star, and comet. Each represents one element: fire, water, air, and earth. Determine which body represents which element.",
          rules: [
            "The sun does not represent water or earth.",
            "The moon represents either water or air.",
            "The star does not represent fire.",
            "The element earth is represented by either the star or the comet.",
          ],
          solution: ["fire", "the fire element", "fire element"],
          solution_explanation:
            "The sun represents fire, the moon represents water, the comet represents air, and the star represents earth.",
        },
      }
  
      this.current_puzzle = null
      this.knowledge_base = []
      this.temperature = 1.0
      this.cooling_rate = 0.95
      this.min_temperature = 0.01
    }
  
    select_puzzle(puzzle_name: string): string {
      if (puzzle_name in this.puzzles) {
        this.current_puzzle = puzzle_name
        this.knowledge_base = [...this.puzzles[puzzle_name].rules]
        this.temperature = 1.0 // Reset temperature for new puzzle
  
        return `You are now attempting to solve: ${puzzle_name}\n\n${this.puzzles[puzzle_name].description}\n\nRules:`
      } else {
        return "Puzzle not found. Please select a valid puzzle."
      }
    }
  
    get_rules(): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      const rules = this.puzzles[this.current_puzzle].rules
      return rules.map((rule) => `- ${rule}`).join("\n")
    }
  
    query_rule(query: string): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      // Normalize query
      query = query.toLowerCase().trim()
      if (query.endsWith("?")) {
        query = query.slice(0, -1)
      }
  
      // Initial state: random response
      const responses = ["Yes", "No", "That cannot be determined from the rules"]
      let current_state = responses[Math.floor(Math.random() * responses.length)]
      let current_energy = this.evaluate_response(query, current_state)
  
      let best_state = current_state
      let best_energy = current_energy
  
      // Simulated annealing process
      let temp = this.temperature
      while (temp > this.min_temperature) {
        // Generate a neighbor state
        const neighbor = responses[Math.floor(Math.random() * responses.length)]
  
        // Calculate energy of neighbor
        const neighbor_energy = this.evaluate_response(query, neighbor)
  
        // Decide whether to accept the neighbor
        if (neighbor_energy < current_energy) {
          // Accept better state
          current_state = neighbor
          current_energy = neighbor_energy
  
          if (current_energy < best_energy) {
            best_state = current_state
            best_energy = current_energy
          }
        } else {
          // Accept worse state with a probability based on temperature
          const delta_energy = neighbor_energy - current_energy
          const acceptance_probability = Math.exp(-delta_energy / temp)
  
          if (Math.random() < acceptance_probability) {
            current_state = neighbor
            current_energy = neighbor_energy
          }
        }
  
        // Cool down
        temp *= this.cooling_rate
      }
  
      // Add explanation based on the rules
      const explanation = this.generate_explanation(query, best_state)
  
      return `${best_state}. ${explanation}`
    }
  
    evaluate_response(query: string, response: string): number {
      // This would normally use logical inference
      // For this example, we'll use a simplified approach
  
      // Extract key terms from query
      const terms = new Set(query.toLowerCase().split(" "))
  
      // Check if query terms appear in rules
      let rule_relevance = 0
      for (const rule of this.knowledge_base) {
        const rule_terms = new Set(rule.toLowerCase().split(" "))
        const common_terms = new Set([...terms].filter((x) => rule_terms.has(x)))
        rule_relevance += common_terms.size
      }
  
      // Penalize uncertain answers for specific queries
      const uncertainty_penalty = response === "That cannot be determined from the rules" && rule_relevance > 2 ? 5 : 0
  
      // Calculate energy (lower is better)
      const energy = 10 - rule_relevance + uncertainty_penalty
  
      return energy
    }
  
    generate_explanation(query: string, response: string): string {
      const relevant_rules: string[] = []
  
      // Extract key terms from query
      const terms = new Set(query.toLowerCase().split(" "))
  
      // Find relevant rules
      for (const rule of this.knowledge_base) {
        const rule_terms = new Set(rule.toLowerCase().split(" "))
        const common_terms = new Set([...terms].filter((x) => rule_terms.has(x)))
        if (common_terms.size > 0) {
          relevant_rules.push(rule)
        }
      }
  
      if (relevant_rules.length === 0) {
        return "This is based on logical deduction from the rules."
      }
  
      // Return explanation based on relevant rules
      if (relevant_rules.length === 1) {
        return `This is based on the rule: '${relevant_rules[0]}'`
      } else {
        return `This is based on combining multiple rules, including: '${relevant_rules[0]}' and '${relevant_rules[1]}'`
      }
    }
  
    check_answer(answer: string): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      answer = answer.toLowerCase().trim()
  
      if (this.puzzles[this.current_puzzle].solution.map((s) => s.toLowerCase()).includes(answer)) {
        const explanation = this.puzzles[this.current_puzzle].solution_explanation
        return `That's correct! You've solved the puzzle. ${explanation}`
      } else {
        return "That's not correct. Try again or ask more questions about the rules."
      }
    }
  
    get_available_puzzles(): string[] {
      return Object.keys(this.puzzles)
    }
  }
  
  