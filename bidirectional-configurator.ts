export class BidirectionalPuzzleConfigurator {
    puzzles: Record<
      string,
      {
        base_difficulty: number
        current_difficulty: number
        min_difficulty: number
        max_difficulty: number
        configurations: Record<string, Record<string, any>>
      }
    >
    player_metrics: {
      solve_time: number[]
      attempts: number[]
      hints_used: number[]
    }
    current_puzzle: string | null
    step_size: number
  
    constructor() {
      this.puzzles = {
        "The Shifting Maze": {
          base_difficulty: 2.5,
          current_difficulty: 2.5,
          min_difficulty: 1.0,
          max_difficulty: 5.0,
          configurations: {
            easy: { paths: 3, dead_ends: 2, traps: 0 },
            medium: { paths: 2, dead_ends: 4, traps: 1 },
            hard: { paths: 1, dead_ends: 6, traps: 3 },
          },
        },
        "The Crystal Sequence": {
          base_difficulty: 2.0,
          current_difficulty: 2.0,
          min_difficulty: 1.0,
          max_difficulty: 5.0,
          configurations: {
            easy: { sequence_length: 3, red_herrings: 1, time_limit: 120 },
            medium: { sequence_length: 5, red_herrings: 2, time_limit: 90 },
            hard: { sequence_length: 7, red_herrings: 3, time_limit: 60 },
          },
        },
        "The Arcane Symbols": {
          base_difficulty: 3.0,
          current_difficulty: 3.0,
          min_difficulty: 1.0,
          max_difficulty: 5.0,
          configurations: {
            easy: { symbols: 4, combinations: 2, obscurity: "low" },
            medium: { symbols: 6, combinations: 3, obscurity: "medium" },
            hard: { symbols: 8, combinations: 4, obscurity: "high" },
          },
        },
      }
  
      this.player_metrics = {
        solve_time: [],
        attempts: [],
        hints_used: [],
      }
  
      this.current_puzzle = null
      this.step_size = 0.3
    }
  
    select_puzzle(puzzle_name: string): string {
      if (puzzle_name in this.puzzles) {
        this.current_puzzle = puzzle_name
        return `Selected puzzle: ${puzzle_name} (Current difficulty: ${this.puzzles[puzzle_name].current_difficulty.toFixed(1)}/5.0)`
      } else {
        return "Puzzle not found. Please select a valid puzzle."
      }
    }
  
    get_configuration(): { difficulty: number; configuration: Record<string, any> } {
      if (!this.current_puzzle) {
        return { difficulty: 0, configuration: {} }
      }
  
      const difficulty = this.puzzles[this.current_puzzle].current_difficulty
  
      // Determine which configuration to use based on difficulty
      let config_type: "easy" | "medium" | "hard"
      if (difficulty < 2.0) {
        config_type = "easy"
      } else if (difficulty < 4.0) {
        config_type = "medium"
      } else {
        config_type = "hard"
      }
  
      const base_config = this.puzzles[this.current_puzzle].configurations[config_type]
  
      // Fine-tune configuration based on exact difficulty
      const config: Record<string, any> = {}
      for (const [key, value] of Object.entries(base_config)) {
        if (typeof value === "number") {
          // Scale numeric values based on difficulty within the range
          let scale_factor: number
          if (config_type === "easy") {
            scale_factor = (difficulty - 1.0) / 1.0 // Scale within easy range (1.0-2.0)
          } else if (config_type === "medium") {
            scale_factor = (difficulty - 2.0) / 2.0 // Scale within medium range (2.0-4.0)
          } else {
            scale_factor = (difficulty - 4.0) / 1.0 // Scale within hard range (4.0-5.0)
          }
  
          // Apply scaling with some randomness
          const adjustment = Math.floor(value * scale_factor * 0.2)
          config[key] = value + adjustment
        } else {
          config[key] = value
        }
      }
  
      return {
        difficulty: difficulty,
        configuration: config,
      }
    }
  
    update_difficulty(solve_time: number, attempts: number, hints_used: number): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      // Store metrics
      this.player_metrics.solve_time.push(solve_time)
      this.player_metrics.attempts.push(attempts)
      this.player_metrics.hints_used.push(hints_used)
  
      // Calculate performance score (lower is better)
      const avg_time = this.player_metrics.solve_time.reduce((a, b) => a + b, 0) / this.player_metrics.solve_time.length
      const avg_attempts = this.player_metrics.attempts.reduce((a, b) => a + b, 0) / this.player_metrics.attempts.length
      const avg_hints = this.player_metrics.hints_used.reduce((a, b) => a + b, 0) / this.player_metrics.hints_used.length
  
      // Normalize metrics
      const norm_time = avg_time > 0 ? Math.min(1.0, solve_time / (avg_time * 2)) : 0.5
      const norm_attempts = avg_attempts > 0 ? Math.min(1.0, attempts / (avg_attempts * 2)) : 0.5
      const norm_hints = avg_hints > 0 ? Math.min(1.0, hints_used / (avg_hints * 2)) : 0.5
  
      const performance = (norm_time + norm_attempts + norm_hints) / 3
  
      // Bidirectional search implementation
      // Unlike hill climbing which only moves in one direction,
      // bidirectional search explores from both directions
      const current_difficulty = this.puzzles[this.current_puzzle].current_difficulty
      const min_difficulty = this.puzzles[this.current_puzzle].min_difficulty
      const max_difficulty = this.puzzles[this.current_puzzle].max_difficulty
  
      // Forward search (from current to harder)
      const forward_difficulty = Math.min(max_difficulty, current_difficulty + this.step_size)
  
      // Backward search (from current to easier)
      const backward_difficulty = Math.max(min_difficulty, current_difficulty - this.step_size)
  
      // Evaluate which direction to move based on performance
      let new_difficulty: number
      let direction: string
  
      if (performance < 0.4) {
        // Player did very well
        new_difficulty = forward_difficulty
        direction = "increased"
      } else if (performance > 0.7) {
        // Player struggled
        new_difficulty = backward_difficulty
        direction = "decreased"
      } else {
        // Player did okay
        new_difficulty = current_difficulty
        direction = "maintained"
      }
  
      // Update difficulty
      this.puzzles[this.current_puzzle].current_difficulty = new_difficulty
  
      return `Based on your performance, puzzle difficulty has been ${direction} to ${new_difficulty.toFixed(1)}/5.0`
    }
  
    get_available_puzzles(): string[] {
      return Object.keys(this.puzzles)
    }
  }
  
  