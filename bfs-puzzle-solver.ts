export class BFSPuzzleSolver {
    puzzles: Record<
      string,
      {
        hints: string[]
        solution: string[]
        difficulty: number
      }
    >
    current_puzzle: string | null
    hints_used: number
    max_hints: number
    start_time: number | null
  
    constructor() {
      // Dictionary of puzzles with their hints and solutions
      this.puzzles = {
        "The Guardian's Riddle": {
          hints: [
            "I am not alive, but I can make sounds.",
            "You might find me in mountains or valleys.",
            "I can be loud or soft, depending on the wind.",
          ],
          solution: ["echo", "an echo"],
          difficulty: 2,
        },
        "The Ancient Symbol": {
          hints: [
            "I have four equal sides and four equal angles.",
            "I am not a rectangle, though I share some properties.",
            "I can be found on a chessboard.",
          ],
          solution: ["square", "a square"],
          difficulty: 1,
        },
        "The Celestial Pattern": {
          hints: [
            "I wax and wane but never disappear completely.",
            "I control the tides of the ocean.",
            "I am Earth's only natural satellite.",
          ],
          solution: ["moon", "the moon"],
          difficulty: 2,
        },
      }
  
      this.current_puzzle = null
      this.hints_used = 0
      this.max_hints = 3
      this.start_time = null
    }
  
    select_puzzle(puzzle_name: string): string {
      if (puzzle_name in this.puzzles) {
        this.current_puzzle = puzzle_name
        this.hints_used = 0
        this.start_time = Date.now() / 1000
        return `You are now attempting to solve: ${puzzle_name}`
      } else {
        return "Puzzle not found. Please select a valid puzzle."
      }
    }
  
    get_hint(): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      if (this.hints_used >= this.max_hints) {
        return "You have used all available hints. Try to solve the puzzle with what you know."
      }
  
      // BFS implementation for hint traversal
      // Unlike DLS which limits depth, BFS explores breadth-first
      const queue: [number, number[]][] = [[0, []]] // (level, path)
      const visited = new Set([0])
  
      while (queue.length > 0) {
        const [level, path] = queue.shift()!
  
        // If we've found the next hint level
        if (level === this.hints_used) {
          const hint = this.puzzles[this.current_puzzle].hints[level]
          this.hints_used += 1
          return `Hint ${this.hints_used}/${this.max_hints}: ${hint}`
        }
  
        // Add next level to queue
        const next_level = level + 1
        if (next_level < this.max_hints && !visited.has(next_level)) {
          visited.add(next_level)
          queue.push([next_level, [...path, next_level]])
        }
      }
  
      return "No more hints available."
    }
  
    check_answer(answer: string): string {
      if (!this.current_puzzle) {
        return "Please select a puzzle first."
      }
  
      const elapsed_time = Date.now() / 1000 - (this.start_time || 0)
      answer = answer.toLowerCase().trim()
  
      if (this.puzzles[this.current_puzzle].solution.map((s) => s.toLowerCase()).includes(answer)) {
        const score = this.calculate_score(elapsed_time)
        return `Correct! You solved the puzzle in ${elapsed_time.toFixed(1)} seconds using ${this.hints_used} hints. Score: ${score}/100`
      } else {
        return "That's not correct. Try again or ask for a hint."
      }
    }
  
    calculate_score(elapsed_time: number): number {
      const base_score = 100
      const time_penalty = Math.min(50, elapsed_time / 5) // Max 50 points penalty for time
      const hint_penalty = this.hints_used * 15 // 15 points penalty per hint
  
      const score = Math.max(0, base_score - time_penalty - hint_penalty)
      return Math.round(score)
    }
  
    get_available_puzzles(): string[] {
      return Object.keys(this.puzzles)
    }
  }
  
  