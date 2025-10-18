import { BFSPuzzleSolver } from "./bfs-puzzle-solver"
import { BidirectionalPuzzleConfigurator } from "./bidirectional-configurator"
import { SimulatedAnnealingPuzzleRules } from "./simulated-annealing-rules"

export class AIChatbotPuzzleGame {
  bfs_solver: BFSPuzzleSolver
  bidirectional_configurator: BidirectionalPuzzleConfigurator
  simulated_annealing_rules: SimulatedAnnealingPuzzleRules

  current_module: string | null
  player_name: string
  score: number

  constructor() {
    this.bfs_solver = new BFSPuzzleSolver()
    this.bidirectional_configurator = new BidirectionalPuzzleConfigurator()
    this.simulated_annealing_rules = new SimulatedAnnealingPuzzleRules()

    this.current_module = null
    this.player_name = "Adventurer"
    this.score = 0
  }

  start_game(): string {
    const intro = `
Welcome to "The Mystical Tower", ${this.player_name}!

You stand before an ancient tower filled with puzzles and mysteries.
Your journey will test your wit and reasoning through three challenges:

1. The Library of Whispers - Solve riddles with limited hints (BFS)
2. The Ever-Changing Maze - Navigate puzzles that adapt to your skill (Bidirectional Search)
3. The Forbidden Cipher - Deduce the truth through logical reasoning (Simulated Annealing)

Type 'help' at any time for assistance, or 'quit' to exit the game.
Let's begin your adventure!
    `
    return intro
  }

  process_command(command: string): string {
    command = command.toLowerCase().trim()

    // Global commands
    if (command === "help") {
      return this.get_help()
    } else if (command === "quit") {
      return "Thank you for playing! Your final score: " + this.score
    } else if (command === "score") {
      return `Your current score: ${this.score}`
    }

    // Module selection
    else if (command === "library" || command === "1") {
      this.current_module = "library"
      return `
You enter the Library of Whispers. Ancient books line the walls, and each contains a riddle.
The library guardian will provide hints, but use them wisely - each hint reduces your potential score.

Available puzzles: ${this.bfs_solver.get_available_puzzles().join(", ")}
Type 'select [puzzle name]' to choose a puzzle.
      `
    } else if (command === "maze" || command === "2") {
      this.current_module = "maze"
      return `
You enter the Ever-Changing Maze. The paths shift and transform based on your performance.
Solve puzzles efficiently, and the maze will become more challenging. Struggle, and it will adapt to help you progress.

Available puzzles: ${this.bidirectional_configurator.get_available_puzzles().join(", ")}
Type 'select [puzzle name]' to choose a puzzle.
      `
    } else if (command === "cipher" || command === "3") {
      this.current_module = "cipher"
      return `
You enter the chamber of the Forbidden Cipher. Here, ancient knowledge is locked behind logical puzzles.
Ask questions about the rules to deduce the solution, but choose your questions wisely.

Available puzzles: ${this.simulated_annealing_rules.get_available_puzzles().join(", ")}
Type 'select [puzzle name]' to choose a puzzle.
      `
    }

    // Module-specific commands
    else if (this.current_module === "library") {
      return this.process_library_command(command)
    } else if (this.current_module === "maze") {
      return this.process_maze_command(command)
    } else if (this.current_module === "cipher") {
      return this.process_cipher_command(command)
    } else {
      return "Please select a module first. Type '1' for Library, '2' for Maze, or '3' for Cipher."
    }
  }

  process_library_command(command: string): string {
    if (command.startsWith("select ")) {
      const puzzle_name = command.substring(7).trim()
      return this.bfs_solver.select_puzzle(puzzle_name)
    } else if (command === "hint") {
      return this.bfs_solver.get_hint()
    } else if (command.startsWith("solve ") || command.startsWith("answer ")) {
      const answer = command.split(" ", 2)[1].trim()
      const result = this.bfs_solver.check_answer(answer)

      // Update score if correct
      if (result.includes("Correct")) {
        const scoreText = result.split("Score: ")[1].split("/")[0]
        this.score += Number.parseInt(scoreText)
        return result + `\nYour total score is now: ${this.score}`
      }

      return result
    } else if (command === "puzzles") {
      return `Available puzzles: ${this.bfs_solver.get_available_puzzles().join(", ")}`
    } else {
      return "Library commands: 'select [puzzle name]', 'hint', 'solve [answer]', 'puzzles'"
    }
  }

  process_maze_command(command: string): string {
    if (command.startsWith("select ")) {
      const puzzle_name = command.substring(7).trim()
      return this.bidirectional_configurator.select_puzzle(puzzle_name)
    } else if (command === "config" || command === "configuration") {
      const config = this.bidirectional_configurator.get_configuration()
      return `Current difficulty: ${config.difficulty.toFixed(1)}/5.0\nConfiguration: ${JSON.stringify(config.configuration)}`
    } else if (command.startsWith("complete ")) {
      // Format: complete [time] [attempts] [hints]
      const parts = command.split(" ")
      if (parts.length !== 4) {
        return "Usage: complete [time in seconds] [number of attempts] [number of hints used]"
      }

      try {
        const solve_time = Number.parseFloat(parts[1])
        const attempts = Number.parseInt(parts[2])
        const hints_used = Number.parseInt(parts[3])

        const result = this.bidirectional_configurator.update_difficulty(solve_time, attempts, hints_used)

        // Award score based on performance
        const performance_score = Math.max(0, 50 - Math.floor(solve_time / 10) - attempts * 5 - hints_used * 10)
        this.score += performance_score

        return `${result}\nYou earned ${performance_score} points. Your total score is now: ${this.score}`
      } catch (error) {
        return "Please provide valid numbers for time, attempts, and hints."
      }
    } else if (command === "puzzles") {
      return `Available puzzles: ${this.bidirectional_configurator.get_available_puzzles().join(", ")}`
    } else {
      return "Maze commands: 'select [puzzle name]', 'config', 'complete [time] [attempts] [hints]', 'puzzles'"
    }
  }

  process_cipher_command(command: string): string {
    if (command.startsWith("select ")) {
      const puzzle_name = command.substring(7).trim()
      return this.simulated_annealing_rules.select_puzzle(puzzle_name)
    } else if (command === "rules") {
      return this.simulated_annealing_rules.get_rules()
    } else if (command.startsWith("query ") || command.startsWith("ask ")) {
      const query = command.split(" ", 2)[1].trim()
      return this.simulated_annealing_rules.query_rule(query)
    } else if (command.startsWith("solve ") || command.startsWith("answer ")) {
      const answer = command.split(" ", 2)[1].trim()
      const result = this.simulated_annealing_rules.check_answer(answer)

      // Update score if correct
      if (result.toLowerCase().includes("correct")) {
        // Award a fixed score for solving logic puzzles
        const puzzle_score = 75
        this.score += puzzle_score
        return result + `\nYou earned ${puzzle_score} points. Your total score is now: ${this.score}`
      }

      return result
    } else if (command === "puzzles") {
      return `Available puzzles: ${this.simulated_annealing_rules.get_available_puzzles().join(", ")}`
    } else {
      return "Cipher commands: 'select [puzzle name]', 'rules', 'query [question]', 'solve [answer]', 'puzzles'"
    }
  }

  get_help(): string {
    const general_help = `
=== HELP MENU ===
General Commands:
- 'help': Display this help menu
- 'quit': Exit the game
- 'score': Display your current score
- '1' or 'library': Enter the Library of Whispers
- '2' or 'maze': Enter the Ever-Changing Maze
- '3' or 'cipher': Enter the Forbidden Cipher
`

    let module_help = ""

    if (this.current_module === "library") {
      module_help = `
Library of Whispers Commands:
- 'select [puzzle name]': Choose a puzzle to solve
- 'hint': Get a hint for the current puzzle
- 'solve [answer]' or 'answer [answer]': Submit your answer
- 'puzzles': List available puzzles
`
    } else if (this.current_module === "maze") {
      module_help = `
Ever-Changing Maze Commands:
- 'select [puzzle name]': Choose a puzzle to solve
- 'config' or 'configuration': View current puzzle configuration
- 'complete [time] [attempts] [hints]': Report puzzle completion
- 'puzzles': List available puzzles
`
    } else if (this.current_module === "cipher") {
      module_help = `
Forbidden Cipher Commands:
- 'select [puzzle name]': Choose a puzzle to solve
- 'rules': View the rules for the current puzzle
- 'query [question]' or 'ask [question]': Ask about the rules
- 'solve [answer]' or 'answer [answer]': Submit your answer
- 'puzzles': List available puzzles
`
    } else {
      module_help = "\nPlease select a module first to see specific commands."
    }

    return general_help + module_help
  }
}

